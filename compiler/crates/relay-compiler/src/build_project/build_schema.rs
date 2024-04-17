/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DiagnosticsResult;
use common::Location;
use common::PerfLogEvent;
use common::Span;
use fnv::FnvHashMap;
use relay_config::ProjectName;
use schema::SDLSchema;
use schema_validate_lib::validate;
use schema_validate_lib::SchemaValidationOptions;

use super::build_resolvers_schema::extend_schema_with_resolvers;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::config::ProjectConfig;
use crate::GraphQLAsts;

pub fn build_schema(
    compiler_state: &CompilerState,
    config: &Config,
    project_config: &ProjectConfig,
    graphql_asts_map: &FnvHashMap<ProjectName, GraphQLAsts>,
    log_event: &impl PerfLogEvent,
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
            let mut schema = log_event.time("build_schema_with_extension_time", || {
                relay_schema::build_schema_with_extensions(&schema_sources, &extensions)
            })?;

            if project_config.feature_flags.enable_relay_resolver_transform {
                log_event.time("extend_schema_with_resolvers_time", || {
                    extend_schema_with_resolvers(
                        &mut schema,
                        config,
                        compiler_state,
                        project_config,
                        graphql_asts_map,
                    )
                })?;
            }

            if project_config
                .feature_flags
                .enable_experimental_schema_validation
            {
                log_event.time("validate_composite_schema_time", || {
                    let default_location_key = schema_sources
                        .first()
                        .map(|(_, key)| key)
                        .or_else(|| extensions.first().map(|(_, key)| key));

                    let default_location = match default_location_key {
                        Some(location) => Location::new(*location, Span::empty()),
                        None => Location::generated(),
                    };

                    validate(
                        &schema,
                        default_location,
                        SchemaValidationOptions {
                            allow_introspection_names: true,
                        },
                    )
                })?;
            }

            Ok(Arc::new(schema))
        }
    }
}
