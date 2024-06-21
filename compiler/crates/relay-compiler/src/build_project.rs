/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! This module is responsible to build a single project. It does not handle
//! watch mode or other state.

mod artifact_generated_types;
pub mod artifact_writer;
mod build_ir;
mod build_resolvers_schema;
pub mod build_schema;
mod generate_artifacts;
pub mod generate_extra_artifacts;
pub mod get_artifacts_file_hash_map;
mod log_program_stats;
mod persist_operations;
mod project_asts;
mod source_control;
mod validate;

use std::fmt;
use std::path::PathBuf;
use std::sync::Arc;

pub use artifact_generated_types::ArtifactGeneratedTypes;
use build_ir::BuildIRResult;
pub use build_ir::SourceHashes;
pub use build_schema::build_schema;
use common::sync::*;
use common::Diagnostic;
use common::PerfLogEvent;
use common::PerfLogger;
use common::WithDiagnostics;
use dashmap::mapref::entry::Entry;
use dashmap::DashSet;
use dependency_analyzer::get_ir_definition_references;
use fnv::FnvBuildHasher;
use fnv::FnvHashMap;
use fnv::FnvHashSet;
pub use generate_artifacts::generate_artifacts;
pub use generate_artifacts::generate_preloadable_query_parameters_artifact;
pub use generate_artifacts::Artifact;
pub use generate_artifacts::ArtifactContent;
use graphql_ir::ExecutableDefinition;
use graphql_ir::ExecutableDefinitionName;
use graphql_ir::FragmentDefinitionNameSet;
use graphql_ir::Program;
use indexmap::IndexSet;
use log::debug;
use log::info;
use log::warn;
use petgraph::unionfind::UnionFind;
use rayon::iter::IntoParallelRefIterator;
use rayon::slice::ParallelSlice;
use relay_codegen::Printer;
use relay_config::ProjectName;
use relay_transforms::apply_transforms;
use relay_transforms::CustomTransformsConfig;
use relay_transforms::Programs;
use relay_typegen::FragmentLocations;
use rustc_hash::FxHashMap;
use rustc_hash::FxHashSet;
use schema::SDLSchema;
use schema_diff::check::IncrementalBuildSchemaChange;
use schema_diff::check::SchemaChangeSafety;
pub use source_control::source_control_for_root;
pub use validate::validate;
pub use validate::AdditionalValidations;

use self::log_program_stats::print_stats;
pub use self::project_asts::find_duplicates;
pub use self::project_asts::get_project_asts;
pub use self::project_asts::ProjectAstData;
pub use self::project_asts::ProjectAsts;
use super::artifact_content;
use crate::artifact_map::ArtifactMap;
use crate::artifact_map::ArtifactSourceKey;
use crate::compiler_state::ArtifactMapKind;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::config::ProjectConfig;
use crate::errors::BuildProjectError;
use crate::file_source::SourceControlUpdateStatus;
use crate::graphql_asts::GraphQLAsts;

type BuildProjectOutput = WithDiagnostics<(ProjectName, Arc<SDLSchema>, Programs, Vec<Artifact>)>;
type BuildProgramsOutput = WithDiagnostics<(Vec<Programs>, Arc<SourceHashes>)>;

pub enum BuildProjectFailure {
    Error(BuildProjectError),
    Cancelled,
}

impl From<BuildProjectError> for BuildProjectFailure {
    fn from(err: BuildProjectError) -> BuildProjectFailure {
        BuildProjectFailure::Error(err)
    }
}

pub enum BuildMode {
    Full,
    Incremental,
    IncrementalWithSchemaChanges(FxHashSet<IncrementalBuildSchemaChange>),
}
impl fmt::Debug for BuildMode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BuildMode::Full => write!(f, "Full"),
            BuildMode::Incremental => write!(f, "Incremental"),
            BuildMode::IncrementalWithSchemaChanges(changes) => {
                write!(f, "IncrementalWithSchemaChanges({:?})", changes)
            }
        }
    }
}

