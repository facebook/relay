/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Unix domain socket server implementation.
//!
//! Provides the main server loop that accepts client connections and
//! dispatches requests to handlers.

use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;

use common::PerfLogger;
use log::debug;
use log::error;
use log::info;
use tokio::io::AsyncBufReadExt;
use tokio::io::AsyncWriteExt;
use tokio::io::BufReader;
use tokio::net::UnixListener;
use tokio::net::UnixStream;
use tokio::signal::unix::SignalKind;
use tokio::sync::Notify;
use tokio::task::JoinSet;

use crate::build_project::artifact_writer::DeferredArtifactCache;
use crate::compiler::Compiler;
use crate::config::Config;
use crate::server_daemon::DaemonMetadata;
use crate::server_daemon::FlushWriterFactory;
use crate::server_daemon::handlers;
use crate::server_daemon::protocol::DaemonRequest;
use crate::server_daemon::protocol::DaemonResponse;
use crate::status_reporter::BuildStatus;

/// Probe whether a process is actively listening on the given socket path.
///
/// Returns `true` if a `connect` succeeds (something is listening), `false`
/// otherwise. The connection is closed immediately.
fn socket_has_listener(socket_path: &Path) -> bool {
    std::os::unix::net::UnixStream::connect(socket_path).is_ok()
}

pub struct ServerConfig<TPerfLogger: PerfLogger + 'static> {
    pub socket_path: PathBuf,
    pub config_path: PathBuf,
    pub projects: Vec<String>,
    pub compiler_config: Config,
    pub perf_logger: Arc<TPerfLogger>,
    pub artifact_cache: Arc<DeferredArtifactCache>,
    pub build_status: Arc<BuildStatus>,
    pub compiler_version: String,
    /// Optional writer factory invoked by `handle_write` when a `Write`
    /// request supplies both `flush_manifest_path` and `flush_shard_dir`.
    /// When `None`, every `Write` flushes straight to disk.
    pub flush_writer_factory: Option<FlushWriterFactory>,
}

/// Start the Unix domain socket server.
///
/// This function binds to the specified socket path and accepts client connections
/// in a loop. Each client connection is handled in a separate task.
///
/// The server will gracefully shut down when the shutdown signal is received.
pub async fn start_server<TPerfLogger: PerfLogger + 'static>(
    config: ServerConfig<TPerfLogger>,
) -> Result<(), std::io::Error> {
    let socket_path = config.socket_path;
    if socket_path.exists() {
        if socket_has_listener(&socket_path) {
            error!("Another daemon is already running on {:?}", socket_path);
            return Err(std::io::Error::new(
                std::io::ErrorKind::AddrInUse,
                "Another daemon is already running",
            ));
        } else {
            info!(
                "Stale socket found with no connected process. Removing {:?}",
                socket_path
            );
            std::fs::remove_file(&socket_path)?;
        }
    }

    let listener = UnixListener::bind(&socket_path)?;
    info!("Server daemon listening on {:?}", socket_path);

    // Write metadata so clients can discover this daemon
    let metadata = DaemonMetadata {
        socket_path: socket_path.clone(),
        config_path: config.config_path,
        projects: config.projects,
        compiler_version: config.compiler_version.clone(),
        pid: std::process::id(),
    };
    if let Err(e) = metadata.write() {
        debug!("Failed to write daemon metadata: {}", e);
    }

    let shutdown_signal = Arc::new(Notify::new());

    // Set up signal handlers for graceful shutdown
    let mut sigint = tokio::signal::unix::signal(SignalKind::interrupt())?;
    let mut sigterm = tokio::signal::unix::signal(SignalKind::terminate())?;

    let artifact_cache = Arc::clone(&config.artifact_cache);
    let build_status = Arc::clone(&config.build_status);
    let compiler_version: Arc<str> = config.compiler_version.into();
    let flush_writer_factory = config.flush_writer_factory;

    let compiler_config = Arc::new(config.compiler_config);
    let compiler = Compiler::new(
        Arc::clone(&compiler_config),
        Arc::clone(&config.perf_logger),
    );
    let mut compiler_handle = tokio::spawn(async move {
        if let Err(e) = compiler.watch().await {
            error!("Compiler watch error: {}", e);
        }
    });

    let mut client_tasks = JoinSet::new();

    loop {
        tokio::select! {
            result = listener.accept() => {
                match result {
                    Ok((stream, _addr)) => {
                        let shutdown = Arc::clone(&shutdown_signal);
                        let task_artifact_cache = Arc::clone(&artifact_cache);
                        let task_build_status = Arc::clone(&build_status);
                        let task_compiler_version = Arc::clone(&compiler_version);
                        let task_config = Arc::clone(&compiler_config);
                        let task_flush_writer_factory = flush_writer_factory.clone();
                        client_tasks.spawn(async move {
                            if let Err(e) = handle_client(
                                stream,
                                shutdown,
                                task_artifact_cache,
                                task_build_status,
                                task_compiler_version,
                                task_config,
                                task_flush_writer_factory,
                            ).await {
                                debug!("Client handler error: {}", e);
                            }
                        });
                    }
                    Err(e) => {
                        error!("Failed to accept connection: {}", e);
                    }
                }
            }
            result = &mut compiler_handle => {
                let message = match result {
                    Ok(()) => "Compiler exited unexpectedly".to_string(),
                    Err(e) if e.is_panic() => {
                        let panic_msg = e.into_panic();
                        let detail = panic_msg
                            .downcast_ref::<&str>()
                            .map(|s| s.to_string())
                            .or_else(|| panic_msg.downcast_ref::<String>().cloned())
                            .unwrap_or_else(|| "unknown panic".to_string());
                        format!("Compiler panicked: {}", detail)
                    }
                    Err(e) => format!("Compiler task failed: {}", e),
                };
                error!("{}", message);
                // Unblock any in-flight wait_for_idle() calls so connected
                // clients get the error. Then exit so the next client starts
                // a fresh daemon (which may succeed if the issue was transient).
                build_status.compiler_crashed(message);
                break;
            }
            _ = shutdown_signal.notified() => {
                info!("Shutdown signal received, stopping daemon");
                break;
            }
            _ = sigint.recv() => {
                info!("Received SIGINT, stopping daemon");
                break;
            }
            _ = sigterm.recv() => {
                info!("Received SIGTERM, stopping daemon");
                break;
            }
        }
    }

    // Wait for in-flight client handlers to finish sending their responses.
    // Without this, the process can exit before a handler that just woke up
    // from wait_for_idle() (due to compiler_crashed) has written its response
    // back to the Unix socket — causing the client to see "No server response".
    if !client_tasks.is_empty() {
        info!(
            "Waiting up to 5 seconds for {} in-flight client handler(s)...",
            client_tasks.len()
        );
        let _ = tokio::time::timeout(std::time::Duration::from_secs(5), async {
            while client_tasks.join_next().await.is_some() {}
        })
        .await;
    }

    // Abort the compiler task (no-op if it already exited) and wait for cleanup.
    compiler_handle.abort();
    let _ = compiler_handle.await;

    metadata.cleanup();

    Ok(())
}

