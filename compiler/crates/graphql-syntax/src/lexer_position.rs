/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::str::Chars;

use crate::char_constants::NULL;

/// A wrapper over a Chars iterator that stores the (byte) index into the
/// chars source.
#[derive(Clone, Debug)]
pub struct LexerPosition<'a> {
    chars: Chars<'a>,
    index: usize,
}

impl<'a> LexerPosition<'a> {
    pub fn new(source: &'a str) -> Self {
        LexerPosition {
            chars: source.chars(),
            index: 0,
        }
    }

    /// Returns the *start* index of the next() char of the LexerPosition's source.
    /// To determine the start and (exclusive) end indices of the next char, use e.g.
    /// ```ignore
    /// let position = LexerPosition::new(source_str);
    /// let start = position.index();
    /// let ch = position.next();
    /// let end = position.index();
    /// assert_eq!(ch.to_string(), source_str[start..end]);
    /// ```
    pub fn index(&self) -> usize {
        self.index
    }

    /// If the end of the source has not been reached, returns the next character and
    /// advances the position. Otherwise does not advance and returns NULL.
    pub fn next(&mut self) -> char {
        match self.chars.next() {
            Some(ch) => {
                self.index += ch.len_utf8();
                ch
            }
            None => NULL,
        }
    }

    /// If the next char is the expected char, advances this position and returns true.
    /// Otherwise (not the expected char) does not advance and returns false.
    pub fn eat(&mut self, expected: char) -> bool {
        let mut clone = self.clone();
        if clone.next() == expected {
            self.index = clone.index;
            self.chars = clone.chars;
            true
        } else {
            false
        }
    }

    /// Returns the next character w/o advancing the position.
    pub fn peek(&self) -> char {
        self.peek_offset(0)
    }

    /// Look ahead a given number of characters, where 0 is equivalent to peek()
    pub fn peek_offset(&self, offset: usize) -> char {
        self.chars.clone().nth(offset).unwrap_or(NULL)
    }

    /// Advance while the predicate returns true, leaving the position at the
    /// first character for which the predicate would return false.
    pub fn skip_while<F>(&mut self, predicate: F)
    where
        F: Fn(char) -> bool,
    {
        let mut clone = self.clone();
        loop {
            let ch = clone.peek();
            if ch == NULL || !predicate(ch) {
                break;
            }
            clone.next();
        }
        self.chars = clone.chars;
        self.index = clone.index;
    }
}
