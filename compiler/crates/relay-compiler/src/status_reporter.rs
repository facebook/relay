/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! The status reporter module provides functionality for reporting the status of the Relay compiler.
//!
//! This module contains the following implementations of the `StatusReporter` trait:
//! * `ConsoleStatusReporter`: Reports the status to the console using the `log` crate.
//! * `JSONStatusReporter`: Reports the status to a JSON file using the `serde_json` crate.
//! * `BuildStatus`: Wraps a base reporter (decorator pattern), delegating reporting while
//!   also tracking build state for daemon/client synchronization.
use std::fs;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::RwLock;
use std::sync::atomic::AtomicBool;
use std::sync::atomic::Ordering::SeqCst;

use common::Diagnostic;
use common::DiagnosticSeverity;
use graphql_cli::DiagnosticPrinter;
use log::error;
use log::info;
use log::warn;
use tokio::sync::Notify;
use watchman_client::prelude::Clock;

use crate::FileSourceResult;
use crate::FsSourceReader;
use crate::SourceReader;
use crate::config::Config;
use crate::errors::BuildProjectError;
use crate::errors::Error;
use crate::file_source::query_changes_since;
use crate::source_for_location;

pub trait StatusReporter {
    fn build_starts(&self);
    fn build_completes(&self, diagnostics: &[Diagnostic]);
    fn build_errors(&self, error: &Error);
}

/// A no-op reporter used as a placeholder when the real reporter is being moved.
pub struct NoopStatusReporter;

impl StatusReporter for NoopStatusReporter {
    fn build_starts(&self) {}
    fn build_completes(&self, _diagnostics: &[Diagnostic]) {}
    fn build_errors(&self, _error: &Error) {}
}

/// The result of the most recent build, either successful stats or error messages.
#[derive(Debug, Clone)]
pub enum BuildResult {
    /// Successful build with per-project diagnostics (severity and pre-formatted message).
    Success(Vec<(DiagnosticSeverity, String)>),
    /// Failed build with pre-formatted error messages and their severities.
    Errors(Vec<(DiagnosticSeverity, String)>),
}

/// Outcome of a Watchman sync — what the caller should do next.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WatchmanSyncOutcome {
    /// Watchman confirmed no relevant files changed since the last clock.
    NoChanges,
    /// New file changes were enqueued into the compiler's pending-changes
    /// queue; caller should drive an incremental build.
    Changes,
    /// Watchman couldn't give a trustworthy incremental answer (the query
    /// failed or returned a fresh instance). Caller must request a reset
    /// so the daemon reinitializes from saved state — falling back to a
    /// full build if saved state is unavailable.
    NeedsReset,
}

/// Tracks build status to coordinate between the compiler daemon and clients.
///
/// This allows the client calling flush_to_disk to wait until
/// any ongoing build completes, ensuring artifacts are consistent.
///
/// `BuildStatus` also implements `StatusReporter` using the decorator pattern:
/// it wraps a base reporter (e.g. `ConsoleStatusReporter`) and delegates
/// reporting to it, while additionally storing `BuildResult` and managing
/// the `is_building` synchronization flag.
///
/// The `is_building` flag starts as `true` to ensure the initial build is
/// waited for. It is cleared when the build completes or when no build is
/// needed, and set back to `true` when file changes are detected.
pub struct BuildStatus {
    is_building: AtomicBool,
    build_complete_notify: Notify,
    build_result: Mutex<Option<BuildResult>>,
    /// The base reporter to delegate display/logging to.
    base_reporter: Box<dyn StatusReporter + Send + Sync>,
    root_dir: PathBuf,
    is_multi_project: bool,
    /// Optional path to a log file that should be size-limited.
    /// When set, the file is truncated after each build if it exceeds
    /// [`Self::MAX_LOG_BYTES`].
    log_path: Option<PathBuf>,
    /// Synchronized Watchman state for coordinating the build loop and write handler.
    ///
    /// Both paths query Watchman through [`Self::sync_file_changes`], which holds
    /// this lock across the async query. This ensures a single authoritative clock
    /// and prevents the two consumers from racing.
    watchman_sync: tokio::sync::Mutex<WatchmanSyncState>,
    /// Set when the build loop must abort, drop the current compiler state,
    /// and let `watch()` reinitialize from saved state (or a full build).
    /// Read-and-cleared by the build loop via [`Self::take_reset_requested`].
    needs_reset: AtomicBool,
}