/// This program doesn't have IR transforms applied to it, so it's not optimized.
/// It's perfect for the LSP server: we have all the documents with
/// their locations to provide information to go_to_definition, hover, etc.
pub fn build_raw_program(
    project_config: &ProjectConfig,
    project_asts: ProjectAsts,
    schema: Arc<SDLSchema>,
    log_event: &impl PerfLogEvent,
    build_mode: BuildMode,
) -> Result<(Program, SourceHashes), BuildProjectError> {
    // Build a type aware IR.
    let BuildIRResult { ir, source_hashes } = log_event.time("build_ir_time", || {
        build_ir::build_ir(project_config, project_asts, &schema, build_mode, log_event).map_err(
            |errors| BuildProjectError::ValidationErrors {
                errors,
                project_name: project_config.name,
            },
        )
    })?;

    // Turn the IR into a base Program.
    let program = log_event.time("build_program_time", || {
        Program::from_definitions(schema, ir)
    });

    Ok((program, source_hashes))
}

const MIN_CHUNK_SIZE: usize = 8192;

/// Build raw programs and divide them into chunks for parallelization
fn build_raw_program_chunks(
    project_config: &ProjectConfig,
    project_asts: ProjectAsts,
    schema: Arc<SDLSchema>,
    log_event: &impl PerfLogEvent,
    build_mode: BuildMode,
) -> Result<(Vec<Program>, SourceHashes), BuildProjectError> {
    // Build a type aware IR.
    let BuildIRResult { ir, source_hashes } = log_event.time("build_ir_time", || {
        build_ir::build_ir(project_config, project_asts, &schema, build_mode, log_event).map_err(
            |errors| BuildProjectError::ValidationErrors {
                errors,
                project_name: project_config.name,
            },
        )
    })?;

    let chunks = if ir.len() < MIN_CHUNK_SIZE {
        vec![ir]
    } else {
        let chunkify_time = log_event.start("chunkify_project_time");
        let dependency_map = get_ir_definition_references(&schema, &ir);
        let definition_indexes: IndexSet<ExecutableDefinitionName> = ir
            .iter()
            .map(|def| match def {
                ExecutableDefinition::Operation(operation) => {
                    ExecutableDefinitionName::OperationDefinitionName(operation.name.item)
                }
                ExecutableDefinition::Fragment(fragment) => {
                    ExecutableDefinitionName::FragmentDefinitionName(fragment.name.item)
                }
            })
            .collect();

        let mut unionfind = UnionFind::<usize>::new(definition_indexes.len());
        for (source, destinations) in &dependency_map {
            let source_index = definition_indexes.get_index_of(source).unwrap();
            for destination in destinations {
                let destination_index = definition_indexes.get_index_of(destination).unwrap();
                unionfind.union(source_index, destination_index);
            }
        }

        let mut groups = FxHashMap::default();
        for (idx, def) in ir.into_iter().enumerate() {
            let group = unionfind.find(idx);
            groups.entry(group).or_insert_with(Vec::new).push(def);
        }

        let mut chunks = vec![];
        let mut buffer = Vec::new();
        for group in groups.into_values() {
            if group.len() > MIN_CHUNK_SIZE {
                chunks.push(group);
            } else {
                buffer.extend(group);
                if buffer.len() > MIN_CHUNK_SIZE {
                    chunks.push(std::mem::take(&mut buffer));
                }
            }
        }
        if !buffer.is_empty() {
            chunks.push(buffer);
        }
        log_event.stop(chunkify_time);
        chunks
    };

    // Turn the IR into base Programs.
    let programs = log_event.time("build_program_time", || {
        chunks
            .into_iter()
            .map(|definitions| Program::from_definitions(Arc::clone(&schema), definitions))
            .collect()
    });
    Ok((programs, source_hashes))
}

pub fn validate_program(
    config: &Config,
    project_config: &ProjectConfig,
    program: &Program,
    log_event: &impl PerfLogEvent,
) -> Result<Vec<Diagnostic>, BuildProjectError> {
    let timer = log_event.start("validate_time");
    log_event.number("validate_documents_count", program.document_count());
    let result = validate(program, project_config, &config.additional_validations).map_or_else(
        |errors| {
            Err(BuildProjectError::ValidationErrors {
                errors,
                project_name: project_config.name,
            })
        },
        |result| Ok(result.diagnostics),
    );

    log_event.stop(timer);

    result
}

