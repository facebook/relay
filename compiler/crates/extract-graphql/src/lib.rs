/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

use std::iter::Peekable;
use std::str::CharIndices;

use common::TextSource;
use docblock_syntax::DocblockSource;
use graphql_syntax::GraphQLSource;

#[derive(Clone)]
pub enum JavaScriptSourceFeature {
    GraphQL(GraphQLSource),
    Docblock(DocblockSource),
}

impl JavaScriptSourceFeature {
    pub fn text_source(&self) -> &TextSource {
        match self {
            JavaScriptSourceFeature::GraphQL(graphql_source) => graphql_source.text_source(),
            JavaScriptSourceFeature::Docblock(docblock_source) => docblock_source.text_source(),
        }
    }

    pub fn to_text_source(self) -> TextSource {
        match self {
            JavaScriptSourceFeature::GraphQL(graphql_source) => graphql_source.to_text_source(),
            JavaScriptSourceFeature::Docblock(docblock_source) => docblock_source.to_text_source(),
        }
    }
}

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

    pub fn get_line_index(&self) -> usize {
        self.line_index
    }

    pub fn get_column_index(&self) -> usize {
        self.column_index
    }

    pub fn get_chars(&self) -> Peekable<CharIndices<'a>> {
        self.chars.clone()
    }
}

impl Iterator for CharReader<'_> {
    type Item = (usize, char);
    fn next(&mut self) -> Option<Self::Item> {
        let pair = self.chars.next();
        if let Some((_index, ch)) = pair {
            match ch {
                // Line terminators: https://www.ecma-international.org/ecma-262/#sec-line-terminators
                '\u{000A}' | '\u{000D}' | '\u{2028}' | '\u{2029}' => {
                    // <CRLF>
                    if ch == '\u{000D}'
                        && let Some((_, ch)) = self.chars.peek()
                        && ch == &'\u{00A}'
                    {
                        return pair;
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

/// Extract graphql`text` literals and @RelayResolver comments from JS-like code.
// This should work for Flow or TypeScript alike.
pub fn extract(input: &str) -> Vec<JavaScriptSourceFeature> {
    let mut res = Vec::new();
    if !input.contains("graphql") && !input.contains("@RelayResolver") {
        return res;
    }
    let mut it = CharReader::new(input);
    'code: while let Some((i, c)) = it.next() {
        match c {
            'g' => {
                for expected in ['r', 'a', 'p', 'h', 'q', 'l'] {
                    if let Some((_, c)) = it.next()
                        && c != expected
                    {
                        consume_identifier(&mut it);
                        continue 'code;
                    }
                }

                let mut whitespace_num: usize = 0;

                loop {
                    if let Some((_, c)) = it.next() {
                        match c {
                            '`' => {
                                break;
                            }
                            ' ' | '\n' | '\r' | '\t' => {
                                whitespace_num += 1;
                            }
                            _ => {
                                consume_identifier(&mut it);
                                continue 'code;
                            }
                        }
                    }
                }
                let start = i;
                let line_index = it.line_index;
                let column_index = it.column_index;
                let mut has_visited_first_char = false;
                for (i, c) in &mut it {
                    match c {
                        '`' => {
                            let end = i;
                            let text = &input[start + (8 + whitespace_num)..end];
                            res.push(JavaScriptSourceFeature::GraphQL(GraphQLSource::new(
                                text,
                                line_index,
                                column_index,
                            )));
                            continue 'code;
                        }
                        ' ' | '\n' | '\r' | '\t' => {}
                        'a'..='z' | 'A'..='Z' | '#' => {
                            if !has_visited_first_char {
                                has_visited_first_char = true;
                            }
                        }
                        _ => {
                            if !has_visited_first_char {
                                continue 'code;
                            }
                        }
                    }
                }
            }
            'a'..='z' | 'A'..='Z' | '_' => {
                consume_identifier(&mut it);
            }
            // Skip over template literals. Unfortunately, this isn't enough to
            // deal with nested template literals and runs a risk of skipping
            // over too much code -- so it is disabled.
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
            '\\' => consume_escaped_char(&mut it),
            '/' => {
                match it.chars.peek() {
                    Some((_, '/')) => {
                        it.next();
                        consume_line_comment(&mut it);
                    }
                    Some((_, '*')) => {
                        it.next();
                        let start = i;
                        let line_index = it.line_index;
                        let column_index = it.column_index;
                        let mut prev_c = ' '; // arbitrary character other than *
                        let mut first = true;
                        for (i, c) in &mut it {
                            // Hack for template literals containing /*, see D21256605:
                            if first && c == '`' {
                                break;
                            }
                            first = false;
                            if prev_c == '*' && c == '/' {
                                let end = i;
                                let text = &input[start + 2..end - 1];
                                if text.contains("@RelayResolver") {
                                    res.push(JavaScriptSourceFeature::Docblock(
                                        DocblockSource::new(text, line_index, column_index),
                                    ));
                                }
                                continue 'code;
                            }
                            prev_c = c;
                        }
                    }
                    _ => {}
                }
            }
            _ => {}
        };
    }
    res
}

pub fn consume_escaped_char(it: &mut CharReader<'_>) {
    it.next();
}

pub fn consume_identifier(it: &mut CharReader<'_>) {
    while it.chars.peek().is_some() {
        match it.chars.peek() {
            Some((_, 'a'..='z' | 'A'..='Z' | '_' | '0'..='9')) => {
                it.next();
            }
            _ => break,
        }
    }
}

pub fn consume_line_comment(it: &mut CharReader<'_>) {
    for (_, c) in it {
        match c {
            '\n' | '\r' => {
                break;
            }
            _ => {}
        }
    }
}

pub fn consume_string(it: &mut CharReader<'_>, quote: char) {
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
