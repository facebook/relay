/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::char_constants::*;
use crate::lexer_position::LexerPosition;
use crate::syntax_node::Token;
use crate::token_kind::TokenKind;
use common::Span;

/// Lexer for the *executable* subset of the GraphQL specification:
/// https://github.com/graphql/graphql-spec/blob/master/spec/Appendix%20B%20--%20Grammar%20Summary.md
///
/// Lazily transforms a source str into a sequence of `Token`s that encode leading trivia,
/// a kind, trailing trivia, and inner/outer spans (outer includes the span of the trivia,
/// inner excludes the spans of the trivia).
#[derive(Clone, Debug)]
pub struct Lexer<'a> {
    position: LexerPosition<'a>,
}

impl<'a> Lexer<'a> {
    pub fn new(source: &'a str) -> Self {
        Lexer {
            position: LexerPosition::new(source),
        }
    }

    /// Advance the lexer and return the next token.
    pub fn next(&mut self) -> Token {
        let start = self.position.index();
        self.skip_leading_trivia();
        let inner_start = self.position.index();
        let kind = self.next_kind();
        let inner_span = Span::from_usize(inner_start, self.position.index() - inner_start);
        self.skip_trailing_trivia();
        let span = Span::from_usize(start, self.position.index() - start);
        Token {
            span,
            kind,
            inner_span,
        }
    }

    fn peek(&self) -> TokenKind {
        let mut clone = self.clone();
        clone.next_kind()
    }

    fn next_kind(&mut self) -> TokenKind {
        let ch = self.position.next();
        match ch {
            LINE_FEED => TokenKind::NewLine,
            CARRIAGE_RETURN => {
                self.position.eat(LINE_FEED);
                TokenKind::NewLine
            }
            TAB | SPACE => {
                self.position.skip_while(is_non_newline_whitespace);
                TokenKind::Whitespace
            }
            AT => TokenKind::At,
            CLOSE_BRACE => TokenKind::CloseBrace,
            CLOSE_BRACKET => TokenKind::CloseBracket,
            CLOSE_PAREN => TokenKind::CloseParen,
            COLON => TokenKind::Colon,
            COMMA => TokenKind::Comma,
            DOUBLE_QUOTE => self.lex_string_literal_rest(),
            EQUALS => TokenKind::Equals,
            EXCLAMATION => TokenKind::Exclamation,
            HASH => self.lex_comment(),
            NULL => TokenKind::EndOfFile,
            OPEN_BRACE => TokenKind::OpenBrace,
            OPEN_BRACKET => TokenKind::OpenBracket,
            OPEN_PAREN => TokenKind::OpenParen,
            PIPE => TokenKind::Pipe,
            PERIOD => {
                // It's invalid to have anything other than exactly '...', but since period
                // has no other meaning we can recover in the parser.
                let peek = self.position.peek();
                if peek == PERIOD {
                    self.position.next();
                    if self.position.peek() == PERIOD {
                        self.position.next();
                        TokenKind::Spread
                    } else {
                        TokenKind::PeriodPeriod
                    }
                } else if is_digit(peek) {
                    self.position.next();
                    self.lex_number_error()
                } else {
                    TokenKind::Period
                }
            }
            DOLLAR => self.lex_variable_identifier_rest(),
            MINUS => self.lex_number_literal_rest(ch),
            PLUS => self.lex_number_error(),
            ch if is_digit(ch) => self.lex_number_literal_rest(ch),
            ch if is_identifier_start(ch) => self.lex_identifer_rest(),
            _ => self.lex_error(),
        }
    }

    /// Skips over all insignificant tokens (including newlines) up to the start of
    /// the next significant token,
    fn skip_leading_trivia(&mut self) {
        let mut clone = self.clone();
        loop {
            match clone.peek() {
                TokenKind::NewLine
                | TokenKind::SingleLineComment
                | TokenKind::Whitespace
                | TokenKind::Comma => {
                    // intentionally ignore since we know the result is valid
                    let _ = clone.next_kind();
                }
                _ => {
                    self.position = clone.position;
                    break;
                }
            }
        }
    }

    /// Skips over all insigificant tokens up to the next newline
    fn skip_trailing_trivia(&mut self) {
        let mut clone = self.clone();
        loop {
            match clone.peek() {
                TokenKind::SingleLineComment | TokenKind::Whitespace | TokenKind::Comma => {
                    // intentionally ignore since we know the result is valid
                    let _ = clone.next_kind();
                }
                _ => {
                    self.position = clone.position;
                    break;
                }
            }
        }
    }