/// State guarded by the `watchman_sync` mutex in [`BuildStatus`].
///
/// The clock is only advanced inside [`BuildStatus::sync_file_changes`], never
/// read from the subscription directly. The subscription merely signals the
/// build loop to call `sync_file_changes`.
struct WatchmanSyncState {
    /// Current Watchman clock — advanced only when changes are queried.
    clock: Option<Clock>,
    /// Handle to push file changes into the compiler's pending-changes queue.
    /// Set during [`BuildStatus::init_watchman_sync`].
    pending_file_source_changes: Option<Arc<RwLock<Vec<FileSourceResult>>>>,
    /// Notify handle to wake the build loop.
    /// Set during [`BuildStatus::init_watchman_sync`].
    build_notify: Option<Arc<Notify>>,
}

impl BuildStatus {
    /// Maximum log file size in bytes before truncation (~1MB).
    const MAX_LOG_BYTES: u64 = 1_000_000;

    /// Create a new `BuildStatus` that wraps the given base reporter.
    ///
    /// The `root_dir` and `is_multi_project` parameters are used to format
    /// diagnostics into the stored `BuildResult`.
    pub fn new(
        base_reporter: Box<dyn StatusReporter + Send + Sync>,
        root_dir: PathBuf,
        is_multi_project: bool,
    ) -> Self {
        Self {
            // Start with is_building=true to wait for the initial build
            is_building: AtomicBool::new(true),
            build_complete_notify: Notify::new(),
            build_result: Mutex::new(None),
            base_reporter,
            root_dir,
            is_multi_project,
            log_path: None,
            watchman_sync: tokio::sync::Mutex::new(WatchmanSyncState {
                clock: None,
                pending_file_source_changes: None,
                build_notify: None,
            }),
            needs_reset: AtomicBool::new(false),
        }
    }

    /// Set a log file path to be size-limited. After each build the file is
    /// checked and truncated to keep only the most recent half of its lines
    /// if it exceeds [`Self::MAX_LOG_BYTES`].
    pub fn set_log_path(&mut self, path: PathBuf) {
        self.log_path = Some(path);
    }

    /// Initialize the Watchman sync state with the compiler's pending-changes
    /// queue and build-loop notify handle.
    ///
    /// Must be called once during `watch()` setup, before the subscription or
    /// write handler attempts to sync.
    pub async fn init_watchman_sync(
        &self,
        clock: Option<Clock>,
        pending_file_source_changes: Arc<RwLock<Vec<FileSourceResult>>>,
        build_notify: Arc<Notify>,
    ) {
        let mut state = self.watchman_sync.lock().await;
        state.clock = clock;
        state.pending_file_source_changes = Some(pending_file_source_changes);
        state.build_notify = Some(build_notify);
    }

