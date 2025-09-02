/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reporting errors to an LSP client
use std::path::Path;
use std::path::PathBuf;

use common::Diagnostic as CompilerDiagnostic;
use common::DiagnosticRelatedInformation;
use common::Location;
use common::TextSource;
use common::get_diagnostics_data;
use crossbeam::channel::Sender;
use dashmap::DashMap;
use dashmap::mapref::entry::Entry;
use dunce::canonicalize;
use extract_graphql::JavaScriptSourceFeature;
use lsp_server::Message;
use lsp_server::Notification as ServerNotification;
use lsp_types::Diagnostic;
use lsp_types::DiagnosticRelatedInformation as LspDiagnosticRelatedInformation;
use lsp_types::DiagnosticSeverity;
use lsp_types::DiagnosticTag;
use lsp_types::Location as LspLocation;
use lsp_types::Position;
use lsp_types::PublishDiagnosticsParams;
use lsp_types::Range;
use lsp_types::Url;
use lsp_types::notification::Notification;
use lsp_types::notification::PublishDiagnostics;
use relay_compiler::FsSourceReader;
use relay_compiler::SourceReader;
use relay_compiler::errors::BuildProjectError;
use relay_compiler::errors::Error;
use relay_compiler::source_for_location;

use crate::lsp_process_error::LSPProcessResult;

/// Converts a Location to a Url pointing to the canonical path based on the root_dir provided.
/// Returns None if we are unable to do the conversion
fn url_from_location(location: Location, root_dir: &Path) -> Option<Url> {
    let file_path = location.source_location().path();
    let canonical_path = canonicalize(root_dir.join(file_path)).ok()?;
    Url::from_file_path(canonical_path).ok()
}

#[derive(Default, Clone)]
struct DiagnosticSet {
    /// Stores the diagnostics from IDE source, which will be updated on any text change
    quick_diagnostics: Vec<Diagnostic>,
    /// Stores the diagnostics from watchman source, which will be updated on file save
    regular_diagnostics: Vec<Diagnostic>,
}

pub struct DiagnosticReporter {
    active_diagnostics: DashMap<Url, DiagnosticSet>,
    sender: Option<Sender<Message>>,
    root_dir: PathBuf,
    source_reader: Box<dyn SourceReader + Send + Sync>,
}

impl DiagnosticReporter {
    pub fn new(root_dir: PathBuf, sender: Option<Sender<Message>>) -> Self {
        Self {
            active_diagnostics: Default::default(),
            sender,
            root_dir,
            source_reader: Box::new(FsSourceReader),
        }
    }

    pub fn clear_regular_diagnostics(&self) {
        for mut r in self.active_diagnostics.iter_mut() {
            let (url, diagnostics) = r.pair_mut();
            diagnostics.regular_diagnostics.clear();
            self.publish_diagnostics_set(url, diagnostics);
        }
        self.active_diagnostics.retain(|_, diagnostics| {
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
                self.print_generic_error(format!("{error}"));
            }
        }
    }

    pub fn report_diagnostics(&self, diagnostics: &[common::Diagnostic]) {
        for diagnostic in diagnostics {
            self.report_diagnostic(diagnostic);
        }
    }

    pub fn commit_diagnostics(&self) {
        for r in self.active_diagnostics.iter() {
            let (url, diagnostics) = r.pair();
            self.publish_diagnostics_set(url, diagnostics)
        }
    }

    fn add_diagnostic(&self, url: Url, diagnostic: Diagnostic) {
        self.active_diagnostics
            .entry(url)
            .or_default()
            .regular_diagnostics
            .push(diagnostic);
    }

    pub fn update_quick_diagnostics_for_url(&self, url: &Url, diagnostics: Vec<Diagnostic>) {
        match self.active_diagnostics.entry(url.clone()) {
            Entry::Occupied(mut e) => {
                let data = e.get_mut();
                if data.quick_diagnostics != diagnostics {
                    data.quick_diagnostics = diagnostics;
                    self.publish_diagnostics_set(url, data);
                }
            }
            Entry::Vacant(e) => {
                if !diagnostics.is_empty() {
                    let data = DiagnosticSet {
                        regular_diagnostics: vec![],
                        quick_diagnostics: diagnostics,
                    };
                    self.publish_diagnostics_set(url, &data);
                    e.insert(data);
                }
            }
        }
    }

