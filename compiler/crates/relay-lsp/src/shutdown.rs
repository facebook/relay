/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::PerfLogger;
use lsp_types::{
    notification::{Exit, Notification},
    request::{Request, Shutdown},
};

use crate::{lsp_runtime_error::LSPRuntimeResult, server::LSPState};

pub(crate) fn on_shutdown<TPerfLogger: PerfLogger + 'static>(
    _state: &mut LSPState<TPerfLogger>,
    _params: <Shutdown as Request>::Params,
) -> LSPRuntimeResult<<Shutdown as Request>::Result> {
    std::process::exit(0);
}

pub(crate) fn on_exit<TPerfLogger: PerfLogger + 'static>(
    _state: &mut LSPState<TPerfLogger>,
    _params: <Exit as Notification>::Params,
) -> LSPRuntimeResult<()> {
    std::process::exit(0);
}
