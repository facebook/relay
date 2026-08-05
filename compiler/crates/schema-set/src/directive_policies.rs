/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! How a directive may legally diverge between a service schema and a client's
//! allowlisted subset of it, derived from the `@divergence` directive
//! applied to each directive's definition in the service schema.
//!
//! A directive whose definition carries no `@divergence` defaults to
//! [`DirectivePolicy::EXACT_MATCH`]: it must be present on both sides with
//! identical arguments.

use std::sync::LazyLock;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use errors::try_all;
use graphql_syntax::ConstantValue;
use intern::string_key::Intern;
use intern::string_key::StringKeyMap;
use serde::Serialize;
use thiserror::Error;

use crate::DIVERGENCE;
use crate::SchemaSet;
use crate::SetDirectiveValue;

static SERVICE_ONLY_ARG: LazyLock<ArgumentName> =
    LazyLock::new(|| ArgumentName("serviceOnly".intern()));
static CLIENT_ONLY_ARG: LazyLock<ArgumentName> =
    LazyLock::new(|| ArgumentName("clientOnly".intern()));
static DIVERGENT_ARGS_ARG: LazyLock<ArgumentName> =
    LazyLock::new(|| ArgumentName("divergentArgs".intern()));
static ALL_ARGS_MAY_DIVERGE_ARG: LazyLock<ArgumentName> =
    LazyLock::new(|| ArgumentName("allArgsMayDiverge".intern()));

/// Errors from reading `@divergence` off a directive definition.
#[derive(Debug, Error, Serialize)]
#[serde(tag = "type", content = "args")]
pub enum DirectivePolicyError {
    #[error(
        "@divergence sets `allArgsMayDiverge: true` together with a non-empty `divergentArgs` list. These are mutually exclusive: `allArgsMayDiverge` already lets every argument diverge, so listing specific arguments is contradictory. Set one or the other."
    )]
    AllArgsMayDivergeWithDivergentArgs,
}

/// Which of a directive's arguments may differ between the service and the
/// client.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DivergentArgs {
    /// Only the named arguments may diverge.
    Only(Vec<ArgumentName>),
    /// Every argument may diverge, including ones added to the directive later.
    All,
}

impl DivergentArgs {
    /// True if `name`'s value is allowed to differ between the service and the
    /// client.
    pub fn may_diverge(&self, name: &ArgumentName) -> bool {
        match self {
            DivergentArgs::All => true,
            DivergentArgs::Only(names) => names.contains(name),
        }
    }
}

/// How a single directive may diverge between the service schema and a client's
/// allowlisted subset. The fields mirror the arguments of `@divergence`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DirectivePolicy {
    /// Whether the directive may appear on the service but not on the client.
    pub service_only_ok: bool,
    /// Whether the directive may appear on the client but not on the service.
    pub client_only_ok: bool,
    /// Which of the directive's arguments may differ between the service and the
    /// client, or `None` if all arguments must match.
    pub divergent_args: Option<DivergentArgs>,
}

impl DirectivePolicy {
    /// Policy for a directive whose definition carries no `@divergence`: it must
    /// match exactly between service and client.
    pub const EXACT_MATCH: Self = Self {
        service_only_ok: false,
        client_only_ok: false,
        divergent_args: None,
    };

    /// Policy for directives that are authoritative on the service schema.
    pub const SERVICE_FIRST: Self = Self {
        service_only_ok: true,
        client_only_ok: false,
        divergent_args: None,
    };

    /// Policy for directives that may freely diverge between service and client
    /// schemas: either side may carry the directive independently, and every
    /// argument value may differ (including arguments added to the directive
    /// later).
    pub const ANY_DIVERGENCE: Self = Self {
        service_only_ok: true,
        client_only_ok: true,
        divergent_args: Some(DivergentArgs::All),
    };
}

/// The reconciliation policy for every directive, read once from the
/// `@divergence` applications on the directive definitions in a service
/// schema. Directives without `@divergence` default to
/// [`DirectivePolicy::EXACT_MATCH`].
#[derive(Debug, Clone, Default, Eq, PartialEq)]
pub struct DirectivePolicies {
    by_name: StringKeyMap<DirectivePolicy>,
}

