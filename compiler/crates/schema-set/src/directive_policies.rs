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
use common::DirectiveName;
use graphql_syntax::ConstantValue;
use intern::string_key::Intern;
use intern::string_key::StringKeyMap;

use crate::DIVERGENCE;
use crate::SchemaSet;
use crate::SetDirectiveValue;

static SERVICE_ONLY_ARG: LazyLock<ArgumentName> =
    LazyLock::new(|| ArgumentName("serviceOnly".intern()));
static CLIENT_ONLY_ARG: LazyLock<ArgumentName> =
    LazyLock::new(|| ArgumentName("clientOnly".intern()));
static ARGUMENTS_MAY_DIFFER_ARG: LazyLock<ArgumentName> =
    LazyLock::new(|| ArgumentName("argumentsMayDiffer".intern()));

/// How a single directive may diverge between the service schema and a client's
/// allowlisted subset. The three booleans mirror the arguments of
/// `@divergence`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct DirectivePolicy {
    /// If true, the directive may exist on the service without being on the
    /// client. If false, service-presence forces the directive (with the
    /// service's args) onto the client.
    pub service_only_ok: bool,
    /// If true, the directive may exist on the client without being on the
    /// service. If false, a client-only directive is stripped.
    pub client_only_ok: bool,
    /// If true, the client's directive arguments may differ from the service's.
    /// If false, the client's args are overwritten from the service whenever
    /// both have the directive.
    pub args_may_differ: bool,
}

impl DirectivePolicy {
    /// Policy for a directive whose definition carries no `@divergence`:
    /// the directive must match exactly between service and client. Service-only
    /// usages are forced onto the client, client-only usages are stripped, and
    /// args are overwritten from the service.
    pub const EXACT_MATCH: Self = Self {
        service_only_ok: false,
        client_only_ok: false,
        args_may_differ: false,
    };
}

/// The reconciliation policy for every directive, read once from the
/// `@divergence` applications on the directive definitions in a service
/// schema. Directives without `@divergence` default to
/// [`DirectivePolicy::EXACT_MATCH`].
#[derive(Debug, Clone, Default)]
pub struct DirectivePolicies {
    by_name: StringKeyMap<DirectivePolicy>,
}

impl DirectivePolicies {
    /// Reads `@divergence(...)` off every directive definition in the
    /// service schema. The directive definition and its `extend directive`
    /// applications are expected to be present in the service SDL.
    pub fn from_service_schema(service: &SchemaSet) -> Self {
        let by_name = service
            .directives
            .values()
            .filter_map(|directive| {
                directive
                    .directives
                    .iter()
                    .find(|applied| applied.name == *DIVERGENCE)
                    .map(|applied| (directive.name.0, policy_from_allow_divergence(applied)))
            })
            .collect();
        Self { by_name }
    }

    /// The policy for `name`, or [`DirectivePolicy::EXACT_MATCH`] if its
    /// definition carries no `@divergence`.
    pub fn policy_for(&self, name: &DirectiveName) -> DirectivePolicy {
        self.by_name
            .get(&name.0)
            .copied()
            .unwrap_or(DirectivePolicy::EXACT_MATCH)
    }

    /// Builds policies directly from
    /// `(directive_name, service_only_ok, client_only_ok, args_may_differ)`
    /// tuples, bypassing schema parsing. Primarily for tests.
    pub fn from_pairs(pairs: &[(&str, bool, bool, bool)]) -> Self {
        Self {
            by_name: pairs
                .iter()
                .map(|(name, service_only_ok, client_only_ok, args_may_differ)| {
                    (
                        name.intern(),
                        DirectivePolicy {
                            service_only_ok: *service_only_ok,
                            client_only_ok: *client_only_ok,
                            args_may_differ: *args_may_differ,
                        },
                    )
                })
                .collect(),
        }
    }
}

/// Builds a [`DirectivePolicy`] from an `@divergence(...)` directive
/// value. Each boolean argument defaults to false when absent, matching the
/// `Boolean! = false` schema defaults.
fn policy_from_allow_divergence(directive: &SetDirectiveValue) -> DirectivePolicy {
    DirectivePolicy {
        service_only_ok: bool_arg(directive, *SERVICE_ONLY_ARG),
        client_only_ok: bool_arg(directive, *CLIENT_ONLY_ARG),
        args_may_differ: bool_arg(directive, *ARGUMENTS_MAY_DIFFER_ARG),
    }
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
              argumentsMayDiffer: Boolean! = false
            ) on DIRECTIVE_DEFINITION
            directive @cdn_url on FIELD_DEFINITION
            directive @fb_owner(oncall: String) on OBJECT
            directive @source(name: String) on FIELD_DEFINITION
            extend directive @cdn_url @divergence(serviceOnly: true)
            extend directive @fb_owner @divergence(serviceOnly: true, clientOnly: true, argumentsMayDiffer: true)
            type Query { q: String }
            "#,
        );
        let policies = DirectivePolicies::from_service_schema(&service);

        assert_eq!(
            policies.policy_for(&DirectiveName("cdn_url".intern())),
            DirectivePolicy {
                service_only_ok: true,
                client_only_ok: false,
                args_may_differ: false,
            },
        );
        assert_eq!(
            policies.policy_for(&DirectiveName("fb_owner".intern())),
            DirectivePolicy {
                service_only_ok: true,
                client_only_ok: true,
                args_may_differ: true,
            },
        );
        // No @divergence on @source → defaults to EXACT_MATCH.
        assert_eq!(
            policies.policy_for(&DirectiveName("source".intern())),
            DirectivePolicy::EXACT_MATCH,
        );
    }
}
