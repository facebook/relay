/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
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

pub use bytes::BytesKey;
pub use bytes::StringKey;
pub use generic::InternTable;
pub use types::Intern;
pub use types::InternKey;
pub use types::RawInternKey;

/// Re-exported values to be used by the `intern!` macro.
pub mod reexport {
    pub use once_cell::sync::Lazy;
}
