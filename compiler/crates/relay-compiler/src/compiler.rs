/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::build_schema;
use crate::compiler_state::{CompilerState, SourceSetName};
use crate::config::{Config, ConfigProject};
use crate::errors::{Error, Result};
use crate::watchman::GraphQLFinder;
use common::{FileKey, Timer};
use dependency_analyzer::get_reachable_ast;
use errors::try_map;
use fnv::FnvHashMap;
use graphql_ir::ValidationError;
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

    pub async fn compile(&self) -> Result<()> {
        let finder = GraphQLFinder::connect(&self.config).await.unwrap();

        let compiler_state = finder.query().await.unwrap();

        let ast_sets_timer = Timer::start("ast_sets");
        let mut ast_sets: AstSets = HashMap::new();
        let mut sources: Sources<'_> = FnvHashMap::default();
        let mut errors = Vec::new();
        for (source_set_name, source_set) in compiler_state.source_sets.iter() {
            let asts = ast_sets.entry(*source_set_name).or_insert_with(Vec::new);
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
                                .map(|error| error.with_source(file_source.into())),
                        ),
                    }
                    sources.insert(file_key, &file_source);
                }
            }
        }
        if !errors.is_empty() {
            return Err(Error::SyntaxErrors { errors });
        }
        ast_sets_timer.stop();

        try_map(self.config.projects.values(), |project_config| {
            self.build_project(&compiler_state, project_config, &ast_sets)
        })
        .map_err(|errors| Error::ValidationErrors {
            errors: errors
                .into_iter()
                .map(|error| error.with_sources(&sources))
                .collect(),
        })?;

        Ok(())
    }

    fn build_project(
        &self,
        compiler_state: &CompilerState,
        project_config: &ConfigProject,
        ast_sets: &AstSets,
    ) -> std::result::Result<(), Vec<ValidationError>> {
        let project_document_asts = ast_sets[&project_config.name.as_source_set_name()].to_vec();

        let base_document_asts = match project_config.base {
            Some(base_project_name) => ast_sets[&base_project_name.as_source_set_name()].clone(),
            None => Vec::new(),
        };

        let build_schema_timer = Timer::start(format!("build_schema {}", project_config.name));
        let schema = build_schema(compiler_state, project_config);
        build_schema_timer.stop();

        let build_ir_timer = Timer::start(format!("build_ir {}", project_config.name));
        let reachable_ast = get_reachable_ast(project_document_asts, vec![base_document_asts])
            .unwrap()
            .0;
        let ir = graphql_ir::build(&schema, &reachable_ast)?;
        build_ir_timer.stop();
        println!("[{}] IR node count {}", project_config.name, ir.len());

        Ok(())
    }
}
