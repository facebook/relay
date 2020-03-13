/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::client_extensions::ClientExtensionConstants;
use crate::connections::ConnectionConstants;
use crate::handle_fields::HandleFieldConstants;
use graphql_ir::Argument;
use interner::StringKey;

// A wrapper type that allows comparing pointer equality of references. Two
// `PointerAddress` values are equal if they point to the same memory location.
//
// This type is _sound_, but misuse can easily lead to logical bugs if the memory
// of one PointerAddress could not have been freed and reused for a subsequent
// PointerAddress.
#[derive(Hash, Eq, PartialEq, Clone, Copy)]
pub struct PointerAddress(usize);

impl PointerAddress {
    pub fn new<T>(ptr: &T) -> Self {
        let ptr_address: usize = unsafe { std::mem::transmute(ptr) };
        Self(ptr_address)
    }
}

pub fn find_argument(arguments: &[Argument], arg_name: StringKey) -> Option<&Argument> {
    arguments.iter().find(|arg| arg.name.item == arg_name)
}

pub struct CustomMetadataDirectives {
    client_extension_constants: ClientExtensionConstants,
    connection_constants: ConnectionConstants,
    handle_field_constants: HandleFieldConstants,
}

impl Default for CustomMetadataDirectives {
    fn default() -> Self {
        Self {
            client_extension_constants: ClientExtensionConstants::default(),
            connection_constants: ConnectionConstants::default(),
            handle_field_constants: HandleFieldConstants::default(),
        }
    }
}

impl CustomMetadataDirectives {
    pub fn is_custom_metadata_directive(&self, name: StringKey) -> bool {
        name == self
            .client_extension_constants
            .client_extension_directive_name
            || name == self.connection_constants.connection_metadata_directive_name
            || name == self.handle_field_constants.handle_field_directive_name
    }
}
