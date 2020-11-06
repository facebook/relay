/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reading, writing, and transforming data for the LSP service
// We use two crates, lsp_types and lsp_server, for interacting with LSP. This module re-exports
// types from both so that we have a central source-of-truth for all LSP-related utilities.
use crate::error::Result;
use common::Location;
use crossbeam::crossbeam_channel::Sender;
pub use lsp_server::{Connection, Message};
pub use lsp_server::{
    Notification as ServerNotification, ProtocolError, Request as ServerRequest,
    RequestId as ServerRequestId, Response as ServerResponse,
};
pub use lsp_types::{notification::*, request::*, *};
use serde::{Deserialize, Serialize};
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
    let canonical_path = fs::canonicalize(root_dir.join(file_path)).ok()?;
    Url::from_file_path(canonical_path).ok()
}

#[derive(Debug)]
pub enum ShowStatus {}

#[derive(Debug, PartialEq, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShowStatusParams {
    #[serde(rename = "type")]
    pub typ: MessageType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub progress: Option<Progress>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uri: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub short_message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actions: Option<Vec<MessageActionItem>>,
}

#[derive(Debug, PartialEq, Clone, Deserialize, Serialize)]
pub struct Progress {
    numerator: f32,
    denominator: Option<f32>,
}

impl Request for ShowStatus {
    type Params = ShowStatusParams;
    type Result = ();
    const METHOD: &'static str = "window/showStatus";
}

pub fn set_ready_status(sender: &Sender<Message>) {
    update_status(
        Some("Relay: ready".into()),
        Some("Relay: ready".into()),
        MessageType::Info,
        sender,
    );
}

pub fn set_running_status(sender: &Sender<Message>) {
    update_status(
        Some("Relay: compiling".into()),
        Some("Relay: compiling".into()),
        MessageType::Warning,
        sender,
    );
}

fn update_status(
    short_message: Option<String>,
    message: Option<String>,
    typ: MessageType,
    sender: &Sender<Message>,
) {
    let request = ServerRequest::new(
        ShowStatus::METHOD.to_string().into(),
        ShowStatus::METHOD.into(),
        ShowStatusParams {
            typ,
            progress: None,
            uri: None,
            message,
            short_message,
            actions: None,
        },
    );
    sender.send(Message::Request(request)).unwrap();
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
    sender: &Sender<Message>,
) -> Result<()> {
    let notif = ServerNotification::new(PublishDiagnostics::METHOD.into(), diagnostic_params);
    sender
        .send(Message::Notification(notif))
        .unwrap_or_else(|_| {
            // TODO(brandondail) log here
        });
    Ok(())
}
