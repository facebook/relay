/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::ir::Named;
use interner::StringKey;

/// Utility to access an item in a list by its name where name is defined by the
/// `Named` trait.
pub trait NamedItem<'a, T: Named> {
    fn named(self, name: StringKey) -> Option<&'a T>;
}

impl<'a, T: Named> NamedItem<'a, T> for &'a [T] {
    fn named(self, name: StringKey) -> Option<&'a T> {
        self.into_iter().find(|x| x.name() == name)
    }
}
