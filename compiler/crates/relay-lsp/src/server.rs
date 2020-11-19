/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::hover::get_hover_response_contents;
use crate::lsp::{
    set_initializing_status, Completion, CompletionOptions, Connection, DidChangeTextDocument,
    DidCloseTextDocument, DidOpenTextDocument, Exit, GotoDefinition, HoverRequest,
    InitializeParams, LSPBridgeMessage, Message, Notification, Request, ServerCapabilities,
    ServerNotification, ServerRequest, ServerRequestId, ServerResponse, Shutdown,
    TextDocumentSyncCapability, TextDocumentSyncKind, Url, WorkDoneProgressOptions,
};
use crate::lsp_process_error::LSPProcessResult;
use crate::status_reporting::LSPStatusReporter;
use crate::text_documents::extract_graphql_sources;
use crate::text_documents::{
    on_did_change_text_document, on_did_close_text_document, on_did_open_text_document,
};
use crate::utils::get_node_resolution_info;
use crate::{
    completion::{completion_items_for_request, get_completion_request, send_completion_response},
    lsp_runtime_error::LSPRuntimeResult,
};
use crate::{goto_definition::get_goto_definition_response, lsp_runtime_error::LSPRuntimeError};
use common::{PerfLogEvent, PerfLogger};
use crossbeam::Sender;
use graphql_ir::Program;
use graphql_syntax::GraphQLSource;
use interner::StringKey;
use log::info;
use lsp_server::{RequestId, ResponseError};
use lsp_types::Hover;
use relay_compiler::{compiler::Compiler, config::Config, FileCategorizer};
use schema::Schema;
use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{Arc, RwLock},
};
use tokio::sync::{mpsc, mpsc::Receiver, Notify};

pub struct Server<TPerfLogger>
where
    TPerfLogger: PerfLogger + 'static,
{
    sender: Sender<Message>,
    schemas: Arc<RwLock<HashMap<StringKey, Arc<Schema>>>>,
    synced_graphql_documents: HashMap<Url, Vec<GraphQLSource>>,
    lsp_rx: Receiver<LSPBridgeMessage>,
    file_categorizer: FileCategorizer,
    root_dir: PathBuf,
    source_programs: Arc<RwLock<HashMap<StringKey, Program>>>,
    perf_logger: Arc<TPerfLogger>,
}

impl<TPerfLogger> Server<TPerfLogger>
where
    TPerfLogger: PerfLogger + 'static,
{
    async fn watch(&mut self) -> LSPProcessResult<()> {
        loop {
            if let Some(message) = self.lsp_rx.recv().await {
                self.handle_lsp_bridge_message(message);
            }
        }
    }

    fn handle_lsp_bridge_message(&mut self, message: LSPBridgeMessage) {
        if let Some((id, lsp_response)) = self.get_lsp_bridge_message_response(message) {
            // TODO handle send error
            let _ = self
                .sender
                .send(Message::Response(create_server_response_and_log(
                    id,
                    lsp_response,
                    &self.perf_logger,
                )));
        }
    }

    fn get_lsp_bridge_message_response(
        &mut self,
        message: LSPBridgeMessage,
    ) -> Option<(RequestId, LSPRuntimeResult<serde_json::Value>)> {
        match message {
            LSPBridgeMessage::HoverRequest {
                request_id,
                text_document_position,
            } => {
                let get_hover_result = || {
                    let node_resolution_info = get_node_resolution_info(
                        text_document_position,
                        &self.synced_graphql_documents,
                        &self.file_categorizer,
                        &self.root_dir,
                    )?;
                    if let Some(schema) = self
                        .schemas
                        .read()
                        .unwrap()
                        .get(&node_resolution_info.project_name)
                    {
                        let contents = get_hover_response_contents(
                            node_resolution_info,
                            schema,
                            &self.source_programs,
                        )
                        .ok_or_else(|| {
                            LSPRuntimeError::UnexpectedError(
                                "Unable to get hover contents".to_string(),
                            )
                        })?;

                        serde_json::to_value(Hover {
                            contents,
                            range: None,
                        })
                        .map_err(|_e| {
                            LSPRuntimeError::UnexpectedError(
                                "Unable to serialize hover response".to_string(),
                            )
                        })
                    } else {
                        Err(LSPRuntimeError::UnexpectedError(format!(
                            "Unable to get schema for project {}",
                            node_resolution_info.project_name
                        )))
                    }
                };

                Some((request_id, get_hover_result()))
            }
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
                None
            }
            LSPBridgeMessage::GotoDefinitionRequest {
                request_id,
                text_document_position,
            } => {
                let get_goto_definition_result = || {
                    let node_resolution_info = get_node_resolution_info(
                        text_document_position,
                        &self.synced_graphql_documents,
                        &self.file_categorizer,
                        &self.root_dir,
                    )?;

                    let goto_definition_response = get_goto_definition_response(
                        node_resolution_info,
                        &self.source_programs,
                        &self.root_dir,
                    )?;

                    serde_json::to_value(goto_definition_response).map_err(|_e| {
                        LSPRuntimeError::UnexpectedError(
                            "Unable to serialize goto definition response".to_string(),
                        )
                    })
                };

                Some((request_id, get_goto_definition_result()))
            }
            LSPBridgeMessage::DidOpenTextDocument(params) => {
                on_did_open_text_document(params, &mut self.synced_graphql_documents);
                None
            }
            LSPBridgeMessage::DidChangeTextDocument(params) => {
                on_did_change_text_document(params, &mut self.synced_graphql_documents);
                None
            }
            LSPBridgeMessage::DidCloseTextDocument(params) => {
                on_did_close_text_document(params, &mut self.synced_graphql_documents);
                None
            }
        }
    }

    fn get_schemas(&self) -> Arc<RwLock<HashMap<StringKey, Arc<Schema>>>> {
        self.schemas.clone()
    }

    fn get_source_programs(&self) -> Arc<RwLock<HashMap<StringKey, Program>>> {
        self.source_programs.clone()
    }
}

