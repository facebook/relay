/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::token_kind::TokenKind;
use common::Location;
use std::fmt;
use thiserror::Error;

#[derive(Clone, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
#[error("Syntax error: {kind} at {location:?}")]
pub struct SyntaxError {
    pub kind: SyntaxErrorKind,
    pub location: Location,
}

impl SyntaxError {
    pub fn new(kind: SyntaxErrorKind, location: Location) -> Self {
        Self { kind, location }
    }

    pub fn print(&self, source: &str) -> String {
        format!("Error: {} at {}", self.kind, self.location.print(source))
    }
}

impl fmt::Debug for SyntaxError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("Error: {} at {:?}", self.kind, self.location))
    }
}

#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum SyntaxErrorKind {
    #[error("Expected a {0}")]
    Expected(TokenKind),
    #[error("Expected a selection: field, inline fragment, or fragment spread")]
    ExpectedSelection,
    #[error("Expected a fragment, mutation, query, or subscription definition")]
    ExpectedDefinition,
    #[error("Expected a 'mutation', 'query', or 'subscription' keyword")]
    ExpectedOperationKind,
    #[error("Expected the keyword {0}")]
    ExpectedKeyword(&'static str),
    #[error("Expected a constant value (boolean, integer, float, string, null, list, or object")]
    ExpectedConstantValue,
    #[error("Expected a type annotation (e.g. '<Type>', '[Type]', 'Type!', etc)")]
    ExpectedTypeAnnotation,
    #[error("Expected a variable ('$<name>')")]
    ExpectedVariable,
    #[error("Expected a spread ('...')")]
    ExpectedSpread,
    #[error("Invalid floating point value")]
    InvalidFloat,
    #[error("Invalid integer value")]
    InvalidInteger,
    #[error("Invalid number value, expected an int or float")]
    InvalidNumberLiteral,
    #[error("Unsupported character")]
    UnsupportedCharacter,
    #[error("Unterminated string literal")]
    UnterminatedString,
}
