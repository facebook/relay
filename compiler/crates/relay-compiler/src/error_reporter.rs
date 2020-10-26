/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::source_for_location;
use common::Diagnostic;
use graphql_cli::DiagnosticPrinter;
use log::error;
use std::path::PathBuf;

pub trait ErrorReporter {
    fn report_diagnostic(&self, diagnostic: &Diagnostic);
}

pub struct ConsoleErrorReporter {
    root_dir: PathBuf,
}

impl ConsoleErrorReporter {
    pub fn new(root_dir: PathBuf) -> Self {
        Self { root_dir }
    }
}

impl ErrorReporter for ConsoleErrorReporter {
    fn report_diagnostic(&self, diagnostic: &Diagnostic) {
        let printer = DiagnosticPrinter::new(|source_location| {
            source_for_location(&self.root_dir, source_location).map(|source| source.text)
        });
        error!("{}", printer.diagnostic_to_string(diagnostic));
    }
}
