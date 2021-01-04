/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use logos::{Lexer, Logos};
use std::fmt;

#[derive(Default, Eq, PartialEq)]
pub struct TokenKindExtras {
    /// Token callbacks might store an error token kind in here before failing.
    /// This is then picked up in the parser to turn the `Error` token into a
    /// more specific variant.
    pub error_token: Option<TokenKind>,
}

/// Lexer for the GraphQL specification: http://spec.graphql.org/
#[derive(Logos, Copy, Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
#[logos(extras = TokenKindExtras)]
pub enum TokenKind {
    #[regex(r"[ \t\r\n\f,]+|#[^\n\r]*", logos::skip)]
    #[error]
    Error,

    ErrorUnterminatedString,
    ErrorUnsupportedStringCharacter,
    ErrorUnterminatedBlockString,
    Empty,

    // Valid tokens
    #[token("&")]
    Ampersand,

    #[token("@")]
    At,

    #[token("}")]
    CloseBrace,

    #[token("]")]
    CloseBracket,

    #[token(")")]
    CloseParen,

    #[token(":")]
    Colon,

    #[token("$")]
    Dollar,

    EndOfFile,

    #[token("=")]
    Equals,

    #[token("!")]
    Exclamation,

    // IntegerPart:    -?(0|[1-9][0-9]*)
    // FractionalPart: \\.[0-9]+
    // ExponentPart:   [eE][+-]?[0-9]+
    #[regex("-?(0|[1-9][0-9]*)(\\.[0-9]+[eE][+-]?[0-9]+|\\.[0-9]+|[eE][+-]?[0-9]+)")]
    FloatLiteral,

    #[regex("[a-zA-Z_][a-zA-Z0-9_]*")]
    Identifier,

    #[regex("-?(0|[1-9][0-9]*)")]
    IntegerLiteral,

    #[regex("-?0[0-9]+(\\.[0-9]+[eE][+-]?[0-9]+|\\.[0-9]+|[eE][+-]?[0-9]+)?")]
    ErrorNumberLiteralLeadingZero,

    #[regex("-?(0|[1-9][0-9]*)(\\.[0-9]+[eE][+-]?[0-9]+|\\.[0-9]+|[eE][+-]?[0-9]+)?[.a-zA-Z_]")]
    ErrorNumberLiteralTrailingInvalid,

    #[regex("-?(\\.[0-9]+[eE][+-]?[0-9]+|\\.[0-9]+)")]
    ErrorFloatLiteralMissingZero,

    #[token("{")]
    OpenBrace,

    #[token("[")]
    OpenBracket,

    #[token("(")]
    OpenParen,

    #[token(".")]
    Period,

    #[token("..")]
    PeriodPeriod,

    #[token("|")]
    Pipe,

    #[token("...")]
    Spread,

    #[token("\"", lex_string)]
    StringLiteral,

    #[token("\"\"\"", lex_block_string)]
    BlockStringLiteral,
}

#[derive(Logos, Debug)]
pub enum StringToken {
    #[error]
    Error,

    #[regex(r#"\\["\\/bfnrt]"#)]
    EscapedCharacter,

    #[regex(r#"\\u[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]"#)]
    EscapedUnicode,

    #[token("\"")]
    Quote,

    #[regex(r#"\n|\r|\r\n"#)]
    LineTerminator,

    #[regex(r#"[\u0009\u0020\u0021\u0023-\u005B\u005D-\uFFFF]+"#)]
    StringCharacters,
}

fn lex_string(lexer: &mut Lexer<'_, TokenKind>) -> bool {
    let remainder = lexer.remainder();
    let mut string_lexer = StringToken::lexer(remainder);
    while let Some(string_token) = string_lexer.next() {
        match string_token {
            StringToken::Quote => {
                lexer.bump(string_lexer.span().end);
                return true;
            }
            StringToken::LineTerminator => {
                lexer.bump(string_lexer.span().start);
                lexer.extras.error_token = Some(TokenKind::ErrorUnterminatedString);
                return false;
            }
            StringToken::EscapedCharacter
            | StringToken::EscapedUnicode
            | StringToken::StringCharacters => {}
            StringToken::Error => {
                lexer.extras.error_token = Some(TokenKind::ErrorUnsupportedStringCharacter);
                return false;
            }
        }
    }
    lexer.extras.error_token = Some(TokenKind::ErrorUnterminatedString);
    false
}

