/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod location;
mod murmurhash;
mod span;
mod timer;

pub use location::{FileKey, Location, WithLocation};
pub use murmurhash::murmurhash;
pub use span::{Span, Spanned};
pub use timer::Timer;
