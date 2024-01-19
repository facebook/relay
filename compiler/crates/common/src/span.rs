/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt;

#[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash, serde::Serialize)]
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

    // clippy suggest to use `subspan.start < self.start` :-)
    #[allow(clippy::suspicious_operation_groupings)]
    pub fn contains(self, subspan: Span) -> bool {
        subspan.start >= self.start && subspan.start < self.end && subspan.end <= self.end
    }

    pub fn with_offset(self, offset: u32) -> Self {
        Self::new(self.start + offset, self.end + offset)
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
