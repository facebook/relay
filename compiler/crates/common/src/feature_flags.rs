/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt::Display;
use std::fmt::Formatter;
use std::fmt::Result as FmtResult;

use indexmap::IndexSet;
use intern::string_key::StringKey;
use intern::Lookup;
use schemars::JsonSchema;
use serde::Deserialize;
use serde::Serialize;

use crate::Rollout;

#[derive(Debug, Serialize, Deserialize, Clone, JsonSchema)]
#[serde(deny_unknown_fields)]
pub struct FeatureFlags {
    #[serde(default)]
    pub enable_relay_resolver_transform: bool,

    #[serde(default)]
    pub enable_catch_directive_transform: FeatureFlag,

    #[serde(default)]
    // Enable returning interfaces from Relay Resolvers without @outputType
    pub relay_resolver_enable_interface_output_type: FeatureFlag,

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
    pub skip_printing_nulls: FeatureFlag,

    /// Enable support for the experimental `@alias` directive on fragment spreads.
    #[serde(default)]
    pub enable_fragment_aliases: FeatureFlag,

    /// Enforce that you must add `@alias` to a fragment if it may not match,
    /// due to type mismatch or `@skip`/`@include`
    #[serde(default)]
    pub enforce_fragment_alias_where_ambiguous: FeatureFlag,

    /// Print queries in compact form
    #[serde(default)]
    pub compact_query_text: FeatureFlag,

    /// Fully build the normalization AST for Resolvers
    #[serde(default)]
    pub enable_resolver_normalization_ast: bool,

    /// Allow relay resolvers to extend the Mutation type
    #[serde(default)]
    pub enable_relay_resolver_mutations: bool,

    /// Perform strict validations when custom scalar types are used
    #[serde(default)]
    pub enable_strict_custom_scalars: bool,

    /// Relay Resolvers are a read-time feature that are not actually handled in
    /// our mutation APIs. We are in the process of removing any existing
    /// examples, but this flag is part of a process of removing any existing
    /// examples.
    #[serde(default)]
    pub allow_resolvers_in_mutation_response: FeatureFlag,

    /// @required with an action of THROW is read-time feature that is not
    /// compatible with our mutation APIs. We are in the process of removing
    /// any existing examples, but this flag is part of a process of removing
    /// any existing examples.
    #[serde(default)]
    pub allow_required_in_mutation_response: FeatureFlag,

    /// Mirror of `enable_resolver_normalization_ast`
    /// excludes resolver metadata from reader ast
    #[serde(default)]
    pub disable_resolver_reader_ast: bool,

    /// Add support for parsing and transforming variable definitions on fragment
    /// definitions and arguments on fragment spreads.
    #[serde(default)]
    pub enable_fragment_argument_transform: bool,

    /// Allow non-nullable return types from resolvers.
    #[serde(default)]
    pub allow_resolver_non_nullable_return_type: FeatureFlag,

    /// Disable validating the composite schema (server, client schema
    /// extensions, Relay Resolvers) after its built.
    #[serde(default)]
    pub disable_schema_validation: bool,

    /// Disallow the `@required` directive on fields that are already non-null
    /// in the schema.
    #[serde(default)]
    pub disallow_required_on_non_null_fields: bool,

    /// Feature flag to prefer `fetch_MyType()` generatior over `node()` query generator
    /// in @refetchable transform
    #[serde(default)]
    pub prefer_fetchable_in_refetch_queries: bool,

    /// Disable validation of the `edgeTypeName` argument on `@prependNode` and `@appendNode`.
    #[serde(default)]
    pub disable_edge_type_name_validation_on_declerative_connection_directives: FeatureFlag,

    /// Adds @ts-nocheck to generated Typescript Files
    #[serde(default = "default_true")]
    pub typescript_disable_checking_generated_files: bool,
}

impl Default for FeatureFlags {
    fn default() -> Self {
        Self {
            enable_relay_resolver_transform: false,
            enable_catch_directive_transform: Default::default(),
            relay_resolver_enable_interface_output_type: Default::default(),
            no_inline: Default::default(),
            enable_3d_branch_arg_generation: false,
            actor_change_support: Default::default(),
            text_artifacts: Default::default(),
            skip_printing_nulls: Default::default(),
            enable_fragment_aliases: Default::default(),
            enforce_fragment_alias_where_ambiguous: Default::default(),
            compact_query_text: Default::default(),
            enable_resolver_normalization_ast: false,
            enable_relay_resolver_mutations: false,
            enable_strict_custom_scalars: false,
            allow_resolvers_in_mutation_response: Default::default(),
            allow_required_in_mutation_response: Default::default(),
            disable_resolver_reader_ast: false,
            enable_fragment_argument_transform: false,
            allow_resolver_non_nullable_return_type: Default::default(),
            disable_schema_validation: false,
            disallow_required_on_non_null_fields: false,
            prefer_fetchable_in_refetch_queries: false,
            disable_edge_type_name_validation_on_declerative_connection_directives: Default::default(),
            typescript_disable_checking_generated_files: default_true(),
        }
    }
}


#[derive(Debug, Deserialize, Clone, Serialize, Default, JsonSchema)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum FeatureFlag {
    /// Fully disabled: developers may not use this feature
    #[default]
    Disabled,

    /// Fully enabled: developers may use this feature
    Enabled,

    /// Partially enabled: developers may only use this feature on the listed items (fragments, fields, types).
    Limited { allowlist: IndexSet<StringKey> },

    /// Partially enabled: used for gradual rollout of the feature
    Rollout { rollout: Rollout },
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
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
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

// Returns true by default for the `typescript_disable_checking_generated_files` feature flag
fn default_true() -> bool {
    true
}

