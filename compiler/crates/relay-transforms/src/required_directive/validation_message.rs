/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use thiserror::Error;

#[derive(Error, Debug, serde::Serialize)]
#[serde(tag = "type")]
pub(super) enum ValidationMessage {
    #[error(
        "Unexpected @required within inline fragment on an abstract type. At runtime we cannot know if this field is null, or if it's missing because the inline fragment did not match. Consider using `@alias` to give your inline fragment a name."
    )]
    RequiredWithinAbstractInlineFragment,

    #[error("@required is not supported within @inline fragments.")]
    RequiredWithinInlineDirective,

    #[error("Missing `action` argument. @required expects an `action` argument")]
    RequiredActionArgumentRequired,

    #[error(
        "All references to a @required field must have matching `action` arguments. The `action` used for '{field_name}'"
    )]
    RequiredActionMismatch { field_name: StringKey },

    #[error(
        "All references to a field must have matching @required declarations. The field '{field_name}` is @required here"
    )]
    RequiredFieldMismatch { field_name: StringKey },

    #[error(
        "@required fields must be included in all instances of their parent. The field '{field_name}` is marked as @required here"
    )]
    RequiredFieldMissing { field_name: StringKey },

    #[error(
        "A @required field may not have an `action` less severe than that of its @required parent. This @required directive should probably have `action: {suggested_action}`"
    )]
    RequiredFieldInvalidNesting { suggested_action: StringKey },
}
