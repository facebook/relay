/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::ValidationMessage;
use super::ASSIGNABLE_DIRECTIVE;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use graphql_ir::FragmentDefinition;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Validator;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use schema::Schema;

lazy_static! {
    static ref ALLOW_LISTED_DIRECTIVES: Vec<StringKey> = vec![
        *ASSIGNABLE_DIRECTIVE,
        // TODO have a global list of directives...?
        "fb_owner".intern(),
    ];
}

pub fn validate_assignable_directive(program: &Program) -> DiagnosticsResult<()> {
    AssignableDirective { program }.validate_program(program)
}

struct AssignableDirective<'a> {
    program: &'a Program,
}

impl<'a> Validator for AssignableDirective<'a> {
    const NAME: &'static str = "AssignableDirective";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        if fragment.directives.named(*ASSIGNABLE_DIRECTIVE).is_none() {
            return Ok(());
        }

        let mut errors = vec![];

        // Temporarily, require that assignable fragments contain only a single unaliased
        // __typename field with no directives
        if fragment.selections.len() == 1 {
            let first = fragment
                .selections
                .get(0)
                .expect("Just checked selection length");
            if let Selection::ScalarField(scalar_field) = first {
                if scalar_field.definition.item != self.program.schema.typename_field()
                    || !scalar_field.directives.is_empty()
                    || scalar_field.alias.is_some()
                {
                    errors.push(Diagnostic::error(
                        ValidationMessage::AssignableOnlyUnaliasedTypenameFieldWithNoDirectives,
                        scalar_field.definition.location,
                    ));
                }
            } else {
                errors.push(Diagnostic::error(
                    ValidationMessage::AssignableOnlyUnaliasedTypenameFieldWithNoDirectives,
                    fragment.name.location,
                ));
            }
        } else {
            errors.push(Diagnostic::error(
                ValidationMessage::AssignableOnlyUnaliasedTypenameFieldWithNoDirectives,
                fragment.name.location,
            ));
        }

        for directive in fragment.directives.iter() {
            if !ALLOW_LISTED_DIRECTIVES.contains(&directive.name.item) {
                errors.push(Diagnostic::error(
                    ValidationMessage::AssignableDisallowOtherDirectives {
                        disallowed_directive_name: directive.name.item,
                    },
                    directive.name.location,
                ))
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }
}
