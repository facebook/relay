/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod bytes;
mod generic;
mod macros;
#[cfg(test)]
mod tests;
mod types;

pub use bytes::{BytesKey, StringKey};
pub use generic::InternTable;
pub use types::{Intern, InternKey, RawInternKey};
