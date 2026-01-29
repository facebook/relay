/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! This modules implements a daemon to help quickly respond to CLI requests
//! when we already have a running server. This is currently started as part of
//! the LSP server, but could also be run independently.
//!
//! The communication runs over TCP to be easily cross-platform. The messages
//! are just a success or failure with an associated output string representing
//! stdout or stderr.

use std::fmt;
use std::sync::Arc;

use log::debug;
use log::error;
use log::warn;
use lsp_types::Url;
use serde::Deserialize;
use serde::Serialize;
use tokio::io::AsyncReadExt;
use tokio::io::AsyncWriteExt;
use tokio::net::TcpListener;
use tokio::net::TcpStream;
use tokio::sync::oneshot;

const TCP_ADDR: &str = "[::1]:53141";

pub struct Responder(oneshot::Sender<DeamonResponse>);
impl Responder {
    pub fn respond(self, response: DeamonResponse) {
        if self.0.send(response).is_err() {
            debug!("Failed to send response");
        }
    }
}

pub struct DeamonRequest {
    pub responder: Responder,
    pub message: DeamonRequestMessage,
}
impl DeamonRequest {
    pub fn new(responder: oneshot::Sender<DeamonResponse>, message: DeamonRequestMessage) -> Self {
        Self {
            responder: Responder(responder),
            message,
        }
    }
}
impl fmt::Debug for DeamonRequest {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("DeamonRequest")
            .field("message", &self.message)
            .finish_non_exhaustive()
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub enum DeamonRequestMessage {
    TypeInformation {
        file_uri: Url,
        type_name: String,
        string_filter: Option<String>,
    },
}

/// The response from the daemon. The current format is just the output
/// for stdout or stderr and intended to be printed directly.
pub type DeamonResponse = Result<String, String>;

type Processor = Arc<dyn Fn(DeamonRequest) + Send + Sync>;

pub async fn start_server(process: Processor) {
    let Ok(listener) = TcpListener::bind(TCP_ADDR).await else {
        error!(
            "failed to bind to {}, not starting type information daemon",
            TCP_ADDR
        );
        return;
    };
    debug!("listening on {}", TCP_ADDR);

    loop {
        match listener.accept().await {
            Ok((stream, _)) => {
                let process = Arc::clone(&process);
                tokio::spawn(async move {
                    handle_client(process, stream).await;
                });
            }
            Err(e) => {
                error!("Failed to accept TCP socket connection: {}", e);
            }
        }
    }
}

/// Send a request to the daemon, returning None on when the daemon is not
/// running or the request fails.
pub async fn send_request(message: DeamonRequestMessage) -> Option<DeamonResponse> {
    let Ok(stream) = TcpStream::connect(TCP_ADDR).await else {
        debug!("Failed to connect to daemon");
        return None;
    };
    let (mut reader, mut writer) = stream.into_split();

    let mut request = serde_json::to_string(&message).unwrap();
    request.push('\n');
    if let Err(e) = writer.write_all(request.as_bytes()).await {
        debug!("Failed to write request: {}", e);
        return None;
    }
    if let Err(e) = writer.shutdown().await {
        debug!("Failed to shutdown writer: {}", e);
        return None;
    }

    let mut response = String::new();
    if let Err(e) = reader.read_to_string(&mut response).await {
        debug!("Failed to read response: {}", e);
        return None;
    }
    match serde_json::from_str::<DeamonResponse>(&response) {
        Ok(response) => Some(response),
        Err(e) => {
            debug!("Failed to parse response: {}", e);
            None
        }
    }
}

/// Handles a single client connection.
async fn handle_client(process: Processor, mut stream: TcpStream) {
    let mut request = String::new();
    match stream.read_to_string(&mut request).await {
        Ok(0) => {
            debug!("Client disconnected");
        }
        Ok(_) => match serde_json::from_str::<DeamonRequestMessage>(&request) {
            Ok(message) => {
                debug!("Received message: {:?}", message);
                let (tx, rx) = oneshot::channel();
                let request = DeamonRequest::new(tx, message);
                process(request);
                match rx.await {
                    Ok(response) => {
                        let mut response_json = serde_json::to_string_pretty(&response).unwrap();
                        response_json.push('\n');
                        if let Err(e) = stream.write_all(response_json.as_bytes()).await {
                            error!("Failed to write response: {}", e);
                        }
                    }
                    Err(e) => {
                        error!("Failed to receive response: {}", e);
                    }
                }
            }
            Err(e) => {
                warn!("Failed to parse message '{}': {}", request, e);
            }
        },
        Err(e) => {
            warn!("Error reading from client: {}", e);
        }
    }
}
