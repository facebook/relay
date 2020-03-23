/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler::AstSets;
use crate::config::ConfigProject;
use dependency_analyzer::{get_reachable_ast, ReachableAst};
use fnv::FnvHashSet;
use graphql_ir::ValidationError;
use interner::StringKey;
use schema::Schema;

pub struct BuildIRResult {
    pub ir: Vec<graphql_ir::ExecutableDefinition>,
    pub base_fragment_names: FnvHashSet<StringKey>,
}

pub fn build_ir(
    project_config: &ConfigProject,
    schema: &Schema,
    ast_sets: &AstSets,
) -> Result<BuildIRResult, Vec<ValidationError>> {
    let project_document_asts = ast_sets[&project_config.name].to_vec();
    let base_document_asts = match project_config.base {
        Some(base_project_name) => ast_sets[&base_project_name].clone(),
        None => Vec::new(),
    };
    let ReachableAst {
        definitions: reachable_ast,
        base_fragment_names,
    } = get_reachable_ast(project_document_asts, base_document_asts).unwrap();
    let ir = graphql_ir::build(&schema, &reachable_ast)?;
    Ok(BuildIRResult {
        ir,
        base_fragment_names,
    })
}
