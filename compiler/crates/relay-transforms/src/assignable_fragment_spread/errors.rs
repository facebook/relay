/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::FragmentDefinitionName;
use intern::string_key::StringKey;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ValidationMessage {
    #[error(
        "The @{disallowed_directive_name} directive is not allowed on assignable fragment spreads."
    )]
    AssignableFragmentSpreadNoOtherDirectives {
        disallowed_directive_name: StringKey,
    },

    #[error("Assignable fragments can only be nested within at most a single inline fragment.")]
    AssignableFragmentSpreadContainingInlineFragmentSingleNesting,

    #[error("Top-level spreads of assignable fragments are not supported.")]
    AssignableNoTopLevelFragmentSpreads,

    #[error(
        "Assignable fragments should contain only a single, unaliased __typename field with no directives."
    )]
    AssignableOnlyUnaliasedTypenameFieldWithNoDirectives,

    #[error("The @{disallowed_directive_name} directive is not allowed on assignable fragments.")]
    AssignableDisallowOtherDirectives {
        disallowed_directive_name: StringKey,
    },

    #[error(
        "Only fragments decorated with the @assignable directive can be spread within updatable {outer_type_plural}. You can try adding the @assignable directive to the fragment {fragment_name}."
    )]
    UpdatableOnlyAssignableFragmentSpreads {
        outer_type_plural: &'static str,
        fragment_name: FragmentDefinitionName,
    },

    #[error(
        "Within updatable {outer_type_plural}, if an assignable fragment is spread on a linked field, the fragment's type (`{fragment_type}`) must be equal to or a subtype of the field's type (`{field_type}`)."
    )]
    UpdatableSpreadOfAssignableFragmentMustBeEqualToOrSubtypeOfOuterField {
        outer_type_plural: &'static str,
        fragment_type: StringKey,
        field_type: StringKey,
    },

    #[error(
        "The @{disallowed_directive_name} directive is not allowed in updatable {outer_type_plural}."
    )]
    UpdatableDisallowOtherDirectives {
        disallowed_directive_name: StringKey,
        outer_type_plural: &'static str,
    },

    #[error(
        "Fields defined using Relay Resolvers are not not allowed within @updatable operations."
    )]
    UpdatableDisallowRealyResolvers,

    #[error("The directives @include and @skip are not allowed within {outer_type_plural}.")]
    UpdatableNoConditions { outer_type_plural: &'static str },

    #[error(
        "Within updatable {outer_type_plural}, if a linked field contains an inline fragment spread, it must contain only inline fragment spreads."
    )]
    UpdatableOnlyInlineFragments { outer_type_plural: &'static str },

    #[error(
        "Within updatable {outer_type_plural}, inline fragments are only allowed on interfaces or unions, not on concrete types. In updatable queries, each inline fragment must have a type conditions, so no inline fragment would make sense here."
    )]
    UpdatableInlineFragmentsOnlyOnInterfacesOrUnions { outer_type_plural: &'static str },

    #[error(
        "Within updatable {outer_type_plural}, each inline fragment spread must have a type condition. An inline fragment without a type condition was among the selections of {parent_field_type}."
    )]
    UpdatableInlineFragmentsRequireTypeConditions {
        outer_type_plural: &'static str,
        parent_field_type: StringKey,
    },

    #[error(
        "Within updatable {outer_type_plural}, each inline fragment spread must have a type condition narrowing the type to a unique concrete type. `{type_condition}` is not a concrete type."
    )]
    UpdatableInlineFragmentsTypeConditionsMustBeConcrete {
        outer_type_plural: &'static str,
        type_condition: StringKey,
    },

    #[error(
        "Within updatable {outer_type_plural}, a single linked field cannot have multiple inline fragments with the same type condition. However, within {parent_field_alias_or_name}, there were multiple inline fragments narrowing the type to `{type_condition}`."
    )]
    UpdatablePreviouslyEncounteredTypeCondition {
        outer_type_plural: &'static str,
        type_condition: StringKey,
        parent_field_alias_or_name: StringKey,
    },

    #[error(
        "Within updatable {outer_type_plural}, each inline fragment spread must contain an unaliased typename field. However, within {parent_field_alias_or_name}, there are inline fragments without typename fields."
    )]
    UpdatableInlineFragmentsMustHaveTypenameFields {
        outer_type_plural: &'static str,
        parent_field_alias_or_name: StringKey,
    },

    #[error(
        "Within updatable {outer_type_plural}, an inline fragment cannot occur immediately within another inline fragment. Found within {operation_or_fragment_name}. This is because all inline fragments must have type conditions and narrow the type from an abstract type to a concrete type."
    )]
    UpdatableNoNestedInlineFragments {
        outer_type_plural: &'static str,
        operation_or_fragment_name: StringKey,
    },

    #[error("Directives are not allowed on spreads of updatable fragments.")]
    UpdatableFragmentSpreadNoDirectives,

    #[error("Updatable fragments cannot be spread at the top level.")]
    UpdatableFragmentTopLevel,

    #[error("Updatable fragments cannot be contained in @skip or @if.")]
    UpdatableFragmentSpreadNoCondition,

    #[error("Updatable fragments can only be nested within at most a single inline fragment.")]
    UpdatableFragmentSpreadContainingInlineFragmentSingleNesting,

    #[error(
        "This updatable fragment has type `{updatable_fragment_type}`, and is found within a linked field with type `{linked_field_type}`. However, if a record has the type `{linked_field_inner_type}`, it does not necessarily have the type `{updatable_fragment_type}`."
    )]
    UpdatableFragmentSpreadSubtypeOrEqualLinkedField {
        updatable_fragment_type: StringKey,
        linked_field_type: String,
        linked_field_inner_type: StringKey,
    },

    #[error(
        "Because {reason_message}, this linked field must have an abstract type, meaning its type must be an Interface or a Union. However, `{linked_field_type}` is a `{linked_field_type_variant}`."
    )]
    EnsureDiscriminatedUnionConcreteOuterLinkedField {
        reason_message: &'static str,
        linked_field_type: StringKey,
        linked_field_type_variant: String,
    },

    #[error(
        "Because {reason_message}, this linked field can only contain inline fragments, and any inline fragments cannot have @skip or @include."
    )]
    EnsureDiscriminatedUnionNonInlineFragment { reason_message: &'static str },

    #[error(
        "Because {reason_message}, each of this linked field's selections must be an inline fragment with no directives, refining the type to a unique concrete type and containing an unaliased __typename field with no directives. However, an inline fragment in this linked field does not refine to a concrete type."
    )]
    EnsureDiscriminatedUnionInlineFragmentNotRefineToConcreteType { reason_message: &'static str },

    #[error(
        "Because {reason_message}, each of this linked field's selections must be an inline fragment with no directives, refining the type to a unique concrete type and containing an unaliased __typename field with no directives. However, multiple inline fragments in this linked field refine to the concrete type `{concrete_type}`."
    )]
    EnsureDiscriminatedUnionInlineFragmentDuplicateConcreteTypeRefinement {
        concrete_type: StringKey,
        reason_message: &'static str,
    },

    #[error(
        "Because {reason_message}, each of this linked field's selections must be an inline fragment with no directives, refining the type to a unique concrete type and containing an unaliased __typename field with no directives. However, an inline fragment in this linked field does not contain an unaliased __typename selection with no directives."
    )]
    EnsureDiscriminatedUnionInlineFragmentNoValidTypename { reason_message: &'static str },

    #[error(
        "Because {reason_message}, each of this linked field's selections must be an inline fragment with no directives, refining the type to a unique concrete type and containing an unaliased __typename field with no directives. However, an inline fragment in this linked field contains directives."
    )]
    EnsureDiscriminatedUnionNoInlineFragmentWithDirectives { reason_message: &'static str },
}
