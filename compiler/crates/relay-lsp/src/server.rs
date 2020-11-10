/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::error::Result;
use crate::lsp::{
    set_initializing_status, show_info_message, Connection, DidChangeTextDocument,
    DidCloseTextDocument, DidOpenTextDocument, Exit, InitializeParams, LSPBridgeMessage, Message,
    Notification, Request, ServerCapabilities, ServerNotification, ServerRequest, ServerRequestId,
    ServerResponse, Shutdown, TextDocumentSyncCapability, TextDocumentSyncKind,
};
use crate::status_reporting::LSPStatusReporter;
use common::{PerfLogEvent, PerfLogger};
use log::info;
use relay_compiler::compiler::Compiler;
use relay_compiler::config::Config;
use std::sync::Arc;
use tokio::sync::{mpsc, Notify};

use crate::text_documents::extract_graphql_sources;

/// Initializes an LSP connection, handling the `initialize` message and `initialized` notification
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
pub async fn run<TPerfLogger>(
    connection: Connection,
    mut config: Config,
    _params: InitializeParams,
    perf_logger: Arc<TPerfLogger>,
) -> Result<()>
where
    TPerfLogger: PerfLogger + 'static,
{
    show_info_message("Relay Language Server Started", &connection)?;
    info!("Running language server");
    let receiver = connection.receiver.clone();
    let sender = connection.sender.clone();

    // A `Notify` instance used to signal that the compiler should be initialized.
    let compiler_notify = Arc::new(Notify::new());
    let compiler_notify_clone = compiler_notify.clone();
    let mut has_notified = false;
    let mut on_opened_document = move |text: &String| {
        if !has_notified {
            if extract_graphql_sources(text).is_some() {
                has_notified = true;
                compiler_notify_clone.notify();
            }
        }
    };

    // A channel to communicate between the LSP message loop and the compiler loop
    let (mut lsp_tx, _lsp_rx) = mpsc::channel::<LSPBridgeMessage>(100);
    let logger_for_process = Arc::clone(&perf_logger);

    tokio::spawn(async move {
        for msg in receiver {
            let perf_logger_msg_event = logger_for_process.create_event("lsp_message");
            info!("Received LSP message\n{:?}", msg);
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
                        perf_logger_msg_event.string("method", req.method.clone());
                        logger_for_process.complete_event(perf_logger_msg_event);
                        logger_for_process.flush();
                        let (request_id, _) = extract_request_params::<Shutdown>(req);
                        let response = ServerResponse {
                            id: request_id,
                            error: None,
                            result: None,
                        };
                        sender.send(Message::Response(response)).ok();
                        // TODO: We should exit when receiving Exit notification according to the protocol,
                        // but the notification is never received.
                        std::process::exit(0);
                    }
                }
                Message::Notification(notif) => {
                    let mut should_flush_perf_log_event = true;
                    perf_logger_msg_event.string("method", notif.method.clone());
                    let lsp_message_processing_time =
                        perf_logger_msg_event.start("lsp_message_processing_time");

                    match &notif.method {
                        method if method == DidOpenTextDocument::METHOD => {
                            let params = extract_notif_params::<DidOpenTextDocument>(notif);
                            on_opened_document(&params.text_document.text);
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
                            perf_logger_msg_event.stop(lsp_message_processing_time);
                            logger_for_process.complete_event(perf_logger_msg_event);
                            logger_for_process.flush();
                            std::process::exit(0);
                        }
                        _ => {
                            should_flush_perf_log_event = false;
                            // Notifications we don't care about
                        }
                    }
                    if should_flush_perf_log_event {
                        perf_logger_msg_event.stop(lsp_message_processing_time);
                        logger_for_process.complete_event(perf_logger_msg_event);
                        logger_for_process.flush();
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
    set_initializing_status(&connection.sender);

    config.status_reporter = Box::new(LSPStatusReporter::new(
        config.root_dir.clone(),
        connection.sender.clone(),
    ));
    let compiler = Compiler::new(config, Arc::clone(&perf_logger));
    compiler.watch().await.unwrap();
    Ok(())
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
