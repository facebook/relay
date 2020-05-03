/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! This module is responsible to build a single project. It does not handle
//! watch mode or other state.

mod apply_transforms;
mod build_ir;
mod build_schema;
mod generate_artifacts;
mod validate;
mod write_artifacts;

use crate::compiler_state::CompilerState;
use crate::config::{Config, ProjectConfig};
use crate::errors::BuildProjectError;
use crate::parse_sources::GraphQLAsts;
pub use apply_transforms::apply_transforms;
use build_ir::BuildIRResult;
use common::{PerfLogEvent, PerfLogger};
pub use generate_artifacts::Artifact;
use graphql_ir::{Program, Sources, ValidationError};
use graphql_transforms::FBConnectionInterface;
use log::info;
use std::path::PathBuf;
pub use validate::validate;

pub type WrittenArtifacts = Vec<(PathBuf, Artifact)>;

pub async fn build_project(
    config: &Config,
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &GraphQLAsts<'_>,
    perf_logger: &impl PerfLogger,
) -> Result<WrittenArtifacts, BuildProjectError> {
    let log_event = perf_logger.create_event("build_project");
    let build_time = log_event.start("build_time");
    log_event.string("project", project_config.name.lookup().into());

    let sources = graphql_asts.sources();
    let is_incremental_build = compiler_state.has_processed_changes();

    // Construct a schema instance including project specific extensions.
    let schema = log_event.time("build_schema", || {
        build_schema::build_schema(compiler_state, project_config)
    });

    // Build a type aware IR.
    let BuildIRResult {
        ir,
        base_fragment_names,
    } = log_event.time("build_ir", || {
        add_error_sources(
            build_ir::build_ir(project_config, &schema, graphql_asts, is_incremental_build),
            sources,
        )
    })?;

    // Turn the IR into a base Program.
    let program = log_event.time("build_program", || Program::from_definitions(&schema, ir));

    let connection_interface = FBConnectionInterface::default();

    // Call validation rules that go beyond type checking.
    log_event.time("validate", || {
        add_error_sources(
            // TODO(T63482263): Pass connection interface from configuration
            validate(&program, &connection_interface),
            sources,
        )
    })?;

    // Apply various chains of transforms to create a set of output programs.
    let programs = log_event.time("apply_transforms", || {
        add_error_sources(
            apply_transforms(program, &base_fragment_names, &connection_interface),
            sources,
        )
    })?;

    // Generate code and persist text to produce output artifacts in memory.
    let artifacts_timer = log_event.start("generate_artifacts");
    let artifacts =
        generate_artifacts::generate_artifacts(config, project_config, &programs).await?;
    log_event.stop(artifacts_timer);

    // Write the generated artifacts to disk. This step is separate from
    // generating artifacts to avoid partial writes in case of errors as
    // much as possible.
    let written_artifacts = if config.write_artifacts {
        log_event.time("write_artifacts", || {
            write_artifacts::write_artifacts(config, project_config, &artifacts)
        })?
    } else {
        Vec::new()
    };

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
    Ok(written_artifacts)
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
