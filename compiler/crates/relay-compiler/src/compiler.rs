/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::config::Config;
use crate::watchman::GraphQLFinder;

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
    }
}
