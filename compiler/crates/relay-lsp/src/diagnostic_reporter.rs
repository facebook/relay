/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reporting errors to an LSP client
use crate::lsp::{
    publish_diagnostic, Diagnostic, DiagnosticSeverity, Position, PublishDiagnosticsParams, Range,
    Url,
};
use common::{Diagnostic as CompilerDiagnostic, Location};
use crossbeam::crossbeam_channel::Sender;
use lsp_server::Message;
use relay_compiler::{
    errors::{BuildProjectError, Error},
    source_for_location, FsSourceReader, SourceReader,
};
use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{Arc, RwLock},
};

/// Converts a Location to a Url pointing to the canonical path based on the root_dir provided.
/// Returns None if we are unable to do the conversion
fn url_from_location(location: Location, root_dir: &PathBuf) -> Option<Url> {
    let file_path = location.source_location().path();
    let canonical_path = std::fs::canonicalize(root_dir.join(file_path)).ok()?;
    Url::from_file_path(canonical_path).ok()
}

#[derive(Default)]
struct DiagnosticSet {
    /// Stores the diagnostics from IDE source, which will be updated on any text change
    quick_diagnostics: Vec<Diagnostic>,
    /// Stores the diagnostics from watchman source, which will be updated on file save
    regular_diagnostics: Vec<Diagnostic>,
}

pub struct DiagnosticReporter {
    active_diagnostics: Arc<RwLock<HashMap<Url, DiagnosticSet>>>,
    sender: Sender<Message>,
    root_dir: PathBuf,
    source_reader: Box<dyn SourceReader + Send + Sync>,
}

impl DiagnosticReporter {
    pub fn new(root_dir: PathBuf, sender: Sender<Message>) -> Self {
        Self {
            active_diagnostics: Default::default(),
            sender,
            root_dir,
            source_reader: Box::new(FsSourceReader),
        }
    }

    pub fn clear_regular_diagnostics(&self) {
        let mut active_diagnostics = self
            .active_diagnostics
            .write()
            .expect("build_finishes: could not acquire write lock for self.active_diagnostics");
        for diagnostics in active_diagnostics.values_mut() {
            diagnostics.regular_diagnostics.clear();
        }
        active_diagnostics.retain(|_, diagnostics| {
            !diagnostics.regular_diagnostics.is_empty() || !diagnostics.quick_diagnostics.is_empty()
        })
    }

    pub fn report_error(&self, error: &Error) {
        match error {
            Error::DiagnosticsError { errors } => {
                for diagnostic in errors {
                    self.report_diagnostic(diagnostic);
                }
            }
            Error::BuildProjectsErrors { errors } => {
                for error in errors {
                    self.print_project_error(error);
                }
            }
            Error::Cancelled => {
                // Ignore the cancellation
            }
            error => {
                self.print_generic_error(format!("{}", error));
            }
        }
    }

    pub fn commit_diagnostics(&self) {
        for (url, diagnostics) in self
            .active_diagnostics
            .read()
            .expect("commit_diagnostic: could not acquire read lock for self.active_diagnostics")
            .iter()
        {
            let params = PublishDiagnosticsParams {
                diagnostics: diagnostics
                    .quick_diagnostics
                    .iter()
                    .chain(diagnostics.regular_diagnostics.iter())
                    .cloned()
                    .collect(),
                uri: url.clone(),
                version: None,
            };
            publish_diagnostic(params, &self.sender).ok();
        }
    }

    fn add_diagnostic(&self, url: Url, diagnostic: Diagnostic) {
        self.active_diagnostics
            .write()
            .expect("add_diagnostic: could not acquire write lock for self.active_diagnostics")
            .entry(url)
            .or_default()
            .regular_diagnostics
            .push(diagnostic);
    }

    pub fn update_quick_diagnostics_for_url(&self, url: Url, diagnostics: Vec<Diagnostic>) {
        self.active_diagnostics
            .write()
            .expect("update_quick_diagnostics_for_url: could not acquire write lock for self.active_diagnostics")
            .entry(url)
            .or_default()
            .regular_diagnostics = diagnostics;
    }

