/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::lsp_runtime_error::LSPRuntimeResult;
use lsp_types::{
    request::{CodeActionRequest, Completion, Request},
    Url,
};

/// Interface for the LSP server to handle JavaScript text
pub trait JSLanguageServer: Send + Sync {
    type TState;

    fn process_js_source(&self, url: &Url, text: &str);
    fn remove_js_source(&self, url: &Url);
    fn on_complete(
        &self,
        params: &<Completion as Request>::Params,
        state: &Self::TState,
    ) -> LSPRuntimeResult<<Completion as Request>::Result>;
    fn on_code_action(
        &self,
        params: &<CodeActionRequest as Request>::Params,
        state: &Self::TState,
    ) -> LSPRuntimeResult<<CodeActionRequest as Request>::Result>;
}
