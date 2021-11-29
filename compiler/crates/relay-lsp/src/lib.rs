/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(clippy::all)]

mod client;
mod code_action;
mod completion;
pub mod diagnostic_reporter;
mod explore_schema_for_type;
pub mod goto_definition;
mod graphql_tools;
pub mod hover;
pub mod js_language_server;
pub mod location;
mod lsp_extra_data_provider;
pub mod lsp_process_error;
pub mod lsp_runtime_error;
pub mod node_resolution_info;
pub mod references;
pub mod resolution_path;
mod resolved_types_at_location;
mod search_schema_items;
mod server;
mod shutdown;
mod status_reporter;
pub mod status_updater;
pub mod text_documents;
pub mod utils;
use common::PerfLogger;
pub use hover::ContentConsumerType;
pub use js_language_server::JSLanguageServer;
use log::debug;
pub use lsp_extra_data_provider::{
    FieldDefinitionSourceInfo, FieldSchemaInfo, LSPExtraDataProvider,
};
use lsp_process_error::LSPProcessResult;
pub use lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult};
use lsp_server::Connection;
use relay_compiler::config::Config;
use schema_documentation::{SchemaDocumentation, SchemaDocumentationLoader};
pub use server::LSPNotificationDispatch;
pub use server::LSPRequestDispatch;
pub use server::{GlobalState, LSPState, Schemas};
use std::sync::Arc;
pub use utils::position_to_offset;
#[cfg(test)]
#[macro_use]
extern crate assert_matches;

pub async fn start_language_server<
    TPerfLogger,
    TSchemaDocumentation: SchemaDocumentation + 'static,
>(
    config: Config,
    perf_logger: Arc<TPerfLogger>,
    extra_data_provider: Box<dyn LSPExtraDataProvider + Send + Sync>,
    schema_documentation_loader: Option<Box<dyn SchemaDocumentationLoader<TSchemaDocumentation>>>,
    js_language_server: Option<
        Box<dyn JSLanguageServer<TState = LSPState<TPerfLogger, TSchemaDocumentation>>>,
    >,
) -> LSPProcessResult<()>
where
    TPerfLogger: PerfLogger + 'static,
{
    let (connection, io_handles) = Connection::stdio();
    debug!("Initialized stdio transport layer");
    let params = server::initialize(&connection)?;
    debug!("JSON-RPC handshake completed");
    server::run(
        connection,
        config,
        params,
        perf_logger,
        extra_data_provider,
        schema_documentation_loader,
        js_language_server,
    )
    .await?;
    io_handles.join()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::client;
    use super::lsp_process_error::LSPProcessResult;
    use super::server;
    use lsp_server::Connection;
    use lsp_types::{ClientCapabilities, InitializeParams};
    #[test]
    fn initialize() -> LSPProcessResult<()> {
        // Test with an in-memory connection pair
        let (connection, client) = Connection::memory();
        // Mock set of client parameters. The `root_path` field is deprecated, but
        // still required to construct the params, so we allow deprecated fields here.
        #[allow(deprecated)]
        let init_params = InitializeParams {
            process_id: Some(1),
            root_path: None,
            root_uri: None,
            initialization_options: None,
            capabilities: ClientCapabilities::default(),
            trace: None,
            workspace_folders: None,
            client_info: None,
            locale: None,
        };
        client::initialize(&client, &init_params, 0);
        let params = server::initialize(&connection)?;
        assert_eq!(params, init_params);
        Ok(())
    }
}
