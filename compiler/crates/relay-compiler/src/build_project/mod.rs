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
use fnv::FnvBuildHasher;
use fnv::FnvHashMap;
use fnv::FnvHashSet;
pub use generate_artifacts::generate_artifacts;
pub use generate_artifacts::generate_preloadable_query_parameters_artifact;
pub use generate_artifacts::Artifact;
pub use generate_artifacts::ArtifactContent;
use graphql_ir::FragmentDefinitionNameSet;
use graphql_ir::Program;
use log::debug;
use log::info;
use log::warn;
use rayon::iter::IntoParallelRefIterator;
use rayon::slice::ParallelSlice;
use relay_codegen::Printer;
use relay_config::ProjectName;
use relay_transforms::apply_transforms;
use relay_transforms::CustomTransformsConfig;
use relay_transforms::Programs;
use relay_typegen::FragmentLocations;
use rustc_hash::FxHashMap;
use schema::SDLSchema;
pub use source_control::add_to_mercurial;
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
type BuildProgramsOutput = WithDiagnostics<(Programs, Arc<SourceHashes>)>;

pub enum BuildProjectFailure {
    Error(BuildProjectError),
    Cancelled,
}

impl From<BuildProjectError> for BuildProjectFailure {
    fn from(err: BuildProjectError) -> BuildProjectFailure {
        BuildProjectFailure::Error(err)
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
    is_incremental_build: bool,
) -> Result<(Program, SourceHashes), BuildProjectError> {
    // Build a type aware IR.
    let BuildIRResult { ir, source_hashes } = log_event.time("build_ir_time", || {
        build_ir::build_ir(project_config, project_asts, &schema, is_incremental_build).map_err(
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
    let is_incremental_build = compiler_state.has_processed_changes()
        && !compiler_state.has_breaking_schema_change(
            log_event,
            project_name,
            &project_config.schema_config,
        )
        && if let Some(base) = project_config.base {
            !compiler_state.has_breaking_schema_change(
                log_event,
                base,
                &project_config.schema_config,
            )
        } else {
            true
        };
    log_event.bool("is_incremental_build", is_incremental_build);
    let (program, source_hashes) = build_raw_program(
        project_config,
        project_asts,
        schema,
        log_event,
        is_incremental_build,
    )?;

    if compiler_state.should_cancel_current_build() {
        debug!("Build is cancelled: updates in source code/or new file changes are pending.");
        return Err(BuildProjectFailure::Cancelled);
    }

    // Call validation rules that go beyond type checking.
    // FIXME: Return non-fatal diagnostics from transforms (only validations for now)
    let diagnostics = validate_program(config, project_config, &program, log_event)?;

    let programs = transform_program(
        project_config,
        Arc::new(program),
        Arc::new(base_fragment_names),
        Arc::clone(&perf_logger),
        log_event,
        config.custom_transforms.as_ref(),
    )?;

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
            build_schema(compiler_state, project_config, graphql_asts_map)
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
    let artifacts = generate_artifacts(project_config, &programs, Arc::clone(&source_hashes));
    log_event.stop(artifacts_timer);

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
    artifacts.par_chunks(8192).try_for_each_init(
        || Printer::with_dedupe(project_config),
        |mut printer, artifacts| {
            for artifact in artifacts {
                if should_stop_updating_artifacts() {
                    return Err(BuildProjectFailure::Cancelled);
                }
                let path = config.root_dir.join(&artifact.path);
                let content = artifact.content.as_bytes(
                    config,
                    project_config,
                    &mut printer,
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
