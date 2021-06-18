/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, FragmentDefinition, OperationDefinition, Program, ScalarField,
    Selection, Transformed, Transformer, ValidationMessage, Value,
};
use interner::Intern;
use interner::StringKey;
use lazy_static::lazy_static;
use schema::{Argument as ArgumentDef, FieldID, SDLSchema, Schema};
use std::sync::Arc;

lazy_static! {
    static ref EARLY_FLUSH_NAME: StringKey = "relay_early_flush".intern();
    static ref QUERY_NAME_ARG: StringKey = "query_name".intern();
}

/// NOTE: This is a Facebook specific transform for www static resource delivery.
///
/// ```graphql
/// query QueryName @relay_early_flush {
///   a
/// }
/// ```
///
/// into
///
/// ```graphql
/// query QueryName {
///   relay_early_flush(query_name: "QueryName")
///   a
/// }
/// ```
pub fn relay_early_flush(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = RelayEarlyFlush {
        program,
        errors: Default::default(),
    };
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

pub struct RelayEarlyFlush<'s> {
    program: &'s Program,
    errors: Vec<Diagnostic>,
}

impl<'s> Transformer for RelayEarlyFlush<'s> {
    const NAME: &'static str = "RelayEarlyFlush";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        let early_flush_directive = operation.directives.named(*EARLY_FLUSH_NAME);
        if let Some(early_flush_directive) = early_flush_directive {
            match get_early_flush_field_id_and_query_name_arg(
                &self.program.schema,
                early_flush_directive.name.location,
            ) {
                Err(err) => {
                    self.errors.push(err);
                    Transformed::Keep
                }
                Ok((early_flush_field_id, query_name_arg)) => {
                    let mut next_selections = Vec::with_capacity(operation.selections.len() + 1);
                    next_selections.push(Selection::ScalarField(Arc::new(ScalarField {
                        alias: None,
                        definition: WithLocation::new(
                            early_flush_directive.name.location,
                            early_flush_field_id,
                        ),
                        arguments: vec![Argument {
                            name: WithLocation::new(
                                early_flush_directive.name.location,
                                query_name_arg.name,
                            ),
                            value: WithLocation::new(
                                early_flush_directive.name.location,
                                Value::Constant(ConstantValue::String(operation.name.item)),
                            ),
                        }],
                        directives: vec![],
                    })));
                    next_selections.extend(operation.selections.iter().cloned());
                    Transformed::Replace(OperationDefinition {
                        directives: operation
                            .directives
                            .iter()
                            .filter(|directive| directive.name.item != *EARLY_FLUSH_NAME)
                            .cloned()
                            .collect(),
                        selections: next_selections,
                        ..operation.clone()
                    })
                }
            }
        } else {
            Transformed::Keep
        }
    }

    fn transform_fragment(
        &mut self,
        _fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        Transformed::Keep
    }
}

fn get_early_flush_field_id_and_query_name_arg(
    schema: &'_ SDLSchema,
    directive_loc: Location,
) -> Result<(FieldID, &'_ ArgumentDef), Diagnostic> {
    let query_type = schema.query_type().unwrap();
    let early_flush_field_id = schema.named_field(query_type, *EARLY_FLUSH_NAME);
    if let Some(early_flush_field_id) = early_flush_field_id {
        let field = schema.field(early_flush_field_id);
        if field.is_extension {
            Err(Diagnostic::error(
                ValidationMessage::UnavailableRelayEarlyFlushServerSchema,
                directive_loc,
            ))
        } else if let Some(query_name_arg) = field.arguments.named(*QUERY_NAME_ARG) {
            Ok((early_flush_field_id, query_name_arg))
        } else {
            Err(Diagnostic::error(
                ValidationMessage::RelayEarlyFlushSchemaWithoutQueryNameArg {
                    query_name: *QUERY_NAME_ARG,
                },
                directive_loc,
            ))
        }
    } else {
        Err(Diagnostic::error(
            ValidationMessage::UnavailableRelayEarlyFlushServerSchema,
            directive_loc,
        ))
    }
}
