/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvHashMap;
use interner::StringKey;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "lowercase")]
pub enum TypegenLanguage {
    Flow,
    TypeScript,
}

impl Default for TypegenLanguage {
    fn default() -> Self {
        Self::Flow
    }
}

#[derive(Debug, Deserialize, Default)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct TypegenConfig {
    /// The desired output language, "flow" or "typescript".
    #[serde(default)]
    pub language: TypegenLanguage,

    /// # For Flow type generation
    /// When set, enum values are imported from a module with this suffix.
    /// For example, an enum Foo and this property set to ".test" would be
    /// imported from "Foo.test".
    /// Note: an empty string is allowed and different from not setting the
    /// value, in the example above it would just import from "Foo".
    pub enum_module_suffix: Option<String>,

    /// # For Flow type generation
    /// When set, generated input types will have the listed fields optional
    /// even if the schema defines them as required.
    #[serde(default)]
    pub optional_input_fields: Vec<StringKey>,

    /// A map from GraphQL scalar types to a custom JS type, example:
    /// { "Url": "String" }
    #[serde(default)]
    pub custom_scalar_types: FnvHashMap<StringKey, StringKey>,
}