    /// Skips any remaining invalid tokens (expected to be called after
    /// encountering the first invalid token), recording the error details
    /// and returning a token error.
    fn lex_error(&mut self) -> TokenKind {
        let mut position = self.position.clone();
        loop {
            match position.peek() {
                LINE_FEED | CARRIAGE_RETURN | TAB | SPACE | AT | CLOSE_BRACE | CLOSE_BRACKET
                | CLOSE_PAREN | COLON | COMMA | DOUBLE_QUOTE | EQUALS | EXCLAMATION | HASH
                | MINUS | NULL | OPEN_BRACE | OPEN_BRACKET | OPEN_PAREN | PIPE | PLUS | PERIOD
                | DOLLAR => break,
                ch => {
                    if is_digit(ch) || is_identifier_start(ch) {
                        break;
                    } else {
                        position.next(); // consume the invalid char
                        continue;
                    }
                }
            };
        }
        self.position = position;
        TokenKind::ErrorUnsupportedCharacterSequence
    }

    /// Skips any remaining number-like characters (digits, period, plus/minus, exponent, or
    /// identifier).
    fn lex_number_error(&mut self) -> TokenKind {
        let mut position = self.position.clone();
        loop {
            let ch = position.peek();
            match ch {
                PERIOD | PLUS | MINUS => {
                    position.next();
                    continue;
                }
                _ => {
                    if is_digit(ch) || is_identifier_start(ch) {
                        position.next();
                        continue;
                    } else {
                        break;
                    }
                }
            };
        }
        self.position = position;
        TokenKind::ErrorUnsupportedNumberLiteral
    }

    /// Comment :: # CommentChar*
    ///
    /// CommentChar :: SourceCharacter but not LineTerminator
    fn lex_comment(&mut self) -> TokenKind {
        loop {
            match self.position.peek() {
                LINE_FEED | CARRIAGE_RETURN | NULL => return TokenKind::SingleLineComment,
                _ => {
                    self.position.next();
                }
            }
        }
    }

    /// Lexes the remainder of an identifer (after the leading '$' char).
    ///
    /// Variable : $ Name
    fn lex_variable_identifier_rest(&mut self) -> TokenKind {
        if !is_identifier_start(self.position.peek()) {
            TokenKind::ErrorInvalidVariableIdentifier
        } else {
            self.position.next(); // skip identifier start
            self.position.skip_while(is_identifer_part);
            TokenKind::VariableIdentifier
        }
    }

    /// Lexes the remainder of an identifer (after the first char).
    ///
    /// Name :: /[_A-Za-z][_0-9A-Za-z]*/
    fn lex_identifer_rest(&mut self) -> TokenKind {
        self.position.skip_while(is_identifer_part);
        TokenKind::Identifier
    }

    /// Lexes the remainder of a string literal (after the leading double quote)
    ///
    /// StringValue ::
    ///     " StringCharacter* "
    ///     """ BlockStringCharacter* """
    ///
    /// StringCharacter ::
    ///     SourceCharacter but not " or \ or LineTerminator
    ///     \u EscapedUnicode
    ///     \ EscapedCharacter
    ///
    /// EscapedUnicode :: /[0-9A-Fa-f]{4}/
    ///
    /// EscapedCharacter :: one of " \ / b f n r t
    ///
    /// BlockStringCharacter ::
    ///     SourceCharacter but not """ or \"""
    ///     \"""
    /// Note: Block string values are interpreted to exclude blank initial and trailing lines and uniform indentation with {BlockStringValue()}.
    ///
    /// SourceCharacter :: /[\u0009\u000A\u000D\u0020-\uFFFF]/
    fn lex_string_literal_rest(&mut self) -> TokenKind {
        // TODO T60450344: full string literal support
        if self.position.peek() == DOUBLE_QUOTE && self.position.peek_offset(1) == DOUBLE_QUOTE {
            unimplemented!("TODO T60450344: support for triple-quoted strings")
        }
        loop {
            match self.position.next() {
                NULL => {
                    return TokenKind::ErrorUnterminatedStringLiteral;
                }
                BACKSLASH => match self.position.next() {
                    '"' | '\\' | '/' | 'b' | 'f' | 'n' | 'r' | 't' => continue,
                    'u' => unimplemented!("TODO T60450344: handle unicode escape sequence"),
                    NULL => {
                        return TokenKind::ErrorUnterminatedStringLiteral;
                    }
                    ch => unimplemented!("TODO T60450344: handle unknown escape sequence {:?}", ch),
                },
                DOUBLE_QUOTE => return TokenKind::StringLiteral,
                _ => continue,
            }
        }
    }