    /// Query Watchman for file changes since the last known clock, push any
    /// discovered changes into the compiler's pending-changes queue, and
    /// advance the clock.
    ///
    /// This is the **single authoritative path** for detecting file changes.
    /// Both the incremental build loop and the write handler call this method,
    /// serialized by the internal tokio mutex.
    ///
    /// Returns [`WatchmanSyncOutcome::NeedsReset`] when Watchman cannot give a
    /// trustworthy incremental answer (query error or fresh instance). In
    /// that case the caller should call [`Self::request_reset`] and wake
    /// the build loop so the daemon reinitializes.
    pub async fn sync_file_changes(&self, config: &Arc<Config>) -> WatchmanSyncOutcome {
        let mut state = self.watchman_sync.lock().await;

        let Some(clock) = state.clock.take() else {
            // No clock means init_watchman_sync hasn't run (or was called
            // with no clock). We have no trustworthy baseline to query
            // against, so the only honest answer is to request a reset.
            warn!("Watchman sync called with no clock available. Requesting compiler reset.");
            return WatchmanSyncOutcome::NeedsReset;
        };

        let query = match query_changes_since(config, clock.clone()).await {
            Ok(q) => q,
            Err(e) => {
                warn!("Watchman sync query failed: {e}. Requesting compiler reset.");
                // Restore clock so a successful retry path can recover.
                state.clock = Some(clock);
                return WatchmanSyncOutcome::NeedsReset;
            }
        };

        if query.is_fresh_instance {
            warn!(
                "Watchman returned a fresh instance — incremental state is no \
                 longer trustworthy. Requesting compiler reset."
            );
            // Don't advance the clock; watch() will pick up its own
            // fresh clock when it reinitializes.
            state.clock = Some(clock);
            return WatchmanSyncOutcome::NeedsReset;
        }

        state.clock = Some(query.clock);
        match query.files {
            Some(changes) => {
                if let Some(ref pending) = state.pending_file_source_changes {
                    pending.write().unwrap().push(changes);
                }
                WatchmanSyncOutcome::Changes
            }
            None => WatchmanSyncOutcome::NoChanges,
        }
    }

    /// Wake the build loop so it picks up changes enqueued by
    /// [`Self::sync_file_changes`] or honors a pending reset request.
    pub async fn notify_build_loop(&self) {
        let state = self.watchman_sync.lock().await;
        if let Some(ref notify) = state.build_notify {
            notify.notify_one();
        }
    }

    /// Request that the build loop drop its current compiler state and let
    /// `watch()` reinitialize from saved state (or fall back to a full build).
    /// Caller should also call [`Self::notify_build_loop`] to wake the loop.
    pub fn request_reset(&self) {
        self.needs_reset.store(true, SeqCst);
    }

    /// Atomically read and clear the reset flag.
    pub fn take_reset_requested(&self) -> bool {
        self.needs_reset.swap(false, SeqCst)
    }

    /// Called when pending changes were determined to not require a build.
    pub fn no_pending_changes(&self) {
        self.is_building.store(false, SeqCst);
        self.build_complete_notify.notify_waiters();
    }

    /// Signal that the compiler task has crashed (panicked or exited unexpectedly).
    ///
    /// Stores an error build result and unblocks any pending `wait_for_idle()`
    /// calls so clients receive the error instead of hanging forever.
    pub fn compiler_crashed(&self, message: String) {
        self.set_build_result(BuildResult::Errors(vec![(
            DiagnosticSeverity::ERROR,
            message,
        )]));
        self.build_completed();
    }

    /// Wait until no build is in progress
    pub async fn wait_for_idle(&self) {
        let notified = self.build_complete_notify.notified();
        if self.is_building.load(SeqCst) {
            info!("Build is currently in progress...");
            notified.await;
        }
    }

    /// Get the build result. Success results are taken (cleared on read),
    /// while error results persist until replaced by a successful build.
    pub fn take_build_result(&self) -> Option<BuildResult> {
        let mut guard = self.build_result.lock().unwrap();
        match &*guard {
            Some(BuildResult::Success(_)) => guard.take(),
            other => other.clone(),
        }
    }

    fn set_build_result(&self, result: BuildResult) {
        *self.build_result.lock().unwrap() = Some(result);
    }

    /// Called when file changes are detected, before the build starts.
    /// This must be called early (before debouncing/checks) to ensure clients
    /// calling `wait_for_idle()` are blocked during the entire processing period.
    pub fn changes_pending(&self) {
        self.is_building.store(true, SeqCst);
    }

    fn build_completed(&self) {
        self.is_building.store(false, SeqCst);
        self.build_complete_notify.notify_waiters();

        if let Some(ref log_path) = self.log_path {
            Self::truncate_log_if_needed(log_path);
        }
    }

