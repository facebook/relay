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
mod diagnostic_reporter;
mod extension_config;
mod goto_definition;
mod graphql_tools;
mod hover;
mod js_language_server;
mod location;
mod lsp;
mod lsp_extra_data_provider;
pub mod lsp_process_error;
mod lsp_runtime_error;
mod node_resolution_info;
mod references;
mod resolution_path;
mod resolved_types_at_location;
mod search_schema_items;
mod server;
mod shutdown;
mod status_reporting;
mod text_documents;
mod utils;
pub use crate::extension_config::ExtensionConfig;
use common::PerfLogger;
pub use js_language_server::JSLanguageServer;
use js_language_server::NoopJSLanguageServer;
use log::debug;
pub use lsp_extra_data_provider::{FieldDefinitionSourceInfo, LSPExtraDataProvider};
use lsp_process_error::LSPProcessResult;
pub use lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult};
use lsp_server::Connection;
use relay_compiler::config::Config;
pub use server::{LSPState, Schemas};
use std::sync::Arc;
pub use utils::position_to_offset;
#[cfg(test)]
#[macro_use]
extern crate assert_matches;

pub async fn start_language_server<TPerfLogger>(
    config: Config,
    extension_config: ExtensionConfig,
    perf_logger: Arc<TPerfLogger>,
    extra_data_provider: Box<dyn LSPExtraDataProvider + Send + Sync>,
    js_language_server: Option<Box<dyn JSLanguageServer<TPerfLogger>>>,
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
        extension_config,
        params,
        perf_logger,
        extra_data_provider,
        js_language_server.unwrap_or_else(|| Box::new(NoopJSLanguageServer::default())),
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
