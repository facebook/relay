/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::associated_data_impl;
use graphql_ir::Argument;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::VariableDefinition;
use intern::string_key::Intern;
use lazy_static::lazy_static;
use thiserror::Error;

lazy_static! {
    pub static ref INLINE_DIRECTIVE_NAME: DirectiveName = DirectiveName("inline".intern());
}

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

struct InlineDataFragmentsTransform<'s> {
    program: &'s Program,
    errors: Vec<Diagnostic>,
    parent_inline_fragments: Vec<WithLocation<FragmentDefinitionName>>,
}

impl<'s> InlineDataFragmentsTransform<'s> {
    fn new(program: &'s Program) -> Self {
        Self {
            program,
            errors: Vec::new(),
            parent_inline_fragments: Vec::new(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct InlineDirectiveMetadata {
    pub fragment_name: FragmentDefinitionName,
    pub arguments: Vec<Argument>,
    pub variable_definitions: Vec<VariableDefinition>,
    pub used_global_variables: Vec<VariableDefinition>,
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

        if fragment.directives.named(*INLINE_DIRECTIVE_NAME).is_none() {
            next_fragment_spread
        } else {
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

            if self
                .parent_inline_fragments
                .iter()
                .any(|name| name.item == fragment.name.item)
            {
                let mut cyclic_fragments = self.parent_inline_fragments.iter();
                let first = cyclic_fragments.next().unwrap();
                let mut diagnostic = Diagnostic::error(
                    ValidationMessage::CircularFragmentReference {
                        fragment_name: first.item,
                    },
                    first.location,
                );
                for spread in cyclic_fragments {
                    diagnostic =
                        diagnostic.annotate(format!("spreading {}", spread.item), spread.location);
                }
                self.errors.push(diagnostic);
                return Transformed::Keep;
            }
            self.parent_inline_fragments.push(spread.fragment);
            let transformed_fragment = self.default_transform_fragment(fragment);
            self.parent_inline_fragments.pop();

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
                        arguments: spread.arguments.clone(),
                        variable_definitions: fragment.variable_definitions.clone(),
                        used_global_variables: fragment.used_global_variables.clone(),
                    }
                    .into(),
                ],
                selections: vec![Selection::InlineFragment(Arc::new(InlineFragment {
                    type_condition: Some(fragment.type_condition),
                    directives: vec![],
                    selections,
                    spread_location: Location::generated(),
                }))],
                spread_location: Location::generated(),
            };

            Transformed::Replace(Selection::InlineFragment(Arc::new(inline_fragment)))
        }
    }
}

#[derive(Error, Debug, serde::Serialize)]
#[serde(tag = "type")]
enum ValidationMessage {
    #[error("Found a circular reference from fragment '{fragment_name}'.")]
    CircularFragmentReference {
        fragment_name: FragmentDefinitionName,
    },

    #[error("Directives on fragment spreads for @inline fragments are not yet supported")]
    InlineDataFragmentDirectivesNotSupported,
}
