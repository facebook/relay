/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod heartbeat;
mod lsp_notification_dispatch;
mod lsp_request_dispatch;
mod lsp_state;
mod lsp_state_resources;
mod task_queue;

use std::ops::ControlFlow;
use std::sync::Arc;

use common::PerfLogEvent;
use common::PerfLogger;
use crossbeam::channel::Receiver;
use crossbeam::select;
use heartbeat::HeartbeatRequest;
use heartbeat::on_heartbeat;
use log::debug;
pub use lsp_notification_dispatch::LSPNotificationDispatch;
pub use lsp_request_dispatch::LSPRequestDispatch;
use lsp_server::Connection;
use lsp_server::ErrorCode;
use lsp_server::Message;
use lsp_server::Notification;
use lsp_server::Response as ServerResponse;
use lsp_server::ResponseError;
pub use lsp_state::GlobalState;
pub use lsp_state::LSPState;
pub use lsp_state::Schemas;
pub use lsp_state::build_ir_for_lsp;
use lsp_types::CodeActionOptions;
use lsp_types::CodeActionProviderCapability;
use lsp_types::CompletionOptions;
use lsp_types::RenameOptions;
use lsp_types::ServerCapabilities;
use lsp_types::TextDocumentSyncCapability;
use lsp_types::TextDocumentSyncKind;
use lsp_types::WorkDoneProgressOptions;
use lsp_types::notification::Cancel;
use lsp_types::notification::DidChangeTextDocument;
use lsp_types::notification::DidCloseTextDocument;
use lsp_types::notification::DidOpenTextDocument;
use lsp_types::notification::DidSaveTextDocument;
use lsp_types::notification::Exit;
use lsp_types::request::CodeActionRequest;
use lsp_types::request::Completion;
use lsp_types::request::GotoDefinition;
use lsp_types::request::HoverRequest;
use lsp_types::request::InlayHintRequest;
use lsp_types::request::PrepareRenameRequest;
use lsp_types::request::References;
use lsp_types::request::Rename;
use lsp_types::request::ResolveCompletionItem;
use lsp_types::request::Shutdown;
use relay_compiler::NoopArtifactWriter;
use relay_compiler::config::Config;
use schema_documentation::SchemaDocumentation;
use schema_documentation::SchemaDocumentationLoader;

use self::task_queue::TaskProcessor;
pub use crate::LSPExtraDataProvider;
use crate::code_action::on_code_action;
use crate::completion::on_completion;
use crate::completion::on_resolve_completion_item;
use crate::daemon;
use crate::daemon::DeamonRequestMessage;
use crate::explore_schema_for_type::ExploreSchemaForType;
use crate::explore_schema_for_type::on_explore_schema_for_type;
use crate::find_field_usages::FindFieldUsages;
use crate::find_field_usages::on_find_field_usages;
use crate::goto_definition::GetSourceLocationOfTypeDefinition;
use crate::goto_definition::on_get_source_location_of_type_definition;
use crate::goto_definition::on_goto_definition;
use crate::graphql_tools::GraphQLExecuteQuery;
use crate::graphql_tools::on_graphql_execute_query;
use crate::hover::on_hover;
use crate::inlay_hints::on_inlay_hint_request;
use crate::lsp_process_error::LSPProcessResult;
use crate::lsp_runtime_error::LSPRuntimeError;
use crate::print_operation::PrintOperation;
use crate::print_operation::on_print_operation;
use crate::references::on_references;
use crate::rename::on_prepare_rename;
use crate::rename::on_rename;
use crate::resolved_types_at_location::ResolvedTypesAtLocation;
use crate::resolved_types_at_location::on_get_resolved_types_at_location;
use crate::search_schema_items::SearchSchemaItems;
use crate::search_schema_items::on_search_schema_items;
use crate::server::lsp_state::handle_lsp_state_tasks;
use crate::server::lsp_state_resources::LSPStateResources;
use crate::server::task_queue::TaskQueue;
use crate::shutdown::on_exit;
use crate::shutdown::on_shutdown;
use crate::status_reporter::LSPStatusReporter;
use crate::text_documents::on_cancel;
use crate::text_documents::on_did_change_text_document;
use crate::text_documents::on_did_close_text_document;
use crate::text_documents::on_did_open_text_document;
use crate::text_documents::on_did_save_text_document;
use crate::type_information::get_type_information;

