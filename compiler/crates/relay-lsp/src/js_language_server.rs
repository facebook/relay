/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{lsp_runtime_error::LSPRuntimeResult, LSPRuntimeError, Schemas};
use common::PerfLogger;
use lsp_types::{
    request::{Completion, Request},
    Url,
};

/// Interface for the LSP server to handle JavaScript text
pub trait JSLanguageServer<TPerfLogger: PerfLogger + 'static> {
    fn process_js_source(&mut self, url: &Url, text: &str);
    fn remove_js_source(&mut self, url: &Url);
    fn on_complete(
        &self,
        params: &<Completion as Request>::Params,
        schemas: Schemas,
    ) -> LSPRuntimeResult<<Completion as Request>::Result>;
}
#[derive(Default)]
pub struct NoopJSLanguageServer;
impl<TPerfLogger: PerfLogger + 'static> JSLanguageServer<TPerfLogger> for NoopJSLanguageServer {
    fn process_js_source(&mut self, _: &Url, _: &str) {}

    fn remove_js_source(&mut self, _: &Url) {}

    fn on_complete(
        &self,
        _: &<Completion as Request>::Params,
        _: Schemas,
    ) -> LSPRuntimeResult<<Completion as Request>::Result> {
        Err(LSPRuntimeError::ExpectedError)
    }
}
