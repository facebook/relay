/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult};
use graphql_ir::{
    reexport::{Intern, StringKey},
    LinkedField, OperationDefinition, Program, Selection, Transformed, Transformer,
};
use lazy_static::lazy_static;
use schema::Schema;

lazy_static! {
    pub static ref QUERY_FIELD_NAME: StringKey = "__query".intern();
}

/**
 * TODO:
 *
 * In incomplete list of things that would need to be done to take this across the finish line:
 *
 * - Enforce that __query is only read at a fragment root
 * - Memoize fragment transformation
 * - What about fragments spread into mutations?
 * - Think about what this means for consumers of our schema/IR crates that are not Relay. Can they turn off `__query`?
 * - Test with refetchable and client edges
 * - Test with @requried (should "just work" since its does as part of reader)
 * - Test with @defer
 * - Test in Resolvers (should just work)
 * - Documentation
 * - End to end tests (test __query using `useFragment`)
 */

// Strips out all access to the Relay specific `__query` field, and hoists those
// selections up to the query root.
//
// Expected to applied to the operation/normalization AST.
pub fn query_field(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = QueryField::new(program);

    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct QueryField<'s> {
    program: &'s Program,
    errors: Vec<Diagnostic>,
    operation_query_selections: Vec<Selection>,
}

impl<'program> QueryField<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            errors: Default::default(),
            operation_query_selections: Default::default(),
        }
    }
}

impl<'s> Transformer for QueryField<'s> {
    const NAME: &'static str = "QueryFieldTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.operation_query_selections = Vec::new();
        let transformed = self.default_transform_operation(operation);
        match transformed {
            Transformed::Delete => Transformed::Delete,
            Transformed::Keep => {
                let mut selections = operation.selections.clone();
                selections.extend(self.operation_query_selections.clone());
                Transformed::Replace(OperationDefinition {
                    selections,
                    ..operation.clone()
                })
            }
            Transformed::Replace(operation) => {
                let mut selections = operation.selections.clone();
                selections.extend(self.operation_query_selections.clone());
                Transformed::Replace(OperationDefinition {
                    selections,
                    ..operation.clone()
                })
            }
        }
    }

    fn transform_fragment(
        &mut self,
        fragment: &graphql_ir::FragmentDefinition,
    ) -> Transformed<graphql_ir::FragmentDefinition> {
        // TODO: Memoize here?
        self.default_transform_fragment(fragment)
    }

    fn transform_linked_field(
        &mut self,
        field: &LinkedField,
    ) -> Transformed<graphql_ir::Selection> {
        let transforemed = self.default_transform_linked_field(field);
        if field.definition.item == self.program.schema.query_field() {
            self.operation_query_selections
                .extend(field.selections.clone());
            Transformed::Delete
        } else {
            transforemed
        }
    }

    fn transform_fragment_spread(
        &mut self,
        spread: &graphql_ir::FragmentSpread,
    ) -> Transformed<Selection> {
        // Ensure we traverse into fragments and discover any query fields nested within.
        // TODO: Memoize to ensure we don't visit the same fragment twice.
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        if let Transformed::Delete = self.transform_fragment(&fragment) {
            // If the fragment is deleted, we can delete the spread.
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }

    // TODO: What about resolvers?
}
