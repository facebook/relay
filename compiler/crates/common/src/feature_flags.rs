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
use intern::Lookup;
use intern::string_key::StringKey;
use schemars::JsonSchema;
use serde::Deserialize;
use serde::Serialize;

use crate::Rollout;
use crate::rollout::RolloutRange;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, JsonSchema)]
#[serde(deny_unknown_fields)]
pub struct FeatureFlags {
    #[serde(default)]
    /// Enable returning interfaces from Relay Resolvers without @outputType
    pub relay_resolver_enable_interface_output_type: FeatureFlag,

    #[serde(default)]
    /// @outputType resolvers are a discontinued experimental feature. This flag
    /// allows users to allowlist old uses of this feature while they work to
    /// remove them. Weak types (types without an `id` field) returned by a Relay
    /// Resolver should be limited to types defined using `@RelayResolver` with `@weak`.
    ///
    /// If using the "limited" feature flag variant, users can allowlist a
    /// specific list of field names.
    ///
    /// https://relay.dev/docs/next/guides/relay-resolvers/defining-types/#defining-a-weak-type
    pub allow_output_type_resolvers: FeatureFlag,

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

    /// Enforce that you must add `@alias` to a fragment if it may not match,
    /// due to type mismatch or `@skip`/`@include`
    #[serde(default = "enabled_feature_flag")]
    pub enforce_fragment_alias_where_ambiguous: FeatureFlag,

    /// Print queries in compact form
    #[serde(default)]
    pub compact_query_text: FeatureFlag,

    /// Fully build the normalization AST for Resolvers
    #[serde(default)]
    pub enable_resolver_normalization_ast: bool,

    /// Allow per-query opt in to normalization AST for Resolvers with exec_time_resolvers
    /// directive. In contrast to enable_resolver_normalization_ast, if this is true, a
    /// normalization AST can be generated for a query using the @exec_time_resolvers directive
    #[serde(default)]
    pub enable_exec_time_resolvers_directive: bool,

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

    /// Feature flag to prefer `fetch_MyType()` generatior over `node()` query generator
    /// in @refetchable transform
    #[serde(default)]
    pub prefer_fetchable_in_refetch_queries: bool,

    /// Disable validation of the `edgeTypeName` argument on `@prependNode` and `@appendNode`.
    #[serde(default)]
    pub disable_edge_type_name_validation_on_declerative_connection_directives: FeatureFlag,

    /// Disable full GraphQL argument type validation. Historically, we only applied argument type
    /// validation to the query that was actually going to be persisted and sent
    /// to the server. This meant that we didn't typecheck arguments passed to
    /// Relay Resolvers or Client Schema Extensions.
    ///
    /// We also permitted an escape hatch of `uncheckedArguments_DEPRECATED` for
    /// defining fragment arguments which were not typechecked.
    ///
    /// We no-longer support `uncheckedArguments_DEPRECATED`, and we typecheck
    /// both client and server arguments. This flag allows you to opt out of
    /// this new behavior to enable gradual adoption of the new validations.
    ///
    /// This flag will be removed in a future version of Relay.
    #[serde(default)]
    pub disable_full_argument_type_validation: FeatureFlag,

    /// Generate the `moduleImports` field in the Reader AST.
    #[serde(default)]
    pub use_reader_module_imports: FeatureFlag,

    /// Skip generating resolver type assertions for resolvers which have
    /// been derived from TS/Flow types.
    #[serde(default)]
    pub omit_resolver_type_assertions_for_confirmed_types: FeatureFlag,

    /// Skip the optimization which extracts common JavaScript structures in
    /// generated artifacts into numbered variables and uses them by reference
    /// in each position in which they occur.
    ///
    /// This optimization can make it hard to follow changes to generated
    /// code, so being able to disable it can be helpful for debugging.
    ///
    /// To disable deduping for just one fragment or operation's generated
    /// artifacts:
    ///
    /// ```json
    /// "disable_deduping_common_structures_in_artifacts": {
    ///   { "kind": "limited", "allowList": ["<operation_or_fragment_name>"] }
    /// }
    /// ```
    #[serde(default)]
    pub disable_deduping_common_structures_in_artifacts: FeatureFlag,

    /// The `path` field in `@required` Reader AST nodes is no longer used. But
    /// removing them in one diff is too large of a change to ship at once.
    ///
    /// This flag will allow us to use the rollout FeatureFlag to remove them
    /// across a number of diffs.
    #[serde(default)]
    pub legacy_include_path_in_required_reader_nodes: FeatureFlag,

