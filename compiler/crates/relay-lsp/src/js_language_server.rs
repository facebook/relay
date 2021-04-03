/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{lsp_runtime_error::LSPRuntimeResult, server::LSPState, LSPRuntimeError};
use common::PerfLogger;
use lsp_types::{
    request::{CodeActionRequest, Completion, Request},
    Url,
};

/// Interface for the LSP server to handle JavaScript text
pub trait JSLanguageServer<TPerfLogger: PerfLogger + 'static> {
    fn process_js_source(&mut self, url: &Url, text: &str);
    fn remove_js_source(&mut self, url: &Url);
    fn on_complete(
        &self,
        params: &<Completion as Request>::Params,
        state: &LSPState<TPerfLogger>,
    ) -> LSPRuntimeResult<<Completion as Request>::Result>;
    fn on_code_action(
        &self,
        params: &<CodeActionRequest as Request>::Params,
        state: &LSPState<TPerfLogger>,
    ) -> LSPRuntimeResult<<CodeActionRequest as Request>::Result>;
}
#[derive(Default)]
pub struct NoopJSLanguageServer;
impl<TPerfLogger: PerfLogger + 'static> JSLanguageServer<TPerfLogger> for NoopJSLanguageServer {
    fn process_js_source(&mut self, _: &Url, _: &str) {}

    fn remove_js_source(&mut self, _: &Url) {}

    fn on_complete(
        &self,
        _: &<Completion as Request>::Params,
        _: &LSPState<TPerfLogger>,
    ) -> LSPRuntimeResult<<Completion as Request>::Result> {
        Err(LSPRuntimeError::ExpectedError)
    }

    fn on_code_action(
        &self,
        _: &<CodeActionRequest as Request>::Params,
        _: &LSPState<TPerfLogger>,
    ) -> LSPRuntimeResult<<CodeActionRequest as Request>::Result> {
        Err(LSPRuntimeError::ExpectedError)
    }
}
