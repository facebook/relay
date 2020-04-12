/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::CompilerState;
use crate::config::ProjectConfig;
use schema::Schema;

pub fn build_schema(compiler_state: &CompilerState, project_config: &ProjectConfig) -> Schema {
    let relay_extensions = String::from(schema::RELAY_EXTENSIONS);
    let mut extensions = vec![&relay_extensions];
    if let Some(project_extensions) = compiler_state.extensions.get(&project_config.name) {
        extensions.extend(project_extensions);
    }
    if let Some(base_project_name) = project_config.base {
        if let Some(base_project_extensions) = compiler_state.extensions.get(&base_project_name) {
            extensions.extend(base_project_extensions);
        }
    }
    let mut schema_sources = Vec::new();
    schema_sources.extend(
        compiler_state.schemas[&project_config.name]
            .iter()
            .map(String::as_str),
    );
    schema::build_schema_with_extensions(&schema_sources, &extensions).unwrap()
}
