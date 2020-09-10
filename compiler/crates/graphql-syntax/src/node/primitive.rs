/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::lexer::TokenKind;
use common::{SourceLocationKey, Span, WithLocation};
use interner::StringKey;
use std::fmt;

#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Token {
    pub span: Span,
    pub kind: TokenKind,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Identifier {
    pub span: Span,
    pub token: Token,
    pub value: StringKey,
}

impl fmt::Display for Identifier {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{}", self.value))
    }
}

impl Identifier {
    pub fn name_with_location(&self, file: SourceLocationKey) -> WithLocation<StringKey> {
        WithLocation::from_span(file, self.span, self.value)
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct List<T> {
    pub span: Span,
    pub start: Token,
    pub items: Vec<T>,
    pub end: Token,
}
