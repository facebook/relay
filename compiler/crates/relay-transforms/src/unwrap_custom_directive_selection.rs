/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::DEFER_STREAM_CONSTANTS;
use common::NamedItem;
use graphql_ir::{FragmentSpread, InlineFragment, Program, Selection, Transformed, Transformer};
use std::{iter, sync::Arc};

/// Transform to unwrap selections wrapped in a InlineFragment with custom
/// directive for printing
pub fn unwrap_custom_directive_selection(program: &Program) -> Program {
    let mut transform = UnwrapCustomDirectiveSelection;
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct UnwrapCustomDirectiveSelection;

impl Transformer for UnwrapCustomDirectiveSelection {
    const NAME: &'static str = "UnwrapCustomDirectiveSelection";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        if fragment.type_condition.is_none() {
            // Remove the wrapping `... @defer` for `@defer` on fragment spreads.
            let defer = fragment.directives.named(DEFER_STREAM_CONSTANTS.defer_name);
            if let Some(defer) = defer {
                if let Selection::FragmentSpread(frag_spread) = &fragment.selections[0] {
                    return Transformed::Replace(Selection::FragmentSpread(Arc::new(
                        FragmentSpread {
                            directives: frag_spread
                                .directives
                                .iter()
                                .chain(iter::once(defer))
                                .cloned()
                                .collect(),
                            fragment: frag_spread.fragment,
                            arguments: frag_spread.arguments.clone(),
                        },
                    )));
                }
            }
        }
        self.default_transform_inline_fragment(fragment)
    }
}
