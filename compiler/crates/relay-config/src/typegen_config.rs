/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use common::ScalarName;
use fnv::FnvBuildHasher;
use indexmap::IndexMap;
use intern::string_key::StringKey;
use serde::Deserialize;
use serde::Serialize;
use strum::EnumIter;
use strum::IntoEnumIterator;
type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;

#[derive(
    EnumIter,
    strum::Display,
    Debug,
    Copy,
    Clone,
    Serialize,
    Deserialize,
    PartialEq
)]
#[serde(deny_unknown_fields, rename_all = "lowercase")]
pub enum TypegenLanguage {
    JavaScript,
    TypeScript,
    Flow,
}

impl Default for TypegenLanguage {
    fn default() -> Self {
        Self::JavaScript
    }
}

impl TypegenLanguage {
    pub fn get_variants_as_string() -> Vec<String> {
        let mut res = vec![];
        for lang in Self::iter() {
            res.push(lang.to_string().to_lowercase());
        }
        res
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum CustomScalarType {
    Name(StringKey),
    Path(CustomScalarTypeImport),
}

#[derive(Debug, Serialize, Deserialize, Clone)]

pub struct CustomScalarTypeImport {
    pub name: StringKey,
    pub path: PathBuf,
}

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct TypegenConfig {
    /// The desired output language, "flow" or "typescript".
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

    /// # For Typescript type generation
    /// Whether to use the `import type` syntax introduced in Typescript
    /// version 3.8. This will prevent warnings from `importsNotUsedAsValues`.
    #[serde(default)]
    pub use_import_type_syntax: bool,

    /// A map from GraphQL scalar types to a custom JS type, example:
    /// { "Url": "String" }
    /// { "Url": {"name:: "MyURL", "path": "../src/MyUrlTypes"} }
    #[serde(default)]
    pub custom_scalar_types: FnvIndexMap<ScalarName, CustomScalarType>,

    /// Require all GraphQL scalar types mapping to be defined, will throw
    /// if a GraphQL scalar type doesn't have a JS type
    #[serde(default)]
    pub require_custom_scalar_types: bool,

    /// Work in progress new Flow type definitions
    #[serde(default)]
    pub flow_typegen: FlowTypegenConfig,

    /// This option enables emitting es modules artifacts.
    #[serde(default)]
    pub eager_es_modules: bool,
}

#[derive(Default, Debug, Serialize, Deserialize, Clone, Copy)]
#[serde(deny_unknown_fields, tag = "phase")]
pub struct FlowTypegenConfig {
    /// This option controls whether or not a catch-all entry is added to enum type definitions
    /// for values that may be added in the future. Enabling this means you will have to update
    /// your application whenever the GraphQL server schema adds new enum values to prevent it
    /// from breaking.
    #[serde(default)]
    pub no_future_proof_enums: bool,
}
