/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::handle_fields::HandleFieldConstants;
use common::{Location, WithLocation};
use graphql_ir::{Argument, ConstantValue, Directive, Value};
use interner::{Intern, StringKey};

pub struct HandleFieldDirectiveArgs<'s> {
    pub handler_arg: Option<(&'s Argument, &'s ConstantValue)>,
    pub key_arg: Option<(&'s Argument, &'s ConstantValue)>,
    pub filters_arg: Option<(&'s Argument, &'s ConstantValue)>,
    pub dynamic_key_arg: Option<(&'s Argument, &'s Value)>,
}

/// Helper to extract handle field arguments that are present
/// on the directive, without any validation or assumption of
/// correctness of values.
pub fn extract_handle_field_directive_args(
    handle_field_directive: &Directive,
    handle_field_constants: HandleFieldConstants,
) -> HandleFieldDirectiveArgs<'_> {
    let mut handler_arg = None;
    let mut key_arg = None;
    let mut filters_arg = None;
    let mut dynamic_key_arg = None;

    for arg in handle_field_directive.arguments.iter() {
        match &arg.value.item {
            Value::Constant(constant_val) => {
                if arg.name.item == handle_field_constants.handler_arg_name {
                    handler_arg = Some((arg, constant_val));
                }
                if arg.name.item == handle_field_constants.key_arg_name {
                    key_arg = Some((arg, constant_val));
                }
                if arg.name.item == handle_field_constants.filters_arg_name {
                    filters_arg = Some((arg, constant_val));
                }
            }
            _ => {
                if arg.name.item == handle_field_constants.dynamic_key_arg_name {
                    dynamic_key_arg = Some((arg, &arg.value.item));
                }
            }
        }
    }

    HandleFieldDirectiveArgs {
        handler_arg,
        key_arg,
        filters_arg,
        dynamic_key_arg,
    }
}

pub struct HandleFieldDirectiveValues {
    pub handle: StringKey,
    pub key: StringKey,
    pub filters: Option<Vec<StringKey>>,
    pub dynamic_key: Option<Value>,
}

/// Helper to extract the values for handle field arguments that are present
/// on the input handle field directive (e.g. a @__clientField or @connection).
/// This function will panic if the expected argument values aren't
/// present on the directive, with the assumption that the directive
/// has already been validated.
pub fn extract_values_from_handle_field_directive(
    handle_field_directive: &Directive,
    handle_field_constants: HandleFieldConstants,
    default_handler: Option<StringKey>,
    default_filters: Option<Vec<StringKey>>,
) -> HandleFieldDirectiveValues {
    let HandleFieldDirectiveArgs {
        handler_arg,
        filters_arg,
        key_arg,
        dynamic_key_arg,
    } = extract_handle_field_directive_args(handle_field_directive, handle_field_constants);

    // We expect these values to be available since they should've been
    // validated first as part of validate_connections validation step.
    let key = match key_arg {
        Some((_, value)) => match value {
            ConstantValue::String(string_val) => *string_val,
            _ => unreachable!("Expected key_arg to have been previously validated."),
        },
        None => "".intern(),
    };
    let handle= match handler_arg {
        Some((_, value)) => match value {
            ConstantValue::String(string_val) => *string_val,
            _ => unreachable!("Expected handler_arg to have been previously validated."),
        },
        None => default_handler.expect("Expected handler_arg to have been previously validated or a default to have been provided."),
    };
    let filters = match filters_arg {
        Some((_, value)) => match value {
            ConstantValue::List(list_val) => Some(
                list_val
                    .iter()
                    .map(|val| match val {
                        ConstantValue::String(string_val) => *string_val,
                        _ => {
                            unreachable!("Expected filters_arg to have been previously validated.")
                        }
                    })
                    .collect::<Vec<_>>(),
            ),
            ConstantValue::Null() => None,
            _ => unreachable!("Expected filters_arg to have been previously validated.",),
        },
        None => default_filters,
    };
    let dynamic_key = match dynamic_key_arg {
        Some((_, value)) => match value {
            Value::Variable(_) => Some(value.clone()),
            _ => unreachable!("Expected dynamic_key_arg to have been previously validated."),
        },
        None => None,
    };

    HandleFieldDirectiveValues {
        handle,
        key,
        filters,
        dynamic_key,
    }
}

/// Helper to build an internal, custom handle field directive (@__clientField)
/// based an input handle field directive that has already been validated (e.g. a @__clientField or @connection).
/// This directive will be used to store the appropriate metadata for the handle,
/// to be later used in codegen.
/// This function will panic if the expected arguments aren't present on the input directive,
/// with the assumption that the input directive has already been validated.
pub fn build_handle_field_directive(
    handle_field_directive: &Directive,
    handle_field_constants: HandleFieldConstants,
    handle_field_constants_for_extracting: HandleFieldConstants,
    // TODO(T63626569): Add support for derived locations
    empty_location: &Location,
    default_handler: Option<StringKey>,
    default_filters: Option<Vec<StringKey>>,
) -> Directive {
    let HandleFieldDirectiveValues {
        handle,
        key,
        filters,
        dynamic_key,
    } = extract_values_from_handle_field_directive(
        handle_field_directive,
        handle_field_constants_for_extracting,
        default_handler,
        default_filters,
    );

    let directive_arguments = vec![
        Argument {
            name: WithLocation::new(*empty_location, handle_field_constants.key_arg_name),
            value: WithLocation::new(*empty_location, Value::Constant(ConstantValue::String(key))),
        },
        Argument {
            name: WithLocation::new(*empty_location, handle_field_constants.handler_arg_name),
            value: WithLocation::new(
                *empty_location,
                Value::Constant(ConstantValue::String(handle)),
            ),
        },
        Argument {
            name: WithLocation::new(*empty_location, handle_field_constants.filters_arg_name),
            value: WithLocation::new(
                *empty_location,
                Value::Constant(match filters {
                    Some(filters) => ConstantValue::List(
                        filters
                            .iter()
                            .map(|filter| ConstantValue::String(*filter))
                            .collect(),
                    ),
                    None => ConstantValue::Null(),
                }),
            ),
        },
        Argument {
            name: WithLocation::new(*empty_location, handle_field_constants.dynamic_key_arg_name),
            value: WithLocation::new(
                *empty_location,
                dynamic_key.unwrap_or_else(|| Value::Constant(ConstantValue::Null())),
            ),
        },
    ];

    Directive {
        name: WithLocation::new(
            *empty_location,
            handle_field_constants.handle_field_directive_name,
        ),
        arguments: directive_arguments,
    }
}

/// Helper to extract the handle field directive if present in the given list of
/// of directives
pub fn extract_handle_field_directives(
    directives: &[Directive],
    handle_field_constants: HandleFieldConstants,
) -> impl Iterator<Item = &Directive> {
    directives.iter().filter(move |directive| {
        directive.name.item == handle_field_constants.handle_field_directive_name
    })
}
