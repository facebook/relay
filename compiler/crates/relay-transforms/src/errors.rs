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
        "@relay_client_component can only be used on fragments on Viewer or Query, or whose type implements the Node interface. If the fragment's type is a union type, all members of that union must implement Node."
    )]
    InvalidRelayClientComponentNonNodeFragment,

    #[error(
        "The Relay Resolver backing this field has an `@relay_resolver` directive with an invalid '{key}' argument. Expected a literal string value."
    )]
    InvalidRelayResolverKeyArg { key: StringKey },

    #[error(
        "The Relay Resolver backing this field is missing a '{key}' argument in its `@relay_resolver` directive."
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

    #[error(
        "Field with actor change (@as_actor) directive expected to have only one item in its selection, and it should be a fragment spread."
    )]
    ActorChangeInvalidSelection,

    #[error("Actor change directive (@as_actor) cannot be applied to scalar fields.")]
    ActorChangeCannotUseOnScalarFields,

    #[error(
        "Actor change has limited (experimental) support and is not allowed to use on this fragment spread."
    )]
    ActorChangeIsExperimental,

    #[error("Actor change does not support plural fields, yet.")]
    ActorChangePluralFieldsNotSupported,

    #[error(
        "Unexpected Relay Resolver field. The Relay Resolvers feature flag is not currently enabled for this project."
    )]
    RelayResolversDisabled {},

    #[error(
        "The directive '{directive_name}' automatically adds '{actor_change_field}' to the selection of the field '{field_name}'. But the field '{actor_change_field}' does not exist on the type '{type_name}'. Please makes sure the GraphQL schema supports actor change on '{type_name}'."
    )]
    ActorChangeExpectViewerFieldOnType {
        directive_name: StringKey,
        actor_change_field: StringKey,
        field_name: StringKey,
        type_name: StringKey,
    },

    #[error(
        "The directive '{directive_name}' automatically adds '{actor_change_field}' to the selection of the field '{field_name}'. The field '{actor_change_field}' should be defined as a scalar field in the GraphQL Schema, but is defined with the type '{actor_change_field_type}' instead."
    )]
    ActorChangeViewerShouldBeScalar {
        directive_name: StringKey,
        actor_change_field: StringKey,
        field_name: StringKey,
        actor_change_field_type: StringKey,
    },

    #[error(
        "The '{fragment_name}' is transformed to use @no_inline implictly by `@module` or `@relay_client_component`, but it's also used in a regular fragment spread. It's required to explicitly add `@no_inline` to the definition of '{fragment_name}'."
    )]
    RequiredExplicitNoInlineDirective { fragment_name: StringKey },
}
