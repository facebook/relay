/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::completion::{
    completion_items_for_request, get_completion_request, send_completion_response,
    GraphQLSourceCache,
};
use crate::error::Result;
use crate::lsp::{
    set_initializing_status, show_info_message, Completion, CompletionOptions, Connection,
    DidChangeTextDocument, DidCloseTextDocument, DidOpenTextDocument, Exit, InitializeParams,
    LSPBridgeMessage, Message, Notification, Request, ServerCapabilities, ServerNotification,
    ServerRequest, ServerRequestId, ServerResponse, Shutdown, TextDocumentSyncCapability,
    TextDocumentSyncKind, WorkDoneProgressOptions,
};
use crate::status_reporting::LSPStatusReporter;
use crate::text_documents::extract_graphql_sources;
use crate::text_documents::{
    on_did_change_text_document, on_did_close_text_document, on_did_open_text_document,
};
use common::{PerfLogEvent, PerfLogger};
use crossbeam::Sender;
use graphql_ir::Program;
use interner::StringKey;
use log::info;
use relay_compiler::{compiler::Compiler, config::Config, FileCategorizer};
use schema::Schema;
use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{Arc, RwLock},
};
use tokio::sync::{mpsc, mpsc::Receiver, Notify};

pub struct Server {
    sender: Sender<Message>,
    schemas: Arc<RwLock<HashMap<StringKey, Arc<Schema>>>>,
    synced_graphql_documents: GraphQLSourceCache,
    lsp_rx: Receiver<LSPBridgeMessage>,
    file_categorizer: FileCategorizer,
    root_dir: PathBuf,
    source_programs: Arc<RwLock<HashMap<StringKey, Program>>>,
}

impl Server {
    fn on_lsp_bridge_message(&mut self, message: LSPBridgeMessage) {
        match message {
            // Completion request
            LSPBridgeMessage::CompletionRequest { request_id, params } => {
                if let Some(completion_request) = get_completion_request(
                    params,
                    &self.synced_graphql_documents,
                    &self.file_categorizer,
                    &self.root_dir,
                ) {
                    info!("completion_request {:#?}", &completion_request);
                    if let Some(schema) = self
                        .schemas
                        .read()
                        .unwrap()
                        .get(&completion_request.project_name)
                    {
                        if let Some(items) = completion_items_for_request(
                            completion_request,
                            schema,
                            &self.source_programs,
                        ) {
                            send_completion_response(items, request_id, &self.sender);
                        }
                    }
                }
            }
            LSPBridgeMessage::DidOpenTextDocument(params) => {
                on_did_open_text_document(params, &mut self.synced_graphql_documents);
            }
            LSPBridgeMessage::DidChangeTextDocument(params) => {
                on_did_change_text_document(params, &mut self.synced_graphql_documents);
            }
            LSPBridgeMessage::DidCloseTextDocument(params) => {
                on_did_close_text_document(params, &mut self.synced_graphql_documents);
            }
        }
    }

    fn get_schemas(&self) -> Arc<RwLock<HashMap<StringKey, Arc<Schema>>>> {
        self.schemas.clone()
    }

    fn get_source_programs(&self) -> Arc<RwLock<HashMap<StringKey, Program>>> {
        self.source_programs.clone()
    }

    async fn watch(&mut self) -> Result<()> {
        loop {
            if let Some(message) = self.lsp_rx.recv().await {
                self.on_lsp_bridge_message(message)
            }
        }
    }
}

/// Initializes an LSP connection, handling the `initialize` message and `initialized` notification
/// handshake.
pub fn initialize(connection: &Connection) -> Result<InitializeParams> {
    let mut server_capabilities = ServerCapabilities::default();
    // Enable text document syncing so we can know when files are opened/changed/saved/closed
    server_capabilities.text_document_sync =
        Some(TextDocumentSyncCapability::Kind(TextDocumentSyncKind::Full));

    server_capabilities.completion_provider = Some(CompletionOptions {
        resolve_provider: Some(true),
        trigger_characters: None,
        work_done_progress_options: WorkDoneProgressOptions {
            work_done_progress: None,
        },
    });

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
        if !has_notified && extract_graphql_sources(text).is_some() {
            has_notified = true;
            compiler_notify_clone.notify();
        }
    };

    // A channel to communicate between the LSP message loop and the compiler loop
    let (mut lsp_tx, lsp_rx) = mpsc::channel::<LSPBridgeMessage>(100);
    let logger_for_process = Arc::clone(&perf_logger);

    tokio::spawn(async move {
        for msg in receiver {
            let perf_logger_msg_event = logger_for_process.create_event("lsp_message");
            info!("Received LSP message\n{:?}", msg);
            match msg {
                Message::Request(req) => {
                    // Auto-complete request
                    if req.method == Completion::METHOD {
                        let (request_id, params) = extract_request_params::<Completion>(req);
                        lsp_tx
                            .send(LSPBridgeMessage::CompletionRequest { request_id, params })
                            .await
                            .ok();
                    } else if req.method == Shutdown::METHOD {
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

    let mut server = Server {
        synced_graphql_documents: Default::default(),
        schemas: Default::default(),
        sender: connection.sender.clone(),
        lsp_rx,
        file_categorizer: FileCategorizer::from_config(&config),
        root_dir: config.root_dir.clone(),
        source_programs: Default::default(),
    };

    config.status_reporter = Box::new(LSPStatusReporter::new(
        config.root_dir.clone(),
        connection.sender.clone(),
    ));

    let schemas_writer = server.get_schemas();
    let source_programs_writer = server.get_source_programs();
    config.on_build_project_success =
        Some(Box::new(move |project_name, schema, source_program| {
            schemas_writer
                .write()
                .unwrap()
                .insert(project_name, schema.clone());
            source_programs_writer
                .write()
                .unwrap()
                .insert(project_name, source_program.clone());
        }));

    tokio::spawn(async move {
        let compiler = Compiler::new(config, Arc::clone(&perf_logger));
        compiler.watch().await
    });

    server.watch().await?;
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