/// Handle a single client connection
async fn handle_client(
    stream: UnixStream,
    shutdown_signal: Arc<Notify>,
    artifact_cache: Arc<DeferredArtifactCache>,
    build_status: Arc<BuildStatus>,
    compiler_version: Arc<str>,
    config: Arc<Config>,
    flush_writer_factory: Option<FlushWriterFactory>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let (reader, mut writer) = stream.into_split();
    let mut reader = BufReader::new(reader);
    let mut line = String::new();

    // Read request (newline-delimited JSON)
    let bytes_read = reader.read_line(&mut line).await?;
    if bytes_read == 0 {
        debug!("Client disconnected before sending request");
        return Ok(());
    }

    let request: DaemonRequest = serde_json::from_str(&line)?;
    debug!("Received request: {:?}", request);

    let response = dispatch_request(
        request,
        &shutdown_signal,
        &artifact_cache,
        &build_status,
        &compiler_version,
        &config,
        flush_writer_factory.as_ref(),
    )
    .await;

    let mut response_json = serde_json::to_string(&response)?;
    response_json.push('\n');
    writer.write_all(response_json.as_bytes()).await?;

    Ok(())
}

/// Dispatch a request to the appropriate handler
async fn dispatch_request(
    request: DaemonRequest,
    shutdown_signal: &Arc<Notify>,
    artifact_cache: &Arc<DeferredArtifactCache>,
    build_status: &Arc<BuildStatus>,
    compiler_version: &str,
    config: &Arc<Config>,
    flush_writer_factory: Option<&FlushWriterFactory>,
) -> DaemonResponse {
    match request {
        DaemonRequest::Write {
            flush_manifest_path,
            flush_shard_dir,
        } => {
            handlers::handle_write(
                artifact_cache,
                build_status,
                config,
                flush_writer_factory,
                flush_manifest_path,
                flush_shard_dir,
            )
            .await
        }
        DaemonRequest::Version => handlers::handle_version(compiler_version),
        DaemonRequest::Shutdown => handlers::handle_shutdown(shutdown_signal),
    }
}

/// Send a request to a running daemon.
///
/// Returns None if the daemon is not running or the request fails.
pub async fn send_request(socket_path: &Path, request: DaemonRequest) -> Option<DaemonResponse> {
    let stream = UnixStream::connect(socket_path).await.ok()?;
    let (reader, mut writer) = stream.into_split();

    let mut request_json = serde_json::to_string(&request).ok()?;
    request_json.push('\n');
    writer.write_all(request_json.as_bytes()).await.ok()?;
    writer.shutdown().await.ok()?;

    let mut reader = BufReader::new(reader);
    let mut response = String::new();
    reader.read_line(&mut response).await.ok()?;

    serde_json::from_str(&response).ok()
}