impl DirectivePolicies {
    /// Reads `@divergence(...)` off every directive definition in the
    /// service schema. The directive definition and its `extend directive`
    /// applications are expected to be present in the service SDL.
    pub fn from_service_schema(service: &SchemaSet) -> DiagnosticsResult<Self> {
        let by_name = try_all(service.directives.values().filter_map(|directive| {
            directive
                .directives
                .iter()
                .find(|applied| applied.name == *DIVERGENCE)
                .map(|applied| {
                    policy_from_allow_divergence(applied).map(|policy| (directive.name.0, policy))
                })
        }))?
        .into_iter()
        .collect();
        Ok(Self { by_name })
    }

    /// The policy for `name`, or [`DirectivePolicy::EXACT_MATCH`] if its
    /// definition carries no `@divergence`.
    pub fn policy_for(&self, name: &DirectiveName) -> DirectivePolicy {
        self.by_name
            .get(&name.0)
            .cloned()
            .unwrap_or(DirectivePolicy::EXACT_MATCH)
    }

    /// The explicit policy for `name`, or `None` if the directive is not
    /// tracked. Use this when callers need to distinguish "no policy specified"
    /// from "policy specified as EXACT_MATCH" — for example, when an absent
    /// policy should keep legacy behavior rather than apply the strict default.
    pub fn lookup(&self, name: &DirectiveName) -> Option<DirectivePolicy> {
        self.by_name.get(&name.0).cloned()
    }
}

impl<'a> FromIterator<(&'a str, DirectivePolicy)> for DirectivePolicies {
    /// Builds policies directly from `(directive_name, policy)` pairs,
    /// bypassing schema parsing. Intern each name as we collect.
    fn from_iter<I: IntoIterator<Item = (&'a str, DirectivePolicy)>>(iter: I) -> Self {
        Self {
            by_name: iter
                .into_iter()
                .map(|(name, policy)| (name.intern(), policy))
                .collect(),
        }
    }
}

impl FromIterator<(DirectiveName, DirectivePolicy)> for DirectivePolicies {
    /// Builds policies directly from `(directive_name, policy)` pairs,
    /// bypassing schema parsing.
    fn from_iter<I: IntoIterator<Item = (DirectiveName, DirectivePolicy)>>(iter: I) -> Self {
        Self {
            by_name: iter
                .into_iter()
                .map(|(name, policy)| (name.0, policy))
                .collect(),
        }
    }
}

/// Builds a [`DirectivePolicy`] from an `@divergence(...)` directive value. The
/// boolean arguments default to false when absent, matching the
/// `Boolean! = false` schema defaults; `divergentArgs` defaults to an empty
/// list when absent.
///
/// The two ways to allow argument divergence map to the [`DivergentArgs`]
/// variants:
/// * `allArgsMayDiverge: true` → [`DivergentArgs::All`]
/// * a non-empty `divergentArgs` list → [`DivergentArgs::Only`]
///
/// An empty/absent `divergentArgs` with `allArgsMayDiverge: false` maps to
/// `None` (all arguments must match). Setting `allArgsMayDiverge: true`
/// together with a non-empty `divergentArgs` list is contradictory and is
/// rejected with [`DirectivePolicyError::AllArgsMayDivergeWithDivergentArgs`].
fn policy_from_allow_divergence(
    directive: &SetDirectiveValue,
) -> DiagnosticsResult<DirectivePolicy> {
    let named_args = directive
        .arguments
        .iter()
        .find(|arg| arg.name == *DIVERGENT_ARGS_ARG)
        .and_then(|arg| arg.value.get_list_literal())
        .map(|list| {
            list.items
                .iter()
                .filter_map(|item| item.get_string_literal())
                .map(ArgumentName)
                .collect::<Vec<_>>()
        })
        .filter(|names| !names.is_empty());

    let divergent_args = match (bool_arg(directive, *ALL_ARGS_MAY_DIVERGE_ARG), named_args) {
        (true, Some(_)) => {
            return Err(vec![Diagnostic::error(
                DirectivePolicyError::AllArgsMayDivergeWithDivergentArgs,
                directive_location(directive),
            )]);
        }
        (true, None) => Some(DivergentArgs::All),
        (false, named) => named.map(DivergentArgs::Only),
    };

    Ok(DirectivePolicy {
        service_only_ok: bool_arg(directive, *SERVICE_ONLY_ARG),
        client_only_ok: bool_arg(directive, *CLIENT_ONLY_ARG),
        divergent_args,
    })
}

