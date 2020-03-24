/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::config::ProjectConfig;
use crate::parse_sources::GraphQLAsts;
use dependency_analyzer::{get_reachable_ast, get_reachable_ir, ReachableAst};
use fnv::FnvHashSet;
use graphql_ir::ValidationError;
use interner::StringKey;
use schema::Schema;

pub struct BuildIRResult {
    pub ir: Vec<graphql_ir::ExecutableDefinition>,
    pub base_fragment_names: FnvHashSet<StringKey>,
}

pub fn build_ir(
    project_config: &ProjectConfig,
    schema: &Schema,
    graphql_asts: &GraphQLAsts<'_>,
    is_incremental_build: bool,
) -> Result<BuildIRResult, Vec<ValidationError>> {
    let project_asts = graphql_asts.asts_for_source_set(project_config.name);
    let (base_project_asts, base_definition_names) = match project_config.base {
        Some(base_project_name) => {
            let base_project_asts = graphql_asts.asts_for_source_set(base_project_name);
            let base_definition_names = base_project_asts
                .iter()
                .filter_map(|definition| match definition {
                    graphql_syntax::ExecutableDefinition::Operation(operation) => {
                        // TODO(T64459085): Figure out what to do about unnamed (anonymous) operations
                        let operation_name = operation.name.clone();
                        operation_name.map(|name| name.value)
                    }
                    graphql_syntax::ExecutableDefinition::Fragment(fragment) => {
                        Some(fragment.name.value)
                    }
                })
                .collect::<FnvHashSet<_>>();
            (base_project_asts, base_definition_names)
        }
        None => (Vec::new(), FnvHashSet::default()),
    };
    let ReachableAst {
        definitions: reachable_ast,
        base_fragment_names,
    } = get_reachable_ast(project_asts, base_project_asts).unwrap();

    let ir = graphql_ir::build(&schema, &reachable_ast)?;
    if is_incremental_build {
        let mut changed_names = graphql_asts.changed_names_for_source_set(project_config.name);
        if let Some(base_project_name) = project_config.base {
            changed_names.extend(graphql_asts.changed_names_for_source_set(base_project_name));
        }
        let affected_ir = get_reachable_ir(ir, base_definition_names, changed_names);
        Ok(BuildIRResult {
            ir: affected_ir,
            base_fragment_names,
        })
    } else {
        Ok(BuildIRResult {
            ir,
            base_fragment_names,
        })
    }
}
