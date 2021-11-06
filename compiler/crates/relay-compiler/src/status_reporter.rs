/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    errors::{BuildProjectError, Error},
    source_for_location, FsSourceReader, SourceReader,
};
use common::Diagnostic;
use graphql_cli::DiagnosticPrinter;
use log::{error, info};
use std::path::PathBuf;

pub trait StatusReporter {
    fn build_starts(&self);
    fn build_completes(&self);
    fn build_errors(&self, error: &Error);
}

pub struct ConsoleStatusReporter {
    source_reader: Box<dyn SourceReader + Send + Sync>,
    root_dir: PathBuf,
}

impl ConsoleStatusReporter {
    pub fn new(root_dir: PathBuf) -> Self {
        Self {
            root_dir,
            source_reader: Box::new(FsSourceReader),
        }
    }
}

impl ConsoleStatusReporter {
    fn print_error(&self, error: &Error) {
        match error {
            Error::DiagnosticsError { errors } => {
                for diagnostic in errors {
                    self.print_diagnostic(diagnostic);
                }
            }
            Error::BuildProjectsErrors { errors } => {
                for error in errors {
                    self.print_project_error(error);
                }
            }
            Error::Cancelled => {
                info!("Compilation cancelled due to new changes.");
            }
            error => {
                error!("{}", error);
            }
        }
    }

    fn print_project_error(&self, error: &BuildProjectError) {
        match error {
            BuildProjectError::ValidationErrors { errors } => {
                for diagnostic in errors {
                    self.print_diagnostic(diagnostic);
                }
            }
            BuildProjectError::PersistErrors { errors } => {
                for error in errors {
                    error!("{}", error);
                }
            }
            _ => {
                error!("{}", error);
            }
        }
    }

    fn print_diagnostic(&self, diagnostic: &Diagnostic) {
        let printer = DiagnosticPrinter::new(|source_location| {
            source_for_location(&self.root_dir, source_location, self.source_reader.as_ref())
                .map(|source| source.text)
        });
        error!("{}", printer.diagnostic_to_string(diagnostic));
    }
}

impl StatusReporter for ConsoleStatusReporter {
    fn build_starts(&self) {}

    fn build_completes(&self) {}

    fn build_errors(&self, error: &Error) {
        self.print_error(error);
        if !matches!(error, Error::Cancelled) {
            error!("Compilation failed.");
        }
    }
}
