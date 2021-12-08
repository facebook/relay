/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::{Argument, ConstantValue, Value};
use std::fmt;

use crate::murmurhash::murmurhash;

pub fn hash_arguments(args: &[Argument]) -> Option<String> {
    if args.is_empty() {
        None
    } else {
        let mut converted_args: Vec<_> = args
            .iter()
            .map(|arg| HashArgument {
                name: arg.name.item.lookup(),
                value: identifier_for_argument_value(&arg.value.item),
            })
            .collect();
        converted_args.sort_by(|a, b| a.name.cmp(b.name));

        let args_string = format!(
            "[{}]",
            converted_args
                .iter()
                .map(|item| item.to_string())
                .collect::<Vec<String>>()
                .join(",")
        );
        Some(murmurhash(&args_string))
    }
}

#[derive(Debug)]
struct HashArgument {
    name: &'static str,
    value: IdentiferValue,
}

impl fmt::Display for HashArgument {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{{\"name\":\"{}\",\"value\":{}}}", self.name, self.value)
    }
}

#[derive(Debug)]
enum IdentiferValue {
    Variable(&'static str),
    Value(String),
    List(Vec<IdentiferValue>),
    Object(Vec<IdentiferObjectProperty>),
}

impl fmt::Display for IdentiferValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match &self {
            IdentiferValue::Variable(var) => write!(f, "{{\"variable\":\"{}\"}}", var),
            IdentiferValue::Value(val) => write!(f, "{{\"value\":{}}}", val),
            IdentiferValue::Object(obj) => write!(
                f,
                "{{\"object\":{{{}}}}}",
                obj.iter()
                    .map(|item| item.to_string())
                    .collect::<Vec<String>>()
                    .join(",")
            ),
            IdentiferValue::List(list) => write!(
                f,
                "{{\"list\":[{}]}}",
                list.iter()
                    .map(|item| item.to_string())
                    .collect::<Vec<String>>()
                    .join(",")
            ),
        }
    }
}

#[derive(Debug)]
struct IdentiferObjectProperty {
    name: &'static str,
    value: IdentiferValue,
}

impl fmt::Display for IdentiferObjectProperty {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{{\"name\":\"{}\",\"value\":{}}}", self.name, self.value)
    }
}

fn build_constant_value_string(value: &ConstantValue) -> String {
    match value {
        ConstantValue::Int(val) => val.to_string(),
        ConstantValue::Float(val) => val.to_string(),
        ConstantValue::String(val) => format!("\"{}\"", val),
        ConstantValue::Boolean(val) => val.to_string(),
        ConstantValue::Null() => "null".to_string(),
        ConstantValue::Enum(val) => format!("\"{}\"", val),
        ConstantValue::List(val_list) => {
            let json_values = val_list
                .iter()
                .map(|val| build_constant_value_string(val))
                .collect::<Vec<_>>();

            format!("[{}]", json_values.join(","))
        }
        ConstantValue::Object(val_object) => {
            let mut rows: Vec<String> = Vec::with_capacity(val_object.len());
            for arg in val_object.iter() {
                let field_name = String::from(arg.name.item.lookup());
                rows.push(format!(
                    "\"{}\":{}",
                    field_name,
                    build_constant_value_string(&arg.value.item)
                ));
            }
            format!("{{{}}}", rows.join(","))
        }
    }
}

fn identifier_for_argument_value(value: &Value) -> IdentiferValue {
    match value {
        Value::Constant(value) => IdentiferValue::Value(build_constant_value_string(value)),
        Value::Variable(variable) => IdentiferValue::Variable(variable.name.item.lookup()),
        Value::List(items) => {
            IdentiferValue::List(items.iter().map(identifier_for_argument_value).collect())
        }
        Value::Object(entries) => IdentiferValue::Object(
            entries
                .iter()
                .map(|entry| IdentiferObjectProperty {
                    name: entry.name.item.lookup(),
                    value: identifier_for_argument_value(&entry.value.item),
                })
                .collect(),
        ),
    }
}
