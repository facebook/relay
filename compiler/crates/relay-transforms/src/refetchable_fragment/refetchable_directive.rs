/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, Location, SourceLocationKey, WithLocation};
use graphql_ir::{ConstantValue, Directive, ValidationMessage, Value};
use graphql_text_printer::print_value;
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::SDLSchema;

lazy_static! {
    pub static ref REFETCHABLE_NAME: StringKey = "refetchable".intern();
    static ref QUERY_NAME_ARG: StringKey = "queryName".intern();
    static ref DIRECTIVES_ARG: StringKey = "directives".intern();
}

/// Represents the @refetchable Relay directive:
///
/// ```graphql
/// directive @refetchable(
///   queryName: String!
///   directives: [String!]
/// ) on FRAGMENT_DEFINITION
/// ```
pub struct RefetchableDirective {
    pub query_name: WithLocation<StringKey>,
    pub directives: Vec<Directive>,
}

impl RefetchableDirective {
    pub fn from_directive(schema: &SDLSchema, directive: &Directive) -> DiagnosticsResult<Self> {
        let mut name = None;
        let mut directives = Vec::new();

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
            } else if argument.name.item == *DIRECTIVES_ARG {
                directives = if let Value::Constant(ConstantValue::List(items)) =
                    &argument.value.item
                {
                    items
                        .iter()
                        .map(|item| {
                            if let ConstantValue::String(directive_string) = item {
                                let ast_directive = graphql_syntax::parse_directive(
                                    directive_string.lookup(),
                                    // We currently don't have the ability to pass offset locations
                                    // to the parser call, so we first use a generated location and
                                    // later override it with an approximation.
                                    SourceLocationKey::generated(),
                                )
                                .map_err(|mut diagnostics| {
                                    for diagnostic in &mut diagnostics {
                                        diagnostic.override_location(argument.value.location);
                                    }
                                    diagnostics
                                })?;
                                graphql_ir::build_directive(
                                    schema,
                                    &ast_directive,
                                    graphql_syntax::DirectiveLocation::Query,
                                    // We currently don't have the ability to pass offset locations
                                    // to the parser call, so we first use a generated location and
                                    // later override it with an approximation.
                                    Location::generated(),
                                )
                                .map_err(|mut diagnostics| {
                                    for diagnostic in &mut diagnostics {
                                        diagnostic.override_location(argument.value.location);
                                    }
                                    diagnostics
                                })
                            } else {
                                Err(vec![Diagnostic::error(
                                    ValidationMessage::RefetchableDirectivesArgRequiresLiteralStringList,
                                    argument.value.location,
                                )])
                            }
                        })
                        .collect::<DiagnosticsResult<_>>()
                } else {
                    Err(vec![Diagnostic::error(
                        ValidationMessage::RefetchableDirectivesArgRequiresLiteralStringList,
                        argument.value.location,
                    )])
                }?
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
            directives,
        })
    }
}
