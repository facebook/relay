/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use thiserror::Error;

#[derive(Clone, Copy, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
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

    #[error(
        "Invalid interface given for `onInterface`. \"{interface_name}\" is not an existing GraphQL interface."
    )]
    InvalidOnInterface { interface_name: StringKey },

    #[error("Invalid type given for `onType`. \"{type_name}\" is not an existing GraphQL type.")]
    InvalidOnType { type_name: StringKey },
}
