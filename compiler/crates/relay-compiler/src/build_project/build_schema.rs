/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DiagnosticsResult;
use common::PerfLogEvent;
use fnv::FnvHashMap;
use relay_config::ProjectName;
use relay_docblock::validate_resolver_schema;
use schema::SDLSchema;
use schema::SchemaDocuments;
use schema::parse_schema_with_extensions;
use schema_validate_lib::SchemaValidationOptions;
use schema_validate_lib::validate;

use super::build_resolvers_schema::build_resolver_types_schema_documents;
use super::build_resolvers_schema::extend_schema_with_field_ir;
use super::build_resolvers_schema::extract_docblock_ir;
use crate::GraphQLAsts;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::config::ProjectConfig;

pub fn build_schema(
    compiler_state: &CompilerState,
    config: &Config,
    project_config: &ProjectConfig,
    graphql_asts_map: &FnvHashMap<ProjectName, GraphQLAsts>,
    log_event: &impl PerfLogEvent,
) -> DiagnosticsResult<Arc<SDLSchema>> {
    if let Some(schema) = compiler_state.schema_cache.get(&project_config.name)
        && !compiler_state.project_has_pending_schema_changes(project_config.name)
    {
        return Ok(schema.clone());
    }
    build_schema_impl(
        compiler_state,
        project_config,
        log_event,
        config,
        graphql_asts_map,
    )
}

fn build_schema_impl(
    compiler_state: &CompilerState,
    project_config: &ProjectConfig,
    log_event: &impl PerfLogEvent,
    config: &Config,
    graphql_asts_map: &FnvHashMap<ProjectName, GraphQLAsts>,
) -> DiagnosticsResult<Arc<SDLSchema>> {
    let schema_sources = get_schema_sources(compiler_state, project_config);
    let extensions = get_extension_sources(compiler_state, project_config);

    // Parse the server and extension schema text
    let SchemaDocuments {
        server: server_asts,
        extensions: mut extension_asts,
    } = log_event.time("parse_schema_time", || {
        parse_schema_with_extensions(&schema_sources, &extensions)
    })?;

    // Collect Relay Resolver schema IR
    let resolver_schema_data = log_event.time("collect_resolver_schema_time", || {
        extract_docblock_ir(config, compiler_state, project_config, graphql_asts_map)
    })?;

    // Convert resolver schema to AST and append it to extension ASTs
    log_event.time("build_resolver_types_schema_time", || {
        extension_asts.extend(build_resolver_types_schema_documents(
            &resolver_schema_data.type_irs,
            config,
            project_config,
        ));
    });

    // Now that all the named types have been collected, we can build
    // the normalized schema. All names should be able to be resolved.
    let mut schema = log_event.time("build_schema_time", || {
        relay_schema::build_schema_with_extensions_from_asts(server_asts, extension_asts)
    })?;

    // Now that the normalized schema has been built we can add fields to existing types by name.
    log_event.time("extend_schema_with_resolver_fields_time", || {
        extend_schema_with_field_ir(
            resolver_schema_data.field_irs,
            &mut schema,
            config,
            project_config,
        )
    })?;

    // Now that the schema has been fully extended to include all Resolver types
    // and fields we can apply resolver-specific validations.
    log_event.time("validate_resolver_schema_time", || {
        validate_resolver_schema(&schema, &project_config.feature_flags)
    })?;

    log_event.time("validate_composite_schema_time", || {
        maybe_validate_schema(project_config, &schema)
    })?;

    Ok(Arc::new(schema))
}

fn get_schema_sources<'a>(
    compiler_state: &'a CompilerState,
    project_config: &'a ProjectConfig,
) -> Vec<(&'a str, common::SourceLocationKey)> {
    compiler_state.schemas[&project_config.name]
        .get_sources_with_location()
        .into_iter()
        .map(|(schema, location_key)| (schema.as_str(), location_key))
        .collect()
}

fn get_extension_sources<'a>(
    compiler_state: &'a CompilerState,
    project_config: &'a ProjectConfig,
) -> Vec<(&'a String, common::SourceLocationKey)> {
    let mut extensions = vec![];
    if let Some(project_extensions) = compiler_state.extensions.get(&project_config.name) {
        extensions.extend(project_extensions.get_sources_with_location());
    }
    if let Some(base_project_name) = project_config.base
        && let Some(base_project_extensions) = compiler_state.extensions.get(&base_project_name)
    {
        extensions.extend(base_project_extensions.get_sources_with_location());
    }
    extensions
}

fn maybe_validate_schema(
    project_config: &ProjectConfig,
    schema: &SDLSchema,
) -> DiagnosticsResult<()> {
    if project_config.feature_flags.disable_schema_validation {
        return Ok(());
    }

    validate(
        schema,
        SchemaValidationOptions {
            allow_introspection_names: true,
        },
    )
}
