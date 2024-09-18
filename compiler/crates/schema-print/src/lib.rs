/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod print_schema;
mod printer;
mod shard_printer;

use std::hash::DefaultHasher;
use std::hash::Hash;
use std::hash::Hasher;

pub use print_schema::*;
pub use printer::*;
pub use shard_printer::*;

pub fn calculate_hash<T: Hash>(t: &T) -> u64 {
    let mut s = DefaultHasher::new();
    t.hash(&mut s);
    s.finish()
}
