/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::{CompilerState, SourceSetName};
use crate::config::{Config, ConfigProject};
use crate::watchman::GraphQLFinder;
use common::{FileKey, Timer};
use dependency_analyzer::get_reachable_ast;
use fnv::FnvHashMap;
use graphql_syntax::ExecutableDefinition;
use std::collections::HashMap;

pub struct Compiler {
    config: Config,
}

type Sources<'a> = FnvHashMap<FileKey, &'a str>;
type AstSets = HashMap<SourceSetName, Vec<ExecutableDefinition>>;

impl Compiler {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn compile(&self) {
        let finder = GraphQLFinder::connect(&self.config).await.unwrap();

        let compiler_state = finder.query().await.unwrap();

        let ast_sets_timer = Timer::start("ast_sets");
        let mut ast_sets: AstSets = HashMap::new();
        let mut sources: Sources<'_> = FnvHashMap::default();
        let mut errors = Vec::new();
        for (source_set_name, source_set) in compiler_state.source_sets.iter() {
            let asts = ast_sets
                .entry(*source_set_name)
                .or_insert_with(|| Vec::new());
            for (file_name, file_sources) in source_set.0.iter() {
                for (index, file_source) in file_sources.iter().enumerate() {
                    let source = format!("{}:{}", file_name.to_string_lossy(), index);
                    let file_key = FileKey::new(&source);
                    match graphql_syntax::parse(&file_source, file_key) {
                        Ok(document) => {
                            asts.extend(document.definitions);
                        }
                        Err(ast_errors) => errors.extend(
                            ast_errors
                                .into_iter()
                                .map(|error| error.print(&file_source)),
                        ),
                    }
                    sources.insert(file_key, &file_source);
                }
            }
        }
        if !errors.is_empty() {
            println!("Failed with parse errors:");
            println!("{}", errors.join("\n\n"));
            return;
        }
        ast_sets_timer.stop();

        for project_config in self.config.projects.values() {
            self.build_project(&compiler_state, project_config, &sources, &ast_sets);
        }
    }

    fn build_project(
        &self,
        compiler_state: &CompilerState,
        project_config: &ConfigProject,
        sources: &Sources<'_>,
        ast_sets: &AstSets,
    ) {
        let project_document_asts = ast_sets[&project_config.name.as_source_set_name()].to_vec();

        let mut extensions = Vec::new();
        if let Some(project_extensions) = compiler_state.extensions.get(&project_config.name) {
            extensions.extend(project_extensions);
        }

        let mut base_document_asts = Vec::new();

        // if we have base project, add their asts and extensions.
        // TODO: this should probably work recursively
        if let Some(base_project_name) = project_config.base {
            base_document_asts.extend(
                ast_sets[&base_project_name.as_source_set_name()]
                    .iter()
                    .cloned(),
            );

            if let Some(base_project_extensions) = compiler_state.extensions.get(&base_project_name)
            {
                extensions.extend(base_project_extensions);
            }
        }

        let build_schema_timer = Timer::start(format!("build_schema {}", project_config.name));
        let mut schema_sources = vec![schema::RELAY_EXTENSIONS];
        schema_sources.extend(
            compiler_state.schemas[&project_config.name]
                .iter()
                .map(String::as_str),
        );
        let schema = schema::build_schema_with_extensions(&schema_sources, &extensions).unwrap();
        build_schema_timer.stop();

        let build_ir_timer = Timer::start(format!("build_ir {}", project_config.name));
        let reachable_ast = get_reachable_ast(project_document_asts, vec![base_document_asts])
            .unwrap()
            .0;
        let ir: Vec<_> = match graphql_ir::build(&schema, &reachable_ast) {
            Ok(ir) => ir,
            Err(errors) => {
                println!(
                    "[{}] Failed with {} validation errors:",
                    project_config.name,
                    errors.len()
                );
                println!(
                    "{}",
                    errors
                        .iter()
                        .map(|error| error.print(sources))
                        .collect::<Vec<_>>()
                        .join("\n\n")
                );
                return;
            }
        };
        build_ir_timer.stop();
        println!("[{}] IR node count {}", project_config.name, ir.len());
    }
}
