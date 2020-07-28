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
mod persist_operations;
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
use fnv::FnvHashMap;
pub use generate_artifacts::{
    create_path_for_artifact, generate_artifacts, Artifact, ArtifactContent,
};
use generate_extra_artifacts::generate_extra_artifacts;
use graphql_ir::Program;
use graphql_transforms::FB_CONNECTION_INTERFACE;
use interner::StringKey;
use log::info;
use persist_operations::persist_operations;
use relay_codegen::Printer;
use schema::Schema;
use std::sync::Arc;
pub use validate::validate;

fn build_programs(
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
    schema: Arc<Schema>,
    log_event: &impl PerfLogEvent,
    perf_logger: Arc<impl PerfLogger + 'static>,
) -> Result<(Programs, Arc<SourceHashes>), BuildProjectError> {
    let project_name = project_config.name;
    let is_incremental_build =
        compiler_state.has_processed_changes() && !compiler_state.has_breaking_schema_change();

    // Build a type aware IR.
    let BuildIRResult {
        ir,
        base_fragment_names,
        source_hashes,
    } = log_event.time("build_ir_time", || {
        build_ir::build_ir(project_config, &schema, graphql_asts, is_incremental_build)
            .map_err(|errors| BuildProjectError::ValidationErrors { errors })
    })?;

    // Turn the IR into a base Program.
    let program = log_event.time("build_program_time", || {
        Program::from_definitions(schema, ir)
    });

    // Call validation rules that go beyond type checking.
    log_event.time("validate_time", || {
        // TODO(T63482263): Pass connection interface from configuration
        validate(&program, &*FB_CONNECTION_INTERFACE)
            .map_err(|errors| BuildProjectError::ValidationErrors { errors })
    })?;

    // Apply various chains of transforms to create a set of output programs.
    let programs = log_event.time("apply_transforms_time", || {
        apply_transforms(
            project_name,
            Arc::new(program),
            Arc::new(base_fragment_names),
            Arc::clone(&FB_CONNECTION_INTERFACE),
            perf_logger,
        )
        .map_err(|errors| BuildProjectError::ValidationErrors { errors })
    })?;

    Ok((programs, Arc::new(source_hashes)))
}

pub fn check_project(
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
    schema: Arc<Schema>,
    perf_logger: Arc<impl PerfLogger + 'static>,
) -> Result<Programs, BuildProjectError> {
    let log_event = perf_logger.create_event("check_project");
    let build_time = log_event.start("check_time");
    let project_name = project_config.name.lookup();
    log_event.string("project", project_name.to_string());

    let (programs, _) = build_programs(
        project_config,
        compiler_state,
        graphql_asts,
        schema,
        &log_event,
        Arc::clone(&perf_logger),
    )?;

    log_event.stop(build_time);
    perf_logger.complete_event(log_event);

    Ok(programs)
}

pub fn build_project(
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &FnvHashMap<SourceSetName, GraphQLAsts>,
    perf_logger: Arc<impl PerfLogger + 'static>,
) -> Result<(ProjectName, Arc<Schema>, Programs, Vec<Artifact>), BuildProjectError> {
    let log_event = perf_logger.create_event("build_project");
    let build_time = log_event.start("build_project_time");
    let project_name = project_config.name.lookup();
    log_event.string("project", project_name.to_string());

    // Construct a schema instance including project specific extensions.
    let schema = log_event.time("build_schema_time", || {
        Arc::new(build_schema(compiler_state, project_config))
    });

    // Apply different transform pipelines to produce the `Programs`.
    let (programs, source_hashes) = build_programs(
        project_config,
        compiler_state,
        graphql_asts,
        Arc::clone(&schema),
        &log_event,
        Arc::clone(&perf_logger),
    )?;

    // Generate artifacts by collecting information from the `Programs`.
    let artifacts_timer = log_event.start("generate_artifacts_time");
    let artifacts = generate_artifacts(project_config, &programs, Arc::clone(&source_hashes))?;
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
    removed_definition_names: Vec<StringKey>,
) -> Result<ArtifactMap, BuildProjectError> {
    let log_event = perf_logger.create_event("commit_project");
    let commit_time = log_event.start("commit_project_time");

    // If there is a persist config, persist operations now.
    if let Some(ref persist_config) = project_config.persist {
        let persist_operations_timer = log_event.start("persist_operations_time");
        persist_operations(config, &mut artifacts, persist_config).await?;
        log_event.stop(persist_operations_timer);
    }

    // In some cases we need to create additional (platform specific) artifacts
    // For that, we will use `generate_extra_operation_artifacts` from the configs
    if let Some(generate_extra_artifacts_fn) = &config.generate_extra_operation_artifacts {
        log_event.time("generate_extra_operation_artifacts_time", || {
            generate_extra_artifacts(
                schema,
                project_config,
                &mut artifacts,
                generate_extra_artifacts_fn,
            )
        });
    }

    // Write the generated artifacts to disk. This step is separate from
    // generating artifacts or persisting to avoid partial writes in case of
    // errors as much as possible.
    let next_artifact_map = match Arc::as_ref(&artifact_map) {
        ArtifactMapKind::Unconnected(existing_artifacts) => {
            let mut existing_artifacts = existing_artifacts.clone();
            let mut artifact_writer = config.create_artifact_writer();
            let mut printer = Printer::default();

            log_event.time("write_artifacts_time", || {
                for artifact in &artifacts {
                    if !existing_artifacts.remove(&artifact.path) {
                        info!(
                            "[{}] NEW: {} -> {:?}",
                            project_config.name, &artifact.name, &artifact.path
                        );
                    }

                    let path = config.root_dir.join(&artifact.path);
                    let content =
                        artifact
                            .content
                            .as_bytes(config, project_config, &mut printer, schema);
                    artifact_writer.write_if_changed(path, content)?;
                }
                Ok(())
            })?;

            log_event.time("delete_artifacts_time", || {
                for remaining_artifact in &existing_artifacts {
                    let path = config.root_dir.join(remaining_artifact);
                    artifact_writer.remove(path)?;
                }
                Ok(())
            })?;

            log_event.time("finalize_artifacts_time", || artifact_writer.finalize())?;

            ArtifactMap::from(artifacts)
        }
        ArtifactMapKind::Mapping(artifact_map) => {
            let mut artifact_writer = config.create_artifact_writer();
            let mut printer = Printer::default();
            let mut artifact_map = artifact_map.clone();

            // Delete all generated paths for removed definitions
            log_event.time("delete_artifacts_time", || {
                for name in &removed_definition_names {
                    if let Some(artifact) = artifact_map.remove(&name) {
                        for (path, _) in artifact {
                            let path = config.root_dir.join(path);
                            artifact_writer.remove(path)?;
                        }
                    }
                }
                Ok(())
            })?;

            // Update artifacts and remove deleted artifacts
            log_event.time("write_artifacts_time", || {
                let mut current_paths_map = ArtifactMap::default();
                for artifact in artifacts {
                    let path = config.root_dir.join(&artifact.path);
                    let content =
                        artifact
                            .content
                            .as_bytes(config, project_config, &mut printer, schema);
                    artifact_writer.write_if_changed(path, content)?;
                    current_paths_map.insert(artifact);
                }
                artifact_map.update_and_remove(current_paths_map, &mut artifact_writer)?;
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
