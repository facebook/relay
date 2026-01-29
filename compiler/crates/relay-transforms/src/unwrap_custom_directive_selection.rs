/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::iter;
use std::sync::Arc;

use common::NamedItem;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use relay_config::DeferStreamInterface;

/// Transform to unwrap selections wrapped in a InlineFragment with custom
/// directive for printing
pub fn unwrap_custom_directive_selection(
    program: &Program,
    defer_stream_interface: DeferStreamInterface,
) -> Program {
    let mut transform = UnwrapCustomDirectiveSelection::new(defer_stream_interface);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct UnwrapCustomDirectiveSelection {
    defer_stream_interface: DeferStreamInterface,
}

impl UnwrapCustomDirectiveSelection {
    fn new(defer_stream_interface: DeferStreamInterface) -> Self {
        Self {
            defer_stream_interface,
        }
    }
}

impl Transformer<'_> for UnwrapCustomDirectiveSelection {
    const NAME: &'static str = "UnwrapCustomDirectiveSelection";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        if fragment.type_condition.is_none() {
            // Remove the wrapping `... @defer` for `@defer` on fragment spreads.
            let defer = fragment
                .directives
                .named(self.defer_stream_interface.defer_name);
            if let Some(defer) = defer
                && let Selection::FragmentSpread(frag_spread) = &fragment.selections[0]
            {
                return Transformed::Replace(Selection::FragmentSpread(Arc::new(FragmentSpread {
                    directives: frag_spread
                        .directives
                        .iter()
                        .chain(iter::once(defer))
                        .cloned()
                        .collect(),
                    ..frag_spread.as_ref().clone()
                })));
            }
        }
        self.default_transform_inline_fragment(fragment)
    }
}
