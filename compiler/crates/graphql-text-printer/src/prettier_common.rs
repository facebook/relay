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

/// Double indentation (4 spaces) for nested content.
pub const DOUBLE_INDENT: &str = "    ";

/// Triple indentation (6 spaces) for deeply nested content.
pub const TRIPLE_INDENT: &str = "      ";

/// Check if content fits within the line width.
///
/// When `needs_trailing_content` is true, uses strict comparison (`<`)
/// to leave room for trailing content like directives. Otherwise uses
/// `<=` to allow content that exactly fits.
#[inline]
pub fn fits_on_line(total_len: usize, needs_trailing_content: bool) -> bool {
    if needs_trailing_content {
        total_len < LINE_WIDTH
    } else {
        total_len <= LINE_WIDTH
    }
}

/// Calculate the length of the current line from the output buffer.
///
/// Returns the number of characters since the last newline, or the
/// total length if there is no newline.
#[inline]
pub fn current_line_length(output: &str) -> usize {
    output
        .rfind('\n')
        .map_or(output.len(), |pos| output.len() - pos - 1)
}

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
