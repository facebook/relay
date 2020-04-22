/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use serde::{Deserialize, Serialize};

/// Represents GraphQL text extracted from a JS-like source
/// file. Stores the text and some location information for
/// error reporting.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GraphQLSource {
    pub text: String,
}

impl GraphQLSource {
    pub fn new(text: impl Into<String>) -> Self {
        GraphQLSource { text: text.into() }
    }
}
