/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DiagnosticsResult;
use graphql_ir::FragmentDefinition;
use graphql_ir::OperationDefinitionName;
use relay_config::SchemaConfig;
use schema::SDLSchema;
use schema::Schema;

use super::QueryGenerator;
use super::RefetchRoot;
use super::RefetchableMetadata;
use super::build_fragment_metadata_as_directive;
use super::build_fragment_spread;
use super::build_operation_variable_definitions;
use super::build_used_global_variables;
use super::uses_prefetchable_pagination_in_connection;
use crate::root_variables::VariableMap;

fn build_refetch_operation(
    schema: &SDLSchema,
    _schema_config: &SchemaConfig,
    fragment: &Arc<FragmentDefinition>,
    query_name: OperationDefinitionName,
    variables_map: &VariableMap,
) -> DiagnosticsResult<Option<RefetchRoot>> {
    let query_type = schema.query_type().unwrap();
    if fragment.type_condition != query_type {
        return Ok(None);
    }

    let fragment = Arc::new(FragmentDefinition {
        directives: build_fragment_metadata_as_directive(
            fragment,
            RefetchableMetadata {
                operation_name: query_name,
                path: vec![],
                identifier_info: None,
                is_prefetchable_pagination: uses_prefetchable_pagination_in_connection(fragment),
            },
        ),
        used_global_variables: build_used_global_variables(
            variables_map,
            &fragment.variable_definitions,
        )?,
        variable_definitions: fragment.variable_definitions.clone(),
        ..fragment.as_ref().clone()
    });
    Ok(Some(RefetchRoot {
        variable_definitions: build_operation_variable_definitions(&fragment),
        selections: vec![build_fragment_spread(&fragment)],
        fragment,
    }))
}

pub const QUERY_QUERY_GENERATOR: QueryGenerator = QueryGenerator {
    description: "the Query type",
    build_refetch_operation,
};
