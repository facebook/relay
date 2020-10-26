/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reporting errors to an LSP client
use crate::lsp::{
    publish_diagnostic, url_from_location, Diagnostic, DiagnosticSeverity,
    PublishDiagnosticsParams, Url,
};
use common::Diagnostic as CompilerDiagnostic;
use crossbeam::crossbeam_channel::Sender;
use lsp_server::Message;
use relay_compiler::{error_reporter::ErrorReporter, source_for_location};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, RwLock};

pub struct LSPErrorReporter {
    active_diagnostics: Arc<RwLock<HashMap<Url, Vec<Diagnostic>>>>,
    sender: Sender<Message>,
    root_dir: PathBuf,
}

impl LSPErrorReporter {
    pub fn new(root_dir: PathBuf, sender: Sender<Message>) -> Self {
        Self {
            active_diagnostics: Default::default(),
            sender,
            root_dir,
        }
    }

    fn add_diagnostic(&self, url: Url, diagnostic: Diagnostic) {
        self.active_diagnostics
            .write()
            .unwrap()
            .entry(url)
            .or_default()
            .push(diagnostic);
    }

    fn commit_diagnostics(&self) {
        for (url, diagnostics) in self.active_diagnostics.read().unwrap().iter() {
            let params = PublishDiagnosticsParams {
                diagnostics: diagnostics.clone(),
                uri: url.clone(),
                version: None,
            };
            publish_diagnostic(params, &self.sender).ok();
        }
    }
}

impl ErrorReporter for LSPErrorReporter {
    fn report_diagnostic(&self, diagnostic: &CompilerDiagnostic) {
        let message = diagnostic.message().to_string();

        let location = diagnostic.location();

        let url = match url_from_location(location, &self.root_dir) {
            Some(url) => url,
            None => {
                // If we can't parse the location as a Url we can't report the error
                // TODO(brandondail) we should always be able to parse as a Url, so log here when we don't
                return;
            }
        };

        let source =
            if let Some(source) = source_for_location(&self.root_dir, location.source_location()) {
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
        self.commit_diagnostics();
    }

    fn clear_diagnostics(&self) {
        {
            let mut active_diagnostics = self.active_diagnostics.write().unwrap();
            for diagnostics in active_diagnostics.values_mut() {
                diagnostics.clear();
            }
        }
        self.commit_diagnostics();
    }
}
