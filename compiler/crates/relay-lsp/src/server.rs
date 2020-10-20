/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    error::LSPError,
    lsp::{
        Connection, DidChangeTextDocument, DidCloseTextDocument, DidOpenTextDocument, Exit,
        InitializeParams, LSPBridgeMessage, Message, Notification, Request, ServerCapabilities,
        ServerNotification, ServerRequest, ServerRequestId, ServerResponse, Shutdown,
        TextDocumentSyncCapability, TextDocumentSyncKind,
    },
};

use relay_compiler::{errors::Error::DiagnosticsError, FileSource};

use relay_compiler::config::Config;

use crate::error::Result;
use crate::lsp::show_info_message;

use common::ConsoleLogger;
use common::PerfLogger;
use log::info;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::{mpsc, Notify};

use crate::lsp_compiler::LSPCompiler;

use crate::text_documents::initialize_compiler_if_contains_graphql;

/// Initializes an LSP connection, handling the `initize` message and `initialized` notification
/// handshake.
pub fn initialize(connection: &Connection) -> Result<InitializeParams> {
    let mut server_capabilities = ServerCapabilities::default();
    // Enable text document syncing so we can know when files are opened/changed/saved/closed
    server_capabilities.text_document_sync =
        Some(TextDocumentSyncCapability::Kind(TextDocumentSyncKind::Full));

    /* TODO: Re-enable auto-complete
    server_capabilities.completion_provider = Some(CompletionOptions {
        resolve_provider: Some(true),
        trigger_characters: None,
        work_done_progress_options: WorkDoneProgressOptions {
            work_done_progress: None,
        },
    });
    */

    let server_capabilities = serde_json::to_value(&server_capabilities)?;
    let params = connection.initialize(server_capabilities)?;
    let params: InitializeParams = serde_json::from_value(params)?;
    Ok(params)
}

/// Run the main server loop
pub async fn run(connection: Connection, _params: InitializeParams) -> Result<()> {
    show_info_message("Relay Language Server Started", &connection)?;
    info!("Running language server");

    let receiver = connection.receiver.clone();
    let sender = connection.sender.clone();

    // A `Notify` instance used to signal that the compiler should be initialized.
    let compiler_notify = Arc::new(Notify::new());

    // Thread for the LSP message loop
    let compiler_notifier = compiler_notify.clone();

    // A channel to communicate between the LSP message loop and the compiler loop
    let (mut lsp_tx, lsp_rx) = mpsc::channel::<LSPBridgeMessage>(100);

    let mut has_shutdown = false;
    tokio::spawn(async move {
        // Cache for the extracted GraphQL sources
        for msg in receiver {
            match msg {
                Message::Request(req) => {
                    /* TODO: Re-enable auto-complete
                    // Auto-complete request
                    if req.method == Completion::METHOD {
                        let (request_id, params) = extract_request_params::<Completion>(req);
                        lsp_tx
                            .send(LSPBridgeMessage::CompletionRequest { request_id, params })
                            .await
                            .ok();
                    }
                    */
                    if req.method == Shutdown::METHOD {
                        has_shutdown = true;
                        let (request_id, _) = extract_request_params::<Shutdown>(req);
                        let response = ServerResponse {
                            id: request_id,
                            error: None,
                            result: None,
                        };
                        sender.send(Message::Response(response)).ok();
                        // TODO: We should exit when receiving Exit notification according to the protocal,
                        // but the notification is never received.
                        std::process::exit(0);
                    }
                }
                Message::Notification(notif) => {
                    match &notif.method {
                        method if method == DidOpenTextDocument::METHOD => {
                            let params = extract_notif_params::<DidOpenTextDocument>(notif);
                            initialize_compiler_if_contains_graphql(
                                &params,
                                compiler_notifier.clone(),
                            );
                            lsp_tx
                                .send(LSPBridgeMessage::DidOpenTextDocument(params))
                                .await
                                .ok();
                        }
                        method if method == DidChangeTextDocument::METHOD => {
                            let params = extract_notif_params::<DidChangeTextDocument>(notif);
                            lsp_tx
                                .send(LSPBridgeMessage::DidChangeTextDocument(params))
                                .await
                                .ok();
                        }
                        method if method == DidCloseTextDocument::METHOD => {
                            let params = extract_notif_params::<DidCloseTextDocument>(notif);
                            lsp_tx
                                .send(LSPBridgeMessage::DidCloseTextDocument(params))
                                .await
                                .ok();
                        }
                        method if method == Exit::METHOD => {
                            std::process::exit(!has_shutdown as i32)
                        }
                        _ => {
                            // Notifications we don't care about
                        }
                    }
                }
                Message::Response(_) => {
                    // Ignore responses for now
                }
            }
        }
    });

    info!("Waiting for compiler to initialize...");
    compiler_notify.notified().await;
    info!("Compiler has initialized");

    let config = load_config();
    let setup_event = ConsoleLogger.create_event("lsp_compiler_setup");
    let file_source = FileSource::connect(&config, &setup_event).await?;
    let (compiler_state, subscription) = file_source
        .subscribe(&setup_event, &ConsoleLogger)
        .await
        .unwrap();
    let schemas = LSPCompiler::build_schemas(&config, &compiler_state, &setup_event)
        .map_err(|errors| LSPError::CompilerError(DiagnosticsError { errors }))?;
    let mut lsp_compiler = LSPCompiler::new(
        &schemas,
        &config,
        subscription,
        compiler_state,
        lsp_rx,
        connection,
    );
    lsp_compiler.watch().await.unwrap();
    Ok(())
}

fn load_config() -> Config {
    // TODO(brandondail) don't hardcode the test project config here
    let home = std::env::var("HOME").unwrap();
    let config_path = PathBuf::from(format!(
        "{}/fbsource/fbcode/relay/config/config.example.json",
        home
    ));
    let config = Config::load(config_path).unwrap();
    config
}

fn extract_notif_params<N>(notif: ServerNotification) -> N::Params
where
    N: Notification,
{
    notif.extract(N::METHOD).unwrap()
}

fn extract_request_params<R>(req: ServerRequest) -> (ServerRequestId, R::Params)
where
    R: Request,
{
    req.extract(R::METHOD).unwrap()
}
