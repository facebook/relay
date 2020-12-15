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
        set_ready_status, set_starting_status, CompletionOptions, Connection, GotoDefinition,
        HoverRequest, InitializeParams, Message, ServerCapabilities, ServerResponse,
        TextDocumentSyncCapability, TextDocumentSyncKind, WorkDoneProgressOptions,
    },
    lsp_process_error::{LSPProcessError, LSPProcessResult},
    references::on_references,
    shutdown::{on_exit, on_shutdown},
    status_reporting::LSPStatusReporter,
    text_documents::on_did_save_text_document,
    text_documents::{
        on_did_change_text_document, on_did_close_text_document, on_did_open_text_document,
    },
};
use common::{PerfLogEvent, PerfLogger};
use crossbeam::{SendError, Sender};
use log::info;
use lsp_server::{ErrorCode, Notification, ResponseError};
use lsp_types::{
    notification::{
        DidChangeTextDocument, DidCloseTextDocument, DidOpenTextDocument, DidSaveTextDocument, Exit,
    },
    request::{Completion, References, Shutdown},
};
use relay_compiler::config::Config;
use std::sync::Arc;
mod lsp_request_dispatch;
use lsp_request_dispatch::LSPRequestDispatch;
mod lsp_notification_dispatch;
use lsp_notification_dispatch::LSPNotificationDispatch;
mod lsp_state;
pub use lsp_state::LSPExtraDataProvider;
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
        trigger_characters: Some(vec!["(".into(), "{".into(), "\n".into(), ",".into()]),
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
    mut config: Config,
    _params: InitializeParams,
    perf_logger: Arc<TPerfLogger>,
    extra_data_provider: Box<dyn LSPExtraDataProvider + Send + Sync>,
) -> LSPProcessResult<()>
where
    TPerfLogger: PerfLogger + 'static,
{
    info!(
        "Running language server with config root {:?}",
        config.root_dir
    );
    set_starting_status(&connection.sender);

    config.status_reporter = Box::new(LSPStatusReporter::new(
        config.root_dir.clone(),
        connection.sender.clone(),
    ));

    let mut lsp_state = LSPState::create_state(
        Arc::new(config),
        extra_data_provider,
        Arc::clone(&perf_logger),
    )
    .await?;

    // At this point we're ready to provide hover/complete/go_to_definition capabilities
    set_ready_status(&connection.sender);

    // And now we can listen for messages and notification
    for msg in connection.receiver {
        info!("LSP message received {:?}", msg);
        match msg {
            Message::Request(req) => {
                handle_request(&mut lsp_state, req, &connection.sender, &perf_logger)
                    .map_err(LSPProcessError::from)?;
            }
            Message::Notification(notification) => {
                handle_notification(&mut lsp_state, notification, &perf_logger);
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
    request: lsp_server::Request,
    sender: &Sender<Message>,
    perf_logger: &Arc<TPerfLogger>,
) -> Result<(), SendError<Message>> {
    let get_server_response_bound = |req| dispatch_request(req, lsp_state);
    let get_response = with_request_logging(perf_logger, get_server_response_bound);

    sender.send(Message::Response(get_response(request)))
}

fn dispatch_request<TPerfLogger: PerfLogger + 'static>(
    request: lsp_server::Request,
    lsp_state: &mut LSPState<TPerfLogger>,
) -> ServerResponse {
    let get_response = || -> Result<_, ServerResponse> {
        let request = LSPRequestDispatch::new(request, lsp_state)
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
    get_response().unwrap_or_else(|response| response)
}

fn with_request_logging<'a, TPerfLogger: PerfLogger + 'static>(
    perf_logger: &'a Arc<TPerfLogger>,
    get_response: impl FnOnce(lsp_server::Request) -> ServerResponse + 'a,
) -> impl FnOnce(lsp_server::Request) -> ServerResponse + 'a {
    move |request| {
        let lsp_request_event = perf_logger.create_event("lsp_message");
        lsp_request_event.string("lsp_method", request.method.clone());
        lsp_request_event.string("lsp_type", "request".to_string());
        let lsp_request_processing_time = lsp_request_event.start("lsp_message_processing_time");

        let response = get_response(request);

        if response.result.is_some() {
            lsp_request_event.string("lsp_outcome", "success".to_string());
        } else if let Some(error) = &response.error {
            lsp_request_event.string("lsp_outcome", "error".to_string());
            if let Some(data) = &error.data {
                lsp_request_event.string("lsp_error_data", data.to_string());
            }
        }
        // N.B. we don't handle the case where the ServerResponse has neither a result nor
        // an error, which is an invalid state.

        lsp_request_event.stop(lsp_request_processing_time);
        perf_logger.complete_event(lsp_request_event);

        response
    }
}

fn handle_notification<TPerfLogger: PerfLogger + 'static>(
    lsp_state: &mut LSPState<TPerfLogger>,
    notification: Notification,
    perf_logger: &Arc<TPerfLogger>,
) {
    let lsp_notification_event = perf_logger.create_event("lsp_message");
    lsp_notification_event.string("lsp_method", notification.method.clone());
    lsp_notification_event.string("lsp_type", "notification".to_string());
    let lsp_notification_processing_time =
        lsp_notification_event.start("lsp_message_processing_time");

    let notification_result = dispatch_notification(notification, lsp_state);

    // The only possible error (for now) is not handling the notification.
    // N.B. is_ok is correct here.
    if notification_result.is_ok() {
        lsp_notification_event.string("lsp_outcome", "error".to_string());
    }

    lsp_notification_event.stop(lsp_notification_processing_time);
    perf_logger.complete_event(lsp_notification_event);
}

fn dispatch_notification<TPerfLogger: PerfLogger + 'static>(
    notification: lsp_server::Notification,
    lsp_state: &mut LSPState<TPerfLogger>,
) -> Result<(), ()> {
    let notification = LSPNotificationDispatch::new(notification, lsp_state)
        .on_notification_sync::<DidOpenTextDocument>(on_did_open_text_document)?
        .on_notification_sync::<DidCloseTextDocument>(on_did_close_text_document)?
        .on_notification_sync::<DidChangeTextDocument>(on_did_change_text_document)?
        .on_notification_sync::<DidSaveTextDocument>(on_did_save_text_document)?
        .on_notification_sync::<Exit>(on_exit)?
        .notification();

    // If we have gotten here, we have not handled the notification
    info!(
        "Error: no handler registered for notification '{}'",
        notification.method
    );
    Ok(())
}
