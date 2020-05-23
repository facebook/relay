/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities related to LSP text document syncing

use crate::lsp::{
    DidChangeTextDocumentParams, DidCloseTextDocumentParams, DidOpenTextDocumentParams,
    TextDocumentItem, Url,
};

use graphql_syntax::GraphQLSource;
use log::info;
use std::sync::Arc;
use tokio::sync::Notify;

pub type GraphQLTextDocumentCache = std::collections::HashMap<Url, Vec<GraphQLSource>>;

pub fn initialize_compiler_if_contains_graphql(
    params: &DidOpenTextDocumentParams,
    compiler_init_notify: Arc<Notify>,
) {
    let DidOpenTextDocumentParams { text_document } = params;
    let TextDocumentItem { text, .. } = text_document;

    if extract_graphql_sources(&text).is_some() {
        compiler_init_notify.notify();
    }
}

pub fn on_did_open_text_document(
    params: DidOpenTextDocumentParams,
    graphql_source_cache: &mut GraphQLTextDocumentCache,
) {
    info!("Did open text document!");
    let DidOpenTextDocumentParams { text_document } = params;
    let TextDocumentItem { text, uri, .. } = text_document;

    // First we check to see if this document has any GraphQL documents.
    let graphql_sources = match extract_graphql_sources(&text) {
        Some(sources) => sources,
        // Exit early if there are no sources
        None => return,
    };

    // Track the GraphQL sources for this document
    graphql_source_cache.insert(uri, graphql_sources);
}

pub fn on_did_close_text_document(
    params: DidCloseTextDocumentParams,
    graphql_source_cache: &mut GraphQLTextDocumentCache,
) {
    let uri = params.text_document.uri;
    graphql_source_cache.remove(&uri);
}

pub fn on_did_change_text_document(
    params: DidChangeTextDocumentParams,
    graphql_source_cache: &mut GraphQLTextDocumentCache,
) {
    info!("Did change text document!");
    let DidChangeTextDocumentParams {
        content_changes,
        text_document,
    } = params;
    let uri = text_document.uri;

    // We do full text document syncing, so the new text will be in the first content change event.
    let content_change = content_changes
        .first()
        .expect("content_changes should always be non-empty");

    // First we check to see if this document has any GraphQL documents.
    let graphql_sources = match extract_graphql_sources(&content_change.text) {
        Some(sources) => sources,
        // Exit early if there are no sources
        None => return,
    };

    // Update the GraphQL sources for this document
    graphql_source_cache.insert(uri, graphql_sources);
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
        Err(_) => None,
    }
}