/// Initializes an LSP connection, handling the `initialize` message and `initialized` notification
/// handshake.
pub fn initialize(connection: &Connection) -> LSPProcessResult<()> {
    // We don't currently negotiate character encoding in the Relay LSP.
    // This means we fall back to the LSP default of UTF-16, but we make no effort to
    // ensure that the LSP positions we emit are actually representing the source text as UTF-16.
    // This is a possible source of positioning issues, but in lieu of having a reproducible bug,
    // we're leaving it how it is for now.

    let server_capabilities = ServerCapabilities {
        // Enable text document syncing so we can know when files are opened/changed/saved/closed
        text_document_sync: Some(TextDocumentSyncCapability::Kind(TextDocumentSyncKind::FULL)),

        completion_provider: Some(CompletionOptions {
            resolve_provider: Some(true),
            trigger_characters: Some(vec!["(".into(), "\n".into(), ",".into(), "@".into()]),
            work_done_progress_options: WorkDoneProgressOptions {
                work_done_progress: None,
            },
            ..Default::default()
        }),
        rename_provider: Some(lsp_types::OneOf::Right(RenameOptions {
            prepare_provider: Some(true),
            work_done_progress_options: WorkDoneProgressOptions {
                work_done_progress: None,
            },
        })),
        hover_provider: Some(lsp_types::HoverProviderCapability::Simple(true)),
        definition_provider: Some(lsp_types::OneOf::Left(true)),
        references_provider: Some(lsp_types::OneOf::Left(true)),
        code_action_provider: Some(CodeActionProviderCapability::Options(CodeActionOptions {
            code_action_kinds: Some(vec![lsp_types::CodeActionKind::QUICKFIX]),
            ..Default::default()
        })),
        inlay_hint_provider: Some(lsp_types::OneOf::Left(true)),
        ..Default::default()
    };

    let server_capabilities = serde_json::to_value(server_capabilities)?;
    connection.initialize(server_capabilities)?;
    Ok(())
}

#[derive(Debug)]
pub enum Task {
    InboundMessage(lsp_server::Message),
    LSPState(lsp_state::Task),
    DeamonRequest(daemon::DeamonRequest),
}

/// Run the main server loop
pub async fn run<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation + 'static,
>(
    connection: Connection,
    mut config: Config,
    perf_logger: Arc<TPerfLogger>,
    extra_data_provider: Box<dyn LSPExtraDataProvider + Send + Sync>,
    schema_documentation_loader: Option<Box<dyn SchemaDocumentationLoader<TSchemaDocumentation>>>,
) -> LSPProcessResult<()> {
    debug!(
        "Running language server with config root {:?}",
        config.root_dir
    );

    let task_processor = LSPTaskProcessor;
    let mut task_queue = TaskQueue::new(Arc::new(task_processor));
    let task_scheduler = task_queue.get_scheduler();

    config.artifact_writer = Box::new(NoopArtifactWriter);
    config.status_reporter = Box::new(LSPStatusReporter::new(
        config.root_dir.clone(),
        connection.sender.clone(),
    ));

    let lsp_state = Arc::new(LSPState::new(
        Arc::new(config),
        connection.sender.clone(),
        Arc::clone(&task_scheduler),
        Arc::clone(&perf_logger),
        extra_data_provider,
        schema_documentation_loader,
    ));

    LSPStateResources::new(Arc::clone(&lsp_state)).watch();

    let daemon_task_scheduler = Arc::clone(&task_scheduler);
    tokio::spawn(daemon::start_server(Arc::new(move |request| {
        daemon_task_scheduler.schedule(Task::DeamonRequest(request));
    })));

    tokio::task::spawn_blocking(move || {
        // `next_task` is a blocking function that will block until a message is received, that's why we
        // need to spawn a blocking task here and then go back to async execution with `block_in_place`.
        while let Some(task) = next_task(&connection.receiver, &task_queue.receiver) {
            tokio::task::block_in_place(|| {
                tokio::runtime::Handle::current()
                    .block_on(async { task_queue.process(Arc::clone(&lsp_state), task).await })
            });
        }
    })
    .await?;

    panic!("Client exited without proper shutdown sequence.")
}

