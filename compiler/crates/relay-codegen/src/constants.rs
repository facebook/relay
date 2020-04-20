/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};
use lazy_static::lazy_static;

pub struct CodegenConstants {
    pub argument_definitions: StringKey,
    pub default_value: StringKey,
    pub derived_from: StringKey,
    pub kind: StringKey,
    pub metadata: StringKey,
    pub name: StringKey,
    pub selections: StringKey,
    pub split_operation: StringKey,
    pub type_: StringKey,
}

impl Default for CodegenConstants {
    fn default() -> Self {
        Self {
            argument_definitions: "argumentDefinitions".intern(),
            default_value: "defaultValue".intern(),
            derived_from: "derivedFrom".intern(),
            kind: "kind".intern(),
            metadata: "metadata".intern(),
            name: "name".intern(),
            selections: "selections".intern(),
            split_operation: "SplitOperation".intern(),
            type_: "type".intern(),
        }
    }
}

lazy_static! {
    pub static ref CODEGEN_CONSTANTS: CodegenConstants = Default::default();
}
