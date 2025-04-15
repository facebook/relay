/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities related to LSP text document syncing

use lsp_types::DidChangeTextDocumentParams;
use lsp_types::DidOpenTextDocumentParams;
use lsp_types::TextDocumentItem;
use lsp_types::notification::Cancel;
use lsp_types::notification::DidChangeTextDocument;
use lsp_types::notification::DidCloseTextDocument;
use lsp_types::notification::DidOpenTextDocument;
use lsp_types::notification::DidSaveTextDocument;
use lsp_types::notification::Notification;

use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;
use crate::utils::is_file_uri_in_dir;

pub fn on_did_open_text_document(
    lsp_state: &impl GlobalState,
    params: <DidOpenTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    let DidOpenTextDocumentParams { text_document } = params;
    let TextDocumentItem { text, uri, .. } = text_document;

    if !is_file_uri_in_dir(lsp_state.root_dir(), &uri) {
        return Ok(());
    }

    lsp_state.document_opened(&uri, &text)
}

#[allow(clippy::unnecessary_wraps)]
pub fn on_did_close_text_document(
    lsp_state: &impl GlobalState,
    params: <DidCloseTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    let uri = params.text_document.uri;

    if !is_file_uri_in_dir(lsp_state.root_dir(), &uri) {
        return Ok(());
    }

    lsp_state.document_closed(&uri)
}

pub fn on_did_change_text_document(
    lsp_state: &impl GlobalState,
    params: <DidChangeTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    let DidChangeTextDocumentParams {
        content_changes,
        text_document,
    } = params;
    let uri = text_document.uri;

    if !is_file_uri_in_dir(lsp_state.root_dir(), &uri) {
        return Ok(());
    }

    // We do full text document syncing, so the new text will be in the first content change event.
    let content_change = content_changes
        .first()
        .expect("content_changes should always be non-empty");

    lsp_state.document_changed(&uri, &content_change.text)
}

#[allow(clippy::unnecessary_wraps)]
pub(crate) fn on_did_save_text_document(
    _lsp_state: &impl GlobalState,
    _params: <DidSaveTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    Ok(())
}

#[allow(clippy::unnecessary_wraps)]
pub fn on_cancel(
    _lsp_state: &impl GlobalState,
    _params: <Cancel as Notification>::Params,
) -> LSPRuntimeResult<()> {
    Ok(())
}
