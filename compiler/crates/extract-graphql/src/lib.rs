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

type IndexedCharIter<'a> = Peekable<CharIndices<'a>>;

/// Extract graphql`text` literals from JS-like code. This should work for Flow
/// or TypeScript alike.
pub fn parse_chunks(input: &str) -> Result<Vec<GraphQLSource>, String> {
    if !input.contains("graphql`") {
        return Ok(vec![]);
    }
    let mut res = vec![];
    let mut it = input.char_indices().peekable();
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
                while let Some((i, c)) = it.next() {
                    match c {
                        '`' => {
                            let end = i;
                            let text = &input[start + 8..end];
                            res.push(GraphQLSource::new(text));
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

fn consume_identifier(it: &mut IndexedCharIter<'_>) {
    for (_, c) in it {
        match c {
            'a'..='z' | 'A'..='Z' | '_' | '0'..='9' => {}
            _ => {
                return;
            }
        }
    }
}

fn consume_line_comment(it: &mut IndexedCharIter<'_>) {
    for (_, c) in it {
        match c {
            '\n' | '\r' => {
                break;
            }
            _ => {}
        }
    }
}

fn consume_block_comment(it: &mut IndexedCharIter<'_>) {
    while let Some((_, c)) = it.next() {
        if c == '*' {
            if let Some((_, '/')) = it.peek() {
                it.next();
                break;
            }
        }
    }
}

fn consume_string(it: &mut IndexedCharIter<'_>, quote: char) {
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