fn next_task(
    lsp_receiver: &Receiver<Message>,
    task_queue_receiver: &Receiver<Task>,
) -> Option<Task> {
    select! {
        recv(lsp_receiver) -> message => message.ok().map(Task::InboundMessage),
        recv(task_queue_receiver) -> task => task.ok()
    }
}

static NOTIFCATIONS_MUTATING_LSP_STATE: [&str; 3] = [
    "textDocument/didOpen",
    "textDocument/didChange",
    "textDocument/didClose",
];

struct LSPTaskProcessor;

impl<TPerfLogger: PerfLogger + 'static, TSchemaDocumentation: SchemaDocumentation + 'static>
    TaskProcessor<LSPState<TPerfLogger, TSchemaDocumentation>, Task> for LSPTaskProcessor
{
    fn process(&self, state: Arc<LSPState<TPerfLogger, TSchemaDocumentation>>, task: Task) {
        match task {
            Task::InboundMessage(Message::Request(request)) => handle_request(state, request),
            Task::InboundMessage(Message::Notification(notification)) => {
                handle_notification(state, notification);
            }
            Task::LSPState(lsp_task) => {
                handle_lsp_state_tasks(state, lsp_task);
            }
            Task::InboundMessage(Message::Response(_)) => {
                // TODO: handle response from the client -> cancel message, etc
            }
            Task::DeamonRequest(daemon_request) => {
                tokio::spawn(async {
                    let response = handle_daemon_request(state, daemon_request.message).await;
                    daemon_request.responder.respond(response);
                });
            }
        }
    }

    fn is_serial_task(&self, task: &Task) -> bool {
        match task {
            Task::InboundMessage(Message::Notification(notification)) => {
                NOTIFCATIONS_MUTATING_LSP_STATE.contains(&notification.method.as_str())
            }
            _ => false,
        }
    }
}

async fn handle_daemon_request<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation + 'static,
>(
    state: Arc<LSPState<TPerfLogger, TSchemaDocumentation>>,
    daemon_request_message: DeamonRequestMessage,
) -> Result<String, String> {
    match daemon_request_message {
        daemon::DeamonRequestMessage::TypeInformation {
            file_uri,
            type_name,
            string_filter,
        } => {
            let Ok(project_name) = state.extract_project_name_from_url(&file_uri) else {
                return Err(format!(
                    "Unable to map {file_uri:?} to Relay GraphQL project."
                ));
            };
            if let Some(when_ready) = state.initialize_lsp_state_resources(project_name) {
                debug!("Waiting for LSP state resources to be ready");
                when_ready.wait().await;
                debug!("LSP state resources are ready");
            } else {
                debug!("LSP state resources are already ready");
            }

            get_type_information(state.as_ref(), file_uri, type_name, string_filter)
        }
    }
}

fn handle_request<TPerfLogger: PerfLogger + 'static, TSchemaDocumentation: SchemaDocumentation>(
    lsp_state: Arc<LSPState<TPerfLogger, TSchemaDocumentation>>,
    request: lsp_server::Request,
) {
    debug!("request received {request:?}");
    let lsp_request_event = lsp_state.perf_logger.create_event("lsp_message");
    let get_server_response_bound = |req| dispatch_request(req, lsp_state.as_ref());
    let get_response = with_request_logging(&lsp_request_event, get_server_response_bound);

    lsp_state
        .send_message(Message::Response(get_response(request)))
        .expect("Unable to send message to a client.");
    lsp_request_event.complete();
}

