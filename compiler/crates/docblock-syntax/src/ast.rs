/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::WithLocation;
use intern::string_key::StringKey;
#[derive(Debug, PartialEq)]
pub struct DocblockField {
    pub field_name: WithLocation<StringKey>,
    pub field_value: Option<WithLocation<StringKey>>,
}

#[derive(Debug, PartialEq)]
pub enum DocblockSection {
    Field(DocblockField),
    FreeText(WithLocation<StringKey>),
}

#[derive(Debug, PartialEq)]
pub struct DocblockAST {
    pub sections: Vec<DocblockSection>,
}
