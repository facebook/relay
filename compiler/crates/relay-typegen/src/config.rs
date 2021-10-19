/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvBuildHasher;
use indexmap::{IndexMap, IndexSet};
use interner::StringKey;
use serde::{Deserialize, Serialize};

use crate::FlowTypegenRollout;

type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;
type FnvIndexSet<T> = IndexSet<T, FnvBuildHasher>;

#[derive(Debug, Copy, Clone, Serialize, Deserialize, PartialEq)]
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

#[derive(Debug, Serialize, Deserialize)]
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
    /// Generate enum files using Flow Enums instead of string unions for the
    /// given GraphQL enum names.
    /// Enums with names that start with lowercase are invalid Flow Enum values
    /// and always generate legacy enums.
    #[serde(default)]
    pub flow_enums: FnvIndexSet<StringKey>,

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

    /// Whether to future proof enums by including "%future added value" as a possible value.
    #[serde(default = "default_future_proofness")]
    pub future_proof_enums: bool,

    /// Whether to future proof union and interface types by including "%other" as a possible type.
    #[serde(default = "default_future_proofness")]
    pub future_proof_abstract_types: bool,

    /// A map from GraphQL scalar types to a custom JS type, example:
    /// { "Url": "String" }
    #[serde(default)]
    pub custom_scalar_types: FnvIndexMap<StringKey, StringKey>,

    /// Require all GraphQL scalar types mapping to be defined, will throw
    /// if a GraphQL scalar type doesn't have a JS type
    #[serde(default)]
    pub require_custom_scalar_types: bool,

    /// Work in progress new Flow type definitions
    #[serde(default)]
    pub flow_typegen_rollout: FlowTypegenRollout,
}

// Custom impl for Default to set future proofness to true when using Default::default().
impl Default for TypegenConfig {
    fn default() -> Self {
        Self {
            language: TypegenLanguage::default(),
            enum_module_suffix: None,
            optional_input_fields: vec![],
            use_import_type_syntax: false,
            future_proof_abstract_types: default_future_proofness(),
            future_proof_enums: default_future_proofness(),
            custom_scalar_types: FnvIndexMap::default(),
            flow_enums: FnvIndexSet::default(),
            require_custom_scalar_types: false,
            flow_typegen_rollout: FlowTypegenRollout::default(),
        }
    }
}

fn default_future_proofness() -> bool {
    true
}
