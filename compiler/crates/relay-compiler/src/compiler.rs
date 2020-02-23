/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::config::Config;
use crate::watchman::GraphQLFinder;
use common::Timer;
use dependency_analyzer::get_reachable_ast;
use std::collections::HashMap;

pub struct Compiler {
    config: Config,
}

impl Compiler {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn compile(&self) {
        let finder = GraphQLFinder::connect(&self.config).await.unwrap();

        let compiler_state = finder.query().await.unwrap();

        for (source_set_name, source_set) in &compiler_state.source_sets {
            let definition_count: usize = source_set
                .0
                .values()
                .map(|file_definitions| file_definitions.len())
                .sum();
            let file_count = source_set.0.len();
            println!(
                "{} has {} definitions from {} files",
                source_set_name.0, definition_count, file_count
            );
        }

        let ast_sets_timer = Timer::start("ast_sets");
        let ast_sets: HashMap<_, _> = compiler_state
            .source_sets
            .iter()
            .map(|(source_set_name, source_set)| {
                (
                    source_set_name,
                    source_set
                        .0
                        .iter()
                        .flat_map(|(file_name, file_sources)| {
                            file_sources
                                .iter()
                                .enumerate()
                                .flat_map(move |(index, file_source)| {
                                    graphql_syntax::parse(
                                        &file_source,
                                        &format!("{}:{}", file_name.to_string_lossy(), index),
                                    )
                                    .unwrap()
                                    .definitions
                                })
                        })
                        .collect::<Vec<_>>(),
                )
            })
            .collect();
        ast_sets_timer.stop();

        for (project_name, project_config) in &self.config.projects {
            // TODO avoid cloned() here
            let project_document_asts = ast_sets[&project_name.as_source_set_name()].to_vec();

            let mut extensions = Vec::new();
            if let Some(project_extensions) = compiler_state.extensions.get(&project_name) {
                extensions.extend(project_extensions);
            }

            let mut base_document_asts = Vec::new();

            // if we have base project, add their asts and extensions.
            // TODO: this should probably work recursively
            if let Some(base_project_name) = project_config.base {
                // TODO avoid cloned() here
                base_document_asts.extend(
                    ast_sets[&base_project_name.as_source_set_name()]
                        .iter()
                        .cloned(),
                );

                if let Some(base_project_extensions) =
                    compiler_state.extensions.get(&base_project_name)
                {
                    extensions.extend(base_project_extensions);
                }
            }

            let build_schema_timer = Timer::start(format!("build_schema {}", project_name));
            let mut schema_sources = vec![schema::RELAY_EXTENSIONS];
            schema_sources.extend(
                compiler_state.schemas[&project_name]
                    .iter()
                    .map(String::as_str),
            );
            let schema =
                schema::build_schema_with_extensions(&schema_sources, &extensions).unwrap();
            build_schema_timer.stop();

            let build_ir_timer = Timer::start(format!("build_ir {}", project_name));
            let reachable_ast = get_reachable_ast(project_document_asts, vec![base_document_asts])
                .unwrap()
                .0;
            let ir: Vec<_> = match graphql_ir::build(&schema, &reachable_ast) {
                Ok(ir) => ir,
                Err(errors) => {
                    println!("IR errors: {:#?}", errors);
                    continue;
                }
            };
            build_ir_timer.stop();
            println!("[{}] IR node count {}", project_name, ir.len());
        }
    }
}
