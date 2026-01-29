/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reporting errors to an LSP client
use std::path::PathBuf;

use crossbeam::channel::Sender;
use log::info;
use lsp_server::Message;
use relay_compiler::errors::Error;
use relay_compiler::status_reporter::StatusReporter;

use crate::diagnostic_reporter::DiagnosticReporter;
use crate::status_updater::set_error_status;
use crate::status_updater::set_ready_status;
use crate::status_updater::update_in_progress_status;

pub struct LSPStatusReporter {
    diagnostic_reporter: DiagnosticReporter,
    sender: Sender<Message>,
}

impl LSPStatusReporter {
    pub fn new(root_dir: PathBuf, sender: Sender<Message>) -> Self {
        let sender_clone = sender.clone();
        Self {
            sender,
            diagnostic_reporter: DiagnosticReporter::new(root_dir, Some(sender_clone)),
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

    fn build_completes(&self, diagnostics: &[common::Diagnostic]) {
        set_ready_status(&self.sender);
        self.diagnostic_reporter.clear_regular_diagnostics();
        self.diagnostic_reporter.report_diagnostics(diagnostics);
        self.diagnostic_reporter.commit_diagnostics();
        info!("Compilation completed.");
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
