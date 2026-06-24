/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Server daemon module for the Relay compiler.
//!
//! Provides a Unix domain socket daemon that holds compilation state in
//! memory and lets clients request a flush-to-disk on demand instead of
//! writing artifacts on every build. Unix-only.

mod handlers;
pub mod protocol;
pub mod socket;
pub mod vcs_state;

use std::collections::hash_map::DefaultHasher;
use std::env;
use std::fs;
use std::fs::File;
use std::hash::Hash;
use std::hash::Hasher;
use std::os::unix::net::UnixStream;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use std::process::Stdio;
use std::sync::Arc;
use std::sync::Mutex;

use log::error;
use log::info;
use log::warn;
use serde::Deserialize;
use serde::Serialize;
pub use socket::send_request;
pub use socket::start_server;

use crate::ArtifactWriter;
use crate::config::Config;
use crate::server_daemon::protocol::DaemonRequest;
use crate::server_daemon::protocol::DaemonResponse;
use crate::server_daemon::protocol::MessageSeverity;
use crate::server_daemon::protocol::ResponseResult;

/// Builds the [`ArtifactWriter`] used when a [`protocol::DaemonRequest::Write`]
/// supplies both `flush_manifest_path` and `flush_shard_dir`.
///
/// When neither (or only one) path is supplied, or when no factory is
/// installed on [`socket::ServerConfig`], the daemon falls back to
/// flushing cached artifacts straight to disk via
/// `DeferredArtifactCache::flush_to_disk`.
pub type FlushWriterFactory =
    Arc<dyn Fn(PathBuf, PathBuf) -> Box<dyn ArtifactWriter + Send + Sync> + Send + Sync>;

/// Seed the daemon's first-build state from client-provided hints.
///
/// When the client (e.g. Meerkat) invokes `relay build` with `--import-state`
/// and `--changed-files-list`, those paths are forwarded to the spawned
/// daemon as `--initial-import-state` / `--initial-changed-files-list`. The
/// daemon's `Start` handler calls this helper to wire the paths into
/// [`Config::load_saved_state_file`] and
/// [`Config::initial_external_changed_files_list`], which `compiler.watch()`'s
/// first iteration consumes via [`crate::file_source::watchman_file_source`]'s
/// fast-path. Both slots are consumed once; subsequent iterations fall back
/// to the normal Watchman / `try_saved_state` path.
pub fn apply_initial_external_state_hints(
    config: &mut Config,
    initial_import_state: Option<PathBuf>,
    initial_changed_files_list: Option<PathBuf>,
) {
    if initial_import_state.is_some() {
        config.load_saved_state_file = Mutex::new(initial_import_state);
    }
    if initial_changed_files_list.is_some() {
        config.initial_external_changed_files_list = Mutex::new(initial_changed_files_list);
    }
}

/// Build the `--initial-import-state` / `--initial-changed-files-list` args
/// to pass as `start_extra_args` to [`start_daemon_process`]. Mirrors the
/// `requires("initial_import_state")` clap constraint on the daemon's
/// `Start` subcommand: `--initial-changed-files-list` is only forwarded
/// when a saved-state path is also present.
pub fn build_initial_external_state_args(
    initial_import_state: Option<&Path>,
    initial_changed_files_list: Option<&Path>,
) -> Vec<String> {
    let mut args = Vec::new();
    if let Some(path) = initial_import_state {
        args.push("--initial-import-state".to_string());
        args.push(path.to_string_lossy().into_owned());
        if let Some(changes) = initial_changed_files_list {
            args.push("--initial-changed-files-list".to_string());
            args.push(changes.to_string_lossy().into_owned());
        }
    }
    args
}

/// Status of a daemon's socket.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DaemonStatus {
    /// A process is actively listening on the socket.
    Active,
    /// The socket file exists but nothing is listening (stale).
    Stale,
    /// The socket file does not exist.
    Gone,
}

