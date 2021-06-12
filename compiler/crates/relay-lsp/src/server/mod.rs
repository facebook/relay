/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod heartbeat;
mod lsp_notification_dispatch;
mod lsp_request_dispatch;
mod lsp_state;
mod lsp_state_resources;

use crate::{
    code_action::on_code_action,
    completion::on_completion,
    goto_definition::{
        on_get_source_location_of_type_definition, on_goto_definition,
        GetSourceLocationOfTypeDefinition,
    },
    graphql_tools::on_graphql_execute_query,
    graphql_tools::GraphQLExecuteQuery,
    hover::on_hover,
    js_language_server::JSLanguageServer,
    lsp::{
        set_initializing_status, CompletionOptions, Connection, GotoDefinition, HoverRequest,
        InitializeParams, Message, ServerCapabilities, ServerResponse, TextDocumentSyncCapability,
        TextDocumentSyncKind, WorkDoneProgressOptions,
    },
    lsp_process_error::{LSPProcessError, LSPProcessResult},
    lsp_runtime_error::LSPRuntimeError,
    references::on_references,
    resolved_types_at_location::{on_get_resolved_types_at_location, ResolvedTypesAtLocation},
    search_schema_items::{on_search_schema_items, SearchSchemaItems},
    shutdown::{on_exit, on_shutdown},
    status_reporting::{LSPStatusReporter, StatusReportingArtifactWriter},
    text_documents::{
        on_cancel, on_did_change_text_document, on_did_close_text_document,
        on_did_open_text_document, on_did_save_text_document,
    },
    ExtensionConfig,
};
use common::{PerfLogEvent, PerfLogger};
use crossbeam::channel::{SendError, Sender};
use log::debug;
use lsp_notification_dispatch::LSPNotificationDispatch;
use lsp_request_dispatch::LSPRequestDispatch;
use lsp_server::{ErrorCode, Notification, ResponseError};
use lsp_types::{
    notification::{
        Cancel, DidChangeTextDocument, DidCloseTextDocument, DidOpenTextDocument,
        DidSaveTextDocument, Exit,
    },
    request::{CodeActionRequest, Completion, References, Shutdown},
    CodeActionProviderCapability,
};
use relay_compiler::{config::Config, NoopArtifactWriter};
use std::sync::Arc;

pub use crate::LSPExtraDataProvider;
pub use lsp_state::LSPState;
pub use lsp_state::{Schemas, SourcePrograms};

use heartbeat::{on_heartbeat, HeartbeatRequest};

/// Initializes an LSP connection, handling the `initialize` message and `initialized` notification
/// handshake.
pub fn initialize(connection: &Connection) -> LSPProcessResult<InitializeParams> {
    let server_capabilities = ServerCapabilities {
        // Enable text document syncing so we can know when files are opened/changed/saved/closed
        text_document_sync: Some(TextDocumentSyncCapability::Kind(TextDocumentSyncKind::Full)),

        completion_provider: Some(CompletionOptions {
            resolve_provider: Some(true),
            trigger_characters: Some(vec!["(".into(), "\n".into(), ",".into(), "@".into()]),
            work_done_progress_options: WorkDoneProgressOptions {
                work_done_progress: None,
            },
            ..Default::default()
        }),

        hover_provider: Some(lsp_types::HoverProviderCapability::Simple(true)),
        definition_provider: Some(lsp_types::OneOf::Left(true)),
        references_provider: Some(lsp_types::OneOf::Left(true)),
        code_action_provider: Some(CodeActionProviderCapability::Simple(true)),
        ..Default::default()
    };

    let server_capabilities = serde_json::to_value(&server_capabilities)?;
    let params = connection.initialize(server_capabilities)?;
    let params: InitializeParams = serde_json::from_value(params)?;
    Ok(params)
}

