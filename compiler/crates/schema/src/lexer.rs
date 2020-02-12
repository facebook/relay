/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::token::TokenKind;

pub struct Lexer<'a> {
    pub token: TokenKind<'a>,
    input: &'a str,
}
impl<'a> Lexer<'a> {
    pub fn new(input: &'a str) -> Self {
        Self {
            token: TokenKind::SOF,
            input,
        }
    }
    pub fn advance(&mut self) {
        let (next_input, token) = read_token(self.input);
        self.input = next_input;
        self.token = token;
    }
}

type ReaderResult<'a> = (&'a str, TokenKind<'a>);

fn read_token(input: &str) -> ReaderResult<'_> {
    if let Some(c) = input.chars().next() {
        match c {
            '\t' | ' ' | ',' | '\u{feff}' | '\n' | '\r' => read_token(&input[1..]),
            '#' => read_token(read_comment(&input)),
            '&' => read_char(input, TokenKind::Amp),
            '!' => read_char(input, TokenKind::Bang),
            '$' => read_char(input, TokenKind::Dollar),
            '(' => read_char(input, TokenKind::ParenL),
            ')' => read_char(input, TokenKind::ParenR),
            ':' => read_char(input, TokenKind::Colon),
            '=' => read_char(input, TokenKind::Equals),
            '@' => read_char(input, TokenKind::At),
            '[' => read_char(input, TokenKind::BracketL),
            ']' => read_char(input, TokenKind::BracketR),
            '{' => read_char(input, TokenKind::BraceL),
            '|' => read_char(input, TokenKind::Pipe),
            '}' => read_char(input, TokenKind::BraceR),
            'a'..='z' | 'A'..='Z' | '_' => read_name(&input),
            '-' | '0'..='9' => read_number(&input),
            '"' => read_string(&input),
            _ => (input, TokenKind::Error),
        }
    } else {
        (input, TokenKind::EOF)
    }
}

fn read_char<'a>(input: &'a str, token: TokenKind<'a>) -> ReaderResult<'a> {
    (&input[1..], token)
}

fn read_name(input: &str) -> ReaderResult<'_> {
    let end = input
        .chars()
        .skip(1)
        .position(|c| match c {
            '_' | '0'..='9' | 'a'..='z' | 'A'..='Z' => false,
            _ => true,
        })
        .map(|len| len + 1)
        .unwrap_or_else(|| input.len());
    (&input[end..], TokenKind::Name(&input[0..end]))
}

fn read_number(input: &str) -> ReaderResult<'_> {
    let mut is_float = false;
    let mut end = 0;
    for (pos, c) in input.char_indices() {
        match c {
            '-' | '0'..='9' => {
                end = pos;
            }
            '.' => {
                end = pos;
                is_float = true;
            }
            _ => {
                break;
            }
        }
    }
    let value = &input[0..=end];
    let token = if is_float {
        TokenKind::Float(value)
    } else {
        TokenKind::Int(value)
    };
    (&input[end + 1..], token)
}

fn read_comment(input: &str) -> &str {
    let end = input
        .chars()
        .position(|c| c == '\n')
        .map(|pos| pos + 1)
        .unwrap_or_else(|| input.len());
    &input[end..]
}

fn read_string(input: &str) -> ReaderResult<'_> {
    enum BlockStringState {
        Normal,
        FirstClose,
        SecondClose,
        Escape,
        EscapeFirst,
        EscapeSecond,
    }

    if input.starts_with("\"\"\"") {
        use BlockStringState::*;
        let mut state = Normal;
        for (pos, c) in input.char_indices().skip(3) {
            state = match (state, c) {
                (Normal, '"') => FirstClose,
                (FirstClose, '"') => SecondClose,
                (SecondClose, '"') => {
                    return (
                        &input[pos + 1..],
                        TokenKind::BlockString(&input[3..pos - 2]),
                    )
                }
                (_, '\\') => Escape,
                (Escape, '"') => EscapeFirst,
                (EscapeFirst, '"') => EscapeSecond,
                _ => Normal,
            }
        }
    } else {
        let mut iter = input.char_indices().skip(1);
        while let Some((pos, c)) = iter.next() {
            match c {
                '"' => return (&input[pos + 1..], TokenKind::Str(&input[1..pos])),
                '\\' => {
                    iter.next();
                }
                _ => (),
            }
        }
    }
    (input, TokenKind::Error)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn numbers() {
        assert_eq!(read_number("0.3"), ("", TokenKind::Float("0.3")));
        assert_eq!(read_number("24 "), (" ", TokenKind::Int("24")));
        assert_eq!(read_number("56"), ("", TokenKind::Int("56")));
        assert_eq!(read_number("100\n"), ("\n", TokenKind::Int("100")));
        assert_eq!(read_number("100x"), ("x", TokenKind::Int("100")));
        assert_eq!(read_number("100("), ("(", TokenKind::Int("100")));
        assert_eq!(read_number("3.--.4- "), (" ", TokenKind::Float("3.--.4-")));
    }

    #[test]
    fn errors() {
        // expect_err(r#" " "#);
        // expect_err(r#"."#);
        // expect_err(r#" .. "#);
    }

    #[test]
    fn comments() {
        let input = "#foo";
        assert_eq!(read_comment(input), "");

        let input = "#foo\nx";
        assert_eq!(read_comment(input), "x");
    }

    #[test]
    fn strings() {
        assert_eq!(read_string(r#""foo""#), ("", TokenKind::Str(r#"foo"#)));
        assert_eq!(read_string(r#""f\"oo""#), ("", TokenKind::Str(r#"f\"oo"#)));
        assert_eq!(read_string(r#""""#), ("", TokenKind::Str(r#""#)));
        assert_eq!(
            read_string(
                r#"
                    """hi"""x
                "#
                .trim()
            ),
            ("x", TokenKind::BlockString(r#"hi"#))
        );
        assert_eq!(
            read_string(
                r#"
                    """ \""" """x
                "#
                .trim()
            ),
            ("x", TokenKind::BlockString(r#" \""" "#))
        );
    }
}
