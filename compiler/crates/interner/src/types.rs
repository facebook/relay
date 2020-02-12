/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/// A type that can be interned.
pub trait Intern: std::cmp::Eq + std::hash::Hash + Clone {
    type Key;

    fn intern(self) -> Self::Key;
}

/// A raw interned key; this should always be wrapped in a type-specific wrapper
/// that implements `InternKey`.
#[derive(Copy, Clone, Debug, Eq, Ord, Hash, PartialEq, PartialOrd)]
pub struct RawInternKey(usize);

impl RawInternKey {
    pub(crate) fn new(value: usize) -> Self {
        Self(value)
    }

    pub(crate) fn as_usize(self) -> usize {
        self.0
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