fn lex_block_string(lexer: &mut Lexer<'_, TokenKind>) -> bool {
    let remainder = lexer.remainder();
    let mut string_lexer = BlockStringToken::lexer(remainder);
    while let Some(string_token) = string_lexer.next() {
        match string_token {
            BlockStringToken::TripleQuote => {
                lexer.bump(string_lexer.span().end);
                return true;
            }
            BlockStringToken::EscapedTripleQuote | BlockStringToken::Other => {}
            BlockStringToken::Error => unreachable!(),
        }
    }
    lexer.extras.error_token = Some(TokenKind::ErrorUnterminatedBlockString);
    false
}

#[derive(Logos, Copy, Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum BlockStringToken {
    #[error]
    Error,

    #[token("\\\"\"\"")]
    EscapedTripleQuote,

    #[token("\"\"\"")]
    TripleQuote,

    #[regex(r#"[\u0009\u000A\u000D\u0020-\uFFFF]"#)]
    Other,
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
            TokenKind::Dollar => "dollar ('$')",
            TokenKind::EndOfFile => "end of file",
            TokenKind::Equals => "equals ('=')",
            TokenKind::Exclamation => "exclamation mark ('!')",
            TokenKind::FloatLiteral => "floating point value (e.g. '3.14')",
            TokenKind::Identifier => "non-variable identifier (e.g. 'x' or 'Foo')",
            TokenKind::IntegerLiteral => "integer value (e.g. '0' or '42')",
            TokenKind::OpenBrace => "open brace ('{')",
            TokenKind::OpenBracket => "open bracket ('[')",
            TokenKind::OpenParen => "open parenthesis ('(')",
            TokenKind::Period => "period ('.')",
            TokenKind::PeriodPeriod => "double period ('..')",
            TokenKind::Pipe => "pipe ('|')",
            TokenKind::Spread => "spread ('...')",
            TokenKind::BlockStringLiteral => "block string (e.g. '\"\"\"hi\"\"\"')",
            TokenKind::Error => "error",
            TokenKind::ErrorFloatLiteralMissingZero => "unsupported number (int or float) literal",
            TokenKind::ErrorNumberLiteralLeadingZero => "unsupported number (int or float) literal",
            TokenKind::ErrorNumberLiteralTrailingInvalid => {
                "unsupported number (int or float) literal"
            }
            TokenKind::StringLiteral => "string literal (e.g. '\"...\"')",
            TokenKind::ErrorUnterminatedString => "unterminated string",
            TokenKind::ErrorUnsupportedStringCharacter => "unsupported character in string",
            TokenKind::ErrorUnterminatedBlockString => "unterminated block string",
            TokenKind::Empty => "missing expected kind",
        };
        f.write_str(message)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn assert_token(source: &str, kind: TokenKind, length: usize) {
        let mut lexer = TokenKind::lexer(source);
        assert_eq!(
            lexer.next(),
            Some(kind),
            "Testing the lexing of string '{}'",
            source
        );
        assert_eq!(
            lexer.span(),
            0..length,
            "Testing the lexing of string '{}'",
            source
        );
    }

    #[test]
    fn test_number_successes() {
        assert_token("4", TokenKind::IntegerLiteral, 1);
        assert_token("4.123", TokenKind::FloatLiteral, 5);
        assert_token("-4", TokenKind::IntegerLiteral, 2);
        assert_token("9", TokenKind::IntegerLiteral, 1);
        assert_token("0", TokenKind::IntegerLiteral, 1);
        assert_token("-4.123", TokenKind::FloatLiteral, 6);
        assert_token("0.123", TokenKind::FloatLiteral, 5);
        assert_token("123e4", TokenKind::FloatLiteral, 5);
        assert_token("123E4", TokenKind::FloatLiteral, 5);
        assert_token("123e-4", TokenKind::FloatLiteral, 6);
        assert_token("123e+4", TokenKind::FloatLiteral, 6);
        assert_token("-1.123e4", TokenKind::FloatLiteral, 8);
        assert_token("-1.123E4", TokenKind::FloatLiteral, 8);
        assert_token("-1.123e-4", TokenKind::FloatLiteral, 9);
        assert_token("-1.123e+4", TokenKind::FloatLiteral, 9);
        assert_token("-1.123e4567", TokenKind::FloatLiteral, 11);
        assert_token("-0", TokenKind::IntegerLiteral, 2);
    }

    #[test]
    fn test_number_failures() {
        assert_token("00", TokenKind::ErrorNumberLiteralLeadingZero, 2);
        assert_token("01", TokenKind::ErrorNumberLiteralLeadingZero, 2);
        assert_token("-01", TokenKind::ErrorNumberLiteralLeadingZero, 3);
        assert_token("+1", TokenKind::Error, 1);
        assert_token("01.23", TokenKind::ErrorNumberLiteralLeadingZero, 5);
        assert_token("1.", TokenKind::ErrorNumberLiteralTrailingInvalid, 2);
        assert_token("1e", TokenKind::ErrorNumberLiteralTrailingInvalid, 2);
        assert_token("1.e1", TokenKind::ErrorNumberLiteralTrailingInvalid, 2);
        assert_token("1.A", TokenKind::ErrorNumberLiteralTrailingInvalid, 2);
        assert_token("-A", TokenKind::Error, 1);
        assert_token("1.0e", TokenKind::ErrorNumberLiteralTrailingInvalid, 4);
        assert_token("1.0eA", TokenKind::ErrorNumberLiteralTrailingInvalid, 4);
        assert_token("1.2e3e", TokenKind::ErrorNumberLiteralTrailingInvalid, 6);
        assert_token("1.2e3.4", TokenKind::ErrorNumberLiteralTrailingInvalid, 6);
        assert_token("1.23.4", TokenKind::ErrorNumberLiteralTrailingInvalid, 5);
        assert_token(".123", TokenKind::ErrorFloatLiteralMissingZero, 4);

        // check that we don't consume trailing valid items
        assert_token("1.23.{}", TokenKind::ErrorNumberLiteralTrailingInvalid, 5);
        assert_token("1.23. {}", TokenKind::ErrorNumberLiteralTrailingInvalid, 5);
        assert_token("1.23. []", TokenKind::ErrorNumberLiteralTrailingInvalid, 5);
        assert_token("1.23. foo", TokenKind::ErrorNumberLiteralTrailingInvalid, 5);
        assert_token(
            "1.23. $foo",
            TokenKind::ErrorNumberLiteralTrailingInvalid,
            5,
        );
    }

    #[test]
    fn test_lexing() {
        let input = "
          query EmptyQuery($id: ID!) {
            node(id: $id) {
              id @skip(if: false)
              ...E1
            }
          }
        ";
        let mut lexer = TokenKind::lexer(input);

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "query");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "EmptyQuery");

        assert_eq!(lexer.next(), Some(TokenKind::OpenParen));
        assert_eq!(lexer.slice(), "(");

        assert_eq!(lexer.next(), Some(TokenKind::Dollar));
        assert_eq!(lexer.slice(), "$");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "id");

        assert_eq!(lexer.next(), Some(TokenKind::Colon));
        assert_eq!(lexer.slice(), ":");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "ID");

        assert_eq!(lexer.next(), Some(TokenKind::Exclamation));
        assert_eq!(lexer.slice(), "!");

        assert_eq!(lexer.next(), Some(TokenKind::CloseParen));
        assert_eq!(lexer.slice(), ")");

        assert_eq!(lexer.next(), Some(TokenKind::OpenBrace));
        assert_eq!(lexer.slice(), "{");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "node");

        assert_eq!(lexer.next(), Some(TokenKind::OpenParen));
        assert_eq!(lexer.slice(), "(");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "id");

        assert_eq!(lexer.next(), Some(TokenKind::Colon));
        assert_eq!(lexer.slice(), ":");

        assert_eq!(lexer.next(), Some(TokenKind::Dollar));
        assert_eq!(lexer.slice(), "$");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "id");

        assert_eq!(lexer.next(), Some(TokenKind::CloseParen));
        assert_eq!(lexer.slice(), ")");

        assert_eq!(lexer.next(), Some(TokenKind::OpenBrace));
        assert_eq!(lexer.slice(), "{");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "id");

        assert_eq!(lexer.next(), Some(TokenKind::At));
        assert_eq!(lexer.slice(), "@");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "skip");

        assert_eq!(lexer.next(), Some(TokenKind::OpenParen));
        assert_eq!(lexer.slice(), "(");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "if");

        assert_eq!(lexer.next(), Some(TokenKind::Colon));
        assert_eq!(lexer.slice(), ":");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "false");

        assert_eq!(lexer.next(), Some(TokenKind::CloseParen));
        assert_eq!(lexer.slice(), ")");

        assert_eq!(lexer.next(), Some(TokenKind::Spread));
        assert_eq!(lexer.slice(), "...");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "E1");

        assert_eq!(lexer.next(), Some(TokenKind::CloseBrace));
        assert_eq!(lexer.slice(), "}");

        assert_eq!(lexer.next(), Some(TokenKind::CloseBrace));
        assert_eq!(lexer.slice(), "}");

        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_string_lexing() {
        let input = r#"
            "test"
            "escaped \" quote"
            "unterminated
            "
        "#;
        let mut lexer = TokenKind::lexer(input);

        assert_eq!(lexer.next(), Some(TokenKind::StringLiteral));
        assert_eq!(lexer.slice(), "\"test\"");

        assert_eq!(lexer.next(), Some(TokenKind::StringLiteral));
        assert_eq!(lexer.slice(), r#""escaped \" quote""#);

        assert_eq!(lexer.next(), Some(TokenKind::Error));
        assert_eq!(
            lexer.extras.error_token,
            Some(TokenKind::ErrorUnterminatedString)
        );
        assert_eq!(lexer.slice(), "\"unterminated");
    }

    #[test]
    fn test_invalid_character_lexing() {
        let input = r#"
            {
                %%%
                __typename
                *
            }
        "#;
        let mut lexer = TokenKind::lexer(input);

        assert_eq!(lexer.next(), Some(TokenKind::OpenBrace));
        assert_eq!(lexer.slice(), "{");

        assert_eq!(lexer.next(), Some(TokenKind::Error));
        assert_eq!(lexer.slice(), "%");

        assert_eq!(lexer.next(), Some(TokenKind::Error));
        assert_eq!(lexer.slice(), "%");

        assert_eq!(lexer.next(), Some(TokenKind::Error));
        assert_eq!(lexer.slice(), "%");

        assert_eq!(lexer.next(), Some(TokenKind::Identifier));
        assert_eq!(lexer.slice(), "__typename");

        assert_eq!(lexer.next(), Some(TokenKind::Error));
        assert_eq!(lexer.slice(), "*");

        assert_eq!(lexer.next(), Some(TokenKind::CloseBrace));
        assert_eq!(lexer.slice(), "}");

        assert_eq!(lexer.next(), None);
    }

    #[test]
    fn test_block_string_lexing() {
        let input = r#"
            # escaped
            """tes\"""t"""
            # empty
            """"""
            # 2 quotes in a string
            """"" """
            """
                multi-
                line
            """
            """unterminated
        "#;
        let mut lexer = TokenKind::lexer(input);

        assert_eq!(lexer.next(), Some(TokenKind::BlockStringLiteral));
        assert_eq!(lexer.slice(), r#""""tes\"""t""""#);

        assert_eq!(lexer.next(), Some(TokenKind::BlockStringLiteral));
        assert_eq!(lexer.slice(), r#""""""""#);

        assert_eq!(lexer.next(), Some(TokenKind::BlockStringLiteral));
        assert_eq!(lexer.slice(), r#"""""" """"#);

        assert_eq!(lexer.next(), Some(TokenKind::BlockStringLiteral));
        assert_eq!(
            lexer.slice(),
            r#""""
                multi-
                line
            """"#
        );

        assert_eq!(lexer.next(), Some(TokenKind::Error));
        assert_eq!(
            lexer.extras.error_token,
            Some(TokenKind::ErrorUnterminatedBlockString)
        );
        // Unterminated string just consumes the starting quotes
        assert_eq!(lexer.slice(), r#"""""#);
    }
}
