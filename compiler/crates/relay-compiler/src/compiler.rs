/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::build_project;
use crate::compiler_state::SourceSetName;
use crate::config::Config;
use crate::errors::{Error, Result};
use crate::watchman::GraphQLFinder;
use common::{FileKey, Timer};
use errors::try_map;
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
            build_project(&compiler_state, project_config, &ast_sets)
        })
        .map_err(|errors| Error::ValidationErrors {
            errors: errors
                .into_iter()
                .map(|error| error.with_sources(&sources))
                .collect(),
        })?;

        Ok(())
    }
}
