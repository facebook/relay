/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Rollout;
use fnv::FnvBuildHasher;
use indexmap::{IndexMap, IndexSet};
use intern::string_key::StringKey;
use serde::{Deserialize, Serialize};

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

    /// This option controls whether or not a catch-all entry is added to enum type definitions
    /// for values that may be added in the future. Enabling this means you will have to update
    /// your application whenever the GraphQL server schema adds new enum values to prevent it
    /// from breaking.
    #[serde(default = "default_future_proofness")]
    pub future_proof_enums: bool,

    /// Whether to future proof union and interface types by including "%other" as a possible type.
    #[serde(default = "default_future_proofness")]
    pub future_proof_abstract_types: bool,

    /// For which types (unions or interfaces) to not write out all possible type names if future
    /// proof abstract types is set to false. Especially useful for interfaces or unions that may
    /// have a lot of concrete types, such as Node.
    #[serde(default)]
    pub exclude_from_typename_unions: Vec<StringKey>,

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
    pub flow_typegen: FlowTypegenConfig,

    /// This option enables emitting es modules artifacts.
    #[serde(default)]
    pub eager_es_modules: bool,

    /// This option controls which emitted files have sorted fields, fragment names,
    /// and union members. It also controls whether unions with more than one element
    /// are written with surrounding parentheses.
    #[serde(default)]
    pub sort_typegen_items: SortTypegenItemsConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
#[serde(deny_unknown_fields, tag = "phase")]
pub struct FlowTypegenConfig {
    pub phase: FlowTypegenPhase,
    #[serde(default)]
    pub rollout: Rollout,
}

impl Default for FlowTypegenConfig {
    fn default() -> Self {
        Self {
            phase: FlowTypegenPhase::Final,
            rollout: Rollout::default(),
        }
    }
}

impl FlowTypegenConfig {
    /// Returns the FlowTypegenPhase based on the config. If a `Rollout` check
    /// is not passing, the previous phase is returned.
    pub fn phase(self, rollout_key: StringKey) -> FlowTypegenPhase {
        if self.rollout.check(rollout_key.lookup()) {
            self.phase
        } else {
            self.phase.previous()
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
pub enum FlowTypegenPhase {
    /// Final state
    Final,
    /// - remove $fragmentRefs for spreads
    /// - remove $refType from Frag$data
    /// - keep exporting old types for operations
    Compat,
}

impl FlowTypegenPhase {
    /// Returns the previous phase that should be used when the rollout
    /// percentage check for the current phase fails.
    fn previous(self) -> Self {
        use FlowTypegenPhase::*;
        match self {
            Final => Compat,
            Compat => Compat,
        }
    }
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
            exclude_from_typename_unions: vec![],
            custom_scalar_types: FnvIndexMap::default(),
            flow_enums: FnvIndexSet::default(),
            require_custom_scalar_types: false,
            flow_typegen: FlowTypegenConfig::default(),
            eager_es_modules: false,
            sort_typegen_items: SortTypegenItemsConfig::default(),
        }
    }
}

fn default_future_proofness() -> bool {
    true
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, Default)]
pub struct SortTypegenItemsConfig {
    #[serde(default)]
    pub rollout: Rollout,
}

impl SortTypegenItemsConfig {
    pub fn should_sort(&self, rollout_key: StringKey) -> bool {
        self.rollout.check(rollout_key.lookup())
    }
}
