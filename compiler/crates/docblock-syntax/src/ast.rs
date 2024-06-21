/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Location;
use common::Named;
use common::WithLocation;
use docblock_shared::ResolverSourceHash;
use intern::string_key::StringKey;
#[derive(Debug, PartialEq)]
pub struct DocblockField {
    pub field_name: WithLocation<StringKey>,
    pub field_value: Option<WithLocation<StringKey>>,
}

impl Named for DocblockField {
    type Name = StringKey;
    fn name(&self) -> StringKey {
        self.field_name.item
    }
}

#[derive(Debug, PartialEq)]
pub enum DocblockSection {
    Field(DocblockField),
    FreeText(WithLocation<StringKey>),
}

#[derive(Debug, PartialEq)]
pub struct DocblockAST {
    pub location: Location,
    pub sections: Vec<DocblockSection>,
    pub source_hash: ResolverSourceHash,
}

impl DocblockAST {
    pub fn find_field(&self, name: StringKey) -> Option<&DocblockField> {
        self.sections.iter().find_map(|section| match section {
            DocblockSection::Field(field) if field.name() == name => Some(field),
            _ => None,
        })
    }
}