/// The location of a directive application, or a generated location when the
/// directive carries no source position.
fn directive_location(directive: &SetDirectiveValue) -> Location {
    directive
        .definition
        .locations
        .first()
        .cloned()
        .unwrap_or(Location::generated())
}

/// Reads a boolean argument off a directive value, defaulting to false when the
/// argument is absent or is not a boolean literal.
fn bool_arg(directive: &SetDirectiveValue, arg_name: ArgumentName) -> bool {
    directive
        .arguments
        .iter()
        .find(|arg| arg.name == arg_name)
        .and_then(|arg| match &arg.value {
            ConstantValue::Boolean(node) => Some(node.value),
            _ => None,
        })
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;

    use super::*;

    fn set_from_str(sdl: &str) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
    }

    #[test]
    fn absent_directive_defaults_to_exact_match() {
        let policies = DirectivePolicies::default();
        assert_eq!(
            policies.policy_for(&DirectiveName("anything".intern())),
            DirectivePolicy::EXACT_MATCH,
        );
    }

    #[test]
    fn reads_policies_from_service_schema() {
        let service = set_from_str(
            r#"
            directive @divergence(
              serviceOnly: Boolean! = false
              clientOnly: Boolean! = false
              divergentArgs: [String!]! = []
              allArgsMayDiverge: Boolean! = false
            ) on DIRECTIVE_DEFINITION
            directive @cdn_url on FIELD_DEFINITION
            directive @fb_owner(oncall: String) on OBJECT
            directive @fbid on FIELD_DEFINITION
            directive @source(name: String) on FIELD_DEFINITION
            extend directive @cdn_url @divergence(serviceOnly: true)
            extend directive @fb_owner @divergence(serviceOnly: true, clientOnly: true, divergentArgs: ["oncall"])
            extend directive @fbid @divergence(serviceOnly: true, clientOnly: true, allArgsMayDiverge: true)
            type Query { q: String }
            "#,
        );
        let policies =
            DirectivePolicies::from_service_schema(&service).expect("valid @divergence directives");

        assert_eq!(
            policies.policy_for(&DirectiveName("cdn_url".intern())),
            DirectivePolicy::SERVICE_FIRST,
        );
        assert_eq!(
            policies.policy_for(&DirectiveName("fb_owner".intern())),
            DirectivePolicy {
                service_only_ok: true,
                client_only_ok: true,
                divergent_args: Some(DivergentArgs::Only(vec![ArgumentName("oncall".intern())])),
            },
        );
        // allArgsMayDiverge: true → every argument may diverge.
        assert_eq!(
            policies.policy_for(&DirectiveName("fbid".intern())),
            DirectivePolicy::ANY_DIVERGENCE,
        );
        // No @divergence on @source → defaults to EXACT_MATCH.
        assert_eq!(
            policies.policy_for(&DirectiveName("source".intern())),
            DirectivePolicy::EXACT_MATCH,
        );
    }

    #[test]
    fn errors_when_all_args_may_diverge_and_divergent_args_both_set() {
        let service = set_from_str(
            r#"
            directive @divergence(
              serviceOnly: Boolean! = false
              clientOnly: Boolean! = false
              divergentArgs: [String!]! = []
              allArgsMayDiverge: Boolean! = false
            ) on DIRECTIVE_DEFINITION
            directive @fb_owner(oncall: String) on OBJECT
            extend directive @fb_owner @divergence(allArgsMayDiverge: true, divergentArgs: ["oncall"])
            type Query { q: String }
            "#,
        );
        assert!(
            DirectivePolicies::from_service_schema(&service).is_err(),
            "allArgsMayDiverge together with a non-empty divergentArgs must be rejected"
        );
    }
}
