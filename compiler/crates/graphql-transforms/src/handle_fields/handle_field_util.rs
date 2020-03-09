/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::handle_fields::HandleFieldConstants;
use common::{Location, WithLocation};
use graphql_ir::{Argument, ConstantValue, Directive, Value};
use interner::StringKey;

pub struct HandleFieldDirectiveArgs<'s> {
    pub handler_arg: Option<(&'s Argument, &'s ConstantValue)>,
    pub key_arg: Option<(&'s Argument, &'s ConstantValue)>,
    pub filters_arg: Option<(&'s Argument, &'s ConstantValue)>,
    pub dynamic_key_arg: Option<(&'s Argument, &'s Value)>,
}

/// Helper to extract handle field arguments that are present
/// on the directive
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

/// Helper to assert and extract the expected arguments for a connection
/// directive. This function will panic if the expected arguments aren't present,
/// with the assumption that the connection field has already been validated.
pub fn build_handle_field_directive(
    handle_field_directive: &Directive,
    handle_field_constants: HandleFieldConstants,
    // TODO(T63626569): Add support for derived locations
    empty_location: &Location,
    default_handler: Option<StringKey>,
) -> Directive {
    let HandleFieldDirectiveArgs {
        handler_arg,
        filters_arg,
        key_arg,
        dynamic_key_arg,
    } = extract_handle_field_directive_args(handle_field_directive, handle_field_constants);

    // We expect these values to be available since they should've been
    // validated first as part of validate_connections validation step.
    let key_val = match key_arg {
        Some((_, value)) => match value {
            ConstantValue::String(_) => value.clone(),
            _ => unreachable!("Expected key_arg to have been previously validated."),
        },
        None => unreachable!("Expected key_arg to have been previously validated."),
    };
    let handler_val = match handler_arg {
        Some((_, value)) => match value {
            ConstantValue::String(_) => value.clone(),
            _ => unreachable!("Expected handler_arg to have been previously validated."),
        },
        None => match default_handler {
            Some(def) => ConstantValue::String(def),
            None => unreachable!("Expected handler_arg to have been previously validated or a default to have been provided."), 
        },
    };
    let filters_val = match filters_arg {
        Some((_, value)) => match value {
            ConstantValue::List(list_val) => {
                for val in list_val.iter() {
                    match val {
                        ConstantValue::String(_) => {}
                        _ => {
                            unreachable!("Expected filters_arg to have been previously validated.")
                        }
                    }
                }
                value.clone()
            }
            _ => unreachable!("Expected filters_arg to have been previously validated."),
        },
        None => ConstantValue::Null(),
    };
    let dynamic_key_val = match dynamic_key_arg {
        Some((_, value)) => match value {
            Value::Variable(_) => value.clone(),
            _ => unreachable!("Expected dynamic_key_arg to have been previously validated."),
        },
        None => Value::Constant(ConstantValue::Null()),
    };

    let directive_arguments = vec![
        Argument {
            name: WithLocation::new(*empty_location, handle_field_constants.key_arg_name),
            value: WithLocation::new(*empty_location, Value::Constant(key_val)),
        },
        Argument {
            name: WithLocation::new(*empty_location, handle_field_constants.handler_arg_name),
            value: WithLocation::new(*empty_location, Value::Constant(handler_val)),
        },
        Argument {
            name: WithLocation::new(*empty_location, handle_field_constants.filters_arg_name),
            value: WithLocation::new(*empty_location, Value::Constant(filters_val)),
        },
        Argument {
            name: WithLocation::new(*empty_location, handle_field_constants.dynamic_key_arg_name),
            value: WithLocation::new(*empty_location, dynamic_key_val),
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
