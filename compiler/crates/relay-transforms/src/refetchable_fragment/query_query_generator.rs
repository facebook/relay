/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{
    build_fragment_metadata_as_directive, build_fragment_spread,
    build_operation_variable_definitions, build_used_global_variables, QueryGenerator, RefetchRoot,
    RefetchableMetadata,
};
use crate::root_variables::VariableMap;
use common::DiagnosticsResult;
use graphql_ir::FragmentDefinition;
use intern::string_key::StringKey;
use schema::{SDLSchema, Schema};
use std::sync::Arc;

fn build_refetch_operation(
    schema: &SDLSchema,
    fragment: &Arc<FragmentDefinition>,
    query_name: StringKey,
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
                identifier_field: None,
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
