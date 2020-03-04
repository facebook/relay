/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::build_project;
use crate::compiler_state::{CompilerState, SourceSetName};
use crate::config::Config;
use crate::errors::{Error, Result};
use crate::watchman::GraphQLFinder;
use common::{FileKey, Timer};
use fnv::FnvHashMap;
use graphql_ir::Sources;
use graphql_syntax::ExecutableDefinition;
use std::collections::HashMap;

pub struct Compiler {
    config: Config,
}

type AstSets = HashMap<SourceSetName, Vec<ExecutableDefinition>>;

impl Compiler {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub async fn compile(&self) -> Result<()> {
        let finder = GraphQLFinder::connect(&self.config).await.unwrap();

        let compiler_state = finder.query().await.unwrap();

        let (ast_sets, sources) = Timer::time("ast_sets", || self.parse_ast_sets(&compiler_state))?;

        self.build_projects(&compiler_state, &ast_sets, &sources)
            .await?;

        Ok(())
    }

    /// Parses all source files into ASTs and builds up a Sources map that can
    /// be used to print errors with source code listing.
    fn parse_ast_sets<'state>(
        &self,
        compiler_state: &'state CompilerState,
    ) -> Result<(AstSets, Sources<'state>)> {
        let mut ast_sets: AstSets = HashMap::new();
        let mut sources: Sources<'state> = FnvHashMap::default();
        let mut syntax_errors = Vec::new();
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
                        Err(errors) => syntax_errors.extend(
                            errors
                                .into_iter()
                                .map(|error| error.with_source(file_source.into())),
                        ),
                    }
                    sources.insert(file_key, &file_source);
                }
            }
        }
        if syntax_errors.is_empty() {
            Ok((ast_sets, sources))
        } else {
            Err(Error::SyntaxErrors {
                errors: syntax_errors,
            })
        }
    }

    async fn build_projects(
        &self,
        compiler_state: &CompilerState,
        ast_sets: &AstSets,
        sources: &Sources<'_>,
    ) -> Result<()> {
        let mut validation_errors = vec![];
        for project_config in self.config.projects.values() {
            // TODO: consider running all projects in parallel
            match build_project(compiler_state, &self.config, project_config, ast_sets).await {
                Ok(()) => {}
                Err(err) => validation_errors.extend(err),
            }
        }
        if validation_errors.is_empty() {
            Ok(())
        } else {
            Err(Error::ValidationErrors {
                errors: validation_errors
                    .into_iter()
                    .map(|error| error.with_sources(sources))
                    .collect(),
            })
        }
    }
}
