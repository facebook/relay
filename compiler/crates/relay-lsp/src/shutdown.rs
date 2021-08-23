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
use schema_documentation::SchemaDocumentation;

use crate::{lsp_runtime_error::LSPRuntimeResult, server::LSPState};

pub(crate) fn on_shutdown<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation,
>(
    _state: &mut LSPState<TPerfLogger, TSchemaDocumentation>,
    _params: <Shutdown as Request>::Params,
) -> LSPRuntimeResult<<Shutdown as Request>::Result> {
    std::process::exit(0);
}

pub(crate) fn on_exit<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation,
>(
    _state: &mut LSPState<TPerfLogger, TSchemaDocumentation>,
    _params: <Exit as Notification>::Params,
) -> LSPRuntimeResult<()> {
    std::process::exit(0);
}