/// Metadata about a running server daemon instance, persisted to disk.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DaemonMetadata {
    /// Path to the Unix domain socket.
    pub socket_path: PathBuf,
    /// Path to the Relay compiler configuration file.
    pub config_path: PathBuf,
    /// Project names the daemon was started with.
    pub projects: Vec<String>,
    /// Compiler version string.
    pub compiler_version: String,
    /// PID of the daemon process. Informational only — not used for status
    /// checks or shutdown. Useful for debugging (e.g. `kill -0` or `strace`).
    #[serde(default)]
    pub pid: u32,
}

impl DaemonMetadata {
    /// Path to the metadata file, derived from the socket path with a `.json` extension.
    fn metadata_path(&self) -> PathBuf {
        self.socket_path.with_extension("json")
    }

    /// Write this metadata to disk.
    pub fn write(&self) -> std::io::Result<()> {
        let contents = serde_json::to_string_pretty(self)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
        fs::write(self.metadata_path(), contents)
    }

    /// Read daemon metadata from a file path.
    pub fn read(path: &Path) -> std::io::Result<Self> {
        let contents = fs::read_to_string(path)?;
        serde_json::from_str(&contents)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))
    }

    /// Check whether the daemon's socket is active.
    ///
    /// Attempts a connection to the socket path to determine if a process
    /// is actively listening. This avoids PID-recycling issues.
    pub fn status(&self) -> DaemonStatus {
        if !self.socket_path.exists() {
            return DaemonStatus::Gone;
        }
        match UnixStream::connect(&self.socket_path) {
            Ok(_) => DaemonStatus::Active,
            Err(_) => DaemonStatus::Stale,
        }
    }

    /// Return all directories where daemon files could have been written.
    ///
    /// Always includes `/tmp`. If `XDG_RUNTIME_DIR` is set and differs from
    /// `/tmp`, it is included as well.
    fn all_runtime_dirs() -> Vec<PathBuf> {
        let tmp = std::env::temp_dir();
        let mut dirs = vec![tmp.clone()];
        if let Ok(xdg) = env::var("XDG_RUNTIME_DIR") {
            let xdg = PathBuf::from(xdg);
            if xdg != tmp {
                dirs.push(xdg);
            }
        }
        dirs
    }

    /// List all known daemon instances.
    ///
    /// Scans all possible runtime directories for `relay-server-*.json` files.
    /// Call [`Self::status`] on each entry to probe liveness; status is
    /// intentionally not bundled into the listing because it can change
    /// between listing and use.
    pub fn list() -> std::io::Result<Vec<Self>> {
        let mut results = Vec::new();
        for dir in Self::all_runtime_dirs() {
            results.extend(Self::list_in(&dir)?);
        }
        Ok(results)
    }

    /// List daemon instances in the given directory.
    fn list_in(dir: &Path) -> std::io::Result<Vec<Self>> {
        if !dir.exists() {
            return Ok(Vec::new());
        }
        let mut results = Vec::new();
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            let matches = path
                .file_name()
                .and_then(|n| n.to_str())
                .is_some_and(|n| n.starts_with("relay-server-") && n.ends_with(".json"));
            if matches && let Ok(metadata) = Self::read(&path) {
                results.push(metadata);
            }
        }
        Ok(results)
    }

    /// Remove this daemon's metadata file from disk.
    pub fn remove(&self) -> std::io::Result<()> {
        let path = self.metadata_path();
        if path.exists() {
            fs::remove_file(path)?;
        }
        Ok(())
    }

    /// Clean up all files associated with this daemon: metadata, socket, and log.
    ///
    /// Errors are logged at debug level but do not prevent other files from
    /// being cleaned up.
    pub fn cleanup(&self) {
        if let Err(e) = self.remove() {
            log::debug!("Failed to remove metadata file: {}", e);
        }
        if self.socket_path.exists()
            && let Err(e) = fs::remove_file(&self.socket_path)
        {
            log::debug!("Failed to remove socket file: {}", e);
        }
        let log_path = log_path_for_socket(&self.socket_path);
        if log_path.exists()
            && let Err(e) = fs::remove_file(&log_path)
        {
            log::debug!("Failed to remove log file: {}", e);
        }
    }
}

