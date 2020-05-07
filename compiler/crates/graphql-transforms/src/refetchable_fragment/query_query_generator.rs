/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{
    build_fragment_spread, build_operation_variable_definitions, QueryGenerator, RefetchRoot,
};
use crate::root_variables::VariableMap;
use common::WithLocation;
use graphql_ir::{FragmentDefinition, OperationDefinition, ValidationResult};
use graphql_syntax::OperationKind;
use interner::StringKey;
use schema::Schema;
use std::sync::Arc;

fn build_refetch_operation(
    schema: &Schema,
    fragment: &Arc<FragmentDefinition>,
    query_name: StringKey,
    variables_map: &VariableMap,
) -> ValidationResult<Option<RefetchRoot>> {
    let query_type = schema.query_type().unwrap();
    if fragment.type_condition != query_type {
        return Ok(None);
    }
    Ok(Some(RefetchRoot {
        identifier_field: None,
        path: vec![],
        operation: Arc::new(OperationDefinition {
            kind: OperationKind::Query,
            name: WithLocation::new(fragment.name.location, query_name),
            type_: query_type,
            variable_definitions: build_operation_variable_definitions(
                variables_map,
                &fragment.variable_definitions,
            ),
            directives: vec![],
            selections: vec![build_fragment_spread(fragment)],
        }),
        fragment: Arc::clone(fragment),
    }))
}

pub const QUERY_QUERY_GENERATOR: QueryGenerator = QueryGenerator {
    description: "the Query type",
    build_refetch_operation,
};
