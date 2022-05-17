/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ValidationMessage;
use ::intern::string_key::StringKey;
use common::{Diagnostic, DiagnosticsResult, Named, NamedItem};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{Argument as IRArgument, Directive, Program, Validator, Value};
use intern::intern;
use lazy_static::lazy_static;
use schema::{Argument as SchemaArgument, ArgumentDefinitions, Schema};

lazy_static! {
    static ref STATIC_ARG: StringKey = intern!("static");
}

pub fn validate_static_args(program: &Program) -> DiagnosticsResult<()> {
    StaticArgValidator::new(program).validate_program(program)
}

type FieldName = StringKey;
type ArgumentName = StringKey;
type StaticArguments = FnvHashSet<ArgumentName>;
type StaticArgCache = FnvHashMap<FieldName, StaticArguments>;

struct StaticArgValidator<'a> {
    program: &'a Program,
    field_to_static_args: StaticArgCache,
}

impl<'a> StaticArgValidator<'a> {
    fn new(program: &'a Program) -> Self {
        Self {
            program,
            field_to_static_args: StaticArgCache::default(),
        }
    }
}

impl<'a> Validator for StaticArgValidator<'a> {
    const NAME: &'static str = "StaticArgValidator";
    // Eliding default argument checks as we're overriding specific argument checks for certain types
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = true;

    fn validate_directive(&mut self, directive: &Directive) -> DiagnosticsResult<()> {
        let validation_errors = self
            .program
            .schema
            .get_directive(directive.name())
            .map(|schema_directive| {
                validate_all_static_args(
                    &mut self.field_to_static_args,
                    &schema_directive.name(),
                    &schema_directive.arguments,
                    &directive.arguments,
                )
            })
            .unwrap_or_default();

        if validation_errors.is_empty() {
            Ok(())
        } else {
            Err(validation_errors)
        }
    }
}

fn validate_all_static_args<'a, 'b>(
    field_to_static_args: &'b mut StaticArgCache,
    field_name: &'a StringKey,
    schema_arguments: &'a ArgumentDefinitions,
    ir_arguments: &'a [IRArgument],
) -> Vec<Diagnostic> {
    let static_args = field_to_static_args
        .entry(*field_name)
        .or_insert_with(|| find_static_argument_names(schema_arguments));

    ir_arguments
        .iter()
        .filter_map(|arg| {
            if static_args.contains(&arg.name()) && !is_constant_value(&arg.value.item) {
                Some(Diagnostic::error(
                    ValidationMessage::InvalidStaticArgument {
                        field_name: *field_name,
                        argument_name: arg.name(),
                    },
                    arg.value.location,
                ))
            } else {
                None
            }
        })
        .collect()
}

fn find_static_argument_names(schema_arguments: &ArgumentDefinitions) -> FnvHashSet<ArgumentName> {
    schema_arguments
        .iter()
        .filter(|a| has_static_directive(a))
        .map(|a| a.name())
        .collect()
}

fn has_static_directive(argument: &SchemaArgument) -> bool {
    argument.directives.named(*STATIC_ARG).is_some()
}

fn is_constant_value(value: &Value) -> bool {
    matches!(value, Value::Constant(_))
}
