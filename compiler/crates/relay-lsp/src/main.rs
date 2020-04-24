/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![warn(clippy::all)]

mod client;
mod server;
use lsp_server::Connection;
use std::error::Error;

fn main() -> Result<(), Box<dyn Error + Sync + Send>> {
    let (connection, io_handles) = Connection::stdio();
    let params = server::initialize(&connection)?;
    server::run(&connection, params)?;
    io_handles.join()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::client;
    use super::server;
    use lsp_server::Connection;
    use lsp_types::{ClientCapabilities, InitializeParams};
    use std::error::Error;
    #[test]
    fn initialize() -> Result<(), Box<dyn Error + Sync + Send>> {
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
