/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::murmurhash;

use graphql_ir::{Argument, ConstantValue, Value};
use serde::Serialize;
use serde_json;
use serde_json::{json, Map as SerdeMap, Value as SerdeValue};

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
        converted_args.sort_by(|a, b| a.name.cmp(&b.name));

        let args_string = serde_json::to_string(&converted_args).unwrap();
        Some(murmurhash(&args_string))
    }
}

#[derive(Serialize)]
struct HashArgument {
    name: &'static str,
    value: IdentiferValue,
}

#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
enum IdentiferValue {
    Variable(&'static str),
    Value(SerdeValue),
    List(Vec<IdentiferValue>),
    Object(Vec<IdentiferObjectProperty>),
}

#[derive(Serialize)]
struct IdentiferObjectProperty {
    name: &'static str,
    value: IdentiferValue,
}

fn build_constant_value(value: &ConstantValue) -> SerdeValue {
    match value {
        ConstantValue::Int(val) => json!(val),
        ConstantValue::Float(val) => json!(val.as_float()),
        ConstantValue::String(val) => json!(val.lookup()),
        ConstantValue::Boolean(val) => json!(val),
        ConstantValue::Null() => json!(null),
        ConstantValue::Enum(val) => json!(val.lookup()),
        ConstantValue::List(val_list) => {
            let json_values = val_list
                .iter()
                .map(|val| build_constant_value(val))
                .collect::<Vec<SerdeValue>>();
            json!(json_values)
        }
        ConstantValue::Object(val_object) => {
            let mut map: SerdeMap<String, SerdeValue> = SerdeMap::with_capacity(val_object.len());
            for arg in val_object.iter() {
                let field_name = String::from(arg.name.item.lookup());
                map.insert(field_name, build_constant_value(&arg.value.item));
            }
            json!(map)
        }
    }
}

fn identifier_for_argument_value(value: &Value) -> IdentiferValue {
    match value {
        Value::Constant(value) => IdentiferValue::Value(build_constant_value(value)),
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
