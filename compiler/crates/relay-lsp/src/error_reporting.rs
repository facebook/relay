/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reporting errors to an LSP client
use crate::lsp::Url;
use crate::lsp::{url_from_location, Diagnostic, DiagnosticSeverity};
use crate::state::ServerState;
use relay_compiler::{errors::BuildProjectError, source_for_location};
use std::fs;

/// Add errors that occur during the `build_project` step
pub fn add_build_project_errors(errors: Vec<BuildProjectError>, server_state: &mut ServerState) {
    for error in errors {
        match error {
            BuildProjectError::ValidationErrors { errors } => {
                for diagnostic in errors {
                    let message = diagnostic.message().to_string();

                    let location = diagnostic.location();

                    let url = match url_from_location(location, &server_state.root_dir) {
                        Some(url) => url,
                        None => {
                            // If we can't parse the location as a Url we can't report the error
                            // TODO(brandondail) we should always be able to parse as a Url, so log here when we don't
                            return;
                        }
                    };

                    let source = if let Some(source) =
                        source_for_location(&server_state.root_dir, location.source_location())
                    {
                        source
                    } else {
                        return;
                    };
                    let range = location.span().to_range(
                        &source.text,
                        source.line_index,
                        source.column_index,
                    );

                    let diagnostic = Diagnostic {
                        code: None,
                        message,
                        range,
                        related_information: None,
                        severity: Some(DiagnosticSeverity::Error),
                        source: None,
                        tags: None,
                    };
                    server_state.add_diagnostic(url, diagnostic);
                }
            }
            // We ignore persist/write errors for now. In the future we can potentially show a notification.
            BuildProjectError::PersistErrors { .. } => {}
            BuildProjectError::WriteFileError { .. } => {}
        }
    }
    // ...
}

/// Add errors that occur during parsing
pub fn add_syntax_errors(errors: Vec<common::Diagnostic>, server_state: &mut ServerState) {
    for error in errors {
        // Remove the index from the end of the path, resolve the absolute path
        let file_path = {
            let file_path = error.location().source_location().path();
            fs::canonicalize(server_state.root_dir.join(file_path)).unwrap()
        };

        let url = Url::from_file_path(file_path).unwrap();

        let message = format!("{}", error.message());

        let source = if let Some(source) =
            source_for_location(&server_state.root_dir, error.location().source_location())
        {
            source
        } else {
            continue;
        };
        let range =
            error
                .location()
                .span()
                .to_range(&source.text, source.line_index, source.column_index);

        let diagnostic = Diagnostic {
            code: None,
            message,
            range,
            related_information: None,
            severity: Some(DiagnosticSeverity::Error),
            source: Some(source.text),
            tags: None,
        };
        server_state.add_diagnostic(url, diagnostic);
    }
}