/// Generate a deterministic socket path based on the config path and project names.
///
/// The path is generated by hashing the canonical config path and sorted project names,
/// then placing the socket in `XDG_RUNTIME_DIR` (if available) or `/tmp`.
///
/// # Arguments
///
/// * `config_path` - Path to the Relay compiler configuration file
/// * `projects` - List of project names specified via command line
///
/// # Returns
///
/// A path like `/tmp/relay-server-a1b2c3d4e5f6g7h8.sock`
/// Generate a deterministic log file path based on the config path and project names.
///
/// Uses the same hash as `get_socket_path` but with a `.log` extension instead of `.sock`.
pub fn get_log_file_path(config_path: &Path, projects: &[String]) -> PathBuf {
    log_path_for_socket(&get_socket_path(config_path, projects))
}

/// Derive the log file path from a socket path by changing the extension to `.log`.
pub fn log_path_for_socket(socket_path: &Path) -> PathBuf {
    socket_path.with_extension("log")
}

/// Print a one-line summary for every discovered daemon and optionally
/// `shutdown` active daemons / `cleanup` stale or gone ones.
pub async fn list_daemons(cleanup: bool, shutdown: bool) -> std::io::Result<()> {
    let daemons = DaemonMetadata::list()?;
    if daemons.is_empty() {
        println!("No daemons found.");
        return Ok(());
    }
    for metadata in &daemons {
        let status = metadata.status();
        let status_str = match status {
            DaemonStatus::Active => "active",
            DaemonStatus::Stale => "stale",
            DaemonStatus::Gone => "gone",
        };
        println!(
            "[{}] pid={} socket={} config={} projects=[{}] version={}",
            status_str,
            metadata.pid,
            metadata.socket_path.display(),
            metadata.config_path.display(),
            metadata.projects.join(", "),
            metadata.compiler_version,
        );
        if shutdown && matches!(status, DaemonStatus::Active) {
            info!(
                "Shutting down active daemon: {}",
                metadata.socket_path.display()
            );
            if send_request(&metadata.socket_path, protocol::DaemonRequest::Shutdown)
                .await
                .is_none()
            {
                warn!(
                    "Failed to shut down daemon: {}",
                    metadata.socket_path.display()
                );
            }
        }
        if cleanup && matches!(status, DaemonStatus::Stale | DaemonStatus::Gone) {
            info!(
                "Cleaning up {} daemon: {}",
                status_str,
                metadata.socket_path.display()
            );
            metadata.cleanup();
        }
    }
    Ok(())
}

