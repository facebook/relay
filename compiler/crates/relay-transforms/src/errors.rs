/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::StringKey;
use thiserror::Error;

#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ValidationMessage {
    #[error(
        "Invalid use of @relay_client_component on an inline fragment, @relay_client_component is only supported on fragment spreads."
    )]
    InvalidRelayClientComponentOnInlineFragment,

    #[error(
        "Invalid use of @relay_client_component on a scalar field, @relay_client_component is only supported on fragment spreads."
    )]
    InvalidRelayClientComponentOnScalarField,

    #[error("@relay_client_component is not compatible with these {}: `{}`",
         if incompatible_directives.len() > 1 { "directives" } else { "directive" },
         incompatible_directives
             .iter()
             .map(|directive| directive.lookup())
             .collect::<Vec<_>>()
             .join("`, `"))
     ]
    IncompatibleRelayClientComponentDirectives {
        incompatible_directives: Vec<StringKey>,
    },

    #[error("@relay_client_component is not compatible with @arguments.")]
    InvalidRelayClientComponentWithArguments,

    #[error("This fragment spread already has a split normalization file generated.")]
    DuplicateRelayClientComponentSplitOperation,

    #[error(
        "The Relay Resolver backing this field has an `@relay_resolver` directive with an invalid '{key}' argument. Expected a literal string value."
    )]
    InvalidRelayResolverKeyArg { key: StringKey },

    #[error(
        "The Relay Rosolver backing this field is missing a '{key}' argument in its `@relay_resolver` directive."
    )]
    MissingRelayResolverKeyArg { key: StringKey },

    #[error(
        "Unexpected directive on Relay Resolver field. Relay Resolver fields do not currently support directives."
    )]
    RelayResolverUnexpectedDirective {},

    #[error(
        "The Relay Resolver backing this field is defined with an invalid `fragment_name`. Could not find a fragment named '{fragment_name}'."
    )]
    InvalidRelayResolverFragmentName { fragment_name: StringKey },
}
