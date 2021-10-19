/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use lsp_types::{Position, Range};
use serde::{Deserialize, Serialize};

/// Represents GraphQL text extracted from a source file
/// The GraphQL text is potentially in some subrange of
/// the file, like a JS file.
/// Stores the text and some location information for
/// error reporting.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GraphQLSource {
    pub text: String,
    pub line_index: usize,
    pub column_index: usize,
}

impl GraphQLSource {
    pub fn new(text: impl Into<String>, line_index: usize, column_index: usize) -> Self {
        GraphQLSource {
            text: text.into(),
            line_index,
            column_index,
        }
    }

    pub fn from_whole_document(text: impl Into<String>) -> Self {
        GraphQLSource::new(text, 0, 0)
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
}
