/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::error::Error;

use crate::lsp::{
    Completion, CompletionOptions, CompletionParams, Connection, DidChangeTextDocument,
    DidChangeTextDocumentParams, DidCloseTextDocument, DidCloseTextDocumentParams,
    DidOpenTextDocument, DidOpenTextDocumentParams, InitializeParams, Message, Notification,
    Request, ServerCapabilities, ServerNotification, ServerRequest, ServerRequestId,
    TextDocumentSyncCapability, TextDocumentSyncKind, WorkDoneProgressOptions,
};

use extract_graphql;
use relay_compiler::compiler::Compiler;
use relay_compiler::config::Config;
use relay_compiler::errors::Error as CompilerError;

use crate::error_reporting::{report_build_project_errors, report_syntax_errors};
use crate::lsp::show_info_message;
use crate::state::ServerState;

use common::ConsoleLogger;
use graphql_syntax::GraphQLSource;
use log::info;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Notify;

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

/// Run the main server loop
pub async fn run(
    connection: Connection,
    _params: InitializeParams,
) -> Result<(), Box<dyn Error + Sync + Send>> {
    show_info_message("Relay Language Server Started!", &connection)?;
    info!("Running language server");

    let receiver = connection.receiver.clone();

    // A `Notify` instance used to signal that the compiler should be initialized.
    let compiler_notify = Arc::new(Notify::new());

    // Thread for the LSP message loop
    let compiler_notifier = compiler_notify.clone();
    tokio::spawn(async move {
        for msg in receiver {
            match msg {
                Message::Request(req) => {
                    // Auto-complete request
                    if req.method == Completion::METHOD {
                        let (request_id, params) = extract_request_params::<Completion>(req);
                        on_completion_request(request_id, params);
                    }
                }
                Message::Notification(notif) => {
                    match &notif.method {
                        method if method == DidOpenTextDocument::METHOD => {
                            let params = extract_notif_params::<DidOpenTextDocument>(notif);
                            on_did_open_text_document(params, &compiler_notifier);
                        }
                        method if method == DidChangeTextDocument::METHOD => {
                            let params = extract_notif_params::<DidChangeTextDocument>(notif);
                            on_did_change_text_document(params);
                        }
                        method if method == DidCloseTextDocument::METHOD => {
                            let params = extract_notif_params::<DidCloseTextDocument>(notif);
                            on_did_close_text_document(params);
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

    let config = load_config();
    let root_dir = config.root_dir.clone();
    let compiler = Compiler::new(config, &ConsoleLogger);
    let mut server_state = ServerState::new(root_dir);
    info!("Compiler initialized");

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
                            report_syntax_errors(errors, &connection, &mut server_state)
                        }
                        CompilerError::BuildProjectsErrors { errors } => {
                            report_build_project_errors(errors, &connection, &mut server_state)
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

    Ok(())
}

/// Returns a set of *non-empty* GraphQL sources if they exist in a file. Returns `None`
/// if extracting fails or there are no GraphQL chunks in the file.
fn extract_graphql_sources(source: &str) -> Option<Vec<GraphQLSource>> {
    match extract_graphql::parse_chunks(source) {
        Ok(chunks) => {
            if chunks.is_empty() {
                None
            } else {
                Some(chunks)
            }
        }
        Err(_) => None,
    }
}

fn on_completion_request(_request_id: ServerRequestId, _params: CompletionParams) {
    // TODO(brandondail)
}

fn on_did_open_text_document(
    params: DidOpenTextDocumentParams,
    compiler_init_notify: &Arc<Notify>,
) {
    info!("Did open text document!");
    let DidOpenTextDocumentParams { text_document } = params;

    // First we check to see if this document has any GraphQL documents.
    let _graphql_sources = match extract_graphql_sources(&text_document.text) {
        Some(sources) => sources,
        // Exit early if there are no sources
        None => return,
    };

    // Notify the mean thread that it can start the compiler now, if it hasn't already
    compiler_init_notify.notify();
}

fn on_did_close_text_document(_params: DidCloseTextDocumentParams) {}

fn on_did_change_text_document(_params: DidChangeTextDocumentParams) {}

fn load_config() -> Config {
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
