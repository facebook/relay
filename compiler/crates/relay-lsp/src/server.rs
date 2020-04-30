/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::error::Error;

use std::collections::HashSet;

use lsp_types::{
    notification::{DidOpenTextDocument, Notification, PublishDiagnostics, ShowMessage},
    Diagnostic, DiagnosticSeverity, InitializeParams, MessageType, PublishDiagnosticsParams,
    ServerCapabilities, ShowMessageParams, TextDocumentSyncCapability, TextDocumentSyncKind, Url,
};

use lsp_server::{Connection, Message, Notification as ServerNotification};

use relay_compiler::compiler::Compiler;
use relay_compiler::config::Config;
use relay_compiler::errors::{Error as CompilerError, SyntaxErrorWithSource};

use std::fs;
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

                    info!("Compiler config {:?}", config);

                    // Clone the root_dir so we can use it for file resolution later
                    let root_dir = config.root_dir.clone();

                    // Don't write artifacts by default
                    config.write_artifacts = false;

                    let compiler = Compiler::new(config);

                    let mut urls_with_diagnostics = HashSet::new();

                    compiler
                        .watch_with_callback(|result| {
                            match result {
                                Ok(_) => {
                                    info!("Compiled successfully");
                                    // Clear all diagnostics
                                    for url in urls_with_diagnostics.drain() {
                                        let params = PublishDiagnosticsParams {
                                            diagnostics: vec![],
                                            uri: url,
                                            version: None,
                                        };
                                        publish_diagnostic(params, &connection).unwrap();
                                    }
                                }
                                Err(err) => {
                                    match err {
                                        CompilerError::SyntaxErrors { errors } => {
                                            for SyntaxErrorWithSource { error, source } in errors {
                                                // Remove the index from the end of the path, resolve the absolute path
                                                let file_path = {
                                                    let file_path_and_index =
                                                        error.location.file().lookup();
                                                    let file_path_and_index: Vec<&str> =
                                                        file_path_and_index.split(':').collect();
                                                    let file_path =
                                                        PathBuf::from(file_path_and_index[0]);
                                                    fs::canonicalize(root_dir.join(file_path))
                                                        .unwrap()
                                                };

                                                let url = Url::from_file_path(file_path).unwrap();

                                                // Track the url we're reporting diagnostics for so we can
                                                // clear them out later.
                                                urls_with_diagnostics.insert(url.clone());

                                                let message = format!("{}", error.kind);

                                                let range = error.location.span().to_range(
                                                    &source.text,
                                                    source.line_index,
                                                    source.column_index,
                                                );

                                                let diagnostic = Diagnostic {
                                                    code: None,
                                                    message,
                                                    range,
                                                    related_information: None,
                                                    severity: Some(DiagnosticSeverity::Error),
                                                    source: Some(source.text),
                                                    tags: None,
                                                };

                                                let params = PublishDiagnosticsParams {
                                                    diagnostics: vec![diagnostic],
                                                    uri: url,
                                                    version: None,
                                                };

                                                publish_diagnostic(params, &connection).unwrap();
                                            }
                                        }
                                        // Ignore the rest of these errors for now
                                        CompilerError::ConfigFileRead { .. } => {}
                                        CompilerError::ConfigFileParse { .. } => {}
                                        CompilerError::ConfigFileValidation { .. } => {}
                                        CompilerError::WatchmanError { .. } => {}
                                        CompilerError::BuildProjectsErrors { .. } => {}
                                        CompilerError::ReadFileError { .. } => {}
                                        CompilerError::WriteFileError { .. } => {}
                                        CompilerError::SerializationError { .. } => {}
                                        CompilerError::DeserializationError { .. } => {}
                                    }
                                    // Report new diagnostics
                                }
                            }
                        })
                        .await
                        .unwrap();
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

fn publish_diagnostic(
    diagnostic_params: PublishDiagnosticsParams,
    connection: &Connection,
) -> Result<(), Box<dyn Error + Sync + Send>> {
    let notif = ServerNotification::new(PublishDiagnostics::METHOD.into(), diagnostic_params);
    connection.sender.send(Message::Notification(notif))?;
    Ok(())
}