    /// Disallow @required action THROW on semantically nullable fields.
    /// When enabled, this will prevent the use of THROW action on fields
    /// that are semantically nullable (e.g., fields that can legitimately
    /// be null in normal operation).
    #[serde(default)]
    pub disallow_required_action_throw_on_semantically_nullable_fields: FeatureFlag,

    /// Allow the legacy verbose resolver syntax (@onType, @onInterface, @fieldName, @edgeTo).
    /// This syntax is deprecated in favor of the terse @RelayResolver Type.field: ReturnType syntax.
    /// When disabled (default), using the legacy syntax will result in a compiler error.
    #[serde(default)]
    pub enable_legacy_verbose_resolver_syntax: FeatureFlag,

    /// Enable experimental support for shadow resolvers. Shadow resolvers allow
    /// defining a Relay Resolver that "shadows" an existing server field,
    /// providing an alternative implementation that can be used during
    /// migration or for client-side overrides.
    #[serde(default)]
    pub enable_shadow_resolvers: FeatureFlag,
}

impl Default for FeatureFlags {
    fn default() -> Self {
        FeatureFlags {
            relay_resolver_enable_interface_output_type: Default::default(),
            allow_output_type_resolvers: Default::default(),
            no_inline: Default::default(),
            enable_3d_branch_arg_generation: Default::default(),
            actor_change_support: Default::default(),
            text_artifacts: Default::default(),
            skip_printing_nulls: Default::default(),
            compact_query_text: Default::default(),
            enable_resolver_normalization_ast: Default::default(),
            enable_exec_time_resolvers_directive: Default::default(),
            enable_relay_resolver_mutations: Default::default(),
            enable_strict_custom_scalars: Default::default(),
            allow_resolvers_in_mutation_response: Default::default(),
            allow_required_in_mutation_response: Default::default(),
            disable_resolver_reader_ast: Default::default(),
            enable_fragment_argument_transform: Default::default(),
            allow_resolver_non_nullable_return_type: Default::default(),
            disable_schema_validation: Default::default(),
            prefer_fetchable_in_refetch_queries: Default::default(),
            disable_edge_type_name_validation_on_declerative_connection_directives:
                Default::default(),
            disable_full_argument_type_validation: Default::default(),
            use_reader_module_imports: Default::default(),
            omit_resolver_type_assertions_for_confirmed_types: Default::default(),
            disable_deduping_common_structures_in_artifacts: Default::default(),
            legacy_include_path_in_required_reader_nodes: Default::default(),
            disallow_required_action_throw_on_semantically_nullable_fields: Default::default(),
            enable_legacy_verbose_resolver_syntax: Default::default(),
            enable_shadow_resolvers: Default::default(),

            // enabled-by-default
            enforce_fragment_alias_where_ambiguous: FeatureFlag::Enabled,
        }
    }
}

#[derive(
    Debug,
    serde::Deserialize,
    Clone,
    Serialize,
    Default,
    PartialEq,
    JsonSchema
)]
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

    /// Partially enabled: used for gradual rollout of the feature
    RolloutRange { rollout: RolloutRange },
}

/// Used for making feature flags enabled by default via Serde's default attribute.
fn enabled_feature_flag() -> FeatureFlag {
    FeatureFlag::Enabled
}

impl FeatureFlag {
    pub fn is_enabled_for(&self, name: StringKey) -> bool {
        match self {
            FeatureFlag::Enabled => true,
            FeatureFlag::Limited { allowlist } => allowlist.contains(&name),
            FeatureFlag::Rollout { rollout } => rollout.check(name.lookup()),
            FeatureFlag::RolloutRange { rollout } => rollout.check(name.lookup()),
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
            FeatureFlag::Rollout { rollout } => write!(f, "Rollout: {rollout:#?}"),
            FeatureFlag::RolloutRange { rollout } => write!(f, "RolloutRange: {rollout:#?}"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_trait_sets_enforce_fragment_alias_enabled() {
        let flags = FeatureFlags::default();
        assert!(matches!(
            flags.enforce_fragment_alias_where_ambiguous,
            FeatureFlag::Enabled
        ));
        // A couple of quick sanity checks for other defaults
        assert!(matches!(flags.no_inline, FeatureFlag::Disabled));
        assert!(!flags.enable_resolver_normalization_ast);
    }

    #[test]
    fn serde_empty_object_deserializes_to_default() {
        // When deserializing from an empty JSON object, serde applies per-field defaults.
        let flags: FeatureFlags = serde_json::from_str("{} ").expect("valid json");
        assert_eq!(flags, FeatureFlags::default());
    }
}