/// Apply various chains of transforms to create a set of output programs.
pub fn transform_program(
    project_config: &ProjectConfig,
    program: Arc<Program>,
    base_fragment_names: Arc<FragmentDefinitionNameSet>,
    perf_logger: Arc<impl PerfLogger + 'static>,
    log_event: &impl PerfLogEvent,
    custom_transforms_config: Option<&CustomTransformsConfig>,
) -> Result<Programs, BuildProjectFailure> {
    let timer = log_event.start("apply_transforms_time");
    let result = apply_transforms(
        project_config,
        program,
        base_fragment_names,
        perf_logger,
        Some(print_stats),
        custom_transforms_config,
    )
    .map_err(|errors| {
        BuildProjectFailure::Error(BuildProjectError::ValidationErrors {
            errors,
            project_name: project_config.name,
        })
    });

    log_event.stop(timer);

    result
}

pub fn build_programs(
    config: &Config,
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    project_asts: ProjectAsts,
    base_fragment_names: FragmentDefinitionNameSet,
    schema: Arc<SDLSchema>,
    log_event: &impl PerfLogEvent,
    perf_logger: Arc<impl PerfLogger + 'static>,
) -> Result<BuildProgramsOutput, BuildProjectFailure> {
    let project_name = project_config.name;
    let mut build_mode = if !compiler_state.has_processed_changes() {
        BuildMode::Full
    } else {
        let project_schema_change = compiler_state.schema_change_safety(
            log_event,
            project_name,
            &project_config.schema_config,
        );
        match project_schema_change {
            SchemaChangeSafety::Unsafe => BuildMode::Full,
            SchemaChangeSafety::Safe | SchemaChangeSafety::SafeWithIncrementalBuild(_) => {
                let base_schema_change = if let Some(base) = project_config.base {
                    compiler_state.schema_change_safety(
                        log_event,
                        base,
                        &project_config.schema_config,
                    )
                } else {
                    SchemaChangeSafety::Safe
                };
                match (project_schema_change, base_schema_change) {
                    (SchemaChangeSafety::Unsafe, _) => BuildMode::Full,
                    (_, SchemaChangeSafety::Unsafe) => BuildMode::Full,
                    (SchemaChangeSafety::Safe, SchemaChangeSafety::Safe) => BuildMode::Incremental,
                    (SchemaChangeSafety::SafeWithIncrementalBuild(c), SchemaChangeSafety::Safe) => {
                        BuildMode::IncrementalWithSchemaChanges(c)
                    }
                    (SchemaChangeSafety::Safe, SchemaChangeSafety::SafeWithIncrementalBuild(c)) => {
                        BuildMode::IncrementalWithSchemaChanges(c)
                    }
                    (
                        SchemaChangeSafety::SafeWithIncrementalBuild(c1),
                        SchemaChangeSafety::SafeWithIncrementalBuild(c2),
                    ) => {
                        BuildMode::IncrementalWithSchemaChanges(c1.into_iter().chain(c2).collect())
                    }
                }
            }
        }
    };
    if !config.has_schema_change_incremental_build {
        // Killswitch here to bail out of schema based incremental builds
        build_mode = if let BuildMode::IncrementalWithSchemaChanges(_) = build_mode {
            BuildMode::Full
        } else {
            build_mode
        }
    }
    log_event.bool(
        "is_incremental_build",
        match build_mode {
            BuildMode::Incremental | BuildMode::IncrementalWithSchemaChanges(_) => true,
            BuildMode::Full => false,
        },
    );
    log_event.string(
        "build_mode",
        match build_mode {
            BuildMode::Full => String::from("Full"),
            BuildMode::Incremental => String::from("Incremental"),
            BuildMode::IncrementalWithSchemaChanges(_) => {
                String::from("IncrementalWithSchemaChanges")
            }
        },
    );
    let (programs, source_hashes) =
        build_raw_program_chunks(project_config, project_asts, schema, log_event, build_mode)?;

    if compiler_state.should_cancel_current_build() {
        debug!("Build is cancelled: updates in source code/or new file changes are pending.");
        return Err(BuildProjectFailure::Cancelled);
    }
    let base_fragment_names = Arc::new(base_fragment_names);
    let results: Vec<(Programs, Vec<Diagnostic>)> = programs
        .into_par_iter()
        .map(|program| {
            // Call validation rules that go beyond type checking.
            // FIXME: Return non-fatal diagnostics from transforms (only validations for now)
            let diagnostics = validate_program(config, project_config, &program, log_event)?;

            let programs = transform_program(
                project_config,
                Arc::new(program),
                Arc::clone(&base_fragment_names),
                Arc::clone(&perf_logger),
                log_event,
                config.custom_transforms.as_ref(),
            )?;

            Ok((programs, diagnostics))
        })
        .collect::<Result<Vec<_>, BuildProjectFailure>>()?;

    let len = results.len();
    let (programs, diagnostics) = results.into_iter().fold(
        (Vec::with_capacity(len), vec![]),
        |(mut programs, mut diagnostics), (temp_programs, temp_diagnostics)| {
            programs.push(temp_programs);
            diagnostics.extend(temp_diagnostics);
            (programs, diagnostics)
        },
    );

    Ok(WithDiagnostics {
        item: (programs, Arc::new(source_hashes)),
        diagnostics,
    })
}

