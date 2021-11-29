/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::Rollout;
use indexmap::IndexSet;
use intern::string_key::StringKey;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter, Result};

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
#[serde(deny_unknown_fields)]
pub struct FeatureFlags {
    #[serde(default)]
    pub enable_flight_transform: bool,

    #[serde(default)]
    pub enable_required_transform: bool,

    #[serde(default)]
    pub enable_relay_resolver_transform: bool,

    /// Enable hashing of the `supported` argument of 3D fields. Partial
    /// enabling of the feature flag checks the name based on the field type.
    #[serde(default)]
    pub hash_supported_argument: FeatureFlag,

    /// For now, this also disallows fragments with variable definitions
    /// This also makes @module to opt in using @no_inline internally
    /// NOTE that the presence of a fragment in this list only controls whether a fragment is *allowed* to
    /// use @no_inline: whether the fragment is inlined or not depends on whether it actually uses that
    /// directive.
    #[serde(default)]
    pub no_inline: FeatureFlag,

    #[serde(default)]
    pub enable_3d_branch_arg_generation: bool,

    #[serde(default)]
    pub actor_change_support: FeatureFlag,

    /// Enable generation of text artifacts used to generate full query strings
    /// later.
    #[serde(default)]
    pub text_artifacts: FeatureFlag,

    #[serde(default)]
    pub enable_client_edges: FeatureFlag,

    #[serde(default)]
    pub enable_provided_variables: FeatureFlag,
}

#[derive(Debug, Deserialize, Clone, Serialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum FeatureFlag {
    /// Fully disabled: developers may not use this feature
    Disabled,

    /// Fully enabled: developers may use this feature
    Enabled,

    /// Partially enabled: developers may only use this feature on the listed items (fragments, fields, types).
    Limited { allowlist: IndexSet<StringKey> },

    /// Partially enabled: used for gradual rollout of the feature
    Rollout { rollout: Rollout },
}

impl Default for FeatureFlag {
    fn default() -> Self {
        FeatureFlag::Disabled
    }
}

impl FeatureFlag {
    pub fn is_enabled_for(&self, name: StringKey) -> bool {
        match self {
            FeatureFlag::Enabled => true,
            FeatureFlag::Limited { allowlist } => allowlist.contains(&name),
            FeatureFlag::Rollout { rollout } => rollout.check(name.lookup()),
            FeatureFlag::Disabled => false,
        }
    }

    pub fn is_fully_enabled(&self) -> bool {
        matches!(self, FeatureFlag::Enabled)
    }
}

impl Display for FeatureFlag {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        match self {
            FeatureFlag::Disabled => f.write_str("disabled"),
            FeatureFlag::Enabled => f.write_str("enabled"),
            FeatureFlag::Limited { allowlist } => {
                let items: Vec<_> = allowlist.iter().map(|x| x.lookup()).collect();
                f.write_str("limited to: ")?;
                f.write_str(&items.join(", "))
            }
            FeatureFlag::Rollout { rollout } => write!(f, "Rollout: {:#?}", rollout),
        }
    }
}