fn dispatch_request(request: lsp_server::Request, lsp_state: &impl GlobalState) -> ServerResponse {
    // Returns ControlFlow::Break(ServerResponse) if the request
    // was handled, ControlFlow::Continue(Request) otherwise.
    let get_response = || {
        let request = LSPRequestDispatch::new(request, lsp_state)
            .on_request_sync::<ResolvedTypesAtLocation>(on_get_resolved_types_at_location)?
            .on_request_sync::<SearchSchemaItems>(on_search_schema_items)?
            .on_request_sync::<ExploreSchemaForType>(on_explore_schema_for_type)?
            .on_request_sync::<GetSourceLocationOfTypeDefinition>(
                on_get_source_location_of_type_definition,
            )?
            .on_request_sync::<PrintOperation>(on_print_operation)?
            .on_request_sync::<HoverRequest>(on_hover)?
            .on_request_sync::<GotoDefinition>(on_goto_definition)?
            .on_request_sync::<References>(on_references)?
            .on_request_sync::<Completion>(on_completion)?
            .on_request_sync::<ResolveCompletionItem>(on_resolve_completion_item)?
            .on_request_sync::<CodeActionRequest>(on_code_action)?
            .on_request_sync::<Shutdown>(on_shutdown)?
            .on_request_sync::<GraphQLExecuteQuery>(on_graphql_execute_query)?
            .on_request_sync::<HeartbeatRequest>(on_heartbeat)?
            .on_request_sync::<FindFieldUsages>(on_find_field_usages)?
            .on_request_sync::<InlayHintRequest>(on_inlay_hint_request)?
            .on_request_sync::<Rename>(on_rename)?
            .on_request_sync::<PrepareRenameRequest>(on_prepare_rename)?
            .request();

        // If we have gotten here, we have not handled the request
        ControlFlow::Continue(request)
    };

    match get_response() {
        ControlFlow::Break(response) => response,
        ControlFlow::Continue(request) => ServerResponse {
            id: request.id,
            result: None,
            error: Some(ResponseError {
                code: ErrorCode::MethodNotFound as i32,
                data: None,
                message: format!("No handler registered for method '{}'", request.method),
            }),
        },
    }
}

fn with_request_logging<'a>(
    lsp_request_event: &'a impl PerfLogEvent,
    get_response: impl FnOnce(lsp_server::Request) -> ServerResponse + 'a,
) -> impl FnOnce(lsp_server::Request) -> ServerResponse + 'a {
    move |request| {
        lsp_request_event.string("lsp_method", request.method.clone());
        lsp_request_event.string("lsp_type", "request".to_string());
        let lsp_request_processing_time = lsp_request_event.start("lsp_message_processing_time");

        let response = get_response(request);

        if response.result.is_some() {
            lsp_request_event.string("lsp_outcome", "success".to_string());
        } else if let Some(error) = &response.error {
            if error.code == ErrorCode::RequestCanceled as i32 {
                lsp_request_event.string("lsp_outcome", "canceled".to_string());
            } else {
                lsp_request_event.string("lsp_outcome", "error".to_string());
                lsp_request_event.string("lsp_error_message", error.message.to_string());
                if let Some(data) = &error.data {
                    lsp_request_event.string("lsp_error_data", data.to_string());
                }
            }
        }
        // N.B. we don't handle the case where the ServerResponse has neither a result nor
        // an error, which is an invalid state.

        lsp_request_event.stop(lsp_request_processing_time);
        response
    }
}

fn handle_notification<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation,
>(
    lsp_state: Arc<LSPState<TPerfLogger, TSchemaDocumentation>>,
    notification: Notification,
) {
    debug!("notification received {notification:?}");
    let lsp_notification_event = lsp_state.perf_logger.create_event("lsp_message");
    lsp_notification_event.string("lsp_method", notification.method.clone());
    lsp_notification_event.string("lsp_type", "notification".to_string());
    let lsp_notification_processing_time =
        lsp_notification_event.start("lsp_message_processing_time");

    let notification_result = dispatch_notification(notification, lsp_state.as_ref());

    match notification_result {
        ControlFlow::Continue(()) => {
            // The notification is not handled
            lsp_notification_event.string("lsp_outcome", "error".to_string());
        }
        ControlFlow::Break(err) => {
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
    lsp_notification_event.complete();
}

fn dispatch_notification(
    notification: lsp_server::Notification,
    lsp_state: &impl GlobalState,
) -> ControlFlow<Option<LSPRuntimeError>, ()> {
    // Returns ControlFlow::Break(Option<LSPRuntimeError>) if the notification
    // was handled, ControlFlow::Continue(()) otherwise.
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
    ControlFlow::Continue(())
}
