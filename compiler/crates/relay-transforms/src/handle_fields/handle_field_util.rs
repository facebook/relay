/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::WithLocation;
use graphql_ir::{Argument, ConstantValue, Directive, Value};
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref CONNECTION_HANDLER_ARG_NAME: StringKey = "handler".intern();
    pub static ref HANDLE_FIELD_DIRECTIVE_NAME: StringKey = "__clientField".intern();
    pub static ref HANDLER_ARG_NAME: StringKey = "handle".intern();
    pub static ref FILTERS_ARG_NAME: StringKey = "filters".intern();
    pub static ref KEY_ARG_NAME: StringKey = "key".intern();
    pub static ref DYNAMIC_KEY_ARG_NAME: StringKey = "dynamicKey_UNSTABLE".intern();
    static ref HANLDE_ARGS_NAME: StringKey = "handleArgs".intern();
}

pub struct HandleFieldDirectiveArgs<'s> {
    pub handler_arg: Option<(&'s Argument, &'s ConstantValue)>,
    pub key_arg: Option<(&'s Argument, &'s ConstantValue)>,
    pub filters_arg: Option<(&'s Argument, &'s ConstantValue)>,
    pub dynamic_key_arg: Option<(&'s Argument, &'s Value)>,
    pub handle_args_arg: Option<&'s Argument>,
}

pub struct HandleFieldDirectiveValues {
    pub handle: StringKey,
    pub key: StringKey,
    pub filters: Option<Vec<StringKey>>,
    pub dynamic_key: Option<Value>,
    pub handle_args: Option<Vec<Argument>>,
}

/// We have two handler keys, "handler" in connection, and "handle" in everywhere else
/// Speicific helpers are created separately for connection

/// Helper to extract handle field arguments that are present
/// on the directive, without any validation or assumption of
/// correctness of values.
pub fn extract_handle_field_directive_args_for_connection(
    handle_field_directive: &Directive,
) -> HandleFieldDirectiveArgs<'_> {
    extract_handle_field_directive_args_helper(handle_field_directive, *CONNECTION_HANDLER_ARG_NAME)
}

/// Helper to extract the values for handle field arguments that are present
/// on the input handle field directive (e.g. a @__clientField or @connection).
/// This function will panic if the expected argument values aren't
/// present on the directive, with the assumption that the directive
/// has already been validated.
pub fn extract_values_from_handle_field_directive(
    handle_field_directive: &Directive,
) -> HandleFieldDirectiveValues {
    extract_values_from_handle_field_directive_helper(
        handle_field_directive,
        *HANDLER_ARG_NAME,
        None,
        None,
    )
}

/// Helper to build an internal, custom handle field directive (@__clientField)
/// based an input handle field directive that has already been validated (e.g. a @__clientField or @connection).
/// This directive will be used to store the appropriate metadata for the handle,
/// to be later used in codegen.
/// This function will panic if the expected arguments aren't present on the input directive,
/// with the assumption that the input directive has already been validated.
pub fn build_handle_field_directive_from_connection_directive(
    handle_field_directive: &Directive,
    default_handler: Option<StringKey>,
    default_filters: Option<Vec<StringKey>>,
) -> Directive {
    let values = extract_values_from_handle_field_directive_helper(
        handle_field_directive,
        *CONNECTION_HANDLER_ARG_NAME,
        default_handler,
        default_filters,
    );
    build_handle_field_directive(values)
}

pub fn build_handle_field_directive(values: HandleFieldDirectiveValues) -> Directive {
    let HandleFieldDirectiveValues {
        handle,
        key,
        filters,
        dynamic_key,
        handle_args,
    } = values;
    let mut directive_arguments = vec![
        Argument {
            name: WithLocation::generated(*KEY_ARG_NAME),
            value: WithLocation::generated(Value::Constant(ConstantValue::String(key))),
        },
        Argument {
            name: WithLocation::generated(*HANDLER_ARG_NAME),
            value: WithLocation::generated(Value::Constant(ConstantValue::String(handle))),
        },
        Argument {
            name: WithLocation::generated(*FILTERS_ARG_NAME),
            value: WithLocation::generated(Value::Constant(match filters {
                Some(filters) => ConstantValue::List(
                    filters
                        .iter()
                        .map(|filter| ConstantValue::String(*filter))
                        .collect(),
                ),
                None => ConstantValue::Null(),
            })),
        },
        Argument {
            name: WithLocation::generated(*DYNAMIC_KEY_ARG_NAME),
            value: WithLocation::generated(
                dynamic_key.unwrap_or(Value::Constant(ConstantValue::Null())),
            ),
        },
    ];

    if let Some(handle_args) = handle_args {
        directive_arguments.push(Argument {
            name: WithLocation::generated(*HANLDE_ARGS_NAME),
            value: WithLocation::generated(Value::Object(handle_args)),
        });
    }

    Directive {
        name: WithLocation::generated(*HANDLE_FIELD_DIRECTIVE_NAME),
        arguments: directive_arguments,
        data: None,
    }
}