pub fn get_socket_path(config_path: &Path, projects: &[String]) -> PathBuf {
    let mut hasher = DefaultHasher::new();

    // Hash the canonical config path
    if let Ok(canonical) = config_path.canonicalize() {
        canonical.to_string_lossy().hash(&mut hasher);
    } else {
        // Fall back to the original path if canonicalization fails
        config_path.to_string_lossy().hash(&mut hasher);
    }

    // Include sorted project names in hash for determinism
    let mut sorted_projects = projects.to_vec();
    sorted_projects.sort();
    for project in &sorted_projects {
        project.hash(&mut hasher);
    }

    let hash = hasher.finish();
    let hash_str = format!("{:016x}", hash);

    // Determine base directory
    let base_dir = env::var("XDG_RUNTIME_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| std::env::temp_dir());

    base_dir.join(format!("relay-server-{}.sock", hash_str))
}

/// Spawn the current binary as a background daemon and wait for its socket
/// to come up. The child is invoked as
/// `<current_exe> server <extra_args> --project <p>... start --foreground <start_extra_args>`,
/// with stdout/stderr redirected to the daemon log file derived from
/// `config_path` and `projects`.
///
/// Polls the daemon socket once per second for up to 60 seconds. Exits the
/// caller process with code 1 if the child exits during startup or fails
/// to bind the socket within the timeout. `extra_args` is inserted before
/// the project flags so callers can pass `Server`-subcommand-level options
/// (e.g. the OSS relay-bin passes `--config <path>`). `start_extra_args`
/// is appended after `--foreground` so callers can pass `Start`-subcommand-
/// level options (e.g. `--initial-import-state <path>`).
pub async fn start_daemon_process(
    config_path: &Path,
    projects: &[String],
    extra_args: &[String],
    start_extra_args: &[String],
) {
    let current_exe = std::env::current_exe().expect("Failed to get current exe path");
    let mut args = vec!["server".to_string()];
    args.extend(extra_args.iter().cloned());
    for project in projects {
        args.push("--project".to_string());
        args.push(project.clone());
    }
    args.push("start".to_string());
    args.push("--foreground".to_string());
    args.extend(start_extra_args.iter().cloned());

    let log_path = get_log_file_path(config_path, projects);
    let log_file = File::options()
        .create(true)
        .append(true)
        .open(&log_path)
        .expect("Failed to open daemon log file");
    let log_file_clone = log_file
        .try_clone()
        .expect("Failed to clone daemon log file handle");

    let mut child = Command::new(current_exe)
        .args(&args)
        .stdin(Stdio::null())
        .stdout(Stdio::from(log_file))
        .stderr(Stdio::from(log_file_clone))
        .spawn()
        .expect("Failed to spawn daemon process");

    let socket_path = get_socket_path(config_path, projects);
    let max_attempts = 60;
    for i in 0..max_attempts {
        tokio::time::sleep(std::time::Duration::from_secs(1)).await;

        // Detect early daemon-process exit (e.g. invalid project name).
        if let Some(status) = child
            .try_wait()
            .expect("Failed to check daemon process status")
        {
            error!("Daemon process exited during startup with {status}");
            log_daemon_file(&log_path);
            std::process::exit(1);
        }

        if send_request(&socket_path, DaemonRequest::Version)
            .await
            .is_some()
        {
            info!("Daemon is ready.");
            return;
        }
        if i % 10 == 9 {
            info!("Still waiting for daemon to start ({} seconds)...", i + 1);
        }
    }

    error!("Daemon failed to start after {max_attempts} seconds");
    log_daemon_file(&log_path);
    std::process::exit(1);
}

/// Log the contents of a daemon log file at the error level.
fn log_daemon_file(log_path: &Path) {
    if let Ok(log_contents) = std::fs::read_to_string(log_path)
        && !log_contents.is_empty()
    {
        error!("Daemon log ({}):\n{}", log_path.display(), log_contents);
    }
}

/// Outcome of [`ensure_daemon_running`] — exposed so callers can log
/// or branch on whether the daemon was already running, freshly started,
/// or restarted due to a version mismatch.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DaemonStartOutcome {
    AlreadyRunning,
    Started,
    Restarted,
}

impl std::fmt::Display for DaemonStartOutcome {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(match self {
            DaemonStartOutcome::AlreadyRunning => "already_running",
            DaemonStartOutcome::Started => "started",
            DaemonStartOutcome::Restarted => "restarted",
        })
    }
}

/// Check whether a [`DaemonRequest::Version`] response indicates that the
/// daemon's compiler version differs from `client_version`. Returns `true`
/// on protocol errors too — the safe default is to assume mismatch and let
/// callers restart.
pub fn has_version_mismatch(response: &DaemonResponse, client_version: &str) -> bool {
    match response {
        DaemonResponse::Success {
            result:
                ResponseResult::Version {
                    compiler_version: daemon_version,
                },
        } => daemon_version != client_version,
        DaemonResponse::Error { code, message } => {
            error!("Daemon returned error ({code:?}): {message}");
            true
        }
        _ => {
            error!("Unexpected response from daemon version check");
            true
        }
    }
}

/// Shut down a running daemon and start a fresh one in its place. Waits
/// for the new daemon to become ready before returning. `extra_args` and
/// `start_extra_args` are forwarded verbatim to [`start_daemon_process`].
pub async fn restart_daemon(
    socket_path: &Path,
    config_path: &Path,
    projects: &[String],
    extra_args: &[String],
    start_extra_args: &[String],
) {
    info!("Compiler version mismatch detected, restarting daemon...");
    send_request(socket_path, DaemonRequest::Shutdown).await;
    // Brief wait for the old daemon to release the socket.
    tokio::time::sleep(std::time::Duration::from_secs(1)).await;
    start_daemon_process(config_path, projects, extra_args, start_extra_args).await;
}