    /// If the log file exceeds [`Self::MAX_LOG_BYTES`], rewrite it keeping
    /// only the most recent half of its lines.
    fn truncate_log_if_needed(log_path: &Path) {
        let size = match fs::metadata(log_path) {
            Ok(m) => m.len(),
            Err(_) => return,
        };

        if size <= Self::MAX_LOG_BYTES {
            return;
        }

        let content = match fs::read_to_string(log_path) {
            Ok(c) => c,
            Err(_) => return,
        };

        let lines: Vec<&str> = content.lines().collect();
        let keep_from = lines.len() / 2;

        if let Ok(mut file) = fs::File::create(log_path) {
            for line in &lines[keep_from..] {
                let _ = writeln!(file, "{}", line);
            }
        }
    }
}

impl StatusReporter for BuildStatus {
    fn build_starts(&self) {
        self.base_reporter.build_starts();
    }

    fn build_completes(&self, diagnostics: &[Diagnostic]) {
        self.base_reporter.build_completes(diagnostics);
        self.set_build_result(BuildResult::Success(
            diagnostics
                .iter()
                .filter(|d| d.severity() != DiagnosticSeverity::HINT)
                .map(|d| {
                    (
                        d.severity(),
                        format_diagnostic(&self.root_dir, &FsSourceReader, d),
                    )
                })
                .collect(),
        ));
        self.build_completed();
    }

    fn build_errors(&self, error: &Error) {
        self.base_reporter.build_errors(error);
        let messages = format_build_errors(
            &self.root_dir,
            &FsSourceReader,
            self.is_multi_project,
            error,
        );
        self.set_build_result(BuildResult::Errors(messages));
        self.build_completed();
    }
}

impl StatusReporter for Arc<BuildStatus> {
    fn build_starts(&self) {
        (**self).build_starts();
    }

    fn build_completes(&self, diagnostics: &[Diagnostic]) {
        (**self).build_completes(diagnostics);
    }

    fn build_errors(&self, error: &Error) {
        (**self).build_errors(error);
    }
}

/// Format a single diagnostic for display with source context.
pub fn format_diagnostic(
    root_dir: &std::path::Path,
    source_reader: &dyn SourceReader,
    diagnostic: &Diagnostic,
) -> String {
    let printer = DiagnosticPrinter::new(|source_location| {
        source_for_location(root_dir, source_location, source_reader)
            .map(|source| source.to_text_source())
    });
    printer.diagnostic_to_string(diagnostic)
}

/// Format a build error into displayable messages with severity.
pub fn format_build_errors(
    root_dir: &std::path::Path,
    source_reader: &dyn SourceReader,
    is_multi_project: bool,
    error: &Error,
) -> Vec<(DiagnosticSeverity, String)> {
    let mut messages = match error {
        Error::DiagnosticsError { errors } => errors
            .iter()
            .map(|d| (d.severity(), format_diagnostic(root_dir, source_reader, d)))
            .collect(),
        Error::BuildProjectsErrors { errors } => errors
            .iter()
            .flat_map(|e| format_project_error(root_dir, source_reader, is_multi_project, e))
            .collect(),
        Error::Cancelled => {
            vec![(
                DiagnosticSeverity::INFORMATION,
                "Compilation cancelled due to new changes.".to_string(),
            )]
        }
        error => vec![(DiagnosticSeverity::ERROR, format!("{error}"))],
    };
    if !matches!(error, Error::Cancelled) {
        messages.push((DiagnosticSeverity::ERROR, "Compilation failed.".to_string()));
    }
    messages
}

