/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use ::intern::string_key::StringKey;
use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Named;
use common::NamedItem;
use fnv::FnvHashMap;
use fnv::FnvHashSet;
use graphql_ir::Argument as IRArgument;
use graphql_ir::Directive;
use graphql_ir::Program;
use graphql_ir::Validator;
use graphql_ir::Value;
use intern::intern;
use lazy_static::lazy_static;
use schema::Argument as SchemaArgument;
use schema::ArgumentDefinitions;
use schema::Schema;

use crate::ValidationMessage;

lazy_static! {
    static ref STATIC_ARG: DirectiveName = DirectiveName(intern!("static"));
}

pub fn validate_static_args(program: &Program) -> DiagnosticsResult<()> {
    StaticArgValidator::new(program).validate_program(program)
}

type FieldName = StringKey;
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

impl Validator for StaticArgValidator<'_> {
    const NAME: &'static str = "StaticArgValidator";
    // Eliding default argument checks as we're overriding specific argument checks for certain types
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = true;

    fn validate_directive(&mut self, directive: &Directive) -> DiagnosticsResult<()> {
        let validation_errors = self
            .program
            .schema
            .get_directive(directive.name.item)
            .map(|schema_directive| {
                validate_all_static_args(
                    &mut self.field_to_static_args,
                    schema_directive.name().0,
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

fn validate_all_static_args<'a>(
    field_to_static_args: &mut StaticArgCache,
    field_name: StringKey,
    schema_arguments: &'a ArgumentDefinitions,
    ir_arguments: &'a [IRArgument],
) -> Vec<Diagnostic> {
    let static_args = field_to_static_args
        .entry(field_name)
        .or_insert_with(|| find_static_argument_names(schema_arguments));

    ir_arguments
        .iter()
        .filter_map(|arg| {
            if static_args.contains(&arg.name.item) && !is_constant_value(&arg.value.item) {
                Some(Diagnostic::error(
                    ValidationMessage::InvalidStaticArgument {
                        field_name,
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
        .map(|a| a.name.item)
        .collect()
}

fn has_static_directive(argument: &SchemaArgument) -> bool {
    argument.directives.named(*STATIC_ARG).is_some()
}

fn is_constant_value(value: &Value) -> bool {
    matches!(value, Value::Constant(_))
}