pub fn build_project(
    config: &Config,
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts_map: &FnvHashMap<ProjectName, GraphQLAsts>,
    perf_logger: Arc<impl PerfLogger + 'static>,
) -> Result<BuildProjectOutput, BuildProjectFailure> {
    let log_event = perf_logger.create_event("build_project");
    let build_time = log_event.start("build_project_time");
    let project_name = project_config.name;
    log_event.string("project", project_name.to_string());
    info!("[{}] compiling...", project_name);

    // Construct a schema instance including project specific extensions.
    let schema = log_event
        .time("build_schema_time", || {
            build_schema(
                compiler_state,
                config,
                project_config,
                graphql_asts_map,
                &log_event,
            )
        })
        .map_err(|errors| {
            BuildProjectFailure::Error(BuildProjectError::ValidationErrors {
                errors,
                project_name: project_config.name,
            })
        })?;

    let ProjectAstData {
        project_asts,
        base_fragment_names,
    } = get_project_asts(&schema, graphql_asts_map, project_config)?;

    if compiler_state.should_cancel_current_build() {
        debug!("Build is cancelled: updates in source code/or new file changes are pending.");
        return Err(BuildProjectFailure::Cancelled);
    }

    // Apply different transform pipelines to produce the `Programs`.
    let WithDiagnostics {
        item: (programs, source_hashes),
        diagnostics,
    } = build_programs(
        config,
        project_config,
        compiler_state,
        project_asts,
        base_fragment_names,
        Arc::clone(&schema),
        &log_event,
        Arc::clone(&perf_logger),
    )?;

    if compiler_state.should_cancel_current_build() {
        debug!("Build is cancelled: updates in source code/or new file changes are pending.");
        return Err(BuildProjectFailure::Cancelled);
    }

    // Generate artifacts by collecting information from the `Programs`.
    let artifacts_timer = log_event.start("generate_artifacts_time");
    let artifacts = programs
        .par_iter()
        .map(|programs| generate_artifacts(project_config, programs, Arc::clone(&source_hashes)))
        .flatten()
        .collect();
    log_event.stop(artifacts_timer);

    let mut iter: std::vec::IntoIter<Programs> = programs.into_iter();
    let mut programs = iter.next().expect("Expect at least one result");
    for temp_programs in iter {
        merge_programs(&mut programs, temp_programs);
    }

    log_event.number(
        "generated_artifacts",
        programs.reader.document_count() + programs.normalization.document_count(),
    );

    log_event.stop(build_time);
    log_event.complete();
    Ok(WithDiagnostics {
        item: (project_config.name, schema, programs, artifacts),
        diagnostics,
    })
}

fn merge_programs(onto: &mut Programs, from: Programs) {
    merge_program(Arc::get_mut(&mut onto.source).unwrap(), from.source);
    merge_program(Arc::get_mut(&mut onto.reader).unwrap(), from.reader);
    merge_program(
        Arc::get_mut(&mut onto.normalization).unwrap(),
        from.normalization,
    );
    merge_program(
        Arc::get_mut(&mut onto.operation_text).unwrap(),
        from.operation_text,
    );
    merge_program(Arc::get_mut(&mut onto.typegen).unwrap(), from.typegen);
}

fn merge_program(onto: &mut Program, from: Arc<Program>) {
    // Note: this it the inner implementation of the unstable "unwrap_or_clone"
    let from = Arc::try_unwrap(from).unwrap_or_else(|arc| (*arc).clone());
    onto.fragments.extend(from.fragments);
    onto.operations.extend(from.operations);
}

