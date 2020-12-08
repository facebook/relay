/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    completion::on_completion,
    goto_definition::on_goto_definition,
    hover::on_hover,
    lsp::{
        set_initializing_status, CompletionOptions, Connection, GotoDefinition, HoverRequest,
        InitializeParams, Message, ServerCapabilities, ServerResponse, TextDocumentSyncCapability,
        TextDocumentSyncKind, WorkDoneProgressOptions,
    },
    lsp_process_error::LSPProcessResult,
    references::on_references,
    shutdown::{on_exit, on_shutdown},
    text_documents::{
        on_did_change_text_document, on_did_close_text_document, on_did_open_text_document,
    },
};
use common::PerfLogger;
use crossbeam::Sender;
use log::info;
use lsp_server::{ErrorCode, Notification, ResponseError};
use lsp_types::{
    notification::{DidChangeTextDocument, DidCloseTextDocument, DidOpenTextDocument, Exit},
    request::{Completion, References, Shutdown},
};
use relay_compiler::config::Config;
use std::sync::Arc;

mod lsp_request_dispatch;
use lsp_request_dispatch::LSPRequestDispatch;
mod lsp_notification_dispatch;
use lsp_notification_dispatch::LSPNotificationDispatch;
mod lsp_state;
pub(crate) use lsp_state::LSPState;

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
    server_capabilities.references_provider = Some(true);

    let server_capabilities = serde_json::to_value(&server_capabilities)?;
    let params = connection.initialize(server_capabilities)?;
    let params: InitializeParams = serde_json::from_value(params)?;
    Ok(params)
}

/// Run the main server loop
pub async fn run<TPerfLogger: PerfLogger + 'static>(
    connection: Connection,
    config: Config,
    _params: InitializeParams,
    perf_logger: Arc<TPerfLogger>,
) -> LSPProcessResult<()>
where
    TPerfLogger: PerfLogger + 'static,
{
    info!(
        "Running language server with config root {:?}",
        config.root_dir
    );

    let mut lsp_state = LSPState::new(config, &connection.sender, perf_logger);

    set_initializing_status(&connection.sender);

    for msg in connection.receiver {
        info!("LSP message received {:?}", msg);
        match msg {
            Message::Request(req) => {
                handle_request(&mut lsp_state, req, &connection.sender);
            }
            Message::Notification(notification) => {
                handle_notification(&mut lsp_state, notification);
            }
            _ => {
                // Ignore responses for now
            }
        }
    }

    Ok(())
}

fn handle_request<TPerfLogger: PerfLogger + 'static>(
    lsp_state: &mut LSPState<TPerfLogger>,
    req: lsp_server::Request,
    sender: &Sender<Message>,
) {
    let get_server_response = || -> Result<_, ServerResponse> {
        let request = LSPRequestDispatch::new(req, lsp_state)
            .on_request_sync::<HoverRequest>(on_hover)?
            .on_request_sync::<GotoDefinition>(on_goto_definition)?
            .on_request_sync::<References>(on_references)?
            .on_request_sync::<Completion>(on_completion)?
            .on_request_sync::<Shutdown>(on_shutdown)?
            .request();

        // If we have gotten here, we have not handled the request
        Ok(ServerResponse {
            id: request.id,
            result: None,
            error: Some(ResponseError {
                code: ErrorCode::MethodNotFound as i32,
                data: None,
                message: format!("No handler registered for method '{}'", request.method),
            }),
        })
    };

    let response = get_server_response().unwrap_or_else(|response| response);

    // TODO handle these errors
    let _ = sender.send(Message::Response(response));
}

fn handle_notification<TPerfLogger: PerfLogger + 'static>(
    lsp_state: &mut LSPState<TPerfLogger>,
    notification: Notification,
) {
    let get_notification_handling_response = || -> Result<(), ()> {
        let notification = LSPNotificationDispatch::new(notification, lsp_state)
            .on_notification_sync::<DidOpenTextDocument>(on_did_open_text_document)?
            .on_notification_sync::<DidCloseTextDocument>(on_did_close_text_document)?
            .on_notification_sync::<DidChangeTextDocument>(on_did_change_text_document)?
            .on_notification_sync::<Exit>(on_exit)?
            .notification();

        // If we have gotten here, we have not handled the notification
        // TODO report this back to the LSP somehow
        // TODO add a DidSaveTextDocument handler or change the server capabilities
        info!(
            "Error: no handler registered for notification '{}'",
            notification.method
        );
        Ok(())
    };

    // TODO handle these errors
    let _ = get_notification_handling_response();
}
