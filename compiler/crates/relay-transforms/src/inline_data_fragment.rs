/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, NamedItem};
use graphql_ir::{
    associated_data_impl, FragmentSpread, InlineFragment, Program, Selection, Transformed,
    Transformer, ValidationMessage,
};

use intern::string_key::{Intern, StringKey};
use once_cell::sync::Lazy;
use std::sync::Arc;

pub fn inline_data_fragment(program: &Program) -> DiagnosticsResult<Program> {
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

pub const INLINE_DIRECTIVE_NAME: Lazy<StringKey> = Lazy::new(|| "inline".intern());

struct InlineDataFragmentsTransform<'s> {
    program: &'s Program,
    errors: Vec<Diagnostic>,
}

impl<'s> InlineDataFragmentsTransform<'s> {
    fn new(program: &'s Program) -> Self {
        Self {
            program,
            errors: vec![],
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct InlineDirectiveMetadata {
    pub fragment_name: StringKey,
}
associated_data_impl!(InlineDirectiveMetadata);

impl<'s> Transformer for InlineDataFragmentsTransform<'s> {
    const NAME: &'static str = "InlineDataFragmentsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        let next_fragment_spread = self.default_transform_fragment_spread(spread);
        let fragment = self
            .program
            .fragment(spread.fragment.item)
            .unwrap_or_else(|| panic!("was expecting to find fragment `{}`", spread.fragment.item));

        let inline_directive = fragment.directives.named(*INLINE_DIRECTIVE_NAME);
        if inline_directive.is_none() {
            next_fragment_spread
        } else {
            if !fragment.variable_definitions.is_empty()
                || !fragment.used_global_variables.is_empty()
            {
                let mut error = Diagnostic::error(
                    ValidationMessage::InlineDataFragmentArgumentsNotSupported,
                    fragment.name.location,
                );
                for var in fragment
                    .variable_definitions
                    .iter()
                    .chain(fragment.used_global_variables.iter())
                {
                    error = error.annotate("Variable used:", var.name.location);
                }
                self.errors.push(error);
            }
            match &next_fragment_spread {
                Transformed::Keep => {
                    if !spread.directives.is_empty() {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::InlineDataFragmentDirectivesNotSupported,
                            spread.fragment.location,
                        ));
                    }
                }
                Transformed::Replace(Selection::FragmentSpread(next_fragment_spread)) => {
                    if !next_fragment_spread.directives.is_empty() {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::InlineDataFragmentDirectivesNotSupported,
                            next_fragment_spread.fragment.location,
                        ));
                    }
                }
                _ => {
                    panic!(
                        "InlineDataFragmentsTransform: Unexpected deletion during fragment spread transformation."
                    );
                }
            };

            let transformed_fragment = self.default_transform_fragment(fragment);

            let (name, selections) = match transformed_fragment {
                Transformed::Keep => (fragment.name.item, fragment.selections.clone()),
                Transformed::Replace(next_fragment) => {
                    (next_fragment.name.item, next_fragment.selections)
                }
                Transformed::Delete => {
                    panic!(
                        "InlineDataFragmentsTransform: Unexpected deletion during fragment spread transformation."
                    );
                }
            };

            let inline_fragment = InlineFragment {
                type_condition: None,
                directives: vec![
                    InlineDirectiveMetadata {
                        fragment_name: name,
                    }
                    .into(),
                ],
                selections: vec![Selection::InlineFragment(Arc::new(InlineFragment {
                    type_condition: Some(fragment.type_condition),
                    directives: vec![],
                    selections,
                }))],
            };

            Transformed::Replace(Selection::InlineFragment(Arc::new(inline_fragment)))
        }
    }
}
