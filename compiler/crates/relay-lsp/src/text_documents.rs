/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities related to LSP text document syncing

use crate::{lsp_runtime_error::LSPRuntimeResult, server::GlobalState};

use lsp_types::{
    notification::{
        Cancel, DidChangeTextDocument, DidCloseTextDocument, DidOpenTextDocument,
        DidSaveTextDocument, Notification,
    },
    DidChangeTextDocumentParams, DidOpenTextDocumentParams, TextDocumentItem,
};

pub(crate) fn on_did_open_text_document(
    lsp_state: &impl GlobalState,
    params: <DidOpenTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    let DidOpenTextDocumentParams { text_document } = params;
    let TextDocumentItem { text, uri, .. } = text_document;
    if !uri
        .path()
        .starts_with(lsp_state.root_dir().to_string_lossy().as_ref())
    {
        return Ok(());
    }

    if let Some(js_server) = lsp_state.get_js_language_sever() {
        js_server.process_js_source(&uri, &text);
    }

    // First we check to see if this document has any GraphQL documents.
    let graphql_sources = extract_graphql::parse_chunks(&text);
    if graphql_sources.is_empty() {
        Ok(())
    } else {
        lsp_state.process_synced_sources(&uri, graphql_sources)
    }
}

#[allow(clippy::unnecessary_wraps)]
pub(crate) fn on_did_close_text_document(
    lsp_state: &impl GlobalState,
    params: <DidCloseTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    let uri = params.text_document.uri;
    if !uri
        .path()
        .starts_with(lsp_state.root_dir().to_string_lossy().as_ref())
    {
        return Ok(());
    }

    if let Some(js_server) = lsp_state.get_js_language_sever() {
        js_server.remove_js_source(&uri);
    }
    lsp_state.remove_synced_sources(&uri);
    Ok(())
}

pub(crate) fn on_did_change_text_document(
    lsp_state: &impl GlobalState,
    params: <DidChangeTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    let DidChangeTextDocumentParams {
        content_changes,
        text_document,
    } = params;
    let uri = text_document.uri;
    if !uri
        .path()
        .starts_with(lsp_state.root_dir().to_string_lossy().as_ref())
    {
        return Ok(());
    }

    // We do full text document syncing, so the new text will be in the first content change event.
    let content_change = content_changes
        .first()
        .expect("content_changes should always be non-empty");

    if let Some(js_server) = lsp_state.get_js_language_sever() {
        js_server.process_js_source(&uri, &content_change.text);
    }


    // First we check to see if this document has any GraphQL documents.
    let graphql_sources = extract_graphql::parse_chunks(&content_change.text);
    if graphql_sources.is_empty() {
        lsp_state.remove_synced_sources(&uri);

        Ok(())
    } else {
        lsp_state.process_synced_sources(&uri, graphql_sources)
    }
}

#[allow(clippy::unnecessary_wraps)]
pub(crate) fn on_did_save_text_document(
    _lsp_state: &impl GlobalState,
    _params: <DidSaveTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    Ok(())
}

#[allow(clippy::unnecessary_wraps)]
pub(crate) fn on_cancel(
    _lsp_state: &impl GlobalState,
    _params: <Cancel as Notification>::Params,
) -> LSPRuntimeResult<()> {
    Ok(())
}