/// Initializes an LSP connection, handling the `initialize` message and `initialized` notification
/// handshake.
pub fn initialize(connection: &Connection) -> LSPProcessResult<InitializeParams> {
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

    server_capabilities.hover_provider = Some(true);
    server_capabilities.definition_provider = Some(true);

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
) -> LSPProcessResult<()>
where
    TPerfLogger: PerfLogger + 'static,
{
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
                    } else if req.method == HoverRequest::METHOD {
                        info!("hover request....");
                        let (request_id, text_document_position) =
                            extract_request_params::<HoverRequest>(req);
                        lsp_tx
                            .send(LSPBridgeMessage::HoverRequest {
                                request_id,
                                text_document_position,
                            })
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
                    } else if req.method == GotoDefinition::METHOD {
                        let (request_id, text_document_position) =
                            extract_request_params::<GotoDefinition>(req);
                        lsp_tx
                            .send(LSPBridgeMessage::GotoDefinitionRequest {
                                request_id,
                                text_document_position,
                            })
                            .await
                            .ok();
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
        perf_logger: Arc::clone(&perf_logger),
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

fn create_server_response_and_log<TPerfLogger>(
    id: RequestId,
    lsp_runtime_result: LSPRuntimeResult<serde_json::Value>,
    perf_logger: &Arc<TPerfLogger>,
) -> ServerResponse
where
    TPerfLogger: PerfLogger + 'static,
{
    match lsp_runtime_result {
        Ok(result) => ServerResponse {
            id,
            result: Some(result),
            error: None,
        },
        Err(error) => {
            let response_error: Option<ResponseError> = error.into();
            match response_error {
                Some(error) => {
                    log_response_error(perf_logger, error.clone());
                    ServerResponse {
                        id,
                        result: None,
                        error: Some(error),
                    }
                }
                None => {
                    // This is not correct behavior here. We should cancel the request.
                    // This will print an error like
                    // "Error: The received response has neither a result nor an error property."
                    ServerResponse {
                        id,
                        result: None,
                        error: None,
                    }
                }
            }
        }
    }
}

fn log_response_error<TPerfLogger>(perf_logger: &Arc<TPerfLogger>, error: ResponseError)
where
    TPerfLogger: PerfLogger + 'static,
{
    let event = perf_logger.create_event("lsp_error");
    event.string("lsp_error_code", error.code.to_string());
    event.string("lsp_error_message", error.message);
    if let Some(data) = error.data {
        event.string("lsp_error_data", data.to_string());
    }
    perf_logger.complete_event(event);
}