    /// Lexes the remainder of a number, after consuming the provided character
    ///
    /// IntValue :: IntegerPart
    ///
    /// IntegerPart ::
    ///     NegativeSign? 0
    ///     NegativeSign? NonZeroDigit Digit*
    ///
    /// NegativeSign :: -
    ///
    /// Digit :: one of 0 1 2 3 4 5 6 7 8 9
    ///
    /// NonZeroDigit :: Digit but not 0
    ///
    /// FloatValue ::
    ///     IntegerPart FractionalPart
    ///     IntegerPart ExponentPart
    ///     IntegerPart FractionalPart ExponentPart
    ///
    /// FractionalPart :: . Digit+
    ///
    /// ExponentPart :: ExponentIndicator Sign? Digit+
    ///
    /// ExponentIndicator :: one of e E
    ///
    /// Sign :: one of + -
    ///
    fn lex_number_literal_rest(&mut self, consumed_ch: char) -> TokenKind {
        let mut ch = consumed_ch;
        let mut is_float = false;

        if ch == MINUS {
            ch = self.position.next();
        }

        if ch == DIGIT_0 {
            ch = self.position.peek();
            if is_digit(ch) {
                return self.lex_number_error();
            }
        } else if is_digit(ch) {
            // Skip any additional digits
            self.position.skip_while(is_digit);
            ch = self.position.peek();
        } else {
            return self.lex_number_error();
        }

        if ch == PERIOD {
            self.position.next(); // Consume the period
            is_float = true;
            if self.read_digits().is_err() {
                return self.lex_number_error();
            }
            ch = self.position.peek();
        }

        if ch == CHAR_E || ch == CHAR_LOWER_E {
            is_float = true;
            self.position.next(); // Consume the E
            ch = self.position.peek();
            if ch == MINUS || ch == PLUS {
                self.position.next(); // Consume the sign
            }
            if self.read_digits().is_err() {
                return self.lex_number_error();
            }
            ch = self.position.peek();
        }

        if ch == PERIOD || is_identifier_start(ch) {
            return self.lex_number_error();
        }

        if is_float {
            TokenKind::FloatLiteral
        } else {
            TokenKind::IntegerLiteral
        }
    }

    /// Consumes all consecutive digits, or errors if the next character is not a digit.
    fn read_digits(&mut self) -> Result<(), ()> {
        let ch = self.position.peek();
        if !is_digit(ch) {
            Err(())
        } else {
            self.position.skip_while(is_digit);
            Ok(())
        }
    }
}

fn is_digit(ch: char) -> bool {
    ch >= DIGIT_0 && ch <= DIGIT_9
}

fn is_identifier_start(ch: char) -> bool {
    (ch >= CHAR_A && ch <= CHAR_Z) || (ch >= CHAR_LOWER_A && ch <= CHAR_LOWER_Z) || ch == UNDERSCORE
}

fn is_identifer_part(ch: char) -> bool {
    is_identifier_start(ch) || is_digit(ch)
}

fn is_non_newline_whitespace(ch: char) -> bool {
    match ch {
        SPACE | TAB | VERTICAL_TAB | FORM_FEED => true,
        _ => false,
    }
}