/// Ensure a daemon with a matching compiler version is running for the
/// given config + projects.
///
/// If no daemon is running, a fresh one is started. If a daemon is running
/// but reports a different `client_version`, it is shut down and replaced.
/// Returns the socket path (for sending subsequent requests) and the start
/// outcome (for telemetry).
///
/// `extra_args` and `start_extra_args` are forwarded to
/// [`start_daemon_process`] so callers can pass binary-specific
/// `Server`-level and `Start`-subcommand-level args respectively.
pub async fn ensure_daemon_running(
    config_path: &Path,
    projects: &[String],
    client_version: &str,
    extra_args: &[String],
    start_extra_args: &[String],
) -> (PathBuf, DaemonStartOutcome) {
    let socket_path = get_socket_path(config_path, projects);
    let outcome = match send_request(&socket_path, DaemonRequest::Version).await {
        Some(response) if has_version_mismatch(&response, client_version) => {
            restart_daemon(
                &socket_path,
                config_path,
                projects,
                extra_args,
                start_extra_args,
            )
            .await;
            DaemonStartOutcome::Restarted
        }
        Some(_) => DaemonStartOutcome::AlreadyRunning,
        None => {
            info!("Starting daemon...");
            start_daemon_process(config_path, projects, extra_args, start_extra_args).await;
            DaemonStartOutcome::Started
        }
    };
    (socket_path, outcome)
}

