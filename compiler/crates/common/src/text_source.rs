/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use lsp_types::Position;
use lsp_types::Range;
use serde::Deserialize;
use serde::Serialize;

use crate::Span;

/// Represents GraphQL text extracted from a source file
/// The GraphQL text is potentially in some subrange of
/// the file, like a JS file.
/// Stores the text and some location information for
/// error reporting.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TextSource {
    pub text: String,
    pub line_index: usize,
    pub column_index: usize,
}

impl TextSource {
    pub fn new(text: impl Into<String>, line_index: usize, column_index: usize) -> Self {
        TextSource {
            text: text.into(),
            line_index,
            column_index,
        }
    }

    pub fn from_whole_document(text: impl Into<String>) -> Self {
        TextSource::new(text, 0, 0)
    }

    // Generate an LSP Range for this GraphQL source string. This provides the absolute
    // range of the entire GraphQL string within the source file.
    pub fn to_range(&self) -> Range {
        // Zero-indexed line offset in the document
        let mut line = self.line_index;
        // Zero-indexed character offset on the line
        let mut character = self.column_index;
        let mut chars = self.text.chars().peekable();
        let start_position = Position::new(line as u32, character as u32);
        while let Some(chr) = chars.next() {
            let is_newline = match chr {
                // Line terminators: https://www.ecma-international.org/ecma-262/#sec-line-terminators
                '\u{000A}' | '\u{000D}' | '\u{2028}' | '\u{2029}' => {
                    !matches!((chr, chars.peek()), ('\u{000D}', Some('\u{000D}')))
                }
                _ => false,
            };

            if is_newline {
                // New line, increment the line offset and reset the
                // character offset.
                line += 1;
                character = 0;
            }
            // Make sure to only increment the character offset if this
            // isn't a newline.
            if !is_newline {
                character += 1;
            }
        }
        let end_position = Position::new(line as u32, character as u32);
        Range::new(start_position, end_position)
    }

    /**
     * Converts span, which is the relative indices of characters within this text source,
     * into the equivalent line and character number range.
     * Span is bytes, not characters.
     */
    pub fn to_span_range(&self, span: Span) -> lsp_types::Range {
        let start = span.start as usize;
        let end = span.end as usize;
        // Zero-indexed line offset in the document
        let mut line = self.line_index;
        // Zero-indexed character offset on the line
        let mut character = self.column_index;
        let mut start_position = lsp_types::Position::default();
        let mut end_position = lsp_types::Position::default();
        let mut chars = self.text.chars().peekable();

        let mut bytes_seen = 0;

        while let Some(chr) = chars.next() {
            if bytes_seen == start {
                start_position = lsp_types::Position::new(line as u32, character as u32);
            }
            if bytes_seen == end {
                end_position = lsp_types::Position::new(line as u32, character as u32);
                break;
            }

            let is_newline = match chr {
                // Line terminators: https://www.ecma-international.org/ecma-262/#sec-line-terminators
                '\u{000A}' | '\u{000D}' | '\u{2028}' | '\u{2029}' => {
                    // <CLRF>
                    !matches!((chr, chars.peek()), ('\u{000D}', Some('\u{000D}')))
                }
                _ => false,
            };

            if is_newline {
                // New line, increment the line offset and reset the
                // character offset.
                line += 1;
                character = 0;
            } else {
                character += 1;
            }
            bytes_seen += chr.len_utf8();
        }

        if start_position != lsp_types::Position::default()
            && end_position == lsp_types::Position::default()
        {
            end_position = lsp_types::Position::new(line as u32, character as u32);
        }

        lsp_types::Range::new(start_position, end_position)
    }
}

#[cfg(test)]
mod test {
    use super::TextSource;
    use crate::Span;

    #[test]
    fn to_range_test() {
        let span = Span::new(0, 5);
        let text_source = TextSource::new("source", 0, 0);
        let range = text_source.to_span_range(span);
        assert_eq!(range.start, lsp_types::Position::new(0, 0));
        assert_eq!(range.end, lsp_types::Position::new(0, 5));
    }

    #[test]
    fn to_range_unicode_test() {
        let span = Span::new(0, 5);
        let text_source = TextSource::new("☃ource", 0, 0);
        let range = text_source.to_span_range(span);
        assert_eq!(range.start, lsp_types::Position::new(0, 0));
        assert_eq!(range.end, lsp_types::Position::new(0, 3));
    }

    #[test]
    fn to_range_multi_line_test() {
        // this range contains all characters of `fn foo ...`
        let span = Span::new(1, 23);
        let text_source = TextSource::new(
            r#"
fn foo() {
    error
}
        "#,
            0,
            0,
        );
        let range = text_source.to_span_range(span);
        assert_eq!(range.start, lsp_types::Position::new(1, 0));
        assert_eq!(range.end, lsp_types::Position::new(3, 1));
    }

    #[test]
    fn to_range_multi_line_test_2() {
        let span = Span::new(16, 21);
        let text_source = TextSource::new(
            r#"
fn foo() {
    error
}
        "#,
            0,
            0,
        );
        let range = text_source.to_span_range(span);
        assert_eq!(range.start, lsp_types::Position::new(2, 4));
        assert_eq!(range.end, lsp_types::Position::new(2, 9));
    }
}
