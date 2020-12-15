/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! This module is responsible to build a single project. It does not handle
//! watch mode or other state.

mod apply_transforms;
mod artifact_content;
pub mod artifact_writer;
mod build_ir;
mod build_schema;
mod generate_artifacts;
pub mod generate_extra_artifacts;
mod is_operation_preloadable;
mod persist_operations;
mod source_control;
mod validate;

use crate::compiler_state::{ArtifactMapKind, CompilerState, ProjectName, SourceSetName};
use crate::config::{Config, ProjectConfig};
use crate::errors::BuildProjectError;
use crate::{artifact_map::ArtifactMap, graphql_asts::GraphQLAsts};
pub use apply_transforms::apply_transforms;
pub use apply_transforms::Programs;
use build_ir::BuildIRResult;
pub use build_ir::SourceHashes;
pub use build_schema::build_schema;
use common::{PerfLogEvent, PerfLogger};
use fnv::{FnvHashMap, FnvHashSet};
pub use generate_artifacts::{
    create_path_for_artifact, generate_artifacts, Artifact, ArtifactContent,
};
use generate_extra_artifacts::generate_extra_artifacts;
use graphql_ir::Program;
use interner::StringKey;
pub use is_operation_preloadable::is_operation_preloadable;
use log::info;
use relay_codegen::Printer;
use schema::Schema;
pub use source_control::add_to_mercurial;
use std::{collections::hash_map::Entry, path::PathBuf, sync::Arc};
pub use validate::validate;

pub enum BuildProjectFailure {
    Error(BuildProjectError),
    Cancelled,
}

/// This program doesn't have IR transforms applied to it, so it's not optimized.
/// It's perfect for the LSP server: we have all the documents with
/// their locations to provide information to go_to_definition, hover, etc.
pub fn build_raw_program(
    project_config: &ProjectConfig,
    graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
    schema: Arc<Schema>,
    log_event: &impl PerfLogEvent,
) -> Result<Program, BuildProjectError> {
    let BuildIRResult { ir, .. } = log_event.time("build_ir_time", || {
        build_ir::build_ir(project_config, &schema, graphql_asts, false)
            .map_err(|errors| BuildProjectError::ValidationErrors { errors })
    })?;

    Ok(log_event.time("build_program_time", || {
        Program::from_definitions(schema, ir)
    }))
}

fn build_programs(
    config: &Config,
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
    schema: Arc<Schema>,
    log_event: &impl PerfLogEvent,
    perf_logger: Arc<impl PerfLogger + 'static>,
) -> Result<(Programs, Arc<SourceHashes>), BuildProjectFailure> {
    let project_name = project_config.name;
    let is_incremental_build =
        compiler_state.has_processed_changes() && !compiler_state.has_breaking_schema_change();

    // Build a type aware IR.
    let BuildIRResult {
        ir,
        base_fragment_names,
        source_hashes,
    } = log_event.time("build_ir_time", || {
        build_ir::build_ir(project_config, &schema, graphql_asts, is_incremental_build).map_err(
            |errors| BuildProjectFailure::Error(BuildProjectError::ValidationErrors { errors }),
        )
    })?;

    // Turn the IR into a base Program.
    let program = log_event.time("build_program_time", || {
        Program::from_definitions(schema, ir)
    });

    if compiler_state.has_pending_file_source_changes() {
        return Err(BuildProjectFailure::Cancelled);
    }

    // Call validation rules that go beyond type checking.
    log_event.time("validate_time", || {
        // TODO(T63482263): Pass connection interface from configuration
        validate(&program, &config.connection_interface).map_err(|errors| {
            BuildProjectFailure::Error(BuildProjectError::ValidationErrors { errors })
        })
    })?;

    // Apply various chains of transforms to create a set of output programs.
    let programs = log_event.time("apply_transforms_time", || {
        apply_transforms(
            project_name,
            Arc::new(program),
            Arc::new(base_fragment_names),
            &config.connection_interface,
            Arc::new(project_config.feature_flags.unwrap_or(config.feature_flags)),
            perf_logger,
        )
        .map_err(|errors| {
            BuildProjectFailure::Error(BuildProjectError::ValidationErrors { errors })
        })
    })?;

    Ok((programs, Arc::new(source_hashes)))
}

