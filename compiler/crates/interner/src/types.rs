/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::hash::Hash;
use std::num::NonZeroU32;

/// A type that can be interned.
pub trait Intern: Eq + Hash + Clone {
    type Key;

    fn intern(self) -> Self::Key;
}

/// A raw interned key; this should always be wrapped in a type-specific wrapper
/// that implements `InternKey`.
#[derive(Copy, Clone, Debug, Eq, Ord, Hash, PartialEq, PartialOrd)]
pub struct RawInternKey(NonZeroU32);

impl RawInternKey {
    #[inline(always)]
    pub(crate) const fn new(value: NonZeroU32) -> Self {
        Self(value)
    }

    pub(crate) fn as_usize(self) -> usize {
        self.0.get() as usize
    }
}

/// A type that acts as an intern key, uniquely identifying the original value
/// as well as supporting fast lookup back to a reference to the original value.
pub trait InternKey {
    type Value;

    fn from_raw(raw: RawInternKey) -> Self;

    fn into_raw(self) -> RawInternKey;

    fn lookup(self) -> &'static Self::Value;
}
