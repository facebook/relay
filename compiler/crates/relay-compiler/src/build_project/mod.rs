/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! This module is responsible to build a single project. It does not handle
//! watch mode or other state.

mod artifact_content;
pub mod artifact_writer;
mod build_ir;
mod build_schema;
mod generate_artifacts;
pub mod generate_extra_artifacts;
mod log_program_stats;
mod persist_operations;
mod source_control;
mod validate;

use self::log_program_stats::print_stats;
use crate::compiler_state::{ArtifactMapKind, CompilerState, ProjectName, SourceSetName};
use crate::config::{Config, ProjectConfig};
use crate::errors::BuildProjectError;
use crate::file_source::SourceControlUpdateStatus;
use crate::{artifact_map::ArtifactMap, graphql_asts::GraphQLAsts};
use build_ir::BuildIRResult;
pub use build_ir::SourceHashes;
pub use build_schema::build_schema;
use common::{sync::*, FeatureFlags, PerfLogEvent, PerfLogger};
use dashmap::{mapref::entry::Entry, DashSet};
use fnv::{FnvBuildHasher, FnvHashMap, FnvHashSet};
pub use generate_artifacts::{
    create_path_for_artifact, generate_artifacts, Artifact, ArtifactContent,
};
use graphql_ir::Program;
use intern::string_key::StringKey;
use log::{debug, info, warn};
use rayon::{iter::IntoParallelRefIterator, slice::ParallelSlice};
use relay_codegen::Printer;
use relay_transforms::{apply_transforms, find_resolver_dependencies, DependencyMap, Programs};
use schema::SDLSchema;
pub use source_control::add_to_mercurial;
use std::iter::FromIterator;
use std::{path::PathBuf, sync::Arc};
pub use validate::{validate, AdditionalValidations};

type BuildProjectOutput = (ProjectName, Arc<SDLSchema>, Programs, Vec<Artifact>);
type BuildProgramsOutput = (Programs, Arc<SourceHashes>);

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
    implicit_dependencies: &DependencyMap,
    graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
    schema: Arc<SDLSchema>,
    log_event: &impl PerfLogEvent,
    is_incremental_build: bool,
) -> Result<(Program, FnvHashSet<StringKey>, SourceHashes), BuildProjectError> {
    // Build a type aware IR.
    let BuildIRResult {
        ir,
        base_fragment_names,
        source_hashes,
    } = log_event.time("build_ir_time", || {
        build_ir::build_ir(
            project_config,
            implicit_dependencies,
            &schema,
            graphql_asts,
            is_incremental_build,
        )
        .map_err(|errors| BuildProjectError::ValidationErrors { errors })
    })?;

    // Turn the IR into a base Program.
    let program = log_event.time("build_program_time", || {
        Program::from_definitions(schema, ir)
    });

    Ok((program, base_fragment_names, source_hashes))
}

pub fn validate_program(
    config: &Config,
    feature_flags: &FeatureFlags,
    program: &Program,
    log_event: &impl PerfLogEvent,
) -> Result<(), BuildProjectError> {
    let timer = log_event.start("validate_time");
    log_event.number("validate_documents_count", program.document_count());
    let result = validate(
        program,
        feature_flags,
        &config.connection_interface,
        &config.additional_validations,
    )
    .map_err(|errors| BuildProjectError::ValidationErrors { errors });

    log_event.stop(timer);

    result
}

/// Apply various chains of transforms to create a set of output programs.
pub fn transform_program(
    config: &Config,
    project_config: &ProjectConfig,
    program: Arc<Program>,
    base_fragment_names: Arc<FnvHashSet<StringKey>>,
    perf_logger: Arc<impl PerfLogger + 'static>,
    log_event: &impl PerfLogEvent,
) -> Result<Programs, BuildProjectFailure> {
    let timer = log_event.start("apply_transforms_time");
    let result = apply_transforms(
        project_config.name,
        program,
        base_fragment_names,
        &config.connection_interface,
        Arc::clone(&project_config.feature_flags),
        &project_config.test_path_regex,
        perf_logger,
        Some(print_stats),
    )
    .map_err(|errors| BuildProjectFailure::Error(BuildProjectError::ValidationErrors { errors }));

    log_event.stop(timer);

    result
}

