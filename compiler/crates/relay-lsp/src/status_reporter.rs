/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reporting errors to an LSP client
use crate::{
    diagnostic_reporter::DiagnosticReporter,
    status_updater::{set_ready_status, update_in_progress_status},
};
use crossbeam::channel::Sender;
use lsp_server::Message;
use relay_compiler::{
    errors::{BuildProjectError, Error},
    status_reporter::StatusReporter,
    ArtifactWriter,
};
use std::path::PathBuf;

pub struct LSPStatusReporter {
    diagnostic_reporter: DiagnosticReporter,
    sender: Sender<Message>,
}

impl LSPStatusReporter {
    pub fn new(root_dir: PathBuf, sender: Sender<Message>) -> Self {
        let sender_clone = sender.clone();
        Self {
            sender,
            diagnostic_reporter: DiagnosticReporter::new(root_dir, sender_clone),
        }
    }
}

impl StatusReporter for LSPStatusReporter {
    fn build_starts(&self) {
        update_in_progress_status(
            "Relay: compiling...",
            Some("The Relay extension is checking for errors."),
            &self.sender,
        );
    }

    fn build_completes(&self) {
        set_ready_status(&self.sender);
        self.diagnostic_reporter.clear_regular_diagnostics();
        self.diagnostic_reporter.commit_diagnostics();
    }

    fn build_errors(&self, error: &Error) {
        set_ready_status(&self.sender);
        self.diagnostic_reporter.clear_regular_diagnostics();
        self.diagnostic_reporter.report_error(error);
        self.diagnostic_reporter.commit_diagnostics();
    }
}

pub struct StatusReporterArtifactWriter {
    sender: Sender<Message>,
    artifact_writer: Box<dyn ArtifactWriter + Send + Sync>,
}

impl StatusReporterArtifactWriter {
    pub fn new(
        sender: Sender<Message>,
        artifact_writer: Box<dyn ArtifactWriter + Send + Sync>,
    ) -> Self {
        Self {
            sender,
            artifact_writer,
        }
    }
}

impl ArtifactWriter for StatusReporterArtifactWriter {
    fn should_write(&self, path: &PathBuf, content: &[u8]) -> Result<bool, BuildProjectError> {
        self.artifact_writer.should_write(path, content)
    }

    fn write(&self, path: PathBuf, content: Vec<u8>) -> Result<(), BuildProjectError> {
        let file_name = path
            .file_name()
            .map(|name| name.to_string_lossy().to_string())
            .unwrap_or_else(|| "".into());
        update_in_progress_status(
            format!("Relay: writing {}", file_name),
            Some(format!(
                "Relay compiler is writing the artifact {}",
                path.to_string_lossy()
            )),
            &self.sender,
        );
        self.artifact_writer.write(path, content)
    }

    fn remove(&self, path: PathBuf) -> Result<(), BuildProjectError> {
        let file_name = path
            .file_name()
            .map(|name| name.to_string_lossy().to_string())
            .unwrap_or_else(|| "".into());
        update_in_progress_status(
            format!("Relay: removing {}", file_name),
            Some(format!(
                "Relay compiler is removing the artifact {}",
                path.to_string_lossy()
            )),
            &self.sender,
        );
        self.artifact_writer.remove(path)
    }

    fn finalize(&self) -> relay_compiler::errors::Result<()> {
        self.artifact_writer.finalize()
    }
}
