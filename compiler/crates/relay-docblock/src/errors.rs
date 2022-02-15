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
}
