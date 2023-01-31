/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use dependency_analyzer::get_reachable_ir;
use fnv::FnvHashMap;
use graphql_ir::ExecutableDefinitionName;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::OperationDefinitionName;
use graphql_syntax::ExecutableDefinition;
use graphql_text_printer::print_executable_definition_ast;
use md5::Digest;
use md5::Md5;
use schema::SDLSchema;

use super::ProjectAsts;
use crate::config::ProjectConfig;

pub struct BuildIRResult {
    pub ir: Vec<graphql_ir::ExecutableDefinition>,
    pub source_hashes: SourceHashes,
}

/// Map fragments and queries definition names to the md5 of they printed source
pub struct SourceHashes(FnvHashMap<ExecutableDefinitionName, String>);

impl SourceHashes {
    pub fn from_definitions(definitions: &[ExecutableDefinition]) -> Self {
        let mut source_hashes = FnvHashMap::default();
        for ast in definitions {
            if let Some(name) = ast.name() {
                let key = match ast {
                    ExecutableDefinition::Operation(_) => OperationDefinitionName(name).into(),
                    ExecutableDefinition::Fragment(_) => FragmentDefinitionName(name).into(),
                };
                source_hashes.insert(key, md5(&print_executable_definition_ast(ast)));
            }
        }
        Self(source_hashes)
    }

    pub fn get(&self, k: &ExecutableDefinitionName) -> Option<&String> {
        self.0.get(k)
    }
}

pub fn build_ir(
    _project_config: &ProjectConfig,
    project_asts: ProjectAsts,
    schema: &SDLSchema,
    is_incremental_build: bool,
) -> Result<BuildIRResult, Vec<Diagnostic>> {
    let asts = project_asts.definitions;
    let source_hashes = SourceHashes::from_definitions(&asts);
    let ir = graphql_ir::build_ir_in_relay_mode(schema, &asts)?;
    if is_incremental_build {
        let affected_ir = get_reachable_ir(
            ir,
            project_asts.base_definition_names,
            project_asts.changed_names,
            schema,
        );
        Ok(BuildIRResult {
            ir: affected_ir,
            source_hashes,
        })
    } else {
        Ok(BuildIRResult { ir, source_hashes })
    }
}

fn md5(data: &str) -> String {
    let mut md5 = Md5::new();
    md5.update(data);
    hex::encode(md5.finalize())
}
