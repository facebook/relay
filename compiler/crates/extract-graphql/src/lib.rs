/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

use graphql_syntax::GraphQLSource;
use std::iter::Peekable;
use std::str::CharIndices;

/// A wrapper around a peekable char iterator that tracks
/// the column and line indicies.
pub struct CharReader<'a> {
    chars: Peekable<CharIndices<'a>>,
    line_index: usize,
    column_index: usize,
}

impl<'a> CharReader<'a> {
    pub fn new(input: &'a str) -> Self {
        let chars = input.char_indices().peekable();
        CharReader {
            chars,
            line_index: 0,
            column_index: 0,
        }
    }

    // Manually implement `peek` since `Peekable` would call next()
    // and increment the line/column indicies
    fn peek(&mut self) -> Option<&(usize, char)> {
        self.chars.peek()
    }
}

impl<'a> Iterator for CharReader<'a> {
    type Item = (usize, char);
    fn next(&mut self) -> Option<Self::Item> {
        let pair = self.chars.next();
        if let Some((_index, ch)) = pair {
            match ch {
                // Line terminators: https://www.ecma-international.org/ecma-262/#sec-line-terminators
                '\u{000A}' | '\u{000D}' | '\u{2028}' | '\u{2029}' => {
                    // <CRLF>
                    if ch == '\u{000D}' {
                        if let Some((_, ch)) = self.chars.peek() {
                            if ch == &'\u{00A}' {
                                return pair;
                            }
                        }
                    }
                    self.line_index += 1;
                    self.column_index = 0;
                }
                _ => {
                    self.column_index += 1;
                }
            }
        }
        pair
    }
}

/// Extract graphql`text` literals from JS-like code. This should work for Flow
/// or TypeScript alike.
pub fn parse_chunks(input: &str) -> Result<Vec<GraphQLSource>, String> {
    if !input.contains("graphql`") {
        return Ok(vec![]);
    }
    let mut res = vec![];
    let mut it = CharReader::new(input);
    'code: while let Some((i, c)) = it.next() {
        match c {
            'g' => {
                for expected in ['r', 'a', 'p', 'h', 'q', 'l', '`'].iter() {
                    if let Some((_, c)) = it.next() {
                        if c != *expected {
                            consume_identifier(&mut it);
                            continue 'code;
                        }
                    }
                }
                let start = i;
                let line_index = it.line_index;
                let column_index = it.column_index;
                while let Some((i, c)) = it.next() {
                    match c {
                        '`' => {
                            let end = i;
                            let text = &input[start + 8..end];
                            res.push(GraphQLSource::new(text, line_index, column_index));
                            continue 'code;
                        }
                        '$' => {
                            if let Some((_, '{')) = it.next() {
                                return Err("graphql literals cannot have string substitutions."
                                    .to_string());
                            }
                        }

                        _ => {}
                    }
                }
            }
            'a'..='z' | 'A'..='Z' | '_' => {
                consume_identifier(&mut it);
            }
            // Skip over template literals. Unfortunately, this isn't enough to
            // deal with nested template literals and runs a risk of skipping
            // over too much code.
            //   '`' => {
            //       while let Some((_, c)) = it.next() {
            //           match c {
            //               '`' => {
            //                   continue 'code;
            //               }
            //               '\\' => {
            //                   it.next();
            //               }
            //               _ => {}
            //           }
            //       }
            //   }
            '"' => consume_string(&mut it, '"'),
            '\'' => consume_string(&mut it, '\''),
            '/' => match it.next() {
                Some((_, '/')) => {
                    consume_line_comment(&mut it);
                }
                Some((_, '*')) => {
                    consume_block_comment(&mut it);
                }
                _ => {}
            },
            _ => {}
        };
    }
    Ok(res)
}

fn consume_identifier(it: &mut CharReader<'_>) {
    for (_, c) in it {
        match c {
            'a'..='z' | 'A'..='Z' | '_' | '0'..='9' => {}
            _ => {
                return;
            }
        }
    }
}

fn consume_line_comment(it: &mut CharReader<'_>) {
    for (_, c) in it {
        match c {
            '\n' | '\r' => {
                break;
            }
            _ => {}
        }
    }
}

fn consume_block_comment(it: &mut CharReader<'_>) {
    while let Some((_, c)) = it.next() {
        if c == '*' {
            if let Some((_, '/')) = it.peek() {
                it.next();
                break;
            }
        }
    }
}

fn consume_string(it: &mut CharReader<'_>, quote: char) {
    while let Some((_, c)) = it.next() {
        match c {
            '\\' => {
                it.next();
            }
            '\'' | '"' if c == quote => {
                return;
            }
            '\n' | '\r' => {
                // Unexpected newline, terminate the string parsing to recover
                return;
            }
            _ => {}
        }
    }
}
