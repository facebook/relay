/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reading, writing, and transforming data for the LSP service
// We use two crates, lsp_types and lsp_server, for interacting with LSP. This module re-exports
// types from both so that we have a central source-of-truth for all LSP-related utilities.
pub use lsp_server::{Connection, Message};
pub use lsp_types::{notification::*, request::*, *};

use crate::error::Result;

use common::Location;
pub use lsp_server::{
    Notification as ServerNotification, ProtocolError, Request as ServerRequest,
    RequestId as ServerRequestId, Response as ServerResponse,
};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone)]
pub enum LSPBridgeMessage {
    #[allow(dead_code)]
    CompletionRequest {
        request_id: ServerRequestId,
        params: CompletionParams,
    },
    DidOpenTextDocument(DidOpenTextDocumentParams),
    DidChangeTextDocument(DidChangeTextDocumentParams),
    DidCloseTextDocument(DidCloseTextDocumentParams),
}

/// Converts a Location to a Url pointing to the canonical path based on the root_dir provided.
/// Returns None if we are unable to do the conversion
pub fn url_from_location(location: Location, root_dir: &PathBuf) -> Option<Url> {
    let file_path = location.source_location().path();
    if let Ok(canonical_path) = fs::canonicalize(root_dir.join(file_path)) {
        Url::from_file_path(canonical_path).ok()
    } else {
        None
    }
}

/// Show a notification in the client
pub fn show_info_message(message: impl Into<String>, connection: &Connection) -> Result<()> {
    let notif = ServerNotification::new(
        ShowMessage::METHOD.into(),
        ShowMessageParams {
            typ: MessageType::Info,
            message: message.into(),
        },
    );
    connection
        .sender
        .send(Message::Notification(notif))
        .unwrap_or_else(|_| {
            // TODO(brandondail) log here
        });
    Ok(())
}

/// Publish diagnostics to the client
pub fn publish_diagnostic(
    diagnostic_params: PublishDiagnosticsParams,
    connection: &Connection,
) -> Result<()> {
    let notif = ServerNotification::new(PublishDiagnostics::METHOD.into(), diagnostic_params);
    connection
        .sender
        .send(Message::Notification(notif))
        .unwrap_or_else(|_| {
            // TODO(brandondail) log here
        });
    Ok(())
}
