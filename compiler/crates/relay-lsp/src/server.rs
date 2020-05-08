/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::{HashMap, HashSet};
use std::error::Error;

use crate::lsp::{
    Completion, CompletionItem, CompletionList, CompletionOptions, CompletionParams,
    CompletionResponse, Connection, DidChangeTextDocument, DidChangeTextDocumentParams,
    DidCloseTextDocument, DidCloseTextDocumentParams, DidOpenTextDocument,
    DidOpenTextDocumentParams, InitializeParams, Message, Notification, PublishDiagnosticsParams,
    Request, ServerCapabilities, ServerNotification, ServerRequest, ServerRequestId,
    ServerResponse, TextDocumentPositionParams, TextDocumentSyncCapability, TextDocumentSyncKind,
    Url, WorkDoneProgressOptions,
};

use extract_graphql;
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

    server_capabilities.completion_provider = Some(CompletionOptions {
        resolve_provider: Some(true),
        trigger_characters: None,
        work_done_progress_options: WorkDoneProgressOptions {
            work_done_progress: None,
        },
    });

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
    let sender = connection.sender.clone();

    // Thread for the LSP message loop
    tokio::spawn(async move {
        let mut synced_documents: HashMap<Url, String> = HashMap::new();
        for msg in receiver {
            match msg {
                Message::Request(req) => {
                    // Auto-complete request
                    if req.method == Completion::METHOD {
                        let (
                            request_id,
                            CompletionParams {
                                text_document_position,
                                ..
                            },
                        ) = extract_request_params::<Completion>(req);
                        let TextDocumentPositionParams {
                            text_document,
                            position,
                        } = text_document_position;
                        let url = text_document.uri;
                        if let Some(source) = synced_documents.get(&url) {
                            let source = source.as_str();
                            match extract_graphql::parse_chunks(source) {
                                Ok(chunks) => {
                                    if chunks.is_empty() {
                                        // Ignore files with no `graphql` tags
                                        continue;
                                    }
                                    let mut target_chunk = None;
                                    for chunk in chunks {
                                        let range = chunk.to_range();
                                        if position >= range.start && position <= range.end {
                                            target_chunk = Some(chunk);
                                            // Exit the loop early as chunks should never be overlapping
                                            break;
                                        }
                                    }
                                    if let Some(_) = target_chunk {
                                        // Build up some fake completion items to test with for now
                                        let items = vec![
                                            "Component_user1",
                                            "Component_user2",
                                            "Component_userWithStream",
                                        ];

                                        let items = items
                                            .iter()
                                            .map(|label| {
                                                CompletionItem::new_simple(
                                                    (*label).to_owned(),
                                                    String::new(),
                                                )
                                            })
                                            .collect();

                                        let list = CompletionList {
                                            is_incomplete: false,
                                            items,
                                        };

                                        let completion_response = CompletionResponse::List(list);
                                        let completion_response =
                                            serde_json::to_value(&completion_response).unwrap();
                                        let response = ServerResponse {
                                            id: request_id,
                                            result: Some(completion_response),
                                            error: None,
                                        };
                                        sender.send(Message::Response(response)).unwrap();
                                        continue;
                                    } else {
                                        info!("Completion request was not within a GraphQL tag");
                                    }
                                }
                                Err(_) => {
                                    continue;
                                    // Ignore errors
                                }
                            }
                        } else {
                            // TODO(brandondail) we should never get a completion request
                            // for a document we haven't synced yet. Do some error logging here.
                        }
                    }
                }
                Message::Response(resp) => {
                    info!("Request: {:#?}", resp);
                }
                Message::Notification(notif) => {
                    if &notif.method == DidOpenTextDocument::METHOD {
                        // Lazily start the compiler once a relevant file is opened
                        if tx.send(CompilerMessage::Initialize).await.is_err() {
                            return;
                        }
                        let DidOpenTextDocumentParams { text_document, .. } =
                            extract_notif_params::<DidOpenTextDocument>(notif);
                        let url = text_document.uri;
                        let source = text_document.text;
                        synced_documents.insert(url, source);
                    // Start syncing the text for this document, so we can
                    // provide accurate auto-completion results
                    } else if notif.method == DidChangeTextDocument::METHOD {
                        // Update the synced document
                        let DidChangeTextDocumentParams {
                            text_document,
                            mut content_changes,
                        } = extract_notif_params::<DidChangeTextDocument>(notif);
                        let url = text_document.uri;
                        // We use full text syncing, so there will be a single content change
                        // with all the new text
                        let change = content_changes.remove(0);
                        let source = change.text;
                        synced_documents.insert(url, source);
                    } else if notif.method == DidCloseTextDocument::METHOD {
                        // Stop tracking the document when the file is closed
                        let DidCloseTextDocumentParams { text_document } =
                            extract_notif_params::<DidCloseTextDocument>(notif);
                        let url = text_document.uri;
                        synced_documents.remove(&url);
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
                                        CompilerError::ReadFileError { .. } => {}
                                        CompilerError::WriteFileError { .. } => {}
                                        CompilerError::SerializationError { .. } => {}
                                        CompilerError::DeserializationError { .. } => {}
                                        CompilerError::CanonicalizeRoot { .. } => {}
                                        CompilerError::Watchman { .. } => {}
                                        CompilerError::EmptyQueryResult => {}
                                        CompilerError::FileRead { .. } => {}
                                        CompilerError::Syntax { .. } => {}
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
