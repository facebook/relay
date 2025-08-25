/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use ::intern::string_key::StringKey;
use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::NamedItem;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinition;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::associated_data_impl;
use intern::intern;
use lazy_static::lazy_static;
pub(crate) mod catchable_node;
mod validation_message;

use self::catchable_node::CatchMetadata;
use self::catchable_node::CatchableNode;
use crate::FragmentAliasMetadata;
use crate::REQUIRED_DIRECTIVE_NAME;
use crate::catch_directive::validation_message::ValidationMessage;
use crate::catch_directive::validation_message::ValidationMessageWithData;

lazy_static! {
    pub static ref CATCH_DIRECTIVE_NAME: DirectiveName = DirectiveName(intern!("catch"));
    pub static ref NULL_TO: StringKey = intern!("NULL");
    pub static ref RESULT_TO: StringKey = intern!("RESULT");
    pub static ref TO_ARGUMENT: ArgumentName = ArgumentName(intern!("to"));
}

// Possible @catch `to` enum values ordered by severity.
#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Debug, Hash)]
pub enum CatchTo {
    Null,
    Result,
}

impl From<StringKey> for CatchTo {
    fn from(to: StringKey) -> Self {
        match to {
            _ if to == *RESULT_TO => Self::Result,
            _ if to == *NULL_TO => Self::Null,
            _ => panic!("unknown @catch `to` value. Use `NULL` or `RESULT` (default) instead."),
        }
    }
}

impl From<CatchTo> for StringKey {
    fn from(val: CatchTo) -> Self {
        match val {
            CatchTo::Null => *NULL_TO,
            CatchTo::Result => *RESULT_TO,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct CatchMetadataDirective {
    pub to: CatchTo,
}
associated_data_impl!(CatchMetadataDirective);

pub fn catch_to_with_fallback(catch_to: Option<CatchTo>) -> CatchTo {
    match catch_to {
        Some(to) => to,
        // @catch without an argument is always RESULT
        None => CatchTo::Result,
    }
}

pub fn catch_directive(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = CatchDirective::new(program);

    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct CatchDirective<'s> {
    #[allow(dead_code)]
    program: &'s Program,
    errors: Vec<Diagnostic>,
}

impl<'program> CatchDirective<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            errors: Default::default(),
        }
    }

    fn get_catch_metadata<T: CatchableNode>(&mut self, field: &T) -> Option<CatchMetadata> {
        self.assert_not_with_required(field);

        match field.catch_metadata() {
            Err(err) => {
                self.errors.push(err);
                None
            }
            Ok(catch) => catch,
        }
    }

    fn assert_not_with_required<T: CatchableNode>(&mut self, field: &T) {
        let catchable_field = field.directives().named(*CATCH_DIRECTIVE_NAME);
        let required_field = field.directives().named(*REQUIRED_DIRECTIVE_NAME);

        if catchable_field.is_some() && required_field.is_some() {
            let required_location = required_field.unwrap().name.location;
            self.errors.push(Diagnostic::error(
                ValidationMessage::CatchDirectiveWithRequiredDirective,
                required_location,
            ));
        }
    }
}

impl Transformer<'_> for CatchDirective<'_> {
    const NAME: &'static str = "CatchDirectiveTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        let maybe_catch_metadata = self.get_catch_metadata(operation);

        match maybe_catch_metadata {
            None => self.default_transform_operation(operation),
            Some(catch_metadata) => {
                let next_directives =
                    add_metadata_directive(&operation.directives, catch_metadata.to);

                let selections = self.transform_selections(&operation.selections);

                Transformed::Replace(OperationDefinition {
                    directives: next_directives,
                    selections: selections.replace_or_else(|| operation.selections.clone()),
                    ..operation.clone()
                })
            }
        }
    }
    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let maybe_catch_metadata = self.get_catch_metadata(fragment);

        match maybe_catch_metadata {
            None => self.default_transform_fragment(fragment),
            Some(catch_metadata) => {
                let next_directives =
                    add_metadata_directive(&fragment.directives, catch_metadata.to);

                let selections = self.transform_selections(&fragment.selections);

                Transformed::Replace(FragmentDefinition {
                    directives: next_directives,
                    selections: selections.replace_or_else(|| fragment.selections.clone()),
                    ..fragment.clone()
                })
            }
        }
    }

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        match self.get_catch_metadata(field) {
            None => Transformed::Keep,
            Some(catch_metadata) => {
                Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
                    directives: add_metadata_directive(&field.directives, catch_metadata.to),
                    ..field.clone()
                })))
            }
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let maybe_catch_metadata = self.get_catch_metadata(field);

        match maybe_catch_metadata {
            None => {
                let selections = self.transform_selections(&field.selections);
                if selections.should_keep() {
                    Transformed::Keep
                } else {
                    Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                        selections: selections.replace_or_else(|| field.selections.clone()),
                        ..field.clone()
                    })))
                }
            }
            Some(catch_metadata) => {
                let next_directives = add_metadata_directive(&field.directives, catch_metadata.to);

                let selections = self.transform_selections(&field.selections);

                Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                    directives: next_directives,
                    selections: selections.replace_or_else(|| field.selections.clone()),
                    ..field.clone()
                })))
            }
        }
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        let alias = FragmentAliasMetadata::find(&fragment.directives);

        let maybe_catch_metadata = self.get_catch_metadata(fragment);

        match alias {
            Some(_alias) => match maybe_catch_metadata {
                None => self.default_transform_inline_fragment(fragment),
                Some(catch_metadata) => {
                    let next_directives =
                        add_metadata_directive(&fragment.directives, catch_metadata.to);

                    let selections = self.transform_selections(&fragment.selections);

                    Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                        directives: next_directives,
                        selections: selections.replace_or_else(|| fragment.selections.clone()),
                        ..fragment.clone()
                    })))
                }
            },
            None => {
                if maybe_catch_metadata.is_some() {
                    self.errors.push(Diagnostic::error(
                        ValidationMessageWithData::CatchNotValidOnUnaliasedInlineFragment,
                        fragment.spread_location,
                    ));
                };
                self.default_transform_inline_fragment(fragment)
            }
        }
    }
}

fn add_metadata_directive(directives: &[Directive], to: Option<CatchTo>) -> Vec<Directive> {
    let mut next_directives: Vec<Directive> = Vec::with_capacity(directives.len() + 1);
    next_directives.extend(directives.iter().cloned());
    next_directives.push(
        CatchMetadataDirective {
            to: catch_to_with_fallback(to),
        }
        .into(),
    );
    next_directives
}
