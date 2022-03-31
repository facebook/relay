/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::UPDATABLE_DIRECTIVE;

use super::ValidationMessage;
use common::{Diagnostic, DiagnosticsResult, NamedItem};
use graphql_ir::{Condition, FragmentSpread, Program, Selection, Validator};

pub fn validate_updatable_fragment_spread(program: &Program) -> DiagnosticsResult<()> {
    UpdatableFragmentSpread { program }.validate_program(program)
}

struct UpdatableFragmentSpread<'a> {
    program: &'a Program,
}

impl<'a> Validator for UpdatableFragmentSpread<'a> {
    const NAME: &'static str = "UpdatableFragmentSpread";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_fragment_spread(
        &mut self,
        fragment_spread: &FragmentSpread,
    ) -> DiagnosticsResult<()> {
        if !fragment_spread.directives.is_empty() {
            let fragment_definition = self
                .program
                .fragment(fragment_spread.fragment.item)
                .expect("Fragment definition not found");

            if fragment_definition
                .directives
                .named(*UPDATABLE_DIRECTIVE)
                .is_some()
            {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::UpdatableFragmentSpreadNoDirectives,
                    fragment_spread.fragment.location,
                )]);
            }
        }
        Ok(())
    }

    fn validate_condition(&mut self, condition: &Condition) -> DiagnosticsResult<()> {
        for item in condition.selections.iter() {
            match item {
                Selection::FragmentSpread(spread) => {
                    let fragment_definition = self
                        .program
                        .fragment(spread.fragment.item)
                        .expect("Fragment definition not found");

                    if fragment_definition
                        .directives
                        .named(*UPDATABLE_DIRECTIVE)
                        .is_some()
                    {
                        return Err(vec![Diagnostic::error(
                            ValidationMessage::UpdatableFragmentSpreadNoDirectives,
                            spread.fragment.location,
                        )]);
                    }
                }
                Selection::InlineFragment(_) => {}
                Selection::LinkedField(_) => {}
                Selection::ScalarField(_) => {}
                Selection::Condition(_) => {}
            }
        }
        Ok(())
    }
}