fn format_project_error(
    root_dir: &std::path::Path,
    source_reader: &dyn SourceReader,
    is_multi_project: bool,
    error: &BuildProjectError,
) -> Vec<(DiagnosticSeverity, String)> {
    match error {
        BuildProjectError::ValidationErrors {
            errors,
            project_name,
        } => errors
            .iter()
            .map(|diagnostic| {
                let output = format_diagnostic(root_dir, source_reader, diagnostic);
                let formatted_output = match diagnostic.severity() {
                    DiagnosticSeverity::ERROR => {
                        if is_multi_project {
                            format!("Error in the project `{project_name}`: {output}")
                        } else {
                            format!("Error: {output}")
                        }
                    }
                    _ => {
                        if is_multi_project {
                            format!("In the project `{project_name}`: {output}")
                        } else {
                            output
                        }
                    }
                };

                (diagnostic.severity(), formatted_output)
            })
            .collect(),
        BuildProjectError::PersistErrors {
            errors,
            project_name,
        } => errors
            .iter()
            .map(|error| {
                let msg = if is_multi_project {
                    format!("Error in the project `{project_name}`: {error}")
                } else {
                    format!("Error: {error}")
                };
                (DiagnosticSeverity::ERROR, msg)
            })
            .collect(),
        _ => {
            vec![(DiagnosticSeverity::ERROR, format!("{error}"))]
        }
    }
}

pub struct ConsoleStatusReporter {
    source_reader: Box<dyn SourceReader + Send + Sync>,
    root_dir: PathBuf,
    is_multi_project: bool,
}

impl ConsoleStatusReporter {
    pub fn new(root_dir: PathBuf, is_multi_project: bool) -> Self {
        Self {
            root_dir,
            source_reader: Box::new(FsSourceReader),
            is_multi_project,
        }
    }

    fn print_by_severity(&self, severity: DiagnosticSeverity, output: String) {
        match severity {
            DiagnosticSeverity::ERROR => error!("{output}"),
            DiagnosticSeverity::WARNING => warn!("{output}"),
            DiagnosticSeverity::HINT => {
                // Opting to omit, not emit, hints in the CLI output.
            }
            _ => info!("{output}"),
        }
    }
}

impl StatusReporter for ConsoleStatusReporter {
    fn build_starts(&self) {}

    fn build_completes(&self, diagnostics: &[Diagnostic]) {
        for diagnostic in diagnostics {
            let output = format_diagnostic(&self.root_dir, self.source_reader.as_ref(), diagnostic);
            self.print_by_severity(diagnostic.severity(), output);
        }
        info!("Compilation completed.");
    }

    fn build_errors(&self, error: &Error) {
        let messages = format_build_errors(
            &self.root_dir,
            self.source_reader.as_ref(),
            self.is_multi_project,
            error,
        );
        for (severity, msg) in messages {
            self.print_by_severity(severity, msg);
        }
    }
}

pub struct JSONStatusReporter {
    path: Option<PathBuf>,
    base_reporter: Box<dyn StatusReporter + Send + Sync>,
}

impl JSONStatusReporter {
    pub fn new(
        path: Option<PathBuf>,
        base_reporter: Box<dyn StatusReporter + Send + Sync>,
    ) -> Self {
        Self {
            path,
            base_reporter,
        }
    }
}

impl StatusReporter for JSONStatusReporter {
    fn build_starts(&self) {}

    fn build_completes(&self, diagnostics: &[Diagnostic]) {
        match &self.path {
            Some(path) => {
                self.base_reporter.build_completes(diagnostics);
                let mut file = OpenOptions::new()
                    .write(true)
                    .create(true)
                    .truncate(true)
                    .open(path)
                    .unwrap();
                writeln!(
                    file,
                    "{{\"completed\":true,\"diagnostics\":{}}}",
                    serde_json::to_string(diagnostics).unwrap()
                )
                .unwrap();
            }
            None => {
                println!(
                    "{{\"completed\":true,\"diagnostics\":{}}}",
                    serde_json::to_string(diagnostics).unwrap()
                );
            }
        }
    }

    fn build_errors(&self, error: &Error) {
        match &self.path {
            Some(path) => {
                self.base_reporter.build_errors(error);

                let mut file = OpenOptions::new()
                    .write(true)
                    .create(true)
                    .truncate(true)
                    .open(path)
                    .unwrap();
                writeln!(
                    file,
                    "{{\"completed\":false,\"error\":{}}}",
                    serde_json::to_string(error).unwrap()
                )
                .unwrap();
            }
            None => {
                println!(
                    "{{\"completed\":false,\"error\":{}}}",
                    serde_json::to_string(error).unwrap()
                );
            }
        }
    }
}
