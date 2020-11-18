/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![warn(clippy::all)]

mod client;
mod completion;
pub mod error;
mod goto_definition;
mod hover;
mod lsp;
mod server;
mod status_reporting;
mod text_documents;
mod type_path;
mod utils;
use common::PerfLogger;
use error::Result;
use log::info;
use lsp_server::Connection;
use relay_compiler::config::Config;
use std::sync::Arc;

pub async fn start_language_server<TPerfLogger>(
    config: Config,
    perf_logger: Arc<TPerfLogger>,
) -> Result<()>
where
    TPerfLogger: PerfLogger + 'static,
{
    let (connection, io_handles) = Connection::stdio();
    info!("Initialized stdio transport layer");
    let params = server::initialize(&connection)?;
    info!("JSON-RPC handshake completed");
    server::run(connection, config, params, perf_logger).await?;
    io_handles.join()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::client;
    use super::error::Result;
    use super::server;
    use lsp_server::Connection;
    use lsp_types::{ClientCapabilities, InitializeParams};
    #[test]
    fn initialize() -> Result<()> {
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
        };
        client::initialize(&client, &init_params, 0);
        let params = server::initialize(&connection)?;
        assert_eq!(params, init_params);
        Ok(())
    }
}
