/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reading, writing, and transforming data for the LSP service
// We use two crates, lsp_types and lsp_server, for interacting with LSP. This module re-exports
// types from both so that we have a central source-of-truth for all LSP-related utilities.

use crossbeam::channel::{SendError, Sender};
use lsp_server::{Message, Notification as ServerNotification, Request as ServerRequest};
use lsp_types::{
    notification::{Notification, ShowMessage},
    request::Request,
    MessageActionItem, MessageType, ShowMessageParams,
};
use serde::{Deserialize, Serialize};

#[derive(Debug)]
enum ShowStatus {}

#[derive(Debug, PartialEq, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ShowStatusParams {
    #[serde(rename = "type")]
    type_: MessageType,
    #[serde(skip_serializing_if = "Option::is_none")]
    progress: Option<Progress>,
    #[serde(skip_serializing_if = "Option::is_none")]
    uri: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    short_message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    actions: Option<Vec<MessageActionItem>>,
}

#[derive(Debug, PartialEq, Clone, Deserialize, Serialize)]
struct Progress {
    numerator: f32,
    denominator: Option<f32>,
}

impl Request for ShowStatus {
    type Params = ShowStatusParams;
    type Result = ();
    const METHOD: &'static str = "window/showStatus";
}

pub(crate) fn set_ready_status(sender: &Sender<Message>) {
    update_status(
        "Relay: ready",
        Some("The Relay extension is ready"),
        MessageType::Info,
        sender,
    );
}

pub(crate) fn set_error_status(sender: &Sender<Message>, error: impl std::fmt::Display) {
    update_status(
        "Relay: error",
        Some(format!(
            "The Relay extension has errors: {}. Try reloading the IDE. If the error persists, report the issue via appropriate channels.",
            error
        )),
        MessageType::Error,
        sender,
    );
}

pub(crate) fn set_initializing_status(sender: &Sender<Message>) {
    update_in_progress_status(
        "Relay: initializing...",
        Some(
            "The Relay compiler will start when you open a Javascript file containing a graphql literal",
        ),
        sender,
    );
}

pub(crate) fn update_in_progress_status(
    short_message: impl Into<String>,
    message: Option<impl Into<String>>,
    sender: &Sender<Message>,
) {
    update_status(short_message, message, MessageType::Warning, sender);
}

pub fn update_status(
    short_message: impl Into<String>,
    message: Option<impl Into<String>>,
    type_: MessageType,
    sender: &Sender<Message>,
) {
    let request = ServerRequest::new(
        ShowStatus::METHOD.to_string().into(),
        ShowStatus::METHOD.into(),
        ShowStatusParams {
            type_,
            progress: None,
            uri: None,
            message: message.map(|s| s.into()),
            short_message: Some(short_message.into()),
            actions: None,
        },
    );
    sender
        .send(Message::Request(request))
        .expect("update_status: failed to send");
}

/// Show a notification in the client
#[allow(dead_code)]
pub(crate) fn show_info_message(
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
