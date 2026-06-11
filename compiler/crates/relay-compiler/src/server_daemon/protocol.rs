/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Protocol types for the server daemon.
//!
//! Defines the request and response message types used for communication
//! between clients and the server daemon over Unix domain sockets.

use std::path::PathBuf;

use common::DiagnosticSeverity;
use serde::Deserialize;
use serde::Serialize;

/// Request messages from client to daemon.
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "method", content = "params", rename_all = "snake_case")]
pub enum DaemonRequest {
    /// Flush cached artifacts. `flush_manifest_path` and `flush_shard_dir`
    /// are opaque hints forwarded to the daemon's flush implementation —
    /// when both are set and a flush writer factory is installed, writes
    /// are routed through the factory; otherwise the daemon writes
    /// artifacts straight to disk.
    Write {
        #[serde(default)]
        flush_manifest_path: Option<PathBuf>,
        #[serde(default)]
        flush_shard_dir: Option<PathBuf>,
    },
    /// Check daemon version and liveness.
    Version,
    /// Request graceful shutdown.
    Shutdown,
}

/// Error codes for daemon error responses.
#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCode {
    FlushFailed,
}

/// Response messages from daemon to client
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum DaemonResponse {
    Success { result: ResponseResult },
    Error { code: ErrorCode, message: String },
}

impl DaemonResponse {
    pub fn success(result: ResponseResult) -> Self {
        DaemonResponse::Success { result }
    }

    #[allow(dead_code)]
    pub fn error(code: ErrorCode, message: impl Into<String>) -> Self {
        DaemonResponse::Error {
            code,
            message: message.into(),
        }
    }
}

/// Successful response payloads
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ResponseResult {
    WriteAck { messages: Vec<BuildMessage> },
    Version { compiler_version: String },
    ShutdownAck,
}

/// A single build output message with its severity level.
#[derive(Debug, Serialize, Deserialize)]
pub struct BuildMessage {
    pub severity: MessageSeverity,
    pub text: String,
}

impl BuildMessage {
    pub fn info(text: String) -> Self {
        Self {
            severity: MessageSeverity::Info,
            text,
        }
    }

    pub fn from_diagnostic(severity: DiagnosticSeverity, text: String) -> Self {
        Self {
            severity: match severity {
                DiagnosticSeverity::ERROR => MessageSeverity::Error,
                DiagnosticSeverity::WARNING => MessageSeverity::Warning,
                _ => MessageSeverity::Info,
            },
            text,
        }
    }
}

/// Severity level for build messages, used to determine log formatting.
#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
#[serde(rename_all = "snake_case")]
pub enum MessageSeverity {
    Info,
    Warning,
    Error,
}
