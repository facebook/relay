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

#[cfg(not(target_arch = "wasm32"))]
pub fn try_join<T1, F1, T2, F2, E>(f1: F1, f2: F2) -> Result<(T1, T2), Vec<E>>
where
    F1: FnOnce() -> Result<T1, Vec<E>> + Send,
    F2: FnOnce() -> Result<T2, Vec<E>> + Send,
    T1: Send,
    T2: Send,
    E: Send,
{
    let (v1, v2) = rayon::join(f1, f2);
    Ok((v1?, v2?))
}

#[cfg(target_arch = "wasm32")]
pub fn try_join<T1, F1, T2, F2, E>(f1: F1, f2: F2) -> Result<(T1, T2), Vec<E>>
where
    F1: FnOnce() -> Result<T1, Vec<E>> + Send,
    F2: FnOnce() -> Result<T2, Vec<E>> + Send,
    T1: Send,
    T2: Send,
    E: Send,
{
    Ok((f1()?, f2()?))
}