#[allow(clippy::too_many_arguments)]
pub async fn commit_project(
    config: &Config,
    project_config: &ProjectConfig,
    perf_logger: Arc<impl PerfLogger + 'static>,
    schema: &SDLSchema,
    programs: Programs,
    mut artifacts: Vec<Artifact>,
    artifact_map: Arc<ArtifactMapKind>,
    // Definitions/Sources that are removed from the previous artifact map
    removed_artifact_sources: Vec<ArtifactSourceKey>,
    // Dirty artifacts that should be removed if no longer in the artifacts map
    mut artifacts_to_remove: DashSet<PathBuf, FnvBuildHasher>,
    source_control_update_status: Arc<SourceControlUpdateStatus>,
) -> Result<ArtifactMap, BuildProjectFailure> {
    let log_event = perf_logger.create_event("commit_project");
    log_event.string("project", project_config.name.to_string());
    let commit_time = log_event.start("commit_project_time");

    let fragment_locations = FragmentLocations::new(programs.typegen.fragments());
    if source_control_update_status.is_started() {
        debug!("commit_project cancelled before persisting due to source control updates");
        return Err(BuildProjectFailure::Cancelled);
    }

    if let Some(operation_persister) = config
        .create_operation_persister
        .as_ref()
        .and_then(|create_fn| create_fn(project_config))
    {
        let persist_operations_timer = log_event.start("persist_operations_time");
        persist_operations::persist_operations(
            &mut artifacts,
            &config.root_dir,
            config,
            project_config,
            &(*operation_persister),
            &log_event,
            &programs,
        )
        .await?;
        log_event.stop(persist_operations_timer);
    }

    if source_control_update_status.is_started() {
        debug!(
            "commit_project cancelled before generating extra artifacts due to source control updates"
        );
        return Err(BuildProjectFailure::Cancelled);
    }

    // In some cases we need to create additional (platform specific) artifacts
    // For that, we will use `generate_extra_artifacts` from the configs
    if let Some(generate_extra_artifacts_fn) = &config.generate_extra_artifacts {
        log_event.time("generate_extra_artifacts_time", || {
            artifacts.extend(generate_extra_artifacts_fn(
                config,
                project_config,
                schema,
                &programs,
                &artifacts,
            ))
        });
    }

    if source_control_update_status.is_started() {
        debug!("commit_project cancelled before writing artifacts due to source control updates");
        return Err(BuildProjectFailure::Cancelled);
    }

    let should_stop_updating_artifacts = || {
        if source_control_update_status.is_started() {
            debug!("artifact_writer updates cancelled due source control updates");
            true
        } else {
            false
        }
    };

    let artifacts_file_hash_map = match &config.get_artifacts_file_hash_map {
        Some(get_fn) => {
            let get_artifacts_file_hash_map_timer =
                log_event.start("get_artifacts_file_hash_map_time");
            let res = get_fn(&artifacts).await;
            log_event.stop(get_artifacts_file_hash_map_timer);
            res
        }
        _ => None,
    };

    // Write the generated artifacts to disk. This step is separate from
    // generating artifacts or persisting to avoid partial writes in case of
    // errors as much as possible.
    let next_artifact_map = match Arc::as_ref(&artifact_map) {
        ArtifactMapKind::Unconnected(existing_artifacts) => {
            let mut existing_artifacts = existing_artifacts.clone();
            let write_artifacts_time = log_event.start("write_artifacts_time");
            write_artifacts(
                config,
                project_config,
                schema,
                should_stop_updating_artifacts,
                &artifacts,
                &fragment_locations,
                &artifacts_file_hash_map,
            )?;
            for artifact in &artifacts {
                if !existing_artifacts.remove(&artifact.path) {
                    debug!(
                        "[{}] new artifact {:?} from definitions {:?}",
                        project_config.name, &artifact.path, &artifact.artifact_source_keys
                    );
                }
            }
            log_event.stop(write_artifacts_time);
            let delete_artifacts_time = log_event.start("delete_artifacts_time");
            for remaining_artifact in &existing_artifacts {
                if should_stop_updating_artifacts() {
                    break;
                }
                let path = config.root_dir.join(remaining_artifact);
                config.artifact_writer.remove(path)?;
            }
            log_event.stop(delete_artifacts_time);
            ArtifactMap::from(artifacts)
        }
        ArtifactMapKind::Mapping(artifact_map) => {
            let artifact_map = artifact_map.clone();
            let current_paths_map = ArtifactMap::default();
            let write_artifacts_incremental_time =
                log_event.start("write_artifacts_incremental_time");

            // Write or update artifacts
            write_artifacts(
                config,
                project_config,
                schema,
                should_stop_updating_artifacts,
                &artifacts,
                &fragment_locations,
                &artifacts_file_hash_map,
            )?;
            artifacts.into_par_iter().for_each(|artifact| {
                current_paths_map.insert(artifact);
            });
            log_event.stop(write_artifacts_incremental_time);

            log_event.time("update_artifact_map_time", || {
                // All generated paths for removed definitions should be removed
                for name in &removed_artifact_sources {
                    if let Some((_, artifacts)) = artifact_map.0.remove(name) {
                        artifacts_to_remove.extend(artifacts.into_iter().map(|a| a.path));
                    }
                }
                // Update the artifact map, and delete any removed artifacts
                current_paths_map.0.into_par_iter().for_each(
                    |(definition_name, artifact_records)| match artifact_map
                        .0
                        .entry(definition_name)
                    {
                        Entry::Occupied(mut entry) => {
                            let prev_records = entry.get_mut();
                            let current_records_paths =
                                FnvHashSet::from_iter(artifact_records.iter().map(|r| &r.path));

                            for prev_record in prev_records.drain(..) {
                                if !current_records_paths.contains(&prev_record.path) {
                                    artifacts_to_remove.insert(prev_record.path);
                                }
                            }
                            *prev_records = artifact_records;
                        }
                        Entry::Vacant(entry) => {
                            entry.insert(artifact_records);
                        }
                    },
                );
                // Filter out any artifact that is in the artifact map
                if !artifacts_to_remove.is_empty() {
                    artifact_map.0.par_iter().for_each(|entry| {
                        for artifact in entry.value() {
                            artifacts_to_remove.remove(&artifact.path);
                        }
                    });
                }
            });
            let delete_artifacts_incremental_time =
                log_event.start("delete_artifacts_incremental_time");
            // The remaining dirty artifacts are no longer required
            for path in artifacts_to_remove {
                if should_stop_updating_artifacts() {
                    break;
                }
                config.artifact_writer.remove(config.root_dir.join(path))?;
            }
            log_event.stop(delete_artifacts_incremental_time);

            artifact_map
        }
    };

    if source_control_update_status.is_started() {
        log_event.number("update_artifacts_after_source_control_update", 1);
        debug!(
            "We just updated artifacts after source control update happened. Most likely we have outdated artifacts now..."
        );
        warn!(
            r#"
Build canceled due to a source control update while we're writing artifacts.
The compiler may produce outdated artifacts, but it will regenerate the correct set after the update is completed."#
        );
        return Err(BuildProjectFailure::Cancelled);
    } else {
        // For now, lets log how often this is happening, so we can decide if we want to
        // adjust the way we write artifacts. For example, we could write them to the temp
        // directory first, then move to a correct destination.
        log_event.number("update_artifacts_after_source_control_update", 0);
    }

    info!(
        "[{}] compiled documents: {} reader, {} normalization, {} operation text",
        project_config.name,
        programs.reader.document_count(),
        programs.normalization.document_count(),
        programs.operation_text.document_count()
    );
    log_event.stop(commit_time);
    log_event.complete();

    Ok(next_artifact_map)
}

