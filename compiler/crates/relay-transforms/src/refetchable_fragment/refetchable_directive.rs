/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{Directive, ValidationMessage};
use graphql_text_printer::print_value;
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::SDLSchema;

lazy_static! {
    static ref REFETCHABLE_NAME: StringKey = "refetchable".intern();
    static ref QUERY_NAME_ARG: StringKey = "queryName".intern();
}

/// Represents the @refetchable Relay directive:
///
/// ```graphql
/// directive @refetchable(
///   queryName: String!
/// ) on FRAGMENT_DEFINITION
/// ```
pub struct RefetchableDirective {
    pub query_name: WithLocation<StringKey>,
}

impl RefetchableDirective {
    pub fn from_directives(
        schema: &SDLSchema,
        directives: &[Directive],
    ) -> DiagnosticsResult<Option<Self>> {
        if let Some(directive) = directives.named(*REFETCHABLE_NAME) {
            Ok(Some(Self::from_directive(schema, directive)?))
        } else {
            Ok(None)
        }
    }

    fn from_directive(schema: &SDLSchema, directive: &Directive) -> DiagnosticsResult<Self> {
        let mut name = None;
        for argument in &directive.arguments {
            if argument.name.item == *QUERY_NAME_ARG {
                if let Some(query_name) = argument.value.item.get_string_literal() {
                    name = Some(WithLocation::new(argument.value.location, query_name));
                } else {
                    return Err(vec![Diagnostic::error(
                        ValidationMessage::ExpectQueryNameToBeString {
                            query_name_value: print_value(schema, &argument.value.item),
                        },
                        argument.name.location,
                    )]);
                }
            } else {
                // should be validated by general directive validations
                panic!(
                    "Unexpected name on @refetchable query: `{}`",
                    argument.name.item
                )
            }
        }
        Ok(Self {
            query_name: name.unwrap(),
        })
    }
}
