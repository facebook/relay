/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use lsp_types::request::Request;

use crate::LSPRuntimeResult;

use super::GlobalState;

pub(crate) struct HeartbeatRequest;

impl Request for HeartbeatRequest {
    type Params = ();
    type Result = String;
    const METHOD: &'static str = "relay/heartbeat";
}

#[allow(clippy::unnecessary_wraps)]
pub(crate) fn on_heartbeat(
    _state: &impl GlobalState,
    _params: <HeartbeatRequest as Request>::Params,
) -> LSPRuntimeResult<<HeartbeatRequest as Request>::Result> {
    Ok("Connected.".to_string())
}
