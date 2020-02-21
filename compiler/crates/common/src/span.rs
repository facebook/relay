/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use colored::Colorize;
use std::convert::TryFrom;
use std::fmt;

#[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Span {
    pub length: u32,
    pub start: u32,
}

impl Span {
    pub fn empty() -> Self {
        Self {
            length: 0,
            start: 0,
        }
    }

    pub fn new(start: u32, length: u32) -> Self {
        Self { length, start }
    }

    pub fn from_usize(start: usize, length: usize) -> Self {
        Self {
            length: u32::try_from(length).unwrap(),
            start: u32::try_from(start).unwrap(),
        }
    }

    pub fn as_usize(&self) -> (usize, usize) {
        (self.start as usize, self.length as usize)
    }

    pub fn print(&self, source: &str) -> String {
        let start = self.start as usize;
        let end = start + self.length as usize;

        let mut index = 0;
        let mut start_line = 0;
        let mut start_line_count = 0;
        let mut line_start = 0;
        let mut slice_start = start;
        let mut slice_end = end;
        for chr in source.chars() {
            if chr == '\n' {
                line_start = index + 1;
                if index < start {
                    start_line = line_start;
                    start_line_count += 1;
                }
                if index > end {
                    slice_end = line_start;
                    break;
                }
            }
            if index == start {
                slice_start = line_start;
            }
            index += chr.len_utf8();
        }
        slice_start = if start < slice_start {
            start
        } else {
            slice_start
        };
        slice_end = if end > slice_end { end } else { slice_end };

        format!(
            "{}:{}:\n{}{}{}",
            start_line_count,
            start - start_line,
            &source[slice_start..start],
            source[start..end].color("red"),
            &source[end..slice_end]
        )
    }
}

impl fmt::Debug for Span {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt.write_str(&format!("{}:{}", self.start, self.start + self.length))
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
