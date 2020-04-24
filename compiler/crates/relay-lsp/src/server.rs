/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::error::Error;

use lsp_types::{
    notification::{Notification, ShowMessage},
    InitializeParams, MessageType, ServerCapabilities, ShowMessageParams,
};

use lsp_server::{Connection, Message, Notification as ServerNotification};

/// Initializes an LSP connection, handling the `initize` message and `initialized` notification
/// handshake.
pub fn initialize(
    connection: &Connection,
) -> Result<InitializeParams, Box<dyn Error + Sync + Send>> {
    let server_capabilities = serde_json::to_value(&ServerCapabilities::default()).unwrap();
    let params = connection.initialize(server_capabilities)?;
    let params: InitializeParams = serde_json::from_value(params).unwrap();
    Ok(params)
}

/// Run the main server loop
pub fn run(
    connection: &Connection,
    _params: InitializeParams,
) -> Result<(), Box<dyn Error + Sync + Send>> {
    show_info_message("Relay Language Server Started", connection)?;
    for msg in &connection.receiver {
        match msg {
            Message::Request(_req) => {}
            Message::Response(_resp) => {}
            Message::Notification(_not) => {}
        }
    }
    Ok(())
}

fn show_info_message(
    message: impl Into<String>,
    connection: &Connection,
) -> Result<(), Box<dyn Error + Sync + Send>> {
    let notif = ServerNotification::new(
        ShowMessage::METHOD.into(),
        ShowMessageParams {
            typ: MessageType::Info,
            message: message.into(),
        },
    );
    connection.sender.send(Message::Notification(notif))?;
    Ok(())
}
