/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{NamedItem, WithLocation};
use graphql_ir::{
    Directive, FragmentSpread, InlineFragment, Program, Selection, Transformed, Transformer,
    ValidationError, ValidationMessage, ValidationResult,
};

use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use std::sync::Arc;

pub fn inline_data_fragment<'s>(program: &Program<'s>) -> ValidationResult<Program<'s>> {
    let mut transform = InlineDataFragmentsTransform::new(program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

pub struct Contants {
    /// Represents the public facing directive name @inline
    pub directive_name: StringKey,
    /// Internal directive name for Relay Codegen
    pub internal_directive_name: StringKey,
}

lazy_static! {
    pub static ref INLINE_DATA_CONSTANTS: Contants = Contants {
        directive_name: "inline".intern(),
        internal_directive_name: "__inline".intern(),
    };
}

struct InlineDataFragmentsTransform<'s> {
    program: &'s Program<'s>,
    errors: Vec<ValidationError>,
}

impl<'s> InlineDataFragmentsTransform<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self {
            program,
            errors: vec![],
        }
    }
}

impl<'s> Transformer for InlineDataFragmentsTransform<'s> {
    const NAME: &'static str = "InlineDataFragmentsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        let next_fragment_spread = self.default_transform_fragment_spread(spread);
        let fragment = self.program.fragment(spread.fragment.item);
        match fragment {
            None => next_fragment_spread,
            Some(fragment) => {
                let inline_directive = fragment
                    .directives
                    .named(INLINE_DATA_CONSTANTS.directive_name);
                if inline_directive.is_none() {
                    next_fragment_spread
                } else {
                    if !fragment.variable_definitions.is_empty() {
                        self.errors.push(ValidationError::new(
                            ValidationMessage::InlineDataFragmentArgumentsNotSupported,
                            vec![fragment.name.location],
                        ));
                    }
                    match &next_fragment_spread {
                        Transformed::Keep => {
                            if !spread.directives.is_empty() {
                                self.errors.push(ValidationError::new(
                                    ValidationMessage::InlineDataFragmentDirectivesNotSupported,
                                    vec![spread.fragment.location],
                                ));
                            }
                        }
                        Transformed::Replace(Selection::FragmentSpread(next_fragment_spread)) => {
                            if !next_fragment_spread.directives.is_empty() {
                                self.errors.push(ValidationError::new(
                                    ValidationMessage::InlineDataFragmentDirectivesNotSupported,
                                    vec![next_fragment_spread.fragment.location],
                                ));
                            }
                        }
                        _ => {}
                    };

                    let transformed_fragment = self.default_transform_fragment(fragment);

                    let selections = match transformed_fragment {
                        Transformed::Keep => fragment.selections.clone(),
                        Transformed::Replace(next_fragment) => next_fragment.selections,
                        Transformed::Delete => vec![],
                    };

                    let inline_fragment = InlineFragment {
                        type_condition: None,
                        directives: vec![Directive {
                            name: WithLocation::new(
                                spread.fragment.location,
                                INLINE_DATA_CONSTANTS.internal_directive_name,
                            ),
                            arguments: vec![],
                        }],
                        selections,
                    };

                    Transformed::Replace(Selection::InlineFragment(Arc::new(inline_fragment)))
                }
            }
        }
    }
}
