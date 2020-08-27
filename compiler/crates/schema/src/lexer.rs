/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::token::TokenKind;
use std::convert::TryInto;

pub struct Lexer<'a> {
    pub token: TokenKind<'a>,
    input: &'a str,
    cur_index: usize,
    next_index: usize,
}
impl<'a> Lexer<'a> {
    pub fn new(input: &'a str) -> Self {
        Self {
            token: TokenKind::SOF,
            input,
            cur_index: 0,
            next_index: 0,
        }
    }
    pub fn advance(&mut self) {
        let mut token = None;
        self.cur_index = self.next_index;
        while token == None {
            let result = read_token(&self.input[self.next_index..]);
            let next_index = result.0;
            token = result.1;
            self.next_index += next_index.unwrap_or(0);
        }
        self.token = token.unwrap();
    }

    pub fn current_position_with_line(&self) -> (u32, u32, String) {
        // Calculate line and column.
        let mut line = 0;
        let mut line_start = 0;
        let mut line_end = self.input.find('\n');
        while line_end.is_some() && line_end.unwrap() + line_start < self.cur_index {
            line += 1;
            line_start += line_end.unwrap() + 1;
            line_end = self.input[line_start..].find('\n');
        }
        if line_end.is_none() {
            line_end = Some(self.input.len());
        }
        // + 1 because both are indexed from 1, not 0,
        (
            line + 1,
            (self.cur_index - line_start + 1).try_into().unwrap(),
            self.input[line_start..line_start + line_end.unwrap()].to_string(),
        )
    }
}

type ReaderResult<'a> = (Option<usize>, Option<TokenKind<'a>>);

fn read_token(input: &str) -> ReaderResult<'_> {
    if let Some(c) = input.chars().next() {
        match c {
            '\t' | ' ' | ',' | '\u{feff}' | '\n' | '\r' => (Some(1), None),
            '#' => (Some(read_comment(&input)), None),
            '&' => read_char(TokenKind::Amp),
            '!' => read_char(TokenKind::Bang),
            '$' => read_char(TokenKind::Dollar),
            '(' => read_char(TokenKind::ParenL),
            ')' => read_char(TokenKind::ParenR),
            ':' => read_char(TokenKind::Colon),
            '=' => read_char(TokenKind::Equals),
            '@' => read_char(TokenKind::At),
            '[' => read_char(TokenKind::BracketL),
            ']' => read_char(TokenKind::BracketR),
            '{' => read_char(TokenKind::BraceL),
            '|' => read_char(TokenKind::Pipe),
            '}' => read_char(TokenKind::BraceR),
            'a'..='z' | 'A'..='Z' | '_' => read_name(&input),
            '-' | '0'..='9' => read_number(&input),
            '"' => read_string(&input),
            _ => (None, Some(TokenKind::Error)),
        }
    } else {
        (None, Some(TokenKind::EOF))
    }
}

fn read_char<'a>(token: TokenKind<'a>) -> ReaderResult<'a> {
    (Some(1), Some(token))
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
    (Some(end), Some(TokenKind::Name(&input[0..end])))
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
    (Some(end + 1), Some(token))
}

fn read_comment(input: &str) -> usize {
    let end = input
        .chars()
        .position(|c| c == '\n')
        .map(|pos| pos + 1)
        .unwrap_or_else(|| input.len());
    end
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
                        Some(pos + 1),
                        Some(TokenKind::BlockString(&input[3..pos - 2])),
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
                '"' => return (Some(pos + 1), Some(TokenKind::Str(&input[1..pos]))),
                '\\' => {
                    iter.next();
                }
                _ => (),
            }
        }
    }
    (None, Some(TokenKind::Error))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn numbers() {
        assert_eq!(read_number("0.3"), (Some(3), Some(TokenKind::Float("0.3"))));
        assert_eq!(read_number("24 "), (Some(2), Some(TokenKind::Int("24"))));
        assert_eq!(read_number("56"), (Some(2), Some(TokenKind::Int("56"))));
        assert_eq!(read_number("100\n"), (Some(3), Some(TokenKind::Int("100"))));
        assert_eq!(read_number("100x"), (Some(3), Some(TokenKind::Int("100"))));
        assert_eq!(read_number("100("), (Some(3), Some(TokenKind::Int("100"))));
        assert_eq!(
            read_number("3.--.4- "),
            (Some(7), Some(TokenKind::Float("3.--.4-")))
        );
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
        assert_eq!(input[read_comment(input)..].to_string(), "");

        let input = "#foo\nx";
        assert_eq!(input[read_comment(input)..].to_string(), "x");
    }

    #[test]
    fn strings() {
        assert_eq!(
            read_string(r#""foo""#),
            (Some(5), Some(TokenKind::Str(r#"foo"#)))
        );
        assert_eq!(
            read_string(r#""f\"oo""#),
            (Some(7), Some(TokenKind::Str(r#"f\"oo"#)))
        );
        assert_eq!(read_string(r#""""#), (Some(2), Some(TokenKind::Str(r#""#))));
        assert_eq!(
            read_string(
                r#"
                    """hi"""x
                "#
                .trim()
            ),
            (Some(8), Some(TokenKind::BlockString(r#"hi"#)))
        );
        assert_eq!(
            read_string(
                r#"
                    """ \""" """x
                "#
                .trim()
            ),
            (Some(12), Some(TokenKind::BlockString(r#" \""" "#)))
        );
    }
}
