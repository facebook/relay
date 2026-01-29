/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::NamedItem;
use common::WithLocation;
use graphql_ir::FragmentSpread;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use schema::Schema;

use crate::UPDATABLE_DIRECTIVE;

pub fn replace_updatable_fragment_spreads(program: &Program) -> Program {
    let mut transform = ReplaceAssignableFragmentSpreads { program };

    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct ReplaceAssignableFragmentSpreads<'s> {
    program: &'s Program,
}

impl Transformer<'_> for ReplaceAssignableFragmentSpreads<'_> {
    const NAME: &'static str = "ReplaceAssignableFragmentSpreads";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment_spread(
        &mut self,
        fragment_spread: &FragmentSpread,
    ) -> Transformed<Selection> {
        // This transform runs **after** apply_fragment_arguments, which removes certain fragments.
        // If we don't find a fragment, assume it was correctly removed!
        if let Some(fragment_definition) = self.program.fragment(fragment_spread.fragment.item) {
            if fragment_definition
                .directives
                .named(*UPDATABLE_DIRECTIVE)
                .is_some()
            {
                Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
                    alias: None,
                    definition: WithLocation {
                        location: fragment_spread.fragment.location,
                        item: self.program.schema.typename_field(),
                    },
                    arguments: vec![],
                    directives: vec![],
                })))
            } else {
                Transformed::Keep
            }
        } else {
            Transformed::Keep
        }
    }
}