/// Helper to extract the handle field directive if present in the given list of
/// of directives
pub fn extract_handle_field_directives(
    directives: &[Directive],
) -> impl Iterator<Item = &Directive> {
    directives
        .iter()
        .filter(move |directive| directive.name.item == *HANDLE_FIELD_DIRECTIVE_NAME)
}

fn extract_handle_field_directive_args_helper(
    handle_field_directive: &Directive,
    handler_arg_name: StringKey,
) -> HandleFieldDirectiveArgs<'_> {
    let mut handler_arg = None;
    let mut key_arg = None;
    let mut filters_arg = None;
    let mut dynamic_key_arg = None;
    let mut handle_args_arg: Option<&Argument> = None;

    for arg in handle_field_directive.arguments.iter() {
        if arg.name.item == handler_arg_name {
            if let Value::Constant(constant_val) = &arg.value.item {
                handler_arg = Some((arg, constant_val));
            }
        } else if arg.name.item == *KEY_ARG_NAME {
            if let Value::Constant(constant_val) = &arg.value.item {
                key_arg = Some((arg, constant_val));
            }
        } else if arg.name.item == *FILTERS_ARG_NAME {
            if let Value::Constant(constant_val) = &arg.value.item {
                filters_arg = Some((arg, constant_val));
            }
        } else if arg.name.item == *DYNAMIC_KEY_ARG_NAME {
            if let Value::Variable(_) = arg.value.item {
                dynamic_key_arg = Some((arg, &arg.value.item));
            }
        } else if arg.name.item == *HANLDE_ARGS_NAME {
            handle_args_arg = Some(arg)
        }
    }

    HandleFieldDirectiveArgs {
        handler_arg,
        key_arg,
        filters_arg,
        dynamic_key_arg,
        handle_args_arg,
    }
}

fn extract_values_from_handle_field_directive_helper(
    handle_field_directive: &Directive,
    hanlder_arg_name: StringKey,
    default_handler: Option<StringKey>,
    default_filters: Option<Vec<StringKey>>,
) -> HandleFieldDirectiveValues {
    let HandleFieldDirectiveArgs {
        handler_arg,
        filters_arg,
        key_arg,
        dynamic_key_arg,
        handle_args_arg,
    } = extract_handle_field_directive_args_helper(handle_field_directive, hanlder_arg_name);

    // We expect these values to be available since they should've been
    // validated first as part of validate_connections validation step.
    let key = match key_arg {
        Some((_, value)) => value
            .get_string_literal()
            .expect("Expected key_arg to have been previously validated."),
        None => "".intern(),
    };
    let handle= match handler_arg {
         Some((_, value)) => value.get_string_literal().expect("Expected handler_arg to have been previously validated."),
         None => default_handler.expect("Expected handler_arg to have been previously validated or a default to have been provided."),
     };
    let filters = match filters_arg {
        Some((_, value)) => match value {
            ConstantValue::List(list_val) => Some(
                list_val
                    .iter()
                    .map(|val| {
                        val.get_string_literal()
                            .expect("Expected filters_arg to have been previously validated.")
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
    let handle_args = handle_args_arg.map(|arg| {
        if let Value::Object(args) = &arg.value.item {
            args.clone()
        } else {
            unreachable!("Expected handle_args to be 'Value::Object'.")
        }
    });

    HandleFieldDirectiveValues {
        handle,
        key,
        filters,
        dynamic_key,
        handle_args,
    }
}
