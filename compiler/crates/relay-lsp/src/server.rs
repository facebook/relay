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

use relay_compiler::compiler::Compiler;
use relay_compiler::config::Config;

use std::path::PathBuf;

use log::info;

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
pub async fn run(
    connection: &Connection,
    _params: InitializeParams,
) -> Result<(), Box<dyn Error + Sync + Send>> {
    show_info_message("Relay Language Server Started", connection)?;

    // TODO(brandondail) don't hardcode the test project config here
    let home = std::env::var("HOME").unwrap();
    let config_path = PathBuf::from(format!(
        "{}/fbsource/fbcode/relay/config/config.test.json",
        home
    ));

    let root_dir = PathBuf::from(format!("{}/fbsource", home));
    let mut config = Config::load(root_dir, config_path).unwrap();

    // Don't write artifacts by default
    config.write_artifacts = false;

    info!("Compiler config: {:#?}", config);

    let compiler = Compiler::new(config);

    match compiler.compile(None).await {
        Ok(_) => {
            info!("Compiled project successfully");
        }
        Err(_) => {
            info!("Failed to compile project");
        }
    }

    for msg in &connection.receiver {
        match msg {
            Message::Request(req) => {
                info!("Request: {:?}", req);
            }
            Message::Response(resp) => {
                info!("Request: {:?}", resp);
            }
            Message::Notification(notif) => {
                info!("Notification: {:?}", notif);
            }
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
