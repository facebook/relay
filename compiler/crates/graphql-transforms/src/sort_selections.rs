/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_context::CompilerContext;
use graphql_ir::{FragmentDefinition, InlineFragment, LinkedField, OperationDefinition, Selection};
use std::sync::Arc;

///
/// Sorts selections in the fragments and queries (and their selections)
///
pub fn sort_selections<'s>(ctx: &'s CompilerContext<'s>) -> CompilerContext<'s> {
    let mut next_context = CompilerContext::new(ctx.schema());
    for fragment in ctx.fragments() {
        next_context.insert_fragment(transform_fragment(ctx, fragment));
    }
    for operation in ctx.operations() {
        next_context.insert_operation(transform_operation(ctx, operation));
    }
    next_context
}

fn transform_fragment(
    ctx: &CompilerContext<'_>,
    fragment: &FragmentDefinition,
) -> FragmentDefinition {
    FragmentDefinition {
        name: fragment.name,
        type_condition: fragment.type_condition,
        directives: fragment.directives.clone(),
        variable_definitions: fragment.variable_definitions.clone(),
        used_global_variables: fragment.used_global_variables.clone(),
        selections: transform_selections(ctx, &mut fragment.selections.clone()),
    }
}

fn transform_operation(
    ctx: &CompilerContext<'_>,
    operation: &OperationDefinition,
) -> OperationDefinition {
    OperationDefinition {
        kind: operation.kind.clone(),
        name: operation.name,
        type_: operation.type_,
        directives: operation.directives.clone(),
        variable_definitions: operation.variable_definitions.clone(),
        selections: transform_selections(ctx, &mut operation.selections.clone()),
    }
}

fn transfrom_inline_fragment(
    ctx: &CompilerContext<'_>,
    node: &InlineFragment,
) -> Arc<InlineFragment> {
    Arc::new(InlineFragment {
        type_condition: node.type_condition,
        directives: node.directives.clone(),
        selections: transform_selections(ctx, &mut node.selections.clone()),
    })
}

fn transfrom_linked_field(ctx: &CompilerContext<'_>, node: &LinkedField) -> Arc<LinkedField> {
    Arc::new(LinkedField {
        alias: node.alias,
        definition: node.definition,
        arguments: node.arguments.clone(),
        directives: node.directives.clone(),
        selections: transform_selections(ctx, &mut node.selections.clone()),
    })
}

fn transform_selections(
    ctx: &CompilerContext<'_>,
    selections: &mut Vec<Selection>,
) -> Vec<Selection> {
    selections.sort_unstable();

    selections
        .iter_mut()
        .map(|selection| match selection {
            Selection::ScalarField(_) => selection.clone(),
            Selection::FragmentSpread(_) => selection.clone(),
            Selection::LinkedField(node) => {
                Selection::LinkedField(transfrom_linked_field(ctx, node))
            }
            Selection::InlineFragment(node) => {
                Selection::InlineFragment(transfrom_inline_fragment(ctx, node))
            }
        })
        .collect()
}
