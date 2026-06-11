/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Request handlers for the server daemon.
//!
//! Each handler processes a specific request type and returns an appropriate response.

use std::path::PathBuf;
use std::sync::Arc;

use log::error;
use log::info;
use log::warn;
use tokio::sync::Notify;

use crate::build_project::artifact_writer::DeferredArtifactCache;
use crate::config::Config;
use crate::server_daemon::FlushWriterFactory;
use crate::server_daemon::protocol::BuildMessage;
use crate::server_daemon::protocol::DaemonResponse;
use crate::server_daemon::protocol::ErrorCode;
use crate::server_daemon::protocol::ResponseResult;
use crate::status_reporter::BuildResult;
use crate::status_reporter::BuildStatus;
use crate::status_reporter::WatchmanSyncOutcome;

/// Maximum number of freshness check retries before flushing anyway.
const MAX_FRESHNESS_RETRIES: usize = 10;

/// Handle Write request by flushing cached artifacts. Flushes straight to
/// disk by default. When the request supplies both `flush_manifest_path`
/// and `flush_shard_dir` and the daemon has a `flush_writer_factory`
/// installed, the factory builds an [`ArtifactWriter`] that receives the
/// flushed bytes instead.
///
/// Waits for any ongoing build to complete before flushing. Uses the same
/// synchronized Watchman sync path as the build loop
/// ([`BuildStatus::sync_file_changes`]) to detect and enqueue pending file
/// changes. If changes are found, they are pushed into the compiler's
/// pending-changes queue and the build loop is notified, ensuring the
/// changes are compiled before artifacts are flushed.
pub async fn handle_write(
    artifact_cache: &Arc<DeferredArtifactCache>,
    build_status: &Arc<BuildStatus>,
    config: &Arc<Config>,
    flush_writer_factory: Option<&FlushWriterFactory>,
    flush_manifest_path: Option<PathBuf>,
    flush_shard_dir: Option<PathBuf>,
) -> DaemonResponse {
    for _attempt in 0..=MAX_FRESHNESS_RETRIES {
        build_status.wait_for_idle().await;

        // Query Watchman through the single authoritative sync path.
        // This acquires the same lock used by the build loop, so the
        // clock advances atomically and discovered changes are pushed
        // directly into the compiler's pending-changes queue.
        match build_status.sync_file_changes(config).await {
            WatchmanSyncOutcome::Changes => {
                // We found and enqueued changes. Mark a build as pending,
                // wake the build loop, and wait for it to finish.
                build_status.changes_pending();
                build_status.notify_build_loop().await;
                warn!("Watchman freshness check: changes pending, waiting for rebuild...");
                continue;
            }
            WatchmanSyncOutcome::NeedsReset => {
                // Watchman couldn't give a trustworthy answer (fresh instance
                // or query error). Request a full reset: the build loop will
                // abort, and watch() will reinitialize from saved state (or
                // fall back to a full build). wait_for_idle() at the top of
                // the next iteration blocks through the whole reset cycle.
                warn!(
                    "Watchman sync unreliable; requesting compiler reset and waiting \
                     for reinitialization..."
                );
                build_status.request_reset();
                build_status.notify_build_loop().await;
                continue;
            }
            WatchmanSyncOutcome::NoChanges => break,
        }
    }
    build_status.wait_for_idle().await;

    let build_result: Result<Vec<BuildMessage>, Vec<BuildMessage>> =
        match build_status.take_build_result() {
            Some(BuildResult::Success(diagnostics)) => {
                let mut msgs: Vec<BuildMessage> = diagnostics
                    .into_iter()
                    .map(|(severity, msg)| BuildMessage::from_diagnostic(severity, msg))
                    .collect();
                msgs.push(BuildMessage::info("Compilation completed.".to_string()));
                Ok(msgs)
            }
            Some(BuildResult::Errors(error_msgs)) => Err(error_msgs
                .into_iter()
                .map(|(severity, msg)| BuildMessage::from_diagnostic(severity, msg))
                .collect()),
            None => Ok(vec![BuildMessage::info(
                "No changes to compile".to_string(),
            )]),
        };

    let flush_result = match (flush_manifest_path, flush_shard_dir, flush_writer_factory) {
        (Some(manifest_path), Some(shard_dir), Some(factory)) => {
            info!("Build idle, flushing artifacts via injected writer...");
            let writer = factory(manifest_path, shard_dir);
            artifact_cache.flush_to_writer(&*writer)
        }
        (Some(_), Some(_), None) => {
            warn!(
                "Flush paths provided but no FlushWriterFactory installed; falling back to disk flush"
            );
            artifact_cache.flush_to_disk()
        }
        _ => {
            info!("Build idle, flushing artifacts to disk...");
            artifact_cache.flush_to_disk()
        }
    };

    match flush_result {
        Ok(count) => {
            info!("Successfully flushed {} artifacts", count);

            let extra_info = if build_result.is_ok() && count == 0 {
                " (no changes since last write)"
            } else {
                ""
            };
            let plural = if count == 1 { "" } else { "s" };
            let mut messages = match build_result {
                Ok(msgs) | Err(msgs) => msgs,
            };
            messages.push(BuildMessage::info(format!(
                "Wrote {} artifact{} to disk{}.",
                count, plural, extra_info
            )));
            DaemonResponse::success(ResponseResult::WriteAck { messages })
        }
        Err(e) => {
            error!("Failed to flush artifacts: {}", e);
            DaemonResponse::error(ErrorCode::FlushFailed, format!("Flush failed: {}", e))
        }
    }
}

/// Handle Version request, returning the daemon's compiler version for compatibility checking.
pub fn handle_version(compiler_version: &str) -> DaemonResponse {
    DaemonResponse::success(ResponseResult::Version {
        compiler_version: compiler_version.to_string(),
    })
}

/// Handle Shutdown request
pub fn handle_shutdown(shutdown_signal: &Arc<Notify>) -> DaemonResponse {
    shutdown_signal.notify_waiters();
    DaemonResponse::success(ResponseResult::ShutdownAck)
}