fn write_artifacts<F: Fn() -> bool + Sync + Send>(
    config: &Config,
    project_config: &ProjectConfig,
    schema: &SDLSchema,
    should_stop_updating_artifacts: F,
    artifacts: &[Artifact],
    fragment_locations: &FragmentLocations,
    artifacts_file_hash_map: &Option<FxHashMap<String, Option<String>>>,
) -> Result<(), BuildProjectFailure> {
    artifacts.par_chunks(8).try_for_each_init(
        || Printer::with_dedupe(project_config),
        |printer, artifacts| {
            for artifact in artifacts {
                if should_stop_updating_artifacts() {
                    return Err(BuildProjectFailure::Cancelled);
                }
                let path = config.root_dir.join(&artifact.path);
                let content = artifact.content.as_bytes(
                    config,
                    project_config,
                    printer,
                    schema,
                    artifact.source_file,
                    fragment_locations,
                );
                let file_hash = match artifact.path.to_str() {
                    Some(key) => artifacts_file_hash_map
                        .as_ref()
                        .and_then(|map| map.get(key).cloned().flatten()),
                    _ => None,
                };
                if config
                    .artifact_writer
                    .should_write(&path, &content, file_hash)?
                {
                    config.artifact_writer.write(path, content)?;
                }
            }
            Ok(())
        },
    )?;
    Ok(())
}
