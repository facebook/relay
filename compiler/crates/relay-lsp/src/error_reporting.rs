/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for reporting errors to an LSP client
use crate::lsp::{
    publish_diagnostic, url_from_location, Diagnostic, DiagnosticSeverity, PublishDiagnosticsParams,
};
use crate::lsp::{Connection, Url};
use crate::state::ServerState;
use relay_compiler::{
    errors::{BuildProjectError, SyntaxErrorWithSource, ValidationError},
    source_for_location,
};
use std::fs;

/// Report errors that occur during the `build_project` step
pub fn report_build_project_errors(
    errors: Vec<BuildProjectError>,
    connection: &Connection,
    server_state: &mut ServerState,
) {
    for error in errors {
        match error {
            BuildProjectError::ValidationErrors { errors } => {
                for ValidationError { message, locations } in errors {
                    let message = format!("{}", message);

                    let location = match locations.first() {
                        Some(&location) => location,
                        _ => {
                            // If we can't get the source and location we can't report the error, so
                            // exit early.
                            // TODO(brandondail) we should always have at least one source and location, so log here when we don't
                            return;
                        }
                    };

                    let url = match url_from_location(location, &server_state.root_dir) {
                        Some(url) => url,
                        None => {
                            // If we can't parse the location as a Url we can't report the error
                            // TODO(brandondail) we should always be able to parse as a Url, so log here when we don't
                            return;
                        }
                    };

                    server_state.register_url_with_diagnostics(url.clone());

                    let source = if let Some(source) =
                        source_for_location(&server_state.root_dir, location)
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

                    let params = PublishDiagnosticsParams {
                        diagnostics: vec![diagnostic],
                        uri: url,
                        version: None,
                    };

                    publish_diagnostic(params, &connection).ok();
                }
            }
            // We ignore persist/write errors for now. In the future we can potentially show a notification.
            BuildProjectError::PersistErrors { .. } => {}
            BuildProjectError::WriteFileError { .. } => {}
        }
    }
    // ...
}

/// Report errors that occur during parsing
pub fn report_syntax_errors(
    errors: Vec<SyntaxErrorWithSource>,
    connection: &Connection,
    server_state: &mut ServerState,
) {
    for SyntaxErrorWithSource { error, source } in errors {
        // Remove the index from the end of the path, resolve the absolute path
        let file_path = {
            let file_path = error.location.source_location().path();
            fs::canonicalize(server_state.root_dir.join(file_path)).unwrap()
        };

        let url = Url::from_file_path(file_path).unwrap();

        // Track the url we're reporting diagnostics for so we can
        // clear them out later.
        server_state.register_url_with_diagnostics(url.clone());

        let message = format!("{}", error.kind);

        let range =
            error
                .location
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

        let params = PublishDiagnosticsParams {
            diagnostics: vec![diagnostic],
            uri: url,
            version: None,
        };

        publish_diagnostic(params, &connection).unwrap();
    }
}
