/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt;
use std::str::FromStr;

use intern::impl_lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::Lookup;
use schemars::JsonSchema;
use serde::Deserialize;
use serde::Serialize;

/// Utility to access an item in a list by its name where name is defined by the
/// `Named` trait.
pub trait NamedItem<'a, T: Named> {
    fn named(self, name: <T as Named>::Name) -> Option<&'a T>;
}

impl<'a, T: Named> NamedItem<'a, T> for &'a [T] {
    fn named(self, name: <T as Named>::Name) -> Option<&'a T> {
        self.iter().find(|x| x.name() == name)
    }
}

/// Represents a node that has a name such as an `Argument` or `Directive`.
/// The Name associated type should be a newtype wrapper around StringKey.
pub trait Named {
    type Name: Eq + PartialEq<<Self as Named>::Name> + Lookup;
    fn name(&self) -> Self::Name;
}

/// Wrapper struct for clarity rather than having StringKey everywhere.
#[derive(
    Clone,
    Copy,
    Debug,
    Deserialize,
    Eq,
    Hash,
    Ord,
    PartialEq,
    PartialOrd,
    Serialize,
    JsonSchema
)]
pub struct DirectiveName(pub StringKey);

impl fmt::Display for DirectiveName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt::Display::fmt(&self.0, f)
    }
}

impl FromStr for DirectiveName {
    type Err = std::convert::Infallible;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(DirectiveName(s.intern()))
    }
}

impl_lookup!(DirectiveName);
#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ArgumentName(pub StringKey);

impl fmt::Display for ArgumentName {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(fmt, "{}", self.0)
    }
}

#[derive(
    Clone,
    Copy,
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    Serialize,
    Deserialize
)]
pub struct ScalarName(pub StringKey);

impl_lookup!(ScalarName);

impl fmt::Display for ScalarName {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(fmt, "{}", self.0)
    }
}
impl_lookup!(ArgumentName);
#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ObjectName(pub StringKey);

impl fmt::Display for ObjectName {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(fmt, "{}", self.0)
    }
}

impl_lookup!(ObjectName);

#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct InputObjectName(pub StringKey);

impl fmt::Display for InputObjectName {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(fmt, "{}", self.0)
    }
}

impl_lookup!(InputObjectName);

#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct EnumName(pub StringKey);

impl fmt::Display for EnumName {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(fmt, "{}", self.0)
    }
}
impl_lookup!(EnumName);

#[derive(Clone, Copy, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct InterfaceName(pub StringKey);

impl fmt::Display for InterfaceName {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(fmt, "{}", self.0)
    }
}

impl_lookup!(InterfaceName);
