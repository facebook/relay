/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reading, writing, and transforming data for the LSP service
// We use two crates, lsp_types and lsp_server, for interacting with LSP. This module re-exports
// types from both so that we have a central source-of-truth for all LSP-related utilities.
use std::sync::{Arc, RwLock};

use crate::lsp_process_error::LSPProcessResult;
use crate::server::LSPStateError;
use crossbeam::{crossbeam_channel::Sender, SendError};
pub use lsp_server::{Connection, Message};
pub use lsp_server::{
    Notification as ServerNotification, ProtocolError, Request as ServerRequest,
    RequestId as ServerRequestId, Response as ServerResponse,
};
pub use lsp_types::{notification::*, request::*, *};
use serde::{Deserialize, Serialize};

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

pub fn set_actual_server_status(
    sender: &Sender<Message>,
    errors: &Arc<RwLock<Vec<LSPStateError>>>,
) {
    if let Ok(errors) = errors.read() {
        if errors.is_empty() {
            set_ready_status(sender);
        } else {
            set_error_status(sender, &errors)
        }
    } else {
        // Ok, this is not entirely correct to return a ready status here.
        // But the other option would be to surface the "acquire read lock error" to the user,
        // which is too many details for the things we're doing here.
        set_ready_status(sender);
    }
}

fn set_ready_status(sender: &Sender<Message>) {
    update_status(
        Some("Relay: ready".into()),
        Some("Relay: ready".into()),
        MessageType::Info,
        sender,
    );
}

fn set_error_status(sender: &Sender<Message>, errors: &[LSPStateError]) {
    update_status(
        Some("Relay: invalid state".into()),
        Some(format!(
            "Unable to create correct server state:\n{}",
            errors
                .iter()
                .map(|err| err.to_string())
                .collect::<Vec<_>>()
                .join("\n")
        )),
        MessageType::Error,
        sender,
    );
}

pub fn set_starting_status(sender: &Sender<Message>) {
    update_status(
        Some("Relay: starting...".into()),
        Some(
            "The Relay compiler will start when you open a Javascript file containing a graphql literal"
                .into(),
        ),
        MessageType::Warning,
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
    sender
        .send(Message::Request(request))
        .expect("update_status: failed to send");
}

/// Show a notification in the client
#[allow(dead_code)]
pub fn show_info_message(
    sender: &Sender<Message>,
    message: impl Into<String>,
) -> Result<(), SendError<Message>> {
    let notif = ServerNotification::new(
        ShowMessage::METHOD.into(),
        ShowMessageParams {
            typ: MessageType::Info,
            message: message.into(),
        },
    );

    sender.send(Message::Notification(notif))
}

/// Publish diagnostics to the client
pub fn publish_diagnostic(
    diagnostic_params: PublishDiagnosticsParams,
    sender: &Sender<Message>,
) -> LSPProcessResult<()> {
    let notif = ServerNotification::new(PublishDiagnostics::METHOD.into(), diagnostic_params);
    sender
        .send(Message::Notification(notif))
        .unwrap_or_else(|_| {
            // TODO(brandondail) log here
        });
    Ok(())
}
