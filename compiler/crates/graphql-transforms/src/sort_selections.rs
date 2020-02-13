/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_context::CompilerContext;
use graphql_ir::{
    FragmentDefinition, FragmentSpread, InlineFragment, LinkedField, OperationDefinition,
    ScalarField, Selection, Transformed, Transformer,
};
use std::sync::Arc;

///
/// Sorts selections in the fragments and queries (and their selections)
///
pub fn sort_selections<'s>(ctx: &'s CompilerContext<'s>) -> CompilerContext<'s> {
    let mut next_context = CompilerContext::new(ctx.schema());
    let mut transform = SortSelectionsTransform::new();
    for operation in ctx.operations() {
        match transform.transform_operation(operation) {
            Transformed::Delete => {}
            Transformed::Keep => next_context.insert_operation(Arc::clone(operation)),
            Transformed::Replace(replacement) => {
                next_context.insert_operation(Arc::new(replacement))
            }
        }
    }
    for fragment in ctx.fragments() {
        match transform.transform_fragment(fragment) {
            Transformed::Delete => {}
            Transformed::Keep => next_context.insert_fragment(Arc::clone(fragment)),
            Transformed::Replace(replacement) => {
                next_context.insert_fragment(Arc::new(replacement))
            }
        }
    }
    next_context
}

#[derive(Default)]
struct SortSelectionsTransform {}

impl SortSelectionsTransform {
    pub fn new() -> Self {
        Default::default()
    }
}

impl Transformer for SortSelectionsTransform {
    const NAME: &'static str = "SortSelectionsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        Transformed::Replace(FragmentDefinition {
            name: fragment.name,
            type_condition: fragment.type_condition,
            directives: fragment.directives.clone(),
            variable_definitions: fragment.variable_definitions.clone(),
            used_global_variables: fragment.used_global_variables.clone(),
            selections: self.transform_selections(&fragment.selections).unwrap(),
        })
    }

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        Transformed::Replace(OperationDefinition {
            kind: operation.kind.clone(),
            name: operation.name,
            type_: operation.type_,
            directives: operation.directives.clone(),
            variable_definitions: operation.variable_definitions.clone(),
            selections: self.transform_selections(&operation.selections).unwrap(),
        })
    }

    fn transform_inline_fragment(
        &mut self,
        node: &InlineFragment,
    ) -> Transformed<Arc<InlineFragment>> {
        Transformed::Replace(Arc::new(InlineFragment {
            type_condition: node.type_condition,
            directives: node.directives.clone(),
            selections: self.transform_selections(&node.selections).unwrap(),
        }))
    }

    fn transform_linked_field(&mut self, node: &LinkedField) -> Transformed<Arc<LinkedField>> {
        Transformed::Replace(Arc::new(LinkedField {
            alias: node.alias,
            definition: node.definition,
            arguments: node.arguments.clone(),
            directives: node.directives.clone(),
            selections: self.transform_selections(&node.selections).unwrap(),
        }))
    }

    fn transform_scalar_field(&mut self, _field: &ScalarField) -> Transformed<Arc<ScalarField>> {
        Transformed::Keep
    }

    fn transform_fragment_spread(
        &mut self,
        _spread: &FragmentSpread,
    ) -> Transformed<Arc<FragmentSpread>> {
        Transformed::Keep
    }

    fn transform_selections(&mut self, selections: &[Selection]) -> Option<Vec<Selection>> {
        let mut selections = self
            .transform_list(selections, Self::transform_selection)
            .unwrap_or_else(|| selections.to_vec());
        selections.sort_unstable();
        Some(selections)
    }
}
