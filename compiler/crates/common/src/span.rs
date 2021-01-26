/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::convert::TryFrom;
use std::fmt;

#[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Span {
    pub start: u32,
    pub end: u32,
}

impl Span {
    pub fn empty() -> Self {
        Self { start: 0, end: 0 }
    }

    pub fn new(start: u32, end: u32) -> Self {
        debug_assert!(start <= end);
        Self { start, end }
    }

    pub fn from_usize(start: usize, end: usize) -> Self {
        Self::new(u32::try_from(start).unwrap(), u32::try_from(end).unwrap())
    }

    pub fn as_usize(self) -> (usize, usize) {
        (self.start as usize, self.end as usize)
    }

    pub fn contains(self, subspan: Span) -> bool {
        subspan.start >= self.start && subspan.start < self.end && subspan.end <= self.end
    }

    pub fn to_range(
        self,
        source: &str,
        line_offset: usize,
        character_offset: usize,
    ) -> lsp_types::Range {
        let start = self.start as usize;
        let end = self.end as usize;
        // Zero-indexed line offset in the document
        let mut line = line_offset;
        // Zero-indexed character offset on the line
        let mut character = character_offset;
        let mut start_position = lsp_types::Position::default();
        let mut end_position = lsp_types::Position::default();
        let mut chars = source.chars().enumerate().peekable();

        while let Some((index, chr)) = chars.next() {
            let is_newline = match chr {
                // Line terminators: https://www.ecma-international.org/ecma-262/#sec-line-terminators
                '\u{000A}' | '\u{000D}' | '\u{2028}' | '\u{2029}' => match (chr, chars.peek()) {
                    // <CLRF>
                    ('\u{000D}', Some((_, '\u{000D}'))) => false,
                    _ => true,
                },
                _ => false,
            };

            if is_newline {
                // New line, increment the line offset and reset the
                // character offset.
                line += 1;
                character = 0;
            }
            if index == start {
                start_position = lsp_types::Position::new(line as u64, character as u64);
            }
            if index == end {
                end_position = lsp_types::Position::new(line as u64, character as u64);
                break;
            }
            // Make sure to only increment the character offset if this
            // isn't a newline.
            if !is_newline {
                character += 1;
            }
        }
        lsp_types::Range::new(start_position, end_position)
    }
}

impl fmt::Debug for Span {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(fmt, "{}:{}", self.start, self.end)
    }
}

impl From<std::ops::Range<usize>> for Span {
    fn from(range: std::ops::Range<usize>) -> Self {
        Span::from_usize(range.start, range.end)
    }
}

#[cfg(test)]
mod test {
    use super::Span;
    #[test]
    fn span_contains() {
        let outer_span = Span::new(1, 10);
        let overflow_right_start_span = Span::new(10, 10);
        let overflow_right_end_span = Span::new(1, 11);
        let overflow_left_span_start = Span::new(0, 10);

        assert!(outer_span.contains(outer_span), "A span contains itself");
        assert!(
            !outer_span.contains(overflow_right_start_span),
            "A span doesn't contain a subspan whose start is equal to the end of the current span"
        );
        assert!(
            !outer_span.contains(overflow_right_end_span),
            "A span doesn't contain a subspan whose end is greater than the end of the current span"
        );
        assert!(
            !outer_span.contains(overflow_left_span_start),
            "A span doesn't contain a subspan whose start is less than the start of the current span",
        );
    }
}
