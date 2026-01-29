/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::collections::HashSet;
use std::fmt;
use std::fmt::Formatter;
use std::str::FromStr;

use indexmap::IndexMap;
use schemars::JsonSchema;
use schemars::Schema;
use schemars::SchemaGenerator;
use schemars::json_schema;
use serde::Deserialize;
use serde::Deserializer;
use serde::Serialize;
use serde::Serializer;

pub use crate::Lookup;
use crate::idhasher::BuildIdHasher;
use crate::string;
use crate::string::IntoUtf8Bytes;
use crate::string::StringId;

// StringKey is a small impedence matcher around StringId.
// NOTE in particular that it does NOT do de-duplicating serde.
#[derive(Copy, Clone, Eq, PartialEq, Hash, Ord, PartialOrd)]
#[repr(transparent)]
pub struct StringKey(StringId);

impl JsonSchema for StringKey {
    fn schema_name() -> std::borrow::Cow<'static, str> {
        String::from("StringKey").into()
    }

    fn json_schema(_gen: &mut SchemaGenerator) -> Schema {
        json_schema!({
                "type": "string",
                "format": null,
                }
        )
    }
}

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
    pub fn index(self) -> u32 {
        self.0.index()
    }

    pub fn from_index_checked(index: u32) -> Option<Self> {
        StringId::from_index_checked(index).map(Self)
    }

    pub unsafe fn from_index(index: u32) -> Self {
        unsafe { Self(StringId::from_index(index)) }
    }
}

impl Lookup for StringKey {
    fn lookup(self) -> &'static str {
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
        use $crate::string::Lazy;
        use $crate::string_key::Intern;
        static INSTANCE: Lazy<$crate::string_key::StringKey> = Lazy::new(|| $value.intern());
        *INSTANCE
    }};
    ($_:expr) => {
        compile_error!("intern! macro can only be used with string literals.")
    };
}