    pub fn clear_quick_diagnostics_for_url(&self, url: &Url) {
        if let Some(mut diagnostics) = self.active_diagnostics.get_mut(url)
            && !diagnostics.quick_diagnostics.is_empty()
        {
            diagnostics.quick_diagnostics.clear();
            self.publish_diagnostics_set(url, &diagnostics)
        }
    }

    fn publish_diagnostics_set(&self, url: &Url, diagnostics: &DiagnosticSet) {
        let mut next_diagnostics = diagnostics.quick_diagnostics.clone();
        for diagnostic in &diagnostics.regular_diagnostics {
            if !next_diagnostics
                .iter()
                .any(|prev_diag| prev_diag.eq(diagnostic))
            {
                next_diagnostics.push(diagnostic.clone());
            }
        }
        let params = PublishDiagnosticsParams {
            diagnostics: next_diagnostics,
            uri: url.clone(),
            version: None,
        };
        publish_diagnostic(params, &self.sender).ok();
    }

    #[cfg(test)]
    fn set_source_reader(&mut self, source_reader: Box<dyn SourceReader + Send + Sync>) {
        self.source_reader = source_reader;
    }

    fn report_diagnostic(&self, diagnostic: &CompilerDiagnostic) {
        let location = diagnostic.location();

        let url = match self.url_from_location(location) {
            Some(url) => url,
            None => return,
        };
        let source = match self.source_from_location(location) {
            Some(source) => source,
            None => return,
        };

        let diagnostic = self.convert_diagnostic(source.text_source(), diagnostic);
        self.add_diagnostic(url, diagnostic);
    }

    pub fn convert_diagnostic(
        &self,
        text_source: &TextSource,
        diagnostic: &CompilerDiagnostic,
    ) -> Diagnostic {
        let tags: Vec<DiagnosticTag> = diagnostic.tags();

        let related_information = diagnostic
            .related_information()
            .iter()
            .filter_map(|info| self.maybe_convert_related_information(info))
            .collect::<Vec<_>>();

        Diagnostic {
            code: None,
            data: get_diagnostics_data(diagnostic),
            message: diagnostic.message().to_string(),
            range: text_source.to_span_range(diagnostic.location().span()),
            related_information: if related_information.is_empty() {
                None
            } else {
                Some(related_information)
            },
            severity: Some(diagnostic.severity()),
            tags: if tags.is_empty() { None } else { Some(tags) },
            source: None,
            ..Default::default()
        }
    }

    pub fn maybe_convert_related_information(
        &self,
        info: &DiagnosticRelatedInformation,
    ) -> Option<LspDiagnosticRelatedInformation> {
        let uri = self.url_from_location(info.location)?;
        let source = self.source_from_location(info.location)?;

        Some(LspDiagnosticRelatedInformation {
            message: info.message.to_string(),
            location: LspLocation {
                range: source.text_source().to_span_range(info.location.span()),
                uri,
            },
        })
    }

    pub fn url_from_location(&self, location: Location) -> Option<Url> {
        url_from_location(location, &self.root_dir).or_else(|| {
            // TODO(brandondail) we should always be able to parse as a Url, so log here when we don't
            Url::from_directory_path(&self.root_dir).ok()
        })
    }

    fn source_from_location(&self, location: Location) -> Option<JavaScriptSourceFeature> {
        source_for_location(
            &self.root_dir,
            location.source_location(),
            self.source_reader.as_ref(),
        )
    }

    fn print_project_error(&self, error: &BuildProjectError) {
        match error {
            BuildProjectError::ValidationErrors { errors, .. } => {
                for diagnostic in errors {
                    self.report_diagnostic(diagnostic);
                }
            }
            BuildProjectError::PersistErrors { errors, .. } => {
                for error in errors {
                    self.print_generic_error(format!("{error}"));
                }
            }
            _ => {
                self.print_generic_error(format!("{error}"));
            }
        }
    }

    fn print_generic_error(&self, message: String) {
        let diagnostic = Diagnostic {
            code: None,
            message,
            range: Range::new(Position::new(0, 0), Position::new(0, 0)),
            related_information: None,
            severity: Some(DiagnosticSeverity::ERROR),
            source: None,
            tags: None,
            ..Default::default()
        };
        let url = Url::from_directory_path(&self.root_dir)
            .expect("print_generic_error: Could not convert self.root_dir to Url");
        self.add_diagnostic(url, diagnostic);
    }

    pub fn get_diagnostics_for_range(&self, url: &Url, range: Range) -> Option<Diagnostic> {
        let diagnostic_set = self.active_diagnostics.get(url)?;
        diagnostic_set
            .quick_diagnostics
            .iter()
            .find(|item| is_sub_range(range, item.range))
            .or_else(|| {
                diagnostic_set
                    .regular_diagnostics
                    .iter()
                    .find(|item| is_sub_range(range, item.range))
            })
            .cloned()
    }

