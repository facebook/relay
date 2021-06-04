/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities related to LSP text document syncing

use crate::{
    lsp::{DidChangeTextDocumentParams, DidOpenTextDocumentParams, TextDocumentItem},
    lsp_runtime_error::LSPRuntimeResult,
    server::LSPState,
};

use common::PerfLogger;
use lsp_types::notification::{
    Cancel, DidChangeTextDocument, DidCloseTextDocument, DidOpenTextDocument, DidSaveTextDocument,
    Notification,
};

pub(crate) fn on_did_open_text_document<TPerfLogger: PerfLogger + 'static>(
    lsp_state: &mut LSPState<TPerfLogger>,
    params: <DidOpenTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    let DidOpenTextDocumentParams { text_document } = params;
    let TextDocumentItem { text, uri, .. } = text_document;
    if !uri.path().starts_with(lsp_state.root_dir_str()) {
        return Ok(());
    }
    lsp_state.js_resource.process_js_source(&uri, &text);

    // First we check to see if this document has any GraphQL documents.
    let graphql_sources = extract_graphql::parse_chunks(&text);
    if graphql_sources.is_empty() {
        Ok(())
    } else {
        lsp_state.process_synced_sources(uri, graphql_sources)
    }
}

#[allow(clippy::unnecessary_wraps)]
pub(crate) fn on_did_close_text_document<TPerfLogger: PerfLogger + 'static>(
    lsp_state: &mut LSPState<TPerfLogger>,
    params: <DidCloseTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    let uri = params.text_document.uri;
    if !uri.path().starts_with(lsp_state.root_dir_str()) {
        return Ok(());
    }
    lsp_state.js_resource.remove_js_source(&uri);
    lsp_state.remove_synced_sources(&uri);
    Ok(())
}

pub(crate) fn on_did_change_text_document<TPerfLogger: PerfLogger + 'static>(
    lsp_state: &mut LSPState<TPerfLogger>,
    params: <DidChangeTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    let DidChangeTextDocumentParams {
        content_changes,
        text_document,
    } = params;
    let uri = text_document.uri;
    if !uri.path().starts_with(lsp_state.root_dir_str()) {
        return Ok(());
    }

    // We do full text document syncing, so the new text will be in the first content change event.
    let content_change = content_changes
        .first()
        .expect("content_changes should always be non-empty");

    lsp_state
        .js_resource
        .process_js_source(&uri, &content_change.text);

    // First we check to see if this document has any GraphQL documents.
    let graphql_sources = extract_graphql::parse_chunks(&content_change.text);
    if graphql_sources.is_empty() {
        lsp_state.remove_synced_sources(&uri);

        Ok(())
    } else {
        lsp_state.process_synced_sources(uri, graphql_sources)
    }
}

#[allow(clippy::unnecessary_wraps)]
pub(crate) fn on_did_save_text_document<TPerfLogger: PerfLogger + 'static>(
    _lsp_state: &mut LSPState<TPerfLogger>,
    _params: <DidSaveTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    Ok(())
}

#[allow(clippy::unnecessary_wraps)]
pub(crate) fn on_cancel<TPerfLogger: PerfLogger + 'static>(
    _lsp_state: &mut LSPState<TPerfLogger>,
    _params: <Cancel as Notification>::Params,
) -> LSPRuntimeResult<()> {
    Ok(())
}