/// Log a daemon response at the appropriate severity. Returns `true` if
/// the response indicates success and `false` if it indicates an error
/// (e.g. build errors in a `WriteAck`, an explicit `Error` response, or
/// no response at all). Callers can use the return value to decide whether
/// to `std::process::exit(1)`.
pub fn log_daemon_response(response: Option<DaemonResponse>) -> bool {
    match response {
        Some(DaemonResponse::Success { result }) => match result {
            ResponseResult::WriteAck { messages } => {
                let mut has_error = false;
                for msg in &messages {
                    match msg.severity {
                        MessageSeverity::Error => {
                            error!("{}", msg.text);
                            has_error = true;
                        }
                        MessageSeverity::Warning => warn!("{}", msg.text),
                        MessageSeverity::Info => info!("{}", msg.text),
                    }
                }
                !has_error
            }
            ResponseResult::Version { compiler_version } => {
                println!("{}", compiler_version);
                true
            }
            ResponseResult::ShutdownAck => {
                info!("Daemon shut down successfully.");
                true
            }
        },
        Some(DaemonResponse::Error { code, message }) => {
            error!("Error ({code:?}): {message}");
            false
        }
        None => {
            error!("No server response");
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use std::os::unix::net::UnixListener;

    use super::*;

    #[test]
    fn test_socket_path_deterministic() {
        let config = Path::new("/path/to/config.json");
        let projects = vec!["project1".to_string(), "project2".to_string()];

        let path1 = get_socket_path(config, &projects);
        let path2 = get_socket_path(config, &projects);

        assert_eq!(path1, path2);
    }

    #[test]
    fn test_socket_path_order_independent() {
        let config = Path::new("/path/to/config.json");
        let projects1 = vec!["project1".to_string(), "project2".to_string()];
        let projects2 = vec!["project2".to_string(), "project1".to_string()];

        let path1 = get_socket_path(config, &projects1);
        let path2 = get_socket_path(config, &projects2);

        assert_eq!(path1, path2);
    }

    #[test]
    fn test_socket_path_different_for_different_projects() {
        let config = Path::new("/path/to/config.json");
        let projects1 = vec!["project1".to_string()];
        let projects2 = vec!["project2".to_string()];

        let path1 = get_socket_path(config, &projects1);
        let path2 = get_socket_path(config, &projects2);

        assert_ne!(path1, path2);
    }

    /// Helper to create a DaemonMetadata using `get_socket_path` to derive the
    /// socket filename, but placed in the given test directory.
    fn make_metadata(dir: &Path, config_path: &str, projects: Vec<String>) -> DaemonMetadata {
        let real_socket_path = get_socket_path(Path::new(config_path), &projects);
        let socket_filename = real_socket_path.file_name().unwrap();
        DaemonMetadata {
            socket_path: dir.join(socket_filename),
            config_path: PathBuf::from(config_path),
            projects,
            compiler_version: "abc123".to_string(),
            pid: std::process::id(),
        }
    }

    #[test]
    fn test_write_and_read_metadata() {
        let dir = tempfile::tempdir().unwrap();
        let metadata = make_metadata(dir.path(), "/config/a.json", vec!["proj_a".to_string()]);

        metadata.write().expect("write failed");

        let read_back = DaemonMetadata::read(&metadata.metadata_path()).expect("read failed");
        assert_eq!(read_back.socket_path, metadata.socket_path);
        assert_eq!(read_back.config_path, metadata.config_path);
        assert_eq!(read_back.projects, metadata.projects);
        assert_eq!(read_back.compiler_version, metadata.compiler_version);
    }

    #[test]
    fn test_remove_metadata() {
        let dir = tempfile::tempdir().unwrap();
        let metadata = make_metadata(dir.path(), "/config/b.json", vec![]);

        metadata.write().expect("write failed");
        assert!(metadata.metadata_path().exists());

        metadata.remove().expect("remove failed");
        assert!(!metadata.metadata_path().exists());
    }

    #[test]
    fn test_list_empty_directory() {
        let dir = tempfile::tempdir().unwrap();

        let results = DaemonMetadata::list_in(dir.path()).expect("list failed");
        assert!(results.is_empty());
    }

    #[test]
    fn test_list_nonexistent_directory() {
        let dir = tempfile::tempdir().unwrap();
        let nonexistent = dir.path().join("nonexistent");
        let results = DaemonMetadata::list_in(&nonexistent).expect("list failed");
        assert!(results.is_empty());
    }

    #[test]
    fn test_list_multiple_daemons() {
        let dir = tempfile::tempdir().unwrap();

        let m1 = make_metadata(dir.path(), "/config/a.json", vec!["proj_a".to_string()]);
        let m2 = make_metadata(dir.path(), "/config/b.json", vec!["proj_b".to_string()]);
        let m3 = make_metadata(dir.path(), "/config/c.json", vec!["proj_c".to_string()]);

        m1.write().expect("write m1");
        m2.write().expect("write m2");
        m3.write().expect("write m3");

        let results = DaemonMetadata::list_in(dir.path()).expect("list failed");

        assert_eq!(results.len(), 3);

        let mut projects: Vec<String> = results.iter().flat_map(|m| m.projects.clone()).collect();
        projects.sort();
        assert_eq!(projects, vec!["proj_a", "proj_b", "proj_c"]);
    }

    #[test]
    fn test_list_skips_malformed_json() {
        let dir = tempfile::tempdir().unwrap();

        let m1 = make_metadata(dir.path(), "/config/good.json", vec!["proj_a".to_string()]);
        m1.write().expect("write m1");

        // Write a malformed relay-server JSON file
        fs::write(
            dir.path().join("relay-server-bad.json"),
            "not valid json {{{",
        )
        .expect("write bad");

        let results = DaemonMetadata::list_in(dir.path()).expect("list failed");

        assert_eq!(results.len(), 1, "malformed file should be skipped");
        assert_eq!(results[0].projects, vec!["proj_a"]);
    }

    #[test]
    fn test_status_gone_when_no_socket_file() {
        let dir = tempfile::tempdir().unwrap();
        let metadata = make_metadata(dir.path(), "/config/nosock.json", vec![]);

        assert_eq!(metadata.status(), DaemonStatus::Gone);
    }

    #[test]
    fn test_status_stale_when_socket_file_exists_but_no_listener() {
        let dir = tempfile::tempdir().unwrap();
        let metadata = make_metadata(dir.path(), "/config/stale.json", vec![]);

        // Bind a listener then drop it — leaves a real socket file with no listener
        let listener = UnixListener::bind(&metadata.socket_path).unwrap();
        drop(listener);

        assert!(metadata.socket_path.exists());
        assert_eq!(metadata.status(), DaemonStatus::Stale);
    }

    #[test]
    fn test_status_active_when_listener_bound() {
        let dir = tempfile::tempdir().unwrap();
        let metadata = make_metadata(dir.path(), "/config/active.json", vec![]);

        // Bind a real Unix listener on the socket path
        let _listener = UnixListener::bind(&metadata.socket_path).expect("failed to bind listener");

        assert_eq!(metadata.status(), DaemonStatus::Active);
    }

    #[test]
    fn test_cleanup_removes_metadata_socket_and_log() {
        let dir = tempfile::tempdir().unwrap();
        let metadata = make_metadata(dir.path(), "/config/a.json", vec!["proj_a".to_string()]);

        // Create all three files
        metadata.write().unwrap();
        fs::write(&metadata.socket_path, "").unwrap();
        let log_path = log_path_for_socket(&metadata.socket_path);
        fs::write(&log_path, "").unwrap();

        assert!(metadata.metadata_path().exists());
        assert!(metadata.socket_path.exists());
        assert!(log_path.exists());

        metadata.cleanup();

        assert!(!metadata.metadata_path().exists());
        assert!(!metadata.socket_path.exists());
        assert!(!log_path.exists());
    }

    #[test]
    fn test_cleanup_with_only_metadata_file() {
        let dir = tempfile::tempdir().unwrap();
        let metadata = make_metadata(dir.path(), "/config/a.json", vec!["proj_a".to_string()]);

        metadata.write().unwrap();
        assert!(metadata.metadata_path().exists());

        // No socket or log file — cleanup should still succeed
        metadata.cleanup();

        assert!(!metadata.metadata_path().exists());
    }

    #[test]
    fn test_cleanup_with_no_files() {
        let dir = tempfile::tempdir().unwrap();
        let metadata = make_metadata(dir.path(), "/config/a.json", vec!["proj_a".to_string()]);

        // Nothing on disk — cleanup should not panic
        metadata.cleanup();
    }

    #[test]
    fn test_cleanup_stale_and_gone_via_list() {
        let dir = tempfile::tempdir().unwrap();

        // Active daemon
        let m_active = make_metadata(
            dir.path(),
            "/config/active.json",
            vec!["active_proj".to_string()],
        );
        m_active.write().unwrap();
        let _listener = UnixListener::bind(&m_active.socket_path).unwrap();
        let active_log = log_path_for_socket(&m_active.socket_path);
        fs::write(&active_log, "active log").unwrap();

        // Stale daemon: bind then drop listener to leave a real stale socket
        let m_stale = make_metadata(
            dir.path(),
            "/config/stale.json",
            vec!["stale_proj".to_string()],
        );
        m_stale.write().unwrap();
        let stale_listener = UnixListener::bind(&m_stale.socket_path).unwrap();
        drop(stale_listener);
        let stale_log = log_path_for_socket(&m_stale.socket_path);
        fs::write(&stale_log, "stale log").unwrap();

        // Gone daemon: metadata exists but no socket file
        let m_gone = make_metadata(
            dir.path(),
            "/config/gone.json",
            vec!["gone_proj".to_string()],
        );
        m_gone.write().unwrap();
        let gone_log = log_path_for_socket(&m_gone.socket_path);
        fs::write(&gone_log, "gone log").unwrap();

        // Clean up stale and gone daemons
        let results = DaemonMetadata::list_in(dir.path()).unwrap();
        for metadata in &results {
            if matches!(metadata.status(), DaemonStatus::Stale | DaemonStatus::Gone) {
                metadata.cleanup();
            }
        }

        // Stale daemon files should be gone
        assert!(!m_stale.metadata_path().exists());
        assert!(!m_stale.socket_path.exists());
        assert!(!stale_log.exists());

        // Gone daemon files should be gone
        assert!(!m_gone.metadata_path().exists());
        assert!(!gone_log.exists());

        // Active daemon should be untouched
        assert!(m_active.metadata_path().exists());
        assert!(m_active.socket_path.exists());
        assert!(active_log.exists());

        // Only the active daemon should remain in the list
        let results = DaemonMetadata::list_in(dir.path()).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].projects, vec!["active_proj"]);
        assert_eq!(results[0].status(), DaemonStatus::Active);
    }
}
