/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A wrapper type representing a pointer address, intended for use in comparing
use std::sync::Arc;

// pointer equality of `Arc`s. Two `ArcAddress` values are equal iff the `Arc`s
// they were created from point to the same data.
//
// This type is sound but misuse can easily lead to logical bugs if the memory
// of one ArcAddress could not have been freed and reused for a subsequent
// ArcAddress
#[derive(Hash, Eq, PartialEq, Clone, Copy)]
pub struct ArcAddress(usize);

impl ArcAddress {
    pub fn new<T>(arc: &Arc<T>) -> Self {
        let ptr = arc.as_ref();
        let ptr_address: usize = unsafe { std::mem::transmute(ptr) };
        Self(ptr_address)
    }
}
