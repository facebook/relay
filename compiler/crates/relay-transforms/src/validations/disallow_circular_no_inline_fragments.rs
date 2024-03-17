/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentDefinitionNameMap;
use graphql_ir::FragmentSpread;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Validator;
use thiserror::Error;

use crate::no_inline::NO_INLINE_DIRECTIVE_NAME;

pub fn disallow_circular_no_inline_fragments(program: &Program) -> DiagnosticsResult<()> {
    let mut validator = DisallowCircularNoInlineFragments::new(program);
    validator.validate_program(program)
}
enum FragmentStatus {
    Visiting,
    Visited,
}

struct DisallowCircularNoInlineFragments<'program> {
    program: &'program Program,
    fragments: FragmentDefinitionNameMap<FragmentStatus>,
}

impl<'program> DisallowCircularNoInlineFragments<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            fragments: Default::default(),
        }
    }
}

impl Validator for DisallowCircularNoInlineFragments<'_> {
    const NAME: &'static str = "disallow_circular_no_inline_fragments";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_operation(&mut self, _: &OperationDefinition) -> DiagnosticsResult<()> {
        Ok(())
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        match self.fragments.get(&fragment.name.item) {
            None => {
                self.fragments
                    .insert(fragment.name.item, FragmentStatus::Visiting);
                let result = self.validate_selections(&fragment.selections);
                self.fragments
                    .insert(fragment.name.item, FragmentStatus::Visited);
                result
            }
            Some(FragmentStatus::Visited) => Ok(()),
            Some(FragmentStatus::Visiting) => {
                if fragment
                    .directives
                    .named(*NO_INLINE_DIRECTIVE_NAME)
                    .is_some()
                {
                    Err(vec![Diagnostic::error(
                        ValidationMessage::CircularFragmentReference {
                            fragment_name: fragment.name.item,
                        },
                        fragment.name.location,
                    )])
                } else {
                    Ok(())
                }
            }
        }
    }

    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> DiagnosticsResult<()> {
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        self.validate_fragment(fragment)
    }
}

#[derive(Debug, Error, serde::Serialize)]
#[serde(tag = "type")]
enum ValidationMessage {
    #[error("Found a circular reference from fragment '{fragment_name}'.")]
    CircularFragmentReference {
        fragment_name: FragmentDefinitionName,
    },
}