    pub fn clear_quick_diagnostics_for_url(&self, url: &Url) {
        if let Some(diagnostics) =  self.active_diagnostics
            .write()
            .expect("update_quick_diagnostics_for_url: could not acquire write lock for self.active_diagnostics")
            .get_mut(url) {
                diagnostics.quick_diagnostics.clear();
            }
    }

    #[cfg(test)]
    fn set_source_reader(&mut self, source_reader: Box<dyn SourceReader + Send + Sync>) {
        self.source_reader = source_reader;
    }

    fn report_diagnostic(&self, diagnostic: &CompilerDiagnostic) {
        let message = diagnostic.message().to_string();

        let location = diagnostic.location();

        let url = match url_from_location(location, &self.root_dir) {
            Some(url) => url,
            None => {
                // TODO(brandondail) we should always be able to parse as a Url, so log here when we don't
                if let Ok(root) = Url::from_directory_path(&self.root_dir) {
                    root
                } else {
                    return;
                }
            }
        };

        let source = if let Some(source) = source_for_location(
            &self.root_dir,
            location.source_location(),
            self.source_reader.as_ref(),
        ) {
            source
        } else {
            return;
        };

        let range = location
            .span()
            .to_range(&source.text, source.line_index, source.column_index);

        let diagnostic = Diagnostic {
            code: None,
            message,
            range,
            related_information: None,
            severity: Some(DiagnosticSeverity::Error),
            source: None,
            tags: None,
        };
        self.add_diagnostic(url, diagnostic);
    }

    fn print_project_error(&self, error: &BuildProjectError) {
        match error {
            BuildProjectError::ValidationErrors { errors } => {
                for diagnostic in errors {
                    self.report_diagnostic(diagnostic);
                }
            }
            BuildProjectError::PersistErrors { errors } => {
                for error in errors {
                    self.print_generic_error(format!("{}", error));
                }
            }
            _ => {
                self.print_generic_error(format!("{}", error));
            }
        }
    }

    fn print_generic_error(&self, message: String) {
        let diagnostic = Diagnostic {
            code: None,
            message,
            range: Range::new(Position::new(0, 0), Position::new(0, 0)),
            related_information: None,
            severity: Some(DiagnosticSeverity::Error),
            source: None,
            tags: None,
        };
        let url = Url::from_directory_path(&self.root_dir)
            .expect("print_generic_error: Could not convert self.root_dir to Url");
        self.add_diagnostic(url, diagnostic);
    }
}

#[cfg(test)]
mod tests {
    use super::DiagnosticReporter;
    use common::{Diagnostic, Location, SourceLocationKey, Span};
    use crossbeam::crossbeam_channel;
    use interner::Intern;
    use relay_compiler::SourceReader;
    use std::path::PathBuf;

    struct MockSourceReader(String);

    impl SourceReader for MockSourceReader {
        fn read_to_string(&self, _path: &PathBuf) -> std::io::Result<String> {
            Ok(self.0.to_string())
        }
    }

    #[test]
    fn report_diagnostic_test() {
        let root_dir = PathBuf::from("/tmp");
        let (sender, _) = crossbeam_channel::unbounded();
        let mut reporter = DiagnosticReporter::new(root_dir, sender);
        reporter.set_source_reader(Box::new(MockSourceReader("Content".to_string())));
        let source_location = SourceLocationKey::Standalone {
            path: "foo.txt".intern(),
        };
        assert_eq!(reporter.active_diagnostics.read().unwrap().len(), 0);
        reporter.report_diagnostic(&Diagnostic::error(
            "test message",
            Location::new(source_location, Span { start: 0, end: 1 }),
        ));
        assert_eq!(reporter.active_diagnostics.read().unwrap().len(), 1);
    }

    /// This test will assert that the message without URL (with generated source) won't be reported by LSPStatusReporter
    /// I'm not sure if this is the right behavior, but lets capture it here.
    #[test]
    fn do_not_report_diagnostic_without_url_test() {
        let root_dir = PathBuf::from("/tmp");
        let (sender, _) = crossbeam_channel::unbounded();

        let mut reporter = DiagnosticReporter::new(root_dir, sender);
        reporter.set_source_reader(Box::new(MockSourceReader("".to_string())));

        reporter.report_diagnostic(&Diagnostic::error("-", Location::generated()));
        assert_eq!(reporter.active_diagnostics.read().unwrap().len(), 0);
    }
}