/// Run the main server loop
pub async fn run<TPerfLogger: PerfLogger + 'static>(
    connection: Connection,
    mut config: Config,
    extension_config: ExtensionConfig,
    _params: InitializeParams,
    perf_logger: Arc<TPerfLogger>,
    extra_data_provider: Box<dyn LSPExtraDataProvider + Send + Sync>,
    js_resource: Box<dyn JSLanguageServer<TPerfLogger>>,
) -> LSPProcessResult<()>
where
    TPerfLogger: PerfLogger + 'static,
{
    debug!(
        "Running language server with config root {:?}",
        config.root_dir
    );
    set_initializing_status(&connection.sender);

    config.artifact_writer = if extension_config.no_artifacts {
        Box::new(NoopArtifactWriter)
    } else {
        Box::new(StatusReportingArtifactWriter::new(
            connection.sender.clone(),
            config.artifact_writer,
        ))
    };
    config.status_reporter = Box::new(LSPStatusReporter::new(
        config.root_dir.clone(),
        connection.sender.clone(),
    ));

    let mut lsp_state = LSPState::create_state(
        Arc::new(config),
        Arc::clone(&perf_logger),
        extra_data_provider,
        js_resource,
        &extension_config,
        connection.sender.clone(),
    );

    loop {
        debug!("waiting for incoming messages...");
        match connection.receiver.recv() {
            Ok(Message::Request(req)) => {
                handle_request(&mut lsp_state, req, &connection.sender, &perf_logger)
                    .map_err(LSPProcessError::from)?;
            }
            Ok(Message::Notification(notification)) => {
                handle_notification(&mut lsp_state, notification, &perf_logger);
            }
            Ok(_) => {
                // Ignore responses for now
            }
            Err(error) => {
                panic!("Relay Language Server receiver error {:?}", error);
            }
        }
    }
}

fn handle_request<TPerfLogger: PerfLogger + 'static>(
    lsp_state: &mut LSPState<TPerfLogger>,
    request: lsp_server::Request,
    sender: &Sender<Message>,
    perf_logger: &Arc<TPerfLogger>,
) -> Result<(), SendError<Message>> {
    debug!("request received {:?}", request);
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
            .on_request_sync::<ResolvedTypesAtLocation>(on_get_resolved_types_at_location)?
            .on_request_sync::<SearchSchemaItems>(on_search_schema_items)?
            .on_request_sync::<GetSourceLocationOfTypeDefinition>(
                on_get_source_location_of_type_definition,
            )?
            .on_request_sync::<HoverRequest>(on_hover)?
            .on_request_sync::<GotoDefinition>(on_goto_definition)?
            .on_request_sync::<References>(on_references)?
            .on_request_sync::<Completion>(on_completion)?
            .on_request_sync::<CodeActionRequest>(on_code_action)?
            .on_request_sync::<Shutdown>(on_shutdown)?
            .on_request_sync::<GraphQLExecuteQuery>(on_graphql_execute_query)?
            .on_request_sync::<HeartbeatRequest>(on_heartbeat)?
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
            if error.code != ErrorCode::RequestCanceled as i32 {
                lsp_request_event.string("lsp_error_message", error.message.to_string());
            }
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
    debug!("notification received {:?}", notification);
    let lsp_notification_event = perf_logger.create_event("lsp_message");
    lsp_notification_event.string("lsp_method", notification.method.clone());
    lsp_notification_event.string("lsp_type", "notification".to_string());
    let lsp_notification_processing_time =
        lsp_notification_event.start("lsp_message_processing_time");

    let notification_result = dispatch_notification(notification, lsp_state);

    match notification_result {
        Ok(()) => {
            // The notification is not handled
            lsp_notification_event.string("lsp_outcome", "error".to_string());
        }
        Err(err) => {
            if let Some(err) = err {
                lsp_notification_event.string("lsp_outcome", "error".to_string());
                if let LSPRuntimeError::UnexpectedError(message) = err {
                    lsp_notification_event.string("lsp_error_message", message);
                }
            } else {
                lsp_notification_event.string("lsp_outcome", "success".to_string());
            }
        }
    }

    lsp_notification_event.stop(lsp_notification_processing_time);
    perf_logger.complete_event(lsp_notification_event);
}

fn dispatch_notification<TPerfLogger: PerfLogger + 'static>(
    notification: lsp_server::Notification,
    lsp_state: &mut LSPState<TPerfLogger>,
) -> Result<(), Option<LSPRuntimeError>> {
    let notification = LSPNotificationDispatch::new(notification, lsp_state)
        .on_notification_sync::<DidOpenTextDocument>(on_did_open_text_document)?
        .on_notification_sync::<DidCloseTextDocument>(on_did_close_text_document)?
        .on_notification_sync::<DidChangeTextDocument>(on_did_change_text_document)?
        .on_notification_sync::<DidSaveTextDocument>(on_did_save_text_document)?
        .on_notification_sync::<Cancel>(on_cancel)?
        .on_notification_sync::<Exit>(on_exit)?
        .notification();

    // If we have gotten here, we have not handled the notification
    debug!(
        "Error: no handler registered for notification '{}'",
        notification.method
    );
    Ok(())
}
