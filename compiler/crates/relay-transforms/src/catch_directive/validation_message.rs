/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticDisplay;
use common::WithDiagnosticData;
use thiserror::Error;

#[derive(Error, Debug, serde::Serialize)]
#[serde(tag = "type")]
pub(super) enum ValidationMessage {
    #[error("@catch and @required directives cannot be on the same field")]
    CatchDirectiveWithRequiredDirective,
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
pub enum ValidationMessageWithData {
    #[error("Unexpected `@catch` on unaliased inline fragment.")]
    CatchNotValidOnUnaliasedInlineFragment,
}

impl WithDiagnosticData for ValidationMessageWithData {
    fn get_data(&self) -> Vec<Box<dyn DiagnosticDisplay>> {
        match self {
            ValidationMessageWithData::CatchNotValidOnUnaliasedInlineFragment => {
                vec![Box::new("... @alias".to_string())]
            }
        }
    }
}
