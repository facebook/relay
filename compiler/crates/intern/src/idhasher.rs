/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::hash::{BuildHasherDefault, Hasher};
use std::marker::PhantomData;

pub type BuildIdHasher<T> = BuildHasherDefault<IdHasher<T>>;

/// A simple fast multiplicative hasher for Ids.
///
/// It's tempting to use `IdHasher` for Ids --- but
/// [HashBrown](https://crates.io/crates/hashbrown) and
/// [std::collections::HashMap](https://doc.rust-lang.org/std/collections/struct.HashMap.html)
/// use the upper 7 bits of the hash for a tag, then compare 8-16 tags in
/// parallel. Without the multiply, typical low-valued u32 ids would all have
/// tag 0.
#[derive(Debug, Default, Clone, Copy)]
pub struct IdHasher<T>(u64, PhantomData<T>);

/// Marker interface to allow supported types. Additional primitive types
/// can be supported by adding an `IsEnabled` decl.
pub trait IsEnabled {}
impl IsEnabled for u32 {}

impl<T: IsEnabled> Hasher for IdHasher<T> {
    fn write(&mut self, _: &[u8]) {
        unimplemented!()
    }

    fn write_u32(&mut self, n: u32) {
        debug_assert_eq!(self.0, 0); // Allow one write per Hasher instance.
        self.0 = (n as u64).wrapping_mul(0x9e3779b97f4a7c15);
    }

    fn finish(&self) -> u64 {
        self.0
    }
}
