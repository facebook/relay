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
mod build_ir;
mod build_schema;
mod generate_artifacts;
pub mod generate_extra_artifacts;
mod persist_operations;
mod validate;
mod write_artifacts;

use crate::compiler_state::CompilerState;
use crate::config::{Config, ProjectConfig};
use crate::errors::BuildProjectError;
use crate::parse_sources::GraphQLAsts;
pub use apply_transforms::apply_transforms;
pub use apply_transforms::Programs;
use build_ir::BuildIRResult;
pub use build_schema::build_schema;
use common::{PerfLogEvent, PerfLogger};
pub use generate_artifacts::{generate_artifacts, Artifact, ArtifactContent};
use generate_extra_artifacts::generate_extra_artifacts;
use graphql_ir::{Program, Sources, ValidationError};
use graphql_transforms::FB_CONNECTION_INTERFACE;
use log::info;
use persist_operations::persist_operations;
use schema::Schema;
pub use validate::validate;
use write_artifacts::write_artifacts;

fn build_programs<'a>(
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &GraphQLAsts<'_>,
    schema: &'a Schema,
    log_event: &impl PerfLogEvent,
    perf_logger: &impl PerfLogger,
) -> Result<Programs<'a>, BuildProjectError> {
    let project_name = project_config.name.lookup();
    let sources = graphql_asts.sources();
    let is_incremental_build = compiler_state.has_processed_changes();

    // Build a type aware IR.
    let BuildIRResult {
        ir,
        base_fragment_names,
    } = log_event.time("build_ir_time", || {
        add_error_sources(
            build_ir::build_ir(project_config, &schema, graphql_asts, is_incremental_build),
            sources,
        )
    })?;

    // Turn the IR into a base Program.
    let program = log_event.time("build_program_time", || {
        Program::from_definitions(&schema, ir)
    });

    // Call validation rules that go beyond type checking.
    log_event.time("validate_time", || {
        add_error_sources(
            // TODO(T63482263): Pass connection interface from configuration
            validate(&program, &*FB_CONNECTION_INTERFACE),
            sources,
        )
    })?;

    // Apply various chains of transforms to create a set of output programs.
    let programs = log_event.time("apply_transforms_time", || {
        add_error_sources(
            apply_transforms(
                &project_name,
                program,
                &base_fragment_names,
                &*FB_CONNECTION_INTERFACE,
                perf_logger,
            ),
            sources,
        )
    })?;

    Ok(programs)
}

pub async fn check_project<'schema>(
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &GraphQLAsts<'_>,
    schema: &'schema Schema,
    perf_logger: &impl PerfLogger,
) -> Result<Programs<'schema>, BuildProjectError> {
    let log_event = perf_logger.create_event("check_project");
    let build_time = log_event.start("check_time");
    let project_name = project_config.name.lookup();
    log_event.string("project", project_name.to_string());

    let programs = build_programs(
        project_config,
        compiler_state,
        graphql_asts,
        schema,
        &log_event,
        perf_logger,
    )?;

    log_event.stop(build_time);
    perf_logger.complete_event(log_event);

    Ok(programs)
}

pub async fn build_project(
    config: &Config,
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &GraphQLAsts<'_>,
    perf_logger: &impl PerfLogger,
) -> Result<(), BuildProjectError> {
    let log_event = perf_logger.create_event("build_project");
    let build_time = log_event.start("build_project_time");
    let project_name = project_config.name.lookup();
    log_event.string("project", project_name.to_string());

    // Construct a schema instance including project specific extensions.
    let schema = log_event.time("build_schema_time", || {
        build_schema(compiler_state, project_config)
    });

    // Apply different transform pipelines to produce the `Programs`.
    let programs = build_programs(
        project_config,
        compiler_state,
        graphql_asts,
        &schema,
        &log_event,
        perf_logger,
    )?;

    // Generate artifacts by collecting information from the `Programs`.
    let artifacts_timer = log_event.start("generate_artifacts_time");
    let mut artifacts = generate_artifacts(project_config, &programs)?;
    log_event.stop(artifacts_timer);

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
                &schema,
                project_config,
                &mut artifacts,
                generate_extra_artifacts_fn,
            )
        });
    }

    // Write the generated artifacts to disk. This step is separate from
    // generating artifacts or persisting to avoid partial writes in case of
    // errors as much as possible.
    if config.write_artifacts {
        log_event.time("write_artifacts_time", || {
            write_artifacts(
                config,
                project_config,
                &artifacts,
                programs.normalization.schema(),
            )
        })?;
    }

    log_event.number(
        "generated_artifacts",
        programs.reader.document_count() + programs.normalization.document_count(),
    );

    info!(
        "[{}] compiled documents: {} reader, {} normalization, {} operation text",
        project_config.name,
        programs.reader.document_count(),
        programs.normalization.document_count(),
        programs.operation_text.document_count()
    );
    log_event.stop(build_time);
    perf_logger.complete_event(log_event);
    Ok(())
}

fn add_error_sources<T>(
    result: Result<T, Vec<ValidationError>>,
    sources: &Sources<'_>,
) -> Result<T, BuildProjectError> {
    result.map_err(|validation_errors| BuildProjectError::ValidationErrors {
        errors: validation_errors
            .into_iter()
            .map(|error| error.with_sources(sources))
            .collect(),
    })
}
