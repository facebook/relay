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
use graphql_syntax::GraphQLSource;
use lsp_types::notification::{
    DidChangeTextDocument, DidCloseTextDocument, DidOpenTextDocument, DidSaveTextDocument,
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

    // First we check to see if this document has any GraphQL documents.
    let graphql_sources = match extract_graphql_sources(&text) {
        Some(sources) => sources,
        // Exit early if there are no sources
        None => return Ok(()),
    };

    let validate_result = lsp_state.validate_synced_sources(uri.clone(), &graphql_sources);
    // Track the GraphQL sources for this document
    lsp_state.insert_synced_sources(uri, graphql_sources);

    validate_result
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

    // First we check to see if this document has any GraphQL documents.
    let graphql_sources = match extract_graphql_sources(&content_change.text) {
        Some(sources) => sources,
        // Remove the item from the cache and exit early if there are no longer any sources
        None => {
            lsp_state.remove_synced_sources(&uri);
            return Ok(());
        }
    };

    let validate_result = lsp_state.validate_synced_sources(uri.clone(), &graphql_sources);
    // Update the GraphQL sources for this document
    lsp_state.insert_synced_sources(uri, graphql_sources);
    validate_result
}

/// Returns a set of *non-empty* GraphQL sources if they exist in a file. Returns `None`
/// if extracting fails or there are no GraphQL chunks in the file.
fn extract_graphql_sources(source: &str) -> Option<Vec<GraphQLSource>> {
    match extract_graphql::parse_chunks(source) {
        Ok(chunks) => {
            if chunks.is_empty() {
                None
            } else {
                Some(chunks)
            }
        }
        // TODO T80565215 handle these errors
        Err(_) => None,
    }
}

#[allow(clippy::unnecessary_wraps)]
pub(crate) fn on_did_save_text_document<TPerfLogger: PerfLogger + 'static>(
    _lsp_state: &mut LSPState<TPerfLogger>,
    _params: <DidSaveTextDocument as Notification>::Params,
) -> LSPRuntimeResult<()> {
    Ok(())
}
