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
use schemars::JsonSchema;
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
    PartialEq,
    JsonSchema
)]
#[serde(deny_unknown_fields, rename_all = "lowercase")]
pub enum TypegenLanguage {
    JavaScript,
    TypeScript,
    Flow,
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

#[derive(Debug, Serialize, Deserialize, Clone, JsonSchema, Hash, PartialEq, Eq)]
#[serde(untagged)]
pub enum CustomType {
    Name(StringKey),
    Path(CustomTypeImport),
}

#[derive(Debug, Serialize, Deserialize, Clone, JsonSchema, Hash, PartialEq, Eq)]
pub struct CustomTypeImport {
    pub name: StringKey,
    pub path: PathBuf,
}

#[derive(Debug, Serialize, Deserialize, JsonSchema)]
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
    pub custom_scalar_types: FnvIndexMap<ScalarName, CustomType>,

    /// Require all GraphQL scalar types mapping to be defined, will throw
    /// if a GraphQL scalar type doesn't have a JS type
    #[serde(default)]
    pub require_custom_scalar_types: bool,

    /// This option controls whether or not a catch-all entry is added to enum type definitions
    /// for values that may be added in the future. Enabling this means you will have to update
    /// your application whenever the GraphQL server schema adds new enum values to prevent it
    /// from breaking.
    #[serde(default)]
    pub no_future_proof_enums: bool,

    /// This option enables emitting es modules artifacts.
    #[serde(default)]
    pub eager_es_modules: bool,

    /// Keep the previous compiler behavior by outputting an union
    /// of the raw type and null, and not the **correct** behavior
    /// of an union with the raw type, null and undefined.
    #[serde(default)]
    pub typescript_exclude_undefined_from_nullable_union: bool,

    /// EXPERIMENTAL: If your environment is configured to handles errors out of band, either via
    /// a network layer which discards responses with errors, or via enabling strict
    /// error handling in the runtime, you can enable this flag to have Relay generate
    /// non-null types for fields which are marked as semantically non-null in
    /// the schema.
    ///
    /// Currently semantically non-null fields must be specified in your schema
    /// using the `@semanticNonNull` directive as specified in:
    /// https://github.com/apollographql/specs/pull/42
    #[serde(default)]
    pub experimental_emit_semantic_nullability_types: bool,

    /// A map from GraphQL error name to import path, example:
    /// {"name:: "MyErrorName", "path": "../src/MyError"}
    pub custom_error_type: Option<CustomTypeImport>,
}

impl Default for TypegenConfig {
    fn default() -> Self {
        TypegenConfig {
            language: TypegenLanguage::JavaScript,
            enum_module_suffix: Default::default(),
            optional_input_fields: Default::default(),
            use_import_type_syntax: Default::default(),
            custom_scalar_types: Default::default(),
            require_custom_scalar_types: Default::default(),
            no_future_proof_enums: Default::default(),
            eager_es_modules: Default::default(),
            typescript_exclude_undefined_from_nullable_union: Default::default(),
            experimental_emit_semantic_nullability_types: Default::default(),
            custom_error_type: None,
        }
    }
}
