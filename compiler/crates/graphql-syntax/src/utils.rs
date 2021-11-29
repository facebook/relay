/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::node::{ConstantArgument, ConstantDirective, FieldDefinition, InputValueDefinition};
use intern::string_key::StringKey;

impl FieldDefinition {
    pub fn argument_named(&self, field_name: StringKey) -> Option<&InputValueDefinition> {
        match self.arguments.as_ref() {
            Some(arguments) => arguments
                .items
                .iter()
                .find(|&argument| argument.name.value == field_name),
            _ => None,
        }
    }
}

impl ConstantDirective {
    pub fn argument_named(&self, field_name: StringKey) -> Option<&ConstantArgument> {
        match self.arguments.as_ref() {
            Some(arguments) => arguments
                .items
                .iter()
                .find(|&argument| argument.name.value == field_name),
            _ => None,
        }
    }
}
