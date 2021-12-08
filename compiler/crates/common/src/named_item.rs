/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;

/// Utility to access an item in a list by its name where name is defined by the
/// `Named` trait.
pub trait NamedItem<'a, T: Named> {
    fn named(self, name: StringKey) -> Option<&'a T>;
}

impl<'a, T: Named> NamedItem<'a, T> for &'a [T] {
    fn named(self, name: StringKey) -> Option<&'a T> {
        self.iter().find(|x| x.name() == name)
    }
}

/// Represents a node that has a name such as an `Argument` or `Directive`.
pub trait Named {
    fn name(&self) -> StringKey;
}
