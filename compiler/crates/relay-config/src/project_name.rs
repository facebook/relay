/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt;

use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::Lookup;
use serde::Deserialize;
use serde::Deserializer;
use serde::Serialize;
use serde::Serializer;

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
pub enum ProjectName {
    Default,
    Named(StringKey),
}

impl ProjectName {
    pub fn generate_name_for_object_and_field(
        &self,
        object_name: StringKey,
        field_name: StringKey,
    ) -> String {
        format!("{}__{}", object_name, field_name)
    }
}

impl Default for ProjectName {
    fn default() -> Self {
        Self::Default
    }
}

impl fmt::Display for ProjectName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let Self::Named(value) = self {
            write!(f, "{}", value)
        } else {
            write!(f, "default")
        }
    }
}

impl From<StringKey> for ProjectName {
    fn from(key: StringKey) -> Self {
        match key.lookup() {
            "default" => Self::Default,
            _ => Self::Named(key),
        }
    }
}

impl From<ProjectName> for StringKey {
    fn from(project_name: ProjectName) -> Self {
        match project_name {
            ProjectName::Default => "default".intern(),
            ProjectName::Named(name) => name,
        }
    }
}

impl Serialize for ProjectName {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(match self {
            ProjectName::Default => "default",
            ProjectName::Named(name) => name.lookup(),
        })
    }
}

impl<'de> Deserialize<'de> for ProjectName {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        Deserialize::deserialize(deserializer).map(|s: String| match s.as_str() {
            "default" => ProjectName::Default,
            s => ProjectName::Named(s.intern()),
        })
    }
}
