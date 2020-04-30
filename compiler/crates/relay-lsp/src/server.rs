/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::error::Error;

use lsp_types::{
    notification::{DidOpenTextDocument, Notification, ShowMessage},
    InitializeParams, MessageType, ServerCapabilities, ShowMessageParams,
    TextDocumentSyncCapability, TextDocumentSyncKind,
};

use lsp_server::{Connection, Message, Notification as ServerNotification};

use relay_compiler::compiler::Compiler;
use relay_compiler::config::Config;

use std::path::PathBuf;

use log::info;

use tokio::sync::mpsc;

/// Initializes an LSP connection, handling the `initize` message and `initialized` notification
/// handshake.
pub fn initialize(
    connection: &Connection,
) -> Result<InitializeParams, Box<dyn Error + Sync + Send>> {
    let mut server_capabilities = ServerCapabilities::default();
    // Enable text document syncing so we can know when files are opened/changed/saved/closed
    server_capabilities.text_document_sync =
        Some(TextDocumentSyncCapability::Kind(TextDocumentSyncKind::Full));

    let server_capabilities = serde_json::to_value(&server_capabilities).unwrap();
    let params = connection.initialize(server_capabilities)?;
    let params: InitializeParams = serde_json::from_value(params).unwrap();
    Ok(params)
}

#[derive(Debug)]
pub enum CompilerMessage {
    Initialize,
}

/// Run the main server loop
pub async fn run(
    connection: Connection,
    _params: InitializeParams,
) -> Result<(), Box<dyn Error + Sync + Send>> {
    show_info_message("Relay Language Server Started!", &connection)?;
    info!("Running language server");

    // We use an MPSC channel to communicate between the LSP server loop and
    // the compiler. That way running compiler doesn't block us from receiving
    // LSP messages.
    let (mut tx, mut rx) = mpsc::channel::<CompilerMessage>(100);

    let receiver = connection.receiver.clone();

    // Thread for the LSP message loop
    tokio::spawn(async move {
        for msg in receiver {
            match msg {
                Message::Request(req) => {
                    info!("Request: {:#?}", req);
                }
                Message::Response(resp) => {
                    info!("Request: {:#?}", resp);
                }
                Message::Notification(notif) => {
                    info!("Got a notification: {:#?}", notif);

                    if notif.method == DidOpenTextDocument::METHOD {
                        // Lazily start the compiler once a relevant file is opened
                        if tx.send(CompilerMessage::Initialize).await.is_err() {
                            return;
                        }
                    }
                }
            }
        }
    });

    info!("Starting to wait for receiver messages");

    let mut is_compiler_running = false;

    while let Some(res) = rx.recv().await {
        match res {
            CompilerMessage::Initialize => {
                if !is_compiler_running {
                    is_compiler_running = true;
                    info!("Initializing compiler...");

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

                    let compiler = Compiler::new(config);

                    match compiler.compile(None).await {
                        Ok(_) => info!("Compiled successfully"),
                        Err(_) => {
                            show_info_message("Failed to compile", &connection)?;
                            info!("Error!");
                        }
                    }
                }
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
