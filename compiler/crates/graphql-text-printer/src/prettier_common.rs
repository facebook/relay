/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Common formatting utilities shared across prettier printers.
//!
//! This module contains shared formatting functions used by
//! the schema printer and executable printer to avoid code duplication.
//!
//! Note: Both printers now use the `pretty` crate for document-based
//! formatting. This module contains string formatting utilities for
//! constant values and type annotations.

use graphql_syntax::ConstantArgument;
use graphql_syntax::ConstantValue;
use graphql_syntax::TypeAnnotation;

/// Formats a `ConstantValue` as a string.
///
/// This handles all constant value types: Int, Float, String, Boolean,
/// Null, Enum, List, and Object.
pub fn format_constant_value(value: &ConstantValue) -> String {
    match value {
        ConstantValue::Int(i) => i.value.to_string(),
        ConstantValue::Float(f) => f.source_value.to_string(),
        ConstantValue::String(s) => format!("\"{}\"", s.value),
        ConstantValue::Boolean(b) => if b.value { "true" } else { "false" }.to_string(),
        ConstantValue::Null(_) => "null".to_string(),
        ConstantValue::Enum(e) => e.value.to_string(),
        ConstantValue::List(list) => {
            let items: Vec<String> = list.items.iter().map(format_constant_value).collect();
            format!("[{}]", items.join(", "))
        }
        ConstantValue::Object(obj) => {
            let fields: Vec<String> = obj.items.iter().map(format_constant_argument).collect();
            format!("{{{}}}", fields.join(", "))
        }
    }
}

/// Formats a `ConstantArgument` as "name: value".
pub fn format_constant_argument(arg: &ConstantArgument) -> String {
    format!("{}: {}", arg.name.value, format_constant_value(&arg.value))
}

/// Formats a `TypeAnnotation` as a string.
///
/// Handles Named types, List types, and NonNull types.
pub fn format_type_annotation(type_: &TypeAnnotation) -> String {
    match type_ {
        TypeAnnotation::Named(named) => named.name.value.to_string(),
        TypeAnnotation::List(list) => format!("[{}]", format_type_annotation(&list.type_)),
        TypeAnnotation::NonNull(non_null) => {
            format!("{}!", format_type_annotation(&non_null.type_))
        }
    }
}
