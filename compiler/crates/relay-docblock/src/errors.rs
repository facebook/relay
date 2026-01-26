/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticDisplay;
use common::InterfaceName;
use common::WithDiagnosticData;
use intern::string_key::StringKey;
use schema::suggestion_list::did_you_mean;
use thiserror::Error;

use crate::ON_INTERFACE_FIELD;
use crate::ON_TYPE_FIELD;
use crate::untyped_representation::AllowedFieldName;

#[derive(
    Clone,
    Debug,
    Error,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    serde::Serialize
)]
#[serde(tag = "type")]
pub enum UntypedRepresentationErrorMessages {
    #[error("Unexpected docblock field `@{field_name}`")]
    UnknownField { field_name: StringKey },

    #[error("Unexpected duplicate docblock field `@{field_name}`")]
    DuplicateField { field_name: AllowedFieldName },

    #[error(
        "Unexpected free text. Free text in a `@RelayResolver` docblock is treated as the field's human-readable description. Only one description is permitted."
    )]
    MultipleDescriptions,
}

#[derive(
    Clone,
    Debug,
    Error,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    serde::Serialize
)]
#[serde(tag = "type")]
pub enum IrParsingErrorMessages {
    #[error("Missing docblock field `@{field_name}`")]
    MissingField { field_name: AllowedFieldName },

    #[error("Expected docblock field `@{field_name}` to have specified a value.")]
    MissingFieldValue { field_name: AllowedFieldName },

    #[error(
        "Unexpected `@{field_1}` and `@{field_2}`. Only one of these docblock fields should be defined on a given `@RelayResolver`."
    )]
    IncompatibleFields {
        field_1: AllowedFieldName,
        field_2: AllowedFieldName,
    },

    #[error(
        "Expected either `@{field_1}` or `@{field_2}` to be defined in this `@RelayResolver` docblock."
    )]
    ExpectedOneOrTheOther {
        field_1: AllowedFieldName,
        field_2: AllowedFieldName,
    },

    // The rest of this sentence is expected to be supplied by `.annotate`.
    #[error("Unexpected conflicting argument name. This field argument")]
    ConflictingArguments,

    #[error(
        "The compiler attempted to parse \"{user_provided}\" as a GraphQL type (e.g. `Viewer` or `User`), but had unparsed characters remaining. Try removing everything after \"{parsed}\"."
    )]
    RemainingCharsWhenParsingIdentifier {
        user_provided: StringKey,
        parsed: StringKey,
    },

    #[error(
        "The `@RelayResolver` field `@{field_name}` does not accept data. Remove everything after `@{field_name}`."
    )]
    FieldWithUnexpectedData { field_name: AllowedFieldName },

    #[error("The `@RelayResolver` field `@{field_name}` requires data.")]
    FieldWithMissingData { field_name: AllowedFieldName },

    #[error(
        "Unexpected Relay Resolver field with non-nullable type. Relay expects all Resolver fields to be nullable since errors thrown by Resolvers are turned into `null` values."
    )]
    FieldWithNonNullType,

    #[error(
        "The compiler attempted to parse this `@RelayResolver` block as a {resolver_type}, but there were unexpected fields: {field_string}."
    )]
    LeftoverFields {
        resolver_type: &'static str,
        field_string: String,
    },

    #[error("Defining arguments with default values for resolver fields is not supported, yet.")]
    ArgumentDefaultValuesNoSupported,

    #[error("Unexpected non-nullable type given in `@edgeTo`.")]
    UnexpectedNonNullableEdgeTo,

    #[error("Unexpected non-nullable item in list type given in `@edgeTo`.")]
    UnexpectedNonNullableItemInListEdgeTo,

    #[error(
        "The type specified in the fragment (`{fragment_type_condition}`) and the type specified in `@{on_field_name}` (`{on_field_value}`) are different. Please make sure these are exactly the same."
    )]
    MismatchRootFragmentTypeCondition {
        fragment_type_condition: StringKey,
        on_field_name: AllowedFieldName,
        on_field_value: StringKey,
    },

    #[error(
        "The type specified in the fragment (`{fragment_type_condition}`) and the parent type (`{type_name}`) are different. Please make sure these are exactly the same."
    )]
    MismatchRootFragmentTypeConditionTerseSyntax {
        fragment_type_condition: StringKey,
        type_name: StringKey,
    },

    #[error(
        "Unexpected character \"{found}\". Expected `@RelayResolver` field to either be a GraphQL typename, or a field definition of the form `ParentType.field_name: ReturnType`."
    )]
    UnexpectedNonDot { found: char },

    #[error(
        "Unexpected `@outputType`. The deprecated `@outputType` option is not enabled for the field `{field_name}`."
    )]
    UnexpectedOutputType { field_name: StringKey },

    #[error(
        "Legacy verbose resolver syntax (@onType, @onInterface, @fieldName) is deprecated. Use the terse syntax instead: @RelayResolver ParentType.fieldName: ReturnType"
    )]
    LegacyVerboseSyntaxDeprecated,
}