#[allow(dead_code)]
fn is_newline(ch: char) -> bool {
    match ch {
        LINE_FEED | CARRIAGE_RETURN | LINE_SEPARATOR | PARAGRAPH_SEPARATOR => true,
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    macro_rules! assert_token {
        ($src:expr, $kind:expr, $start:expr, $length:expr) => {
            assert_eq!(
                Lexer::new($src).next(),
                $crate::syntax_node::Token {
                    span: Span::new($start, $length),
                    inner_span: Span::new($start, $length),
                    kind: $kind
                },
                "Testing the lexing of string '{}'",
                $src
            );
        };
        ($src:expr, $kind:expr, $start:expr, $length:expr, $inner_start:expr, $inner_length: expr) => {
            assert_eq!(
                Lexer::new($src).next(),
                $crate::syntax_node::Token {
                    span: Span::new($start, $length),
                    inner_span: Span::new($inner_start, $inner_length),
                    kind: $kind
                },
                "Testing the lexing of string '{}'",
                $src
            );
        };
    }

    #[test]
    fn test_number_successes() {
        assert_token!("4", TokenKind::IntegerLiteral, 0, 1);
        assert_token!("4.123", TokenKind::FloatLiteral, 0, 5);
        assert_token!("-4", TokenKind::IntegerLiteral, 0, 2);
        assert_token!("9", TokenKind::IntegerLiteral, 0, 1);
        assert_token!("0", TokenKind::IntegerLiteral, 0, 1);
        assert_token!("-4.123", TokenKind::FloatLiteral, 0, 6);
        assert_token!("0.123", TokenKind::FloatLiteral, 0, 5);
        assert_token!("123e4", TokenKind::FloatLiteral, 0, 5);
        assert_token!("123E4", TokenKind::FloatLiteral, 0, 5);
        assert_token!("123e-4", TokenKind::FloatLiteral, 0, 6);
        assert_token!("123e+4", TokenKind::FloatLiteral, 0, 6);
        assert_token!("-1.123e4", TokenKind::FloatLiteral, 0, 8);
        assert_token!("-1.123E4", TokenKind::FloatLiteral, 0, 8);
        assert_token!("-1.123e-4", TokenKind::FloatLiteral, 0, 9);
        assert_token!("-1.123e+4", TokenKind::FloatLiteral, 0, 9);
        assert_token!("-1.123e4567", TokenKind::FloatLiteral, 0, 11);
        assert_token!("-0", TokenKind::IntegerLiteral, 0, 2);
    }

    #[test]
    fn test_number_failures() {
        assert_token!("00", TokenKind::ErrorUnsupportedNumberLiteral, 0, 2);
        assert_token!("01", TokenKind::ErrorUnsupportedNumberLiteral, 0, 2);
        assert_token!("-01", TokenKind::ErrorUnsupportedNumberLiteral, 0, 3);
        assert_token!("+1", TokenKind::ErrorUnsupportedNumberLiteral, 0, 2);
        assert_token!("01.23", TokenKind::ErrorUnsupportedNumberLiteral, 0, 5);
        assert_token!("1.", TokenKind::ErrorUnsupportedNumberLiteral, 0, 2);
        assert_token!("1e", TokenKind::ErrorUnsupportedNumberLiteral, 0, 2);
        assert_token!("1.e1", TokenKind::ErrorUnsupportedNumberLiteral, 0, 4);
        assert_token!("1.A", TokenKind::ErrorUnsupportedNumberLiteral, 0, 3);
        assert_token!("-A", TokenKind::ErrorUnsupportedNumberLiteral, 0, 2);
        assert_token!("1.0e", TokenKind::ErrorUnsupportedNumberLiteral, 0, 4);
        assert_token!("1.0eA", TokenKind::ErrorUnsupportedNumberLiteral, 0, 5);
        assert_token!("1.2e3e", TokenKind::ErrorUnsupportedNumberLiteral, 0, 6);
        assert_token!("1.2e3.4", TokenKind::ErrorUnsupportedNumberLiteral, 0, 7);
        assert_token!("1.23.4", TokenKind::ErrorUnsupportedNumberLiteral, 0, 6);
        assert_token!(".123", TokenKind::ErrorUnsupportedNumberLiteral, 0, 4);

        // check that we don't consume trailing valid items
        assert_token!("1.23.4{}", TokenKind::ErrorUnsupportedNumberLiteral, 0, 6);
        assert_token!(
            "1.23.4 {}",
            TokenKind::ErrorUnsupportedNumberLiteral,
            0,
            7,
            0,
            6
        );
        assert_token!(
            "1.23.4 []",
            TokenKind::ErrorUnsupportedNumberLiteral,
            0,
            7,
            0,
            6
        );
        assert_token!(
            "1.23.4 foo",
            TokenKind::ErrorUnsupportedNumberLiteral,
            0,
            7,
            0,
            6
        );
        assert_token!(
            "1.23.4 $foo",
            TokenKind::ErrorUnsupportedNumberLiteral,
            0,
            7,
            0,
            6
        );
    }
}
