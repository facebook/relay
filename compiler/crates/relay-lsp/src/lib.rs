/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(clippy::all)]

mod client;
mod code_action;
pub mod completion;
pub mod diagnostic_reporter;
mod docblock_resolution_info;
mod explore_schema_for_type;
pub mod find_field_usages;
pub mod goto_definition;
mod graphql_tools;
pub mod hover;
mod inlay_hints;
pub mod location;
mod lsp_extra_data_provider;
pub mod lsp_process_error;
pub mod lsp_runtime_error;
pub mod node_resolution_info;
pub mod references;
pub mod rename;
mod resolved_types_at_location;
mod search_schema_items;
mod server;
mod shutdown;
mod status_reporter;
pub mod status_updater;
pub mod text_documents;
pub mod utils;
use std::sync::Arc;

use common::PerfLogger;
use docblock_resolution_info::DocblockResolutionInfo;
pub use extract_graphql::JavaScriptSourceFeature;
use graphql_syntax::ExecutableDocument;
use graphql_syntax::SchemaDocument;
pub use hover::ContentConsumerType;
use log::debug;
pub use lsp_extra_data_provider::DummyExtraDataProvider;
pub use lsp_extra_data_provider::FieldDefinitionSourceInfo;
pub use lsp_extra_data_provider::FieldSchemaInfo;
pub use lsp_extra_data_provider::LSPExtraDataProvider;
use lsp_process_error::LSPProcessResult;
pub use lsp_runtime_error::LSPRuntimeError;
pub use lsp_runtime_error::LSPRuntimeResult;
use lsp_server::Connection;
use node_resolution_info::NodeResolutionInfo;
use relay_compiler::config::Config;
use relay_docblock::DocblockIr;
use schema_documentation::SchemaDocumentation;
use schema_documentation::SchemaDocumentationLoader;
pub use server::GlobalState;
pub use server::LSPNotificationDispatch;
pub use server::LSPRequestDispatch;
pub use server::LSPState;
pub use server::Schemas;
pub use utils::position_to_offset;

pub enum Feature {
    ExecutableDocument(ExecutableDocument),
    DocblockIr(DocblockIr),
    SchemaDocument(SchemaDocument),
}

#[allow(clippy::large_enum_variant)]
pub enum FeatureResolutionInfo {
    GraphqlNode(NodeResolutionInfo),
    DocblockNode(DocblockNode),
}

pub struct DocblockNode {
    resolution_info: DocblockResolutionInfo,
    ir: DocblockIr,
}

pub async fn start_language_server<
    TPerfLogger,
    TSchemaDocumentation: SchemaDocumentation + 'static,
>(
    config: Config,
    perf_logger: Arc<TPerfLogger>,
    extra_data_provider: Box<dyn LSPExtraDataProvider + Send + Sync>,
    schema_documentation_loader: Option<Box<dyn SchemaDocumentationLoader<TSchemaDocumentation>>>,
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
    )
    .await?;
    io_handles.join()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use lsp_server::Connection;
    use lsp_types::ClientCapabilities;
    use lsp_types::InitializeParams;

    use super::client;
    use super::lsp_process_error::LSPProcessResult;
    use super::server;
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
