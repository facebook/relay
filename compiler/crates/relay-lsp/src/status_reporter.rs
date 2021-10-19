/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reporting errors to an LSP client
use crate::{
    diagnostic_reporter::DiagnosticReporter,
    status_updater::{set_error_status, set_ready_status, update_in_progress_status},
};
use crossbeam::channel::Sender;
use lsp_server::Message;
use relay_compiler::{errors::Error, status_reporter::StatusReporter};
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
        match error {
            Error::BuildProjectsErrors { .. } | Error::DiagnosticsError { .. } => {
                set_ready_status(&self.sender);
                self.diagnostic_reporter.clear_regular_diagnostics();
                self.diagnostic_reporter.report_error(error);
                self.diagnostic_reporter.commit_diagnostics();
            }
            Error::Cancelled => {}
            _ => set_error_status(&self.sender, error),
        }
    }
}
