/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use colored::Colorize;
use std::cmp;
use std::convert::TryFrom;
use std::fmt;

#[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Span {
    pub start: u32,
    pub end: u32,
}

impl From<std::ops::Range<usize>> for Span {
    fn from(range: std::ops::Range<usize>) -> Self {
        Span::from_usize(range.start, range.end)
    }
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
        subspan.start >= self.start && subspan.end <= self.end
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

    pub fn print(
        self,
        source: &str,
        start_line_count_offset: usize,
        start_line_offset: usize,
    ) -> String {
        let start = self.start as usize;
        let end = self.end as usize;

        let mut index = 0;
        let mut line_offset = start_line_offset;
        let mut start_offset = start_line_offset;
        let mut start_line_count = start_line_count_offset;
        let mut line_start = 0;
        let mut slice_start = start;
        let mut slice_end = end;
        for chr in source.chars() {
            if index == start {
                slice_start = line_start;
                start_offset = line_offset;
            }

            if chr == '\n' {
                line_start = index + 1;
                line_offset = 1;
                if index < start {
                    start_line_count += 1;
                }
                if index > end {
                    slice_end = line_start;
                    break;
                }
            } else {
                line_offset += 1;
            }
            index += chr.len_utf8();
        }
        slice_start = cmp::min(start, slice_start);
        slice_end = cmp::max(end, slice_end);
        format!(
            "{}:{}:\n{}{}{}",
            start_line_count,
            start_offset,
            &source[slice_start..start],
            source[start..end].color("red"),
            &source[end..slice_end]
        )
    }
}

impl fmt::Debug for Span {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt.write_str(&format!("{}:{}", self.start, self.end))
    }
}

#[derive(Copy, Clone, Debug, Hash, PartialEq, Eq, Ord, PartialOrd)]
pub struct Spanned<T> {
    pub span: Span,
    pub item: T,
}

impl<T> Spanned<T> {
    pub fn new(span: Span, item: T) -> Self {
        Self { span, item }
    }
}
