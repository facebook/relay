/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::NamedItem;
use graphql_ir::associated_data_impl;
use graphql_ir::Directive;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use intern::intern;
use lazy_static::lazy_static;
mod catchable_field;
mod validation_message;
use graphql_ir::Field;
use intern::Lookup;

use self::catchable_field::CatchMetadata;
use self::catchable_field::CatchableField;
use crate::catch_directive::validation_message::ValidationMessage;
use crate::REQUIRED_DIRECTIVE_NAME;

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
    pub path: StringKey,
}
associated_data_impl!(CatchMetadataDirective);

pub fn catch_to_with_fallback(catch_to: Option<CatchTo>) -> CatchTo {
    match catch_to {
        Some(to) => to,
        // @catch without an argument is always RESULT
        None => CatchTo::Result,
    }
}

pub fn catch_directive(program: &Program, enabled: bool) -> DiagnosticsResult<Program> {
    let mut transform = CatchDirective::new(program, enabled);

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
    enabled: bool,
    path: Vec<&'s str>,
}

impl<'program> CatchDirective<'program> {
    fn new(program: &'program Program, enabled: bool) -> Self {
        Self {
            program,
            errors: Default::default(),
            enabled,
            path: vec![],
        }
    }

    fn report_unimplemented(&mut self, directives: &[Directive]) {
        if let Some(directive) = directives.named(*CATCH_DIRECTIVE_NAME) {
            self.errors.push(Diagnostic::error(
                ValidationMessage::CatchDirectiveNotImplemented,
                directive.name.location,
            ));
        }
    }

    fn get_catch_metadata<T: CatchableField>(&mut self, field: &T) -> Option<CatchMetadata> {
        self.assert_not_with_required(field);

        match field.catch_metadata() {
            Err(err) => {
                self.errors.push(err);
                None
            }
            Ok(catch) => catch,
        }
    }

    fn assert_not_with_required<T: CatchableField>(&mut self, field: &T) {
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

impl<'s> Transformer for CatchDirective<'s> {
    const NAME: &'static str = "CatchDirectiveTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        if !self.enabled {
            self.report_unimplemented(&field.directives);
        }

        let name = field.alias_or_name(&self.program.schema).lookup();
        self.path.push(name);
        let path_name: StringKey = self.path.join(".").intern();
        self.path.pop();

        match self.get_catch_metadata(field) {
            None => Transformed::Keep,
            Some(catch_metadata) => {
                Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
                    directives: add_metadata_directive(
                        &field.directives,
                        path_name,
                        catch_metadata.to,
                    ),
                    ..field.clone()
                })))
            }
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        if !self.enabled {
            self.report_unimplemented(&field.directives);
        }

        let name = field.alias_or_name(&self.program.schema).lookup();
        self.path.push(name);

        let maybe_catch_metadata = self.get_catch_metadata(field);

        match maybe_catch_metadata {
            None => {
                let selections = self.transform_selections(&field.selections);
                self.path.pop();
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
                let path_name = self.path.join(".").intern();
                let next_directives =
                    add_metadata_directive(&field.directives, path_name, catch_metadata.to);

                let selections = self.transform_selections(&field.selections);

                self.path.pop();

                Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                    directives: next_directives,
                    selections: selections.replace_or_else(|| field.selections.clone()),
                    ..field.clone()
                })))
            }
        }
    }
}

fn add_metadata_directive(
    directives: &[Directive],
    path_name: StringKey,
    to: Option<CatchTo>,
) -> Vec<Directive> {
    let mut next_directives: Vec<Directive> = Vec::with_capacity(directives.len() + 1);
    next_directives.extend(directives.iter().cloned());
    next_directives.push(
        CatchMetadataDirective {
            to: catch_to_with_fallback(to),
            path: path_name,
        }
        .into(),
    );
    next_directives
}
