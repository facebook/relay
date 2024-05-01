/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::NamedItem;
use graphql_ir::Directive;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;

mod catchable_field;
mod validation_message;

use crate::catch_directive::validation_message::ValidationMessage;

lazy_static! {
    pub static ref CATCH_DIRECTIVE_NAME: DirectiveName = DirectiveName("catch".intern());
    pub static ref NULL_TO: StringKey = "NULL".intern();
    pub static ref RESULT_TO: StringKey = "RESULT".intern();
    pub static ref TO_ARGUMENT: ArgumentName = ArgumentName("to".intern());
}

// Possible @catch `to` enum values ordered by severity.
#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Debug, Hash)]
pub enum CatchTo {
    Null,
    Result,
}

impl From<CatchTo> for StringKey {
    fn from(val: CatchTo) -> Self {
        match val {
            CatchTo::Null => *NULL_TO,
            CatchTo::Result => *RESULT_TO,
        }
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
//struct CatchDirective<'s> {

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

    fn report_unimplemented(&mut self, directives: Vec<Directive>) {
        if let Some(directive) = directives.named(*CATCH_DIRECTIVE_NAME) {
            self.errors.push(Diagnostic::error(
                ValidationMessage::CatchDirectiveNotImplemented,
                directive.name.location,
            ));
        }
    }
}

impl<'s> Transformer for CatchDirective<'s> {
    const NAME: &'static str = "CatchDirectiveTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        self.report_unimplemented(field.directives.clone());

        self.default_transform_scalar_field(field)
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        self.report_unimplemented(field.directives.clone());

        self.default_transform_linked_field(field)
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        self.report_unimplemented(fragment.directives.clone());

        self.default_transform_inline_fragment(fragment)
    }
}
