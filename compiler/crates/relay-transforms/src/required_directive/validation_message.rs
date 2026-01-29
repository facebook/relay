/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticDisplay;
use common::WithDiagnosticData;
use intern::string_key::StringKey;
use thiserror::Error;

#[derive(Error, Debug, serde::Serialize)]
#[serde(tag = "type")]
pub(super) enum RequiredDirectiveValidationMessage {
    #[error(
        "Unexpected @required within inline fragment on an abstract type. At runtime we cannot know if this field is null, or if it's missing because the inline fragment did not match. Consider using `@alias` to give your inline fragment a name."
    )]
    WithinAbstractInlineFragment,

    #[error("@required is not supported within @inline fragments.")]
    WithinInlineDirective,

    #[error("Missing `action` argument. @required expects an `action` argument")]
    ActionArgumentRequired,

    #[error(
        "All references to a @required field must have matching `action` arguments. The `action` used for '{field_name}'"
    )]
    ActionMismatch { field_name: StringKey },

    #[error(
        "All references to a field must have matching @required declarations. The field '{field_name}` is @required here"
    )]
    FieldMismatch { field_name: StringKey },

    #[error(
        "@required fields must be included in all instances of their parent. The field '{field_name}` is marked as @required here"
    )]
    FieldMissing { field_name: StringKey },

    #[error(
        "A @required field may not have an `action` less severe than that of its @required parent. This @required directive should probably have `action: {suggested_action}`"
    )]
    FieldInvalidNesting { suggested_action: StringKey },
}

#[derive(Error, Debug, serde::Serialize)]
pub(super) enum RequiredDirectiveValidationMessageWithData {
    #[error(
        "@required with action THROW is not allowed on fields that are semantically nullable. Fields that can legitimately be null should not use the THROW action."
    )]
    ThrowActionOnSemanticNullableFieldWithFix,
    #[error(
        "@required with action DANGEROUSLY_THROW_ON_SEMANTICALLY_NULLABLE_FIELD is not allowed on non-nullable fields. Use action THROW instead."
    )]
    DangerousThrowActionOnNonNullableFieldWithFix,
}

impl WithDiagnosticData for RequiredDirectiveValidationMessageWithData {
    fn get_data(&self) -> Vec<Box<dyn DiagnosticDisplay>> {
        match self {
            RequiredDirectiveValidationMessageWithData::ThrowActionOnSemanticNullableFieldWithFix => {
                vec![Box::new("DANGEROUSLY_THROW_ON_SEMANTICALLY_NULLABLE_FIELD".to_string())]
            }
            RequiredDirectiveValidationMessageWithData::DangerousThrowActionOnNonNullableFieldWithFix => {
                vec![Box::new("THROW".to_string())]
            }
        }
    }
}
