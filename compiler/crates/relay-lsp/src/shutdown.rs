/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use lsp_types::notification::Exit;
use lsp_types::notification::Notification;
use lsp_types::request::Request;
use lsp_types::request::Shutdown;

use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;

pub fn on_shutdown(
    _state: &impl GlobalState,
    _params: <Shutdown as Request>::Params,
) -> LSPRuntimeResult<<Shutdown as Request>::Result> {
    LSPRuntimeResult::Ok(())
}

pub fn on_exit(
    _state: &impl GlobalState,
    _params: <Exit as Notification>::Params,
) -> LSPRuntimeResult<()> {
    std::process::exit(0);
}
