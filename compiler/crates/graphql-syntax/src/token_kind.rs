/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt;

#[derive(Copy, Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum TokenKind {
    // Errors
    ErrorInvalidVariableIdentifier,
    ErrorUnsupportedCharacterSequence,
    ErrorUnterminatedStringLiteral,
    ErrorUnsupportedNumberLiteral,

    // Valid tokens
    Ampersand,
    At,
    CloseBrace,
    CloseBracket,
    CloseParen,
    Colon,
    Comma,
    Dollar,
    EndOfFile,
    Equals,
    Exclamation,
    FloatLiteral,
    Identifier,
    IntegerLiteral,
    NewLine,
    OpenBrace,
    OpenBracket,
    OpenParen,
    Period,
    PeriodPeriod,
    Pipe,
    Plus,
    SingleLineComment,
    Spread,
    StringLiteral,
    VariableIdentifier,
    Whitespace,
}

impl fmt::Display for TokenKind {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let message = match self {
            TokenKind::Ampersand => "ampersand ('&')",
            TokenKind::At => "at ('@')",
            TokenKind::CloseBrace => "closing brace ('}')",
            TokenKind::CloseBracket => "closing bracket (']')",
            TokenKind::CloseParen => "closing paren (')')",
            TokenKind::Colon => "colon (':')",
            TokenKind::Comma => "comma (',')",
            TokenKind::EndOfFile => "end of file",
            TokenKind::Equals => "equals ('=')",
            TokenKind::ErrorInvalidVariableIdentifier => {
                "invalid variable identifier ('$' followed by invalid  character)"
            }
            TokenKind::ErrorUnsupportedCharacterSequence => "unsupported character(s)",
            TokenKind::ErrorUnterminatedStringLiteral => "unterminated string literal ('\"...\"')",
            TokenKind::ErrorUnsupportedNumberLiteral => "unsupported number (int or float) literal",
            TokenKind::Exclamation => "exclamation mark ('!')",
            TokenKind::FloatLiteral => "floating point value (e.g. '3.14')",
            TokenKind::Identifier => "non-variable identifier (e.g. 'x' or 'Foo')",
            TokenKind::IntegerLiteral => "integer value (e.g. '0' or '42')",
            TokenKind::NewLine => "newline ('\\n' or '\\r\\n)",
            TokenKind::OpenBrace => "open brace ('{')",
            TokenKind::OpenBracket => "open bracket ('[')",
            TokenKind::OpenParen => "open parenthesis ('(')",
            TokenKind::Period => "period ('.')",
            TokenKind::PeriodPeriod => "double period ('..')",
            TokenKind::Pipe => "pipe ('|')",
            TokenKind::Plus => "plus ('+')",
            TokenKind::SingleLineComment => "single line comment ('//...')",
            TokenKind::Spread => "spread ('...')",
            TokenKind::StringLiteral => "string literal (e.g. '\"...\"')",
            TokenKind::VariableIdentifier => "variable name ('$...', e.g. '$id')",
            TokenKind::Whitespace => "whitespace (tab, space, etc)",
            TokenKind::Dollar => "dollar ('$')",
        };
        f.write_str(message)
    }
}
