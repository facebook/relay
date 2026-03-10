/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Common formatting utilities shared across prettier printers.
//!
//! This module contains shared constants and formatting functions used by
//! both the schema printer and executable printer to avoid code duplication.

use graphql_syntax::ConstantArgument;
use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::TypeAnnotation;

/// Line width used for prettier-graphql formatting decisions.
pub const LINE_WIDTH: usize = 80;

/// Indentation string (2 spaces, matching prettier-graphql).
pub const INDENT: &str = "  ";

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

/// Formats a slice of `ConstantDirective` as a space-separated string.
///
/// Each directive is formatted as `@name` or `@name(arg1: value1, arg2: value2)`.
pub fn format_constant_directives(directives: &[ConstantDirective]) -> String {
    directives
        .iter()
        .map(format_constant_directive)
        .collect::<Vec<_>>()
        .join(" ")
}

/// Formats a single `ConstantDirective` as a string.
pub fn format_constant_directive(directive: &ConstantDirective) -> String {
    let mut result = format!("@{}", directive.name.value);
    if let Some(ref arguments) = directive.arguments {
        let args: Vec<String> = arguments
            .items
            .iter()
            .map(format_constant_argument)
            .collect();
        result.push('(');
        result.push_str(&args.join(", "));
        result.push(')');
    }
    result
}
