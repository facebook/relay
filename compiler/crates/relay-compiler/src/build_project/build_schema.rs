/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DiagnosticsResult;
use fnv::FnvHashMap;
use relay_config::ProjectName;
use schema::SDLSchema;

use super::build_resolvers_schema::extend_schema_with_resolvers;
use crate::compiler_state::CompilerState;
use crate::config::ProjectConfig;
use crate::GraphQLAsts;

pub fn build_schema(
    compiler_state: &CompilerState,
    project_config: &ProjectConfig,
    graphql_asts_map: &FnvHashMap<ProjectName, GraphQLAsts>,
) -> DiagnosticsResult<Arc<SDLSchema>> {
    let schema = compiler_state.schema_cache.get(&project_config.name);
    match schema {
        Some(schema) if !compiler_state.project_has_pending_schema_changes(project_config.name) => {
            Ok(schema.clone())
        }
        _ => {
            let mut extensions = vec![];
            if let Some(project_extensions) = compiler_state.extensions.get(&project_config.name) {
                extensions.extend(project_extensions.get_sources_with_location());
            }
            if let Some(base_project_name) = project_config.base {
                if let Some(base_project_extensions) =
                    compiler_state.extensions.get(&base_project_name)
                {
                    extensions.extend(base_project_extensions.get_sources_with_location());
                }
            }
            let mut schema_sources = Vec::new();
            schema_sources.extend(
                compiler_state.schemas[&project_config.name]
                    .get_sources_with_location()
                    .into_iter()
                    .map(|(schema, location_key)| (schema.as_str(), location_key)),
            );
            let mut schema =
                relay_schema::build_schema_with_extensions(&schema_sources, &extensions)?;

            if project_config.feature_flags.enable_relay_resolver_transform {
                extend_schema_with_resolvers(
                    &mut schema,
                    compiler_state,
                    project_config,
                    graphql_asts_map,
                )?;
            }

            Ok(Arc::new(schema))
        }
    }
}
