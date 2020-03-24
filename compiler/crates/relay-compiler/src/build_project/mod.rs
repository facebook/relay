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
use common::Timer;
use graphql_ir::{Program, Sources, ValidationError};
use graphql_transforms::FBConnectionInterface;
pub use validate::validate;

pub async fn build_project(
    config: &Config,
    project_config: &ProjectConfig,
    compiler_state: &CompilerState,
    graphql_asts: &GraphQLAsts<'_>,
) -> Result<(), BuildProjectError> {
    let sources = graphql_asts.sources();
    let is_incremental_build = compiler_state.has_processed_changes();

    // Construct a schema instance including project specific extensions.
    let schema = Timer::time(format!("build_schema {}", project_config.name), || {
        build_schema::build_schema(compiler_state, project_config)
    });

    // Build a type aware IR.
    let BuildIRResult {
        ir,
        base_fragment_names,
    } = Timer::time(format!("build_ir {}", project_config.name), || {
        add_error_sources(
            build_ir::build_ir(project_config, &schema, graphql_asts, is_incremental_build),
            sources,
        )
    })?;

    // Turn the IR into a base Program.
    let program = Timer::time(format!("build_program {}", project_config.name), || {
        Program::from_definitions(&schema, ir)
    });

    let connection_interface = FBConnectionInterface::default();

    // Call validation rules that go beyond type checking.
    Timer::time(format!("validate {}", project_config.name), || {
        add_error_sources(
            // TODO(T63482263): Pass connection interface from configuration
            validate(&program, &connection_interface),
            sources,
        )
    })?;

    // Apply various chains of transforms to create a set of output programs.
    let programs = Timer::time(format!("apply_transforms {}", project_config.name), || {
        add_error_sources(
            apply_transforms(&program, &base_fragment_names, &connection_interface),
            sources,
        )
    })?;

    // Generate code and persist text to produce output artifacts in memory.
    let artifacts_timer = Timer::start(format!("generate_artifacts {}", project_config.name));
    let artifacts =
        generate_artifacts::generate_artifacts(config, project_config, &programs).await?;
    artifacts_timer.stop();

    // Write the generated artifacts to disk. This step is separte from
    // generating artifacts to avoid partial writes in case of errors as
    // much as possible.
    Timer::time(format!("write_artifacts {}", project_config.name), || {
        write_artifacts::write_artifacts(config, project_config, &artifacts)
    })?;

    println!(
        "[{}] compiled documents: {} reader, {} normalization, {} operation text",
        project_config.name,
        programs.reader.document_count(),
        programs.normalization.document_count(),
        programs.operation_text.document_count()
    );

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
