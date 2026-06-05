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
            let is_newline = is_line_terminator(chr, chars.peek().copied());

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

            let is_newline = is_line_terminator(chr, chars.peek().copied());

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

    /// Ascending byte offset at which each line begins (line 0 starts at offset
    /// 0). Pair with [`TextSource::line_for_offset`] to resolve byte offsets to
    /// lines in O(log n). Prefer this over calling [`TextSource::to_span_range`]
    /// in a loop, which rescans the whole document per call (fine for the
    /// one-off diagnostic/LSP callers, quadratic for bulk span->line
    /// resolution).
    pub fn line_starts(&self) -> Vec<usize> {
        let mut line_starts = vec![0usize];
        let mut chars = self.text.char_indices().peekable();
        while let Some((offset, chr)) = chars.next() {
            if is_line_terminator(chr, chars.peek().map(|&(_, next)| next)) {
                line_starts.push(offset + chr.len_utf8());
            }
        }
        line_starts
    }

    /// Resolve a byte offset to its line number, offset by this source's
    /// `line_index`. Equivalent to `self.to_span_range(span).start.line` for an
    /// in-bounds `span.start`, but O(log n) given a precomputed `line_starts`.
    ///
    /// For `offset >= self.text.len()` this counts every line in the document,
    /// whereas `to_span_range` reports line 0 for an out-of-range span; real
    /// spans never reach that case.
    pub fn line_for_offset(&self, line_starts: &[usize], offset: usize) -> u32 {
        // The first `line_starts` entry is the implicit line 0; subtracting it
        // leaves the count of line terminators at or before `offset`.
        let newlines_before = line_starts.partition_point(|&start| start <= offset) - 1;
        (self.line_index + newlines_before) as u32
    }
}

/// Whether `chr` is a line terminator, given the char that immediately follows
/// it. Treats a `\r` followed by another `\r` as a non-terminator.
///
/// Line terminators: https://www.ecma-international.org/ecma-262/#sec-line-terminators
fn is_line_terminator(chr: char, next: Option<char>) -> bool {
    matches!(chr, '\u{000A}' | '\u{000D}' | '\u{2028}' | '\u{2029}')
        && !matches!((chr, next), ('\u{000D}', Some('\u{000D}')))
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

    #[test]
    fn line_for_offset_matches_to_span_range() {
        // Parity: line_for_offset must equal to_span_range's start line at every
        // char boundary, including after multi-byte UTF-8 chars.
        let text = "type A {\n  # café ☕ comment\n  field: Int\n}\n\nscalar B\n";
        let source = TextSource::from_whole_document(text);
        let line_starts = source.line_starts();
        for (offset, _) in text.char_indices() {
            let span = Span::new(offset as u32, offset as u32);
            let expected = source.to_span_range(span).start.line;
            let actual = source.line_for_offset(&line_starts, offset);
            assert_eq!(actual, expected, "line mismatch at byte offset {offset}");
        }
    }

    #[test]
    fn line_for_offset_respects_line_index() {
        // A TextSource embedded in a larger file starts at a nonzero line.
        let text = "a\nb\nc";
        let source = TextSource::new(text, 10, 0);
        let line_starts = source.line_starts();
        // Offset 4 ('c') is the 3rd line (index 2) within the snippet; with a
        // base line_index of 10 it reports line 12.
        assert_eq!(source.line_for_offset(&line_starts, 4), 12);
    }
}
