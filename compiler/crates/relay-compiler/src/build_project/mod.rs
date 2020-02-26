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

use crate::compiler_state::{CompilerState, SourceSetName};
use crate::config::ConfigProject;
use common::Timer;
use graphql_ir::{Program, ValidationError};
use std::collections::HashMap;

pub fn build_project(
    compiler_state: &CompilerState,
    project_config: &ConfigProject,
    ast_sets: &HashMap<SourceSetName, Vec<graphql_syntax::ExecutableDefinition>>,
) -> std::result::Result<(), Vec<ValidationError>> {
    let build_schema_timer = Timer::start(format!("build_schema {}", project_config.name));
    let schema = build_schema::build_schema(compiler_state, project_config);
    build_schema_timer.stop();

    let ir = Timer::time(format!("build_ir {}", project_config.name), || {
        build_ir::build_ir(project_config, &schema, ast_sets)
    })?;

    let program = Timer::time(format!("build_program {}", project_config.name), || {
        Program::from_definitions(&schema, ir)
    });

    let programs = Timer::time(format!("apply_transforms {}", project_config.name), || {
        apply_transforms::apply_transforms(&program)
    });

    println!(
        "[{}] documents: {} reader, {} normalization, {} operation",
        project_config.name,
        programs.reader.document_count(),
        programs.normalization.document_count(),
        programs.operation_text.document_count()
    );

    Ok(())
}
