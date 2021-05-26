/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

pub use rayon::prelude::{IntoParallelIterator, ParallelIterator};
pub use std::sync::atomic::Ordering;
pub use std::sync::atomic::Ordering::SeqCst;

/// An abstraction over rayon's par_iter that falls back to a normal
/// iterator when compiling to WebAssembly.
#[cfg(target_arch = "wasm32")]
pub fn par_iter<T: IntoIterator + rayon::iter::IntoParallelIterator>(t: T) -> T::IntoIter {
    t.into_iter()
}

/// An abstraction over rayon's par_iter that falls back to a normal
/// iterator when compiling to WebAssembly.
#[cfg(not(target_arch = "wasm32"))]
pub fn par_iter<T: IntoIterator + rayon::iter::IntoParallelIterator>(t: T) -> T::Iter {
    t.into_par_iter()
}
