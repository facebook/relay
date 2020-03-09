/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
