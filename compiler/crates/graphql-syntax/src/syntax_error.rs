/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::lexer::TokenKind;
use thiserror::Error;

#[derive(Clone, Copy, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum SyntaxError {
    #[error("Expected a {0}")]
    Expected(TokenKind),
    #[error("Expected a selection: field, inline fragment, or fragment spread")]
    ExpectedSelection,
    #[error("Expected a fragment, mutation, query, or subscription definition")]
    ExpectedDefinition,
    #[error("Expected a definition")]
    ExpectedExecutableDefinition,
    #[error("Expected a 'mutation', 'query', or 'subscription' keyword")]
    ExpectedOperationKind,
    #[error(
        "Expected a valid variable name after $ (alphabetic character followed by any number of alphabetic, number and _ characters)"
    )]
    ExpectedVariableIdentifier,
    #[error("Expected the keyword '{0}'")]
    ExpectedKeyword(&'static str),
    #[error("Expected a constant value (boolean, integer, float, string, null, list, or object")]
    ExpectedConstantValue,
    #[error("Expected a type annotation (e.g. '<Type>', '[Type]', 'Type!', etc)")]
    ExpectedTypeAnnotation,
    #[error(
        "Expected a value ('$example', boolean, integer, float, string, null, list, or object)"
    )]
    ExpectedValue,
    #[error("Expected a variable ('$example')")]
    ExpectedVariable,
    #[error("Expected a spread ('...')")]
    ExpectedSpread,
    #[error("Expected an argument")]
    ExpectedArgument,
    #[error("Expected the list to be non-empty")]
    ExpectedNonEmptyList,
    #[error("Invalid floating point value")]
    InvalidFloat,
    #[error("Invalid integer value")]
    InvalidInteger,
    #[error("Invalid number value, expected an int or float")]
    InvalidNumberLiteral,
    #[error(
        "Invalid float literal, fractional float literals require a leading 0, e.g. 0.5 instead of .5"
    )]
    InvalidFloatLiteralMissingZero,
    #[error("Invalid float value, GraphQL requires a leading zero, eg. 0.56")]
    InvalidFloatMissingZeroLiteral,
    #[error("Unsupported character")]
    UnsupportedCharacter,
    #[error("String containing an invalid character")]
    UnsupportedStringCharacter,
    #[error("Unterminated string literal (strings cannot contain unescaped line breaks)")]
    UnterminatedString,
    #[error("Unterminated block string literal")]
    UnterminatedBlockString,
}
