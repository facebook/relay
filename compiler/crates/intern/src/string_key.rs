/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    idhasher::BuildIdHasher,
    string::{self, IntoUtf8Bytes, StringId},
};
use indexmap::IndexMap;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::{
    collections::{HashMap, HashSet},
    fmt::{self, Formatter},
    str::FromStr,
};

// StringKey is a small impedence matcher around StringId.
// NOTE in particular that it does NOT do de-duplicating serde.
// and that its ordering is arbitrary (rather than string order).
#[derive(Copy, Clone, Eq, PartialEq, Hash, Ord, PartialOrd)]
#[repr(transparent)]
pub struct StringKey(StringId);

pub type StringKeyMap<V> = HashMap<StringKey, V, BuildIdHasher<u32>>;
pub type StringKeySet = HashSet<StringKey, BuildIdHasher<u32>>;
pub type StringKeyIndexMap<V> = IndexMap<StringKey, V, BuildIdHasher<u32>>;

pub trait Intern: IntoUtf8Bytes {
    fn intern(self) -> StringKey {
        StringKey(string::intern(self))
    }
}

impl<T: IntoUtf8Bytes> Intern for T {}

impl StringKey {
    pub fn lookup(self) -> &'static str {
        self.0.as_str()
    }
}

impl fmt::Display for StringKey {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.lookup())
    }
}

impl fmt::Debug for StringKey {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self.lookup())
    }
}

impl Serialize for StringKey {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.lookup())
    }
}

impl<'de> Deserialize<'de> for StringKey {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        Deserialize::deserialize(deserializer).map(|s: String| s.intern())
    }
}

impl FromStr for StringKey {
    type Err = std::convert::Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(s.intern())
    }
}

#[macro_export]
macro_rules! intern {
    ($value:literal) => {{
        use $crate::{string::Lazy, string_key::Intern};
        static INSTANCE: Lazy<$crate::string_key::StringKey> = Lazy::new(|| $value.intern());
        *INSTANCE
    }};
    ($_:expr) => {
        compile_error!("intern! macro can only be used with string literals.")
    };
}