pub fn build_project(
    config: &Config,
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
    perf_logger: Arc<impl PerfLogger + 'static>,
) -> Result<(ProjectName, Arc<Schema>, Programs, Vec<Artifact>), BuildProjectFailure> {
    let log_event = perf_logger.create_event("build_project");
    let build_time = log_event.start("build_project_time");
    let project_name = project_config.name.lookup();
    log_event.string("project", project_name.to_string());
    info!("[{}] compiling...", project_name);

    // Construct a schema instance including project specific extensions.
    let schema = log_event
        .time("build_schema_time", || {
            Ok(build_schema(compiler_state, project_config)?)
        })
        .map_err(|errors| {
            BuildProjectFailure::Error(BuildProjectError::ValidationErrors { errors })
        })?;

    if compiler_state.has_pending_file_source_changes() {
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

    if compiler_state.has_pending_file_source_changes() {
        return Err(BuildProjectFailure::Cancelled);
    }

    // Generate artifacts by collecting information from the `Programs`.
    let artifacts_timer = log_event.start("generate_artifacts_time");
    let artifacts = generate_artifacts(project_config, &programs, Arc::clone(&source_hashes))
        .map_err(BuildProjectFailure::Error)?;
    log_event.stop(artifacts_timer);

    log_event.number(
        "generated_artifacts",
        programs.reader.document_count() + programs.normalization.document_count(),
    );

    log_event.stop(build_time);
    perf_logger.complete_event(log_event);
    Ok((project_config.name, schema, programs, artifacts))
}

pub async fn commit_project(
    config: &Config,
    project_config: &ProjectConfig,
    perf_logger: Arc<impl PerfLogger + 'static>,
    schema: &Schema,
    programs: Programs,
    mut artifacts: Vec<Artifact>,
    artifact_map: Arc<ArtifactMapKind>,
    // Definitions that are removed from the previous artifact map
    removed_definition_names: Vec<StringKey>,
    // Dirty artifacts that should be removed if no longer in the artifacts map
    mut artifacts_to_remove: FnvHashSet<PathBuf>,
) -> Result<ArtifactMap, BuildProjectError> {
    let log_event = perf_logger.create_event("commit_project");
    let commit_time = log_event.start("commit_project_time");

    if let Some(ref operation_persister) = config.operation_persister {
        if let Some(ref persist_config) = project_config.persist {
            let persist_operations_timer = log_event.start("persist_operations_time");
            persist_operations::persist_operations(
                &mut artifacts,
                &config.root_dir,
                &persist_config,
                config,
                &operation_persister,
                &log_event,
            )
            .await?;
            log_event.stop(persist_operations_timer);
        }
    }

    // In some cases we need to create additional (platform specific) artifacts
    // For that, we will use `generate_extra_operation_artifacts` from the configs
    if let Some(generate_extra_operation_artifacts_fn) = &config.generate_extra_operation_artifacts
    {
        log_event.time("generate_extra_operation_artifacts_time", || {
            generate_extra_artifacts(
                schema,
                project_config,
                &mut artifacts,
                generate_extra_operation_artifacts_fn,
            )
        });
    }

    // Write the generated artifacts to disk. This step is separate from
    // generating artifacts or persisting to avoid partial writes in case of
    // errors as much as possible.
    let next_artifact_map = match Arc::as_ref(&artifact_map) {
        ArtifactMapKind::Unconnected(existing_artifacts) => {
            let mut existing_artifacts = existing_artifacts.clone();
            let mut printer = Printer::with_dedupe();

            log_event.time("write_artifacts_time", || {
                for artifact in &artifacts {
                    if !existing_artifacts.remove(&artifact.path) {
                        info!(
                            "[{}] NEW: {:?} -> {:?}",
                            project_config.name, &artifact.source_definition_names, &artifact.path
                        );
                    }

                    let path = config.root_dir.join(&artifact.path);
                    let content =
                        artifact
                            .content
                            .as_bytes(config, project_config, &mut printer, schema);
                    config.artifact_writer.write_if_changed(path, content)?;
                }
                Ok(())
            })?;

            log_event.time("delete_artifacts_time", || {
                for remaining_artifact in &existing_artifacts {
                    let path = config.root_dir.join(remaining_artifact);
                    config.artifact_writer.remove(path)?;
                }
                Ok(())
            })?;

            ArtifactMap::from(artifacts)
        }
        ArtifactMapKind::Mapping(artifact_map) => {
            let mut printer = Printer::with_dedupe();
            let mut artifact_map = artifact_map.clone();
            let mut current_paths_map = ArtifactMap::default();

            log_event.time("write_artifacts_incremental_time", || {
                // Write or update artifacts
                for artifact in artifacts {
                    let path = config.root_dir.join(&artifact.path);
                    let content =
                        artifact
                            .content
                            .as_bytes(config, project_config, &mut printer, schema);
                    config.artifact_writer.write_if_changed(path, content)?;
                    current_paths_map.insert(artifact);
                }
                Ok(())
            })?;

            log_event.time("update_artifact_map_time", || {
                // All generated paths for removed definitions should be removed
                for name in &removed_definition_names {
                    if let Some(artifacts) = artifact_map.0.remove(&name) {
                        for artifact in artifacts {
                            artifacts_to_remove.insert(artifact.path);
                        }
                    }
                }
                // Update the artifact map, and delete any removed artifacts
                for (definition_name, artifact_records) in current_paths_map.0 {
                    match artifact_map.0.entry(definition_name) {
                        Entry::Occupied(mut entry) => {
                            let prev_records = entry.get_mut();
                            for prev_record in prev_records.drain(..) {
                                if !artifact_records.iter().any(|t| t.path == prev_record.path) {
                                    artifacts_to_remove.insert(prev_record.path);
                                }
                            }
                            prev_records.extend(artifact_records.into_iter());
                        }
                        Entry::Vacant(entry) => {
                            entry.insert(artifact_records);
                        }
                    }
                }
                // Filter out any artifact that is in the artifact map
                for artifacts in artifact_map.0.values() {
                    for artifact in artifacts {
                        artifacts_to_remove.remove(&artifact.path);
                    }
                }
            });

            log_event.time("delete_artifacts_incremental_time", || {
                // The remaining dirty artifacts are no longer required
                for path in artifacts_to_remove {
                    config.artifact_writer.remove(config.root_dir.join(path))?;
                }
                Ok(())
            })?;

            artifact_map
        }
    };

    info!(
        "[{}] compiled documents: {} reader, {} normalization, {} operation text",
        project_config.name,
        programs.reader.document_count(),
        programs.normalization.document_count(),
        programs.operation_text.document_count()
    );
    log_event.stop(commit_time);
    perf_logger.complete_event(log_event);

    Ok(next_artifact_map)
}