#[derive(
    Clone,
    Debug,
    Error,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    serde::Serialize
)]
#[serde(tag = "type")]
pub enum SchemaValidationErrorMessages {
    #[error(
        "Unexpected plural server type in `@edgeTo` field. Currently Relay Resolvers only support plural `@edgeTo` if the type is defined via Client Schema Extensions."
    )]
    ClientEdgeToPluralServerType,

    #[error(
        "Unexpected Relay Resolver for a field which is defined in parent interface. The field `{field_name}` is defined by `{interface_name}`. Relay does not yet support interfaces where different subtypes implement the same field using different Relay Resolvers. As a workaround consider defining Relay Resolver field directly on the interface and checking the `__typename` field to have special handling for different concrete types."
    )]
    ResolverImplementingInterfaceField {
        field_name: StringKey,
        interface_name: InterfaceName,
    },

    #[error("Relay Resolvers may not be used to implement the `{id_field_name}` field.")]
    ResolversCantImplementId { id_field_name: StringKey },

    #[error(
        "The interface `{interface_name}` is not defined in a client schema extension. Resolver types that implement interfaces can only implement client-defined interfaces."
    )]
    UnexpectedServerInterface { interface_name: InterfaceName },

    #[error("Expected interface `{interface_name}` to define an `id: ID!` field.")]
    InterfaceWithNoIdField { interface_name: InterfaceName },

    #[error(
        "Expected interface `{interface_name}` to define an `id: ID!` field. It defines an id field, but its type is `{invalid_type_string}`."
    )]
    InterfaceWithWrongIdField {
        interface_name: InterfaceName,
        invalid_type_string: String,
    },

    #[error(
        "Resolvers on the mutation type {mutation_type_name} are disallowed without the enable_relay_resolver_mutations feature flag"
    )]
    DisallowedMutationResolvers { mutation_type_name: StringKey },

    #[error(
        "Mutation resolver {resolver_field_name} must return a scalar or enum type, got {actual_return_type}"
    )]
    MutationResolverNonScalarReturn {
        resolver_field_name: StringKey,
        actual_return_type: StringKey,
    },

    #[error(
        "Relay Resolvers that return weak types defined in client schema extensions are not supported. Prefer defining the return type using a `@weak` Relay Resolver type: https://relay.dev/docs/next/guides/relay-resolvers/defining-types/#defining-a-weak-type"
    )]
    ClientEdgeToClientWeakType,
}

#[derive(
    Clone,
    Debug,
    Error,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    serde::Serialize
)]
#[serde(tag = "type")]
pub enum ErrorMessagesWithData {
    #[error(
        "Invalid interface given for `@onInterface`. `{interface_name}` is not an existing GraphQL interface.{suggestions}", suggestions = did_you_mean(suggestions))]
    InvalidOnInterface {
        interface_name: StringKey,
        suggestions: Vec<StringKey>,
    },

    #[error("Invalid type given for `@onType`. `{type_name}` is not an existing GraphQL type.{suggestions}", suggestions = did_you_mean(suggestions))]
    InvalidOnType {
        type_name: StringKey,
        suggestions: Vec<StringKey>,
    },

    #[error(
        "Found `@onType` docblock field referring to an interface. Did you mean `@onInterface`?"
    )]
    OnTypeForInterface,

    #[error(
        "Found `@onInterface` docblock field referring to an object type. Did you mean `@onType`?"
    )]
    OnInterfaceForType,

    #[error("Fragment `{fragment_name}` not found.{suggestions}", suggestions = did_you_mean(suggestions))]
    FragmentNotFound {
        fragment_name: StringKey,
        suggestions: Vec<StringKey>,
    },

    #[error("The type `{type_name}` is not an existing GraphQL type.{suggestions}", suggestions = did_you_mean(suggestions))]
    TypeNotFound {
        type_name: StringKey,
        suggestions: Vec<StringKey>,
    },
}

impl WithDiagnosticData for ErrorMessagesWithData {
    fn get_data(&self) -> Vec<Box<dyn DiagnosticDisplay>> {
        match self {
            ErrorMessagesWithData::InvalidOnInterface { suggestions, .. }
            | ErrorMessagesWithData::FragmentNotFound { suggestions, .. }
            | ErrorMessagesWithData::InvalidOnType { suggestions, .. } => suggestions
                .iter()
                .map(|suggestion| into_box(*suggestion))
                .collect::<_>(),
            ErrorMessagesWithData::OnTypeForInterface => vec![into_box(*ON_INTERFACE_FIELD)],
            ErrorMessagesWithData::OnInterfaceForType => vec![into_box(*ON_TYPE_FIELD)],
            ErrorMessagesWithData::TypeNotFound { suggestions, .. } => suggestions
                .iter()
                .map(|suggestion| into_box(*suggestion))
                .collect::<_>(),
        }
    }
}

fn into_box(item: StringKey) -> Box<dyn DiagnosticDisplay> {
    Box::new(item)
}
