/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::PerfLogEvent;
use fnv::FnvHashMap;
use relay_config::ProjectName;
use relay_docblock::validate_resolver_schema;
use schema::parse_schema_with_extensions;
use schema::SDLSchema;
use schema::SchemaAsts;
use schema_validate_lib::validate;
use schema_validate_lib::SchemaValidationOptions;

use super::build_resolvers_schema::build_resolver_types_schema_documents;
use super::build_resolvers_schema::extend_schema_with_field_ir;
use super::build_resolvers_schema::extract_docblock_ir;
use super::build_resolvers_schema::ExtractedDocblockIr;
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
    // First we check if there's already a schema cached in our compiler state
    if let Some(schema) = compiler_state.schema_cache.get(&project_config.name) {
        return Ok(schema.clone());
    }

    // Collect schema extension text
    let mut extensions = vec![];
    if let Some(project_extensions) = compiler_state.extensions.get(&project_config.name) {
        extensions.extend(project_extensions.get_sources_with_location());
    }
    if let Some(base_project_name) = project_config.base {
        if let Some(base_project_extensions) = compiler_state.extensions.get(&base_project_name) {
            extensions.extend(base_project_extensions.get_sources_with_location());
        }
    }

    // Collect server schema text
    let schema_sources = compiler_state.schemas[&project_config.name]
        .get_sources_with_location()
        .into_iter()
        .map(|(schema, location_key)| (schema.as_str(), location_key))
        .collect::<Vec<_>>();

    // Parse the server and extension schema text
    let SchemaAsts {
        server: server_asts,
        client: mut extension_asts,
    } = log_event.time("parse_schema_time", || {
        parse_schema_with_extensions(&schema_sources, &extensions)
    })?;

    // Collect Relay Resolver schema IR
    let resolver_schema_data = if project_config.feature_flags.enable_relay_resolver_transform {
        extract_docblock_ir(config, compiler_state, project_config, graphql_asts_map)?
    } else {
        ExtractedDocblockIr::default()
    };

    // Convert resolver schema to AST and append it to extension ASTs
    extension_asts.extend(build_resolver_types_schema_documents(
        &resolver_schema_data.type_irs,
        &config,
        &project_config,
    ));

    // Now that all the named types have been collected, we can build
    // the normalized schema. All names should be able to be resolved.
    let mut schema = log_event.time("build_schema_time", || {
        relay_schema::build_schema_with_extensions_from_asts(server_asts, extension_asts)
    })?;

    // Now that the normalized schema has been built we can add fields to existing types by name.
    extend_schema_with_field_ir(
        resolver_schema_data.field_irs,
        &mut schema,
        config,
        project_config,
    )?;

    // Now that the schema has been fully extended to include all Resolver types
    // and fields we can apply resolver-specific validations.
    validate_resolver_schema(&schema, &project_config.feature_flags)?;

    // Now that the schema is complete, we can validate it
    if project_config
        .feature_flags
        .enable_experimental_schema_validation
    {
        let options = SchemaValidationOptions {
            allow_introspection_names: true,
        };
        let validation_context = log_event.time("validate_composite_schema_time", || {
            validate(&schema, options)
        });
        if !validation_context.errors.is_empty() {
            // TODO: Before removing this feature flag, we should update schema validation
            // to be able to return a list of Diagnostics with locations.
            return Err(vec![Diagnostic::error(
                validation_context.print_errors(),
                Location::generated(),
            )]);
        }
    }

    Ok(Arc::new(schema))
}
