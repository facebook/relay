/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use thiserror::Error;

#[derive(Error, Debug, serde::Serialize)]
#[serde(tag = "type")]
pub(super) enum ValidationMessage {
    #[error("@catch and @required directives cannot be on the same field")]
    CatchDirectiveWithRequiredDirective,
}
