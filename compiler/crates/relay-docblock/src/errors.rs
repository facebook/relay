/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{DiagnosticDisplay, WithDiagnosticData};
use intern::string_key::StringKey;
use schema::suggestion_list::did_you_mean;
use thiserror::Error;

use crate::{ON_INTERFACE_FIELD, ON_TYPE_FIELD};

#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ErrorMessages {
    #[error("Unexpected docblock field \"@{field_name}\"")]
    UnknownField { field_name: StringKey },

    #[error("Unexpected duplicate docblock field \"@{field_name}\"")]
    DuplicateField { field_name: StringKey },

    #[error(
        "Unexpected free text. Free text in a @RelayResolver docblock is treated as the field's human readable description. Only one description is permitted."
    )]
    MultipleDescriptions,

    #[error("Missing docblock field \"@{field_name}\"")]
    MissingField { field_name: StringKey },

    #[error("Expected docblock field \"@{field_name}\" to have specified a value.")]
    MissingFieldValue { field_name: StringKey },

    #[error(
        "Unexpected `onType` and `onInterface`. Only one of these docblock fields should be defined on a given @RelayResolver."
    )]
    UnexpectedOnTypeAndOnInterface,

    #[error(
        "Expected either `onType` or `onInterface` to be defined in a @RelayResolver docblock."
    )]
    ExpectedOnTypeOrOnInterface,

    // The rest of this sentence is expected to be supplied by `.annotate`.
    #[error("Unexpected conflicting argument name. This field argument")]
    ConflictingArguments,

    #[error("Unexpected non-nullable type given in `@edgeTo`.")]
    UnexpectedNonNullableEdgeTo,

    // In the future we plan to support this, but not currently
    #[error("Unexpected plural type given in `@edgeTo`.")]
    UnexpectedPluralEdgeTo,

    #[error(
        "The type specified in the fragment (`{fragment_type_condition}`) and the type specified in @onInterface (`{interface_type}`) are different. Please make sure these are exactly the same."
    )]
    MismatchRootFragmentTypeConditionOnInterface {
        fragment_type_condition: StringKey,
        interface_type: StringKey,
    },

    #[error(
        "The type specified in the fragment (`{fragment_type_condition}`) and the type specified in @onType (`{type_name}`) are different. Please make sure these are exactly the same."
    )]
    MismatchRootFragmentTypeConditionOnType {
        fragment_type_condition: StringKey,
        type_name: StringKey,
    },
}

#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ErrorMessagesWithData {
    #[error(
        "Invalid interface given for `onInterface`. \"{interface_name}\" is not an existing GraphQL interface.{suggestions}", suggestions = did_you_mean(suggestions))]
    InvalidOnInterface {
        interface_name: StringKey,
        suggestions: Vec<StringKey>,
    },

    #[error("Invalid type given for `onType`. \"{type_name}\" is not an existing GraphQL type.{suggestions}", suggestions = did_you_mean(suggestions))]
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

    #[error("Fragment \"{fragment_name}\" not found.{suggestions}", suggestions = did_you_mean(suggestions))]
    FragmentNotFound {
        fragment_name: StringKey,
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
        }
    }
}

fn into_box(item: StringKey) -> Box<dyn DiagnosticDisplay> {
    Box::new(item)
}
