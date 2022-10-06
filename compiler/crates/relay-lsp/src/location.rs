/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;
use std::path::PathBuf;

use common::Location;
use common::SourceLocationKey;
use common::TextSource;
use intern::Lookup;
use lsp_types::Url;

use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;

/// Given a root dir and a common::Location, return a Result containing an
/// LSPLocation (i.e. lsp_types::Location).
pub fn transform_relay_location_to_lsp_location(
    root_dir: &Path,
    location: Location,
) -> LSPRuntimeResult<lsp_types::Location> {
    match location.source_location() {
        SourceLocationKey::Standalone { path } => {
            let abspath = root_dir.join(PathBuf::from(path.lookup()));

            let file_contents = get_file_contents(&abspath)?;

            let uri = get_uri(&abspath)?;

            let range =
                TextSource::from_whole_document(file_contents).to_span_range(location.span());
            Ok(lsp_types::Location { uri, range })
        }
        SourceLocationKey::Embedded { path, index } => {
            let path_to_fragment = root_dir.join(PathBuf::from(path.lookup()));
            let uri = get_uri(&path_to_fragment)?;

            let file_contents = get_file_contents(&path_to_fragment)?;

            let response = extract_graphql::extract(&file_contents);
            let response_length = response.len();
            let embedded_source = response
                .into_iter()
                .nth(index.try_into().unwrap())
                .ok_or_else(|| {
                    LSPRuntimeError::UnexpectedError(format!(
                        "File {:?} does not contain enough graphql literals: {} needed; {} found",
                        path_to_fragment, index, response_length
                    ))
                })?;

            let text_source = embedded_source.text_source();
            let range = text_source.to_span_range(location.span());
            Ok(lsp_types::Location { uri, range })
        }
        _ => Err(LSPRuntimeError::UnexpectedError(
            "Cannot get location of generated field in graphql file".to_string(),
        )),
    }
}

fn get_file_contents(path: &Path) -> LSPRuntimeResult<String> {
    let file = std::fs::read(&path).map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))?;
    String::from_utf8(file).map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))
}

fn get_uri(path: &PathBuf) -> LSPRuntimeResult<Url> {
    Url::parse(&format!(
        "file://{}",
        path.to_str()
            .ok_or_else(|| LSPRuntimeError::UnexpectedError(format!(
                "Could not cast path {:?} as string",
                path
            )))?
    ))
    .map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))
}
