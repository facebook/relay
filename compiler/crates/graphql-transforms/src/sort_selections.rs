/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_context::CompilerContext;
use crate::util::ArcAddress;

use graphql_ir::{FragmentDefinition, InlineFragment, LinkedField, OperationDefinition, Selection};
use std::collections::HashMap;
use std::sync::Arc;

// Note on correctness: the ArcAddress here is calculated from addresses of the input
// context. Beecause those value are still referenced, that memory cannot be freed/
// reused for the lifetime of the transform.
type Seen = HashMap<ArcAddress, Selection>;

///
/// Sorts selections in the fragments and queries (and their selections)
///
pub fn sort_selections<'s>(ctx: &'s CompilerContext<'s>) -> CompilerContext<'s> {
    let mut next_context = CompilerContext::new(ctx.schema());
    let mut transformer = Transformer::new();
    for fragment in ctx.fragments() {
        next_context.insert_fragment(transformer.transform_fragment(fragment));
    }
    for operation in ctx.operations() {
        next_context.insert_operation(transformer.transform_operation(operation));
    }
    next_context
}

struct Transformer {
    seen: Seen,
}

impl Transformer {
    fn new() -> Self {
        Self {
            seen: Default::default(),
        }
    }

    fn transform_fragment(&mut self, fragment: &FragmentDefinition) -> FragmentDefinition {
        FragmentDefinition {
            name: fragment.name,
            type_condition: fragment.type_condition,
            directives: fragment.directives.clone(),
            variable_definitions: fragment.variable_definitions.clone(),
            used_global_variables: fragment.used_global_variables.clone(),
            selections: self.transform_selections(&mut fragment.selections.clone()),
        }
    }

    fn transform_operation(&mut self, operation: &OperationDefinition) -> OperationDefinition {
        OperationDefinition {
            kind: operation.kind.clone(),
            name: operation.name,
            type_: operation.type_,
            directives: operation.directives.clone(),
            variable_definitions: operation.variable_definitions.clone(),
            selections: self.transform_selections(&mut operation.selections.clone()),
        }
    }

    fn transfrom_inline_fragment(&mut self, fragment: &Arc<InlineFragment>) -> Selection {
        let key = ArcAddress::new(fragment);
        if let Some(prev) = self.seen.get(&key) {
            return prev.clone();
        }
        let result = Selection::InlineFragment(Arc::new(InlineFragment {
            type_condition: fragment.type_condition,
            directives: fragment.directives.clone(),
            selections: self.transform_selections(&mut fragment.selections.clone()),
        }));
        self.seen.insert(key, result.clone());
        result
    }

    fn transfrom_linked_field(&mut self, linked_field: &Arc<LinkedField>) -> Selection {
        let key = ArcAddress::new(linked_field);
        if let Some(prev) = self.seen.get(&key) {
            return prev.clone();
        }
        let result = Selection::LinkedField(Arc::new(LinkedField {
            alias: linked_field.alias,
            definition: linked_field.definition,
            arguments: linked_field.arguments.clone(),
            directives: linked_field.directives.clone(),
            selections: self.transform_selections(&mut linked_field.selections.clone()),
        }));
        self.seen.insert(key, result.clone());
        result
    }

    fn transform_selections(&mut self, selections: &mut Vec<Selection>) -> Vec<Selection> {
        selections.sort_unstable();

        selections
            .iter_mut()
            .map(|selection| match selection {
                Selection::ScalarField(_) => selection.clone(),
                Selection::FragmentSpread(_) => selection.clone(),
                Selection::LinkedField(node) => self.transfrom_linked_field(node),
                Selection::InlineFragment(node) => self.transfrom_inline_fragment(node),
            })
            .collect()
    }
}
