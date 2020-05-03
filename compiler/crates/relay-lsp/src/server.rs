/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::error::Error;

use crate::lsp::{
    Connection, DidOpenTextDocument, InitializeParams, Message, Notification,
    PublishDiagnosticsParams, ServerCapabilities, TextDocumentSyncCapability, TextDocumentSyncKind,
    Url,
};

use relay_compiler::compiler::Compiler;
use relay_compiler::config::Config;
use relay_compiler::errors::Error as CompilerError;

use crate::error_reporting::{report_build_project_errors, report_syntax_errors};
use crate::lsp::{publish_diagnostic, show_info_message};

use common::ConsoleLogger;
use log::info;
use std::path::PathBuf;
use tokio::sync::mpsc;

pub struct ServerState {
    urls_with_active_diagnostics: HashSet<Url>,
    pub root_dir: PathBuf,
}

impl ServerState {
    pub fn new(root_dir: PathBuf) -> Self {
        ServerState {
            urls_with_active_diagnostics: HashSet::default(),
            root_dir,
        }
    }

    pub fn register_url_with_diagnostics(&mut self, url: Url) {
        self.urls_with_active_diagnostics.insert(url);
    }

    pub fn clear_diagnostics(&mut self, connection: &Connection) {
        for url in self.urls_with_active_diagnostics.drain() {
            let params = PublishDiagnosticsParams {
                diagnostics: vec![],
                uri: url,
                version: None,
            };
            publish_diagnostic(params, &connection).unwrap();
        }
    }
}

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
                    let root_dir = config.root_dir.clone();

                    // Don't write artifacts by default
                    config.write_artifacts = false;

                    let logger = ConsoleLogger;
                    let compiler = Compiler::new(config, &logger);

                    let mut server_state = ServerState::new(root_dir);

                    compiler
                        .watch_with_callback(|result| {
                            match result {
                                Ok(_) => {
                                    info!("Compiled successfully");
                                    // Clear all diagnostics
                                    server_state.clear_diagnostics(&connection);
                                }
                                Err(err) => {
                                    match err {
                                        CompilerError::SyntaxErrors { errors } => {
                                            report_syntax_errors(
                                                errors,
                                                &connection,
                                                &mut server_state,
                                            )
                                        }
                                        CompilerError::BuildProjectsErrors { errors } => {
                                            report_build_project_errors(
                                                errors,
                                                &connection,
                                                &mut server_state,
                                            )
                                        }
                                        // Ignore the rest of these errors for now
                                        CompilerError::ConfigFileRead { .. } => {}
                                        CompilerError::ConfigFileParse { .. } => {}
                                        CompilerError::ConfigFileValidation { .. } => {}
                                        CompilerError::WatchmanError { .. } => {}
                                        CompilerError::ReadFileError { .. } => {}
                                        CompilerError::WriteFileError { .. } => {}
                                        CompilerError::SerializationError { .. } => {}
                                        CompilerError::DeserializationError { .. } => {}
                                    }
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
