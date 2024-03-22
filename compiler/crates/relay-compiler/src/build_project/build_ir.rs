/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use common::Diagnostic;
use common::PerfLogEvent;
use dependency_analyzer::get_reachable_ir;
use fnv::FnvHashMap;
use graphql_ir::ExecutableDefinitionName;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::OperationDefinitionName;
use graphql_syntax::ExecutableDefinition;
use graphql_text_printer::print_executable_definition_ast;
use md5::Digest;
use md5::Md5;
use relay_transforms::annotate_resolver_root_fragments;
use schema::SDLSchema;

use super::BuildMode;
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
    project_config: &ProjectConfig,
    project_asts: ProjectAsts,
    schema: &SDLSchema,
    build_mode: BuildMode,
    log_event: &impl PerfLogEvent,
) -> Result<BuildIRResult, Vec<Diagnostic>> {
    let asts = project_asts.definitions;
    let source_hashes = SourceHashes::from_definitions(&asts);
    let mut ir = graphql_ir::build_ir_in_relay_mode(schema, &asts, &project_config.feature_flags)?;
    if project_config.resolvers_schema_module.is_some() {
        ir = annotate_resolver_root_fragments(schema, ir);
    }
    let affected_ir: Vec<graphql_ir::ExecutableDefinition> = match build_mode {
        BuildMode::Incremental => get_reachable_ir(
            ir,
            project_asts.base_definition_names,
            project_asts.changed_names,
            schema,
            HashSet::default(),
            log_event,
        ),
        BuildMode::IncrementalWithSchemaChanges(changes) => get_reachable_ir(
            ir,
            project_asts.base_definition_names,
            project_asts.changed_names,
            schema,
            changes,
            log_event,
        ),
        BuildMode::Full => ir,
    };
    Ok(BuildIRResult {
        ir: affected_ir,
        source_hashes,
    })
}

fn md5(data: &str) -> String {
    let mut md5 = Md5::new();
    md5.update(data);
    hex::encode(md5.finalize())
}
