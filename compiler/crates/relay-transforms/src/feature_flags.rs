/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use indexmap::IndexSet;
use interner::StringKey;
use serde::Deserialize;
use std::fmt::{Display, Formatter, Result};

#[derive(Debug, Deserialize, Clone)]
#[serde(deny_unknown_fields)]
pub struct FeatureFlags {
    #[serde(default)]
    pub enable_flight_transform: bool,

    pub enable_required_transform_for_prefix: Option<StringKey>,

    #[serde(default)]
    pub no_inline: NoInlineFeature,
}

impl Default for FeatureFlags {
    fn default() -> Self {
        FeatureFlags {
            enable_flight_transform: false,
            enable_required_transform_for_prefix: None,
            no_inline: Default::default(),
        }
    }
}

#[derive(Debug, Deserialize, Clone)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum NoInlineFeature {
    /// Fully disabled: developers may not use @no_inline
    Disabled,

    /// Fully enabled: developers may use @no_inline on any fragment, with or without variable definitions
    Enabled,

    /// Partially enabled: developers may only use @no_inline on the listed fragments. For now, this also
    /// disallows fragments with variable definitions
    /// NOTE that the presence of a fragment in this list only controls whether a fragment is *allowed* to
    /// use @no_inline: whether the fragment is inlined or not depends on whether it actually uses that
    /// directive.
    Limited { allowlist: IndexSet<StringKey> },
}

impl Default for NoInlineFeature {
    fn default() -> Self {
        NoInlineFeature::Disabled
    }
}

impl NoInlineFeature {
    pub fn enable_for_fragment(&self, name: StringKey) -> bool {
        match self {
            NoInlineFeature::Enabled => true,
            NoInlineFeature::Limited { allowlist } => allowlist.contains(&name),
            _ => false,
        }
    }

    pub fn enable_fragment_variables(&self) -> bool {
        matches!(self, NoInlineFeature::Enabled)
    }
}

impl Display for NoInlineFeature {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        match self {
            NoInlineFeature::Disabled => f.write_str("disabled"),
            NoInlineFeature::Enabled => f.write_str("enabled"),
            NoInlineFeature::Limited { allowlist } => {
                let items: Vec<_> = allowlist.iter().map(|x| x.lookup()).collect();
                f.write_str("limited to: ")?;
                f.write_str(&items.join(", "))
            }
        }
    }
}
