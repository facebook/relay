/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::TextSource;
use serde::{Deserialize, Serialize};

/// Represents GraphQL text extracted from a source file
/// The GraphQL text is potentially in some subrange of
/// the file, like a JS file.
/// Stores the text and some location information for
/// error reporting.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GraphQLSource(TextSource);

impl GraphQLSource {
    pub fn new(text: impl Into<String>, line_index: usize, column_index: usize) -> Self {
        Self(TextSource {
            text: text.into(),
            line_index,
            column_index,
        })
    }

    pub fn from_whole_document(text: impl Into<String>) -> Self {
        GraphQLSource::new(text, 0, 0)
    }

    pub fn text_source(&self) -> &TextSource {
        &self.0
    }

    pub fn to_text_source(self) -> TextSource {
        self.0
    }
}
