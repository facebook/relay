/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_codegen_ast::{build_fragment, build_operation};
use graphql_ir::{ExecutableDefinition, FragmentDefinition, OperationDefinition};
use schema::Schema;

pub fn print_json(schema: &Schema, definition: &ExecutableDefinition) -> String {
    match definition {
        ExecutableDefinition::Operation(operation) => print_operation(schema, operation),
        ExecutableDefinition::Fragment(fragment) => print_fragment(schema, fragment),
    }
}

pub fn print_fragment(schema: &Schema, fragment: &FragmentDefinition) -> String {
    let ast = build_fragment(schema, fragment);
    serde_json::to_string_pretty(&ast).unwrap()
}

pub fn print_operation(schema: &Schema, operation: &OperationDefinition) -> String {
    // TODO build a concrete request instead of just a normalization ast
    let ast = build_operation(schema, operation);
    serde_json::to_string_pretty(&ast).unwrap()
}

pub fn print_deduped_json(_definition: &ExecutableDefinition) -> String {
    // TODO
    // The idea is for this function to operate directly on serde::Value's to dedupe
    // the printed JSON.
    // This will follow in the nexts diffs in this stac
    unimplemented!()
}
