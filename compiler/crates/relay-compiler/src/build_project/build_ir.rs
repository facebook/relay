/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::SourceSetName;
use crate::config::ConfigProject;
use dependency_analyzer::get_reachable_ast;
use graphql_ir::ValidationError;
use schema::Schema;
use std::collections::HashMap;

pub fn build_ir(
    project_config: &ConfigProject,
    schema: &Schema,
    ast_sets: &HashMap<SourceSetName, Vec<graphql_syntax::ExecutableDefinition>>,
) -> Result<Vec<graphql_ir::ExecutableDefinition>, Vec<ValidationError>> {
    let project_document_asts = ast_sets[&project_config.name.as_source_set_name()].to_vec();
    let base_document_asts = match project_config.base {
        Some(base_project_name) => ast_sets[&base_project_name.as_source_set_name()].clone(),
        None => Vec::new(),
    };
    let reachable_ast = get_reachable_ast(project_document_asts, vec![base_document_asts])
        .unwrap()
        .0;
    graphql_ir::build(&schema, &reachable_ast)
}