    pub fn get_published_diagnostics(&self) -> Vec<PublishDiagnosticsParams> {
        let mut result = Vec::new();
        for r in self.active_diagnostics.iter() {
            let (url, diagnostics) = r.pair();
            let mut next_diagnostics = diagnostics.quick_diagnostics.clone();
            for diagnostic in &diagnostics.regular_diagnostics {
                if !next_diagnostics
                    .iter()
                    .any(|prev_diag| prev_diag.eq(diagnostic))
                {
                    next_diagnostics.push(diagnostic.clone());
                }
            }
            result.push(PublishDiagnosticsParams {
                diagnostics: next_diagnostics,
                uri: url.clone(),
                version: None,
            });
        }
        result
    }
}

/// Checks if `inner` range is within the `outer` range.
/// First, we need to make sure that the start character of the outer range
/// is before (or the same) character of the inner range.
/// Then we need to make sure that end character of the outer range is after
/// (or the same) as the end character of the inner range, or outer line
/// is more than inner end line.
fn is_sub_range(inner: Range, outer: Range) -> bool {
    (outer.start.character <= inner.start.character && outer.start.line <= inner.start.line)
        && (outer.end.character >= inner.end.character && outer.end.line >= inner.end.line)
}

/// Publish diagnostics to the client
pub fn publish_diagnostic(
    diagnostic_params: PublishDiagnosticsParams,
    sender: &Option<Sender<Message>>,
) -> LSPProcessResult<()> {
    let notif = ServerNotification::new(PublishDiagnostics::METHOD.into(), diagnostic_params);
    if let Some(sender) = sender {
        sender.send(Message::Notification(notif)).unwrap_or(());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::env;
    use std::path::Path;
    use std::path::PathBuf;

    use common::Diagnostic;
    use common::Location;
    use common::SourceLocationKey;
    use common::Span;
    use intern::string_key::Intern;
    use lsp_types::Position;
    use lsp_types::Range;
    use relay_compiler::SourceReader;

    use super::DiagnosticReporter;
    use super::is_sub_range;

    struct MockSourceReader(String);

    impl SourceReader for MockSourceReader {
        fn read_file_to_string(&self, _path: &Path) -> std::io::Result<String> {
            Ok(self.0.to_string())
        }
    }

    #[test]
    fn report_diagnostic_test() {
        let root_dir =
            env::current_dir().expect("expect to be able to get the current working directory");
        let (sender, _) = crossbeam::channel::unbounded();
        let mut reporter = DiagnosticReporter::new(root_dir, Some(sender));
        reporter.set_source_reader(Box::new(MockSourceReader("Content".to_string())));
        let source_location = SourceLocationKey::Standalone {
            path: "foo.txt".intern(),
        };
        assert_eq!(reporter.active_diagnostics.len(), 0);
        reporter.report_diagnostic(&Diagnostic::error(
            "test message",
            Location::new(source_location, Span { start: 0, end: 1 }),
        ));
        assert_eq!(reporter.active_diagnostics.len(), 1);
    }

    /// This test will assert that the message without URL (with generated source) won't be reported by LSPStatusReporter
    /// I'm not sure if this is the right behavior, but lets capture it here.
    #[test]
    fn do_not_report_diagnostic_without_url_test() {
        let root_dir = PathBuf::from("/tmp");
        let (sender, _) = crossbeam::channel::unbounded();

        let mut reporter = DiagnosticReporter::new(root_dir, Some(sender));
        reporter.set_source_reader(Box::new(MockSourceReader("".to_string())));

        reporter.report_diagnostic(&Diagnostic::error("-", Location::generated()));
        assert_eq!(reporter.active_diagnostics.len(), 0);
    }

    #[test]
    fn sub_range_inner_directly_below() {
        let cursor = Range::new(Position::new(106, 12), Position::new(106, 12));
        let diagnostic = Range::new(Position::new(92, 6), Position::new(92, 17));
        assert!(!is_sub_range(cursor, diagnostic));
    }

    #[test]
    fn sub_range_inner_directly_above() {
        let cursor = Range::new(Position::new(80, 12), Position::new(80, 12));
        let diagnostic = Range::new(Position::new(92, 6), Position::new(92, 17));
        assert!(!is_sub_range(cursor, diagnostic));
    }
}