pub fn build_programs(
    config: &Config,
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
    schema: Arc<SDLSchema>,
    log_event: &impl PerfLogEvent,
    perf_logger: Arc<impl PerfLogger + 'static>,
) -> Result<BuildProgramsOutput, BuildProjectFailure> {
    let project_name = project_config.name;
    let is_incremental_build = compiler_state.has_processed_changes()
        && !compiler_state.has_breaking_schema_change(project_name)
        && if let Some(base) = project_config.base {
            !compiler_state.has_breaking_schema_change(base)
        } else {
            true
        };

    let (program, base_fragment_names, source_hashes) = build_raw_program(
        project_config,
        &compiler_state.implicit_dependencies.read().unwrap(),
        graphql_asts,
        schema,
        log_event,
        is_incremental_build,
    )?;

    if compiler_state.should_cancel_current_build() {
        debug!("Build is cancelled: updates in source code/or new file changes are pending.");
        return Err(BuildProjectFailure::Cancelled);
    }

    let (validation_results, _) = rayon::join(
        || {
            // Call validation rules that go beyond type checking.
            validate_program(config, &project_config.feature_flags, &program, log_event)
        },
        || {
            find_resolver_dependencies(
                &mut compiler_state
                    .pending_implicit_dependencies
                    .write()
                    .unwrap(),
                &program,
            );
        },
    );

    validation_results?;

    let programs = transform_program(
        config,
        project_config,
        Arc::new(program),
        Arc::new(base_fragment_names),
        Arc::clone(&perf_logger),
        log_event,
    )?;

    Ok((programs, Arc::new(source_hashes)))
}

pub fn build_project(
    config: &Config,
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
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
            build_schema(compiler_state, project_config)
        })
        .map_err(|errors| {
            BuildProjectFailure::Error(BuildProjectError::ValidationErrors { errors })
        })?;

    if compiler_state.should_cancel_current_build() {
        debug!("Build is cancelled: updates in source code/or new file changes are pending.");
        return Err(BuildProjectFailure::Cancelled);
    }

    // Apply different transform pipelines to produce the `Programs`.
    let (programs, source_hashes) = build_programs(
        config,
        project_config,
        compiler_state,
        graphql_asts,
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
    let artifacts = generate_artifacts(
        config,
        project_config,
        &programs,
        Arc::clone(&source_hashes),
    );
    log_event.stop(artifacts_timer);

    log_event.number(
        "generated_artifacts",
        programs.reader.document_count() + programs.normalization.document_count(),
    );

    log_event.stop(build_time);
    log_event.complete();
    Ok((project_config.name, schema, programs, artifacts))
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
    // Definitions that are removed from the previous artifact map
    removed_definition_names: Vec<StringKey>,
    // Dirty artifacts that should be removed if no longer in the artifacts map
    mut artifacts_to_remove: DashSet<PathBuf, FnvBuildHasher>,
    source_control_update_status: Arc<SourceControlUpdateStatus>,
) -> Result<ArtifactMap, BuildProjectFailure> {
    let log_event = perf_logger.create_event("commit_project");
    log_event.string("project", project_config.name.to_string());
    let commit_time = log_event.start("commit_project_time");

    if source_control_update_status.is_started() {
        debug!("commit_project cancelled before persisting due to source control updates");
        return Err(BuildProjectFailure::Cancelled);
    }

    if let Some(ref operation_persister) = config.operation_persister {
        if let Some(ref persist_config) = project_config.persist {
            let persist_operations_timer = log_event.start("persist_operations_time");
            persist_operations::persist_operations(
                &mut artifacts,
                &config.root_dir,
                persist_config,
                config,
                project_config,
                operation_persister.as_ref(),
                &log_event,
                &programs,
            )
            .await?;
            log_event.stop(persist_operations_timer);
        }
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
            )?;
            for artifact in &artifacts {
                if !existing_artifacts.remove(&artifact.path) {
                    debug!(
                        "[{}] new artifact {:?} from definitions {:?}",
                        project_config.name, &artifact.path, &artifact.source_definition_names
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
            )?;
            artifacts.into_par_iter().for_each(|artifact| {
                current_paths_map.insert(artifact);
            });
            log_event.stop(write_artifacts_incremental_time);

            log_event.time("update_artifact_map_time", || {
                // All generated paths for removed definitions should be removed
                for name in &removed_definition_names {
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
) -> Result<(), BuildProjectFailure> {
    artifacts.par_chunks(8192).try_for_each_init(
        || Printer::with_dedupe(project_config.js_module_format),
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
                );
                if config.artifact_writer.should_write(&path, &content)? {
                    config.artifact_writer.write(path, content)?;
                }
            }
            Ok(())
        },
    )?;
    Ok(())
}
