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
use dashmap::DashMap;
use extract_graphql::JavaScriptSourceFeature;
use graphql_syntax::GraphQLSource;
use intern::Lookup;
use lsp_types::Range;
use lsp_types::Url;

use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;

/// Given a root dir and a common::Location, return a Result containing an
/// LSPLocation (i.e. lsp_types::Location).
pub fn transform_relay_location_on_disk_to_lsp_location(
    root_dir: &Path,
    location: Location,
) -> LSPRuntimeResult<lsp_types::Location> {
    transform_relay_location_to_lsp_location_with_cache(root_dir, location, None, None)
}

pub fn transform_relay_location_to_lsp_location_with_cache(
    root_dir: &Path,
    location: Location,
    source_feature_cache: Option<&DashMap<Url, Vec<JavaScriptSourceFeature>>>,
    synced_schema_sources: Option<&DashMap<Url, GraphQLSource>>,
) -> LSPRuntimeResult<lsp_types::Location> {
    match location.source_location() {
        SourceLocationKey::Standalone { path } => {
            let absolute_path = root_dir.join(PathBuf::from(path.lookup()));
            let uri = get_uri(&absolute_path)?;

            // Standalone locations might be `.graphql` files, so we'll look in the synced
            // schema sources cache first.
            let range = match synced_schema_sources.and_then(|cache| {
                cache
                    .get(&uri)
                    .map(|source| source.text_source().to_span_range(location.span()))
            }) {
                Some(range) => range,
                None => {
                    let file_contents = get_file_contents(&absolute_path)?;
                    TextSource::from_whole_document(file_contents).to_span_range(location.span())
                }
            };

            Ok(lsp_types::Location { uri, range })
        }
        SourceLocationKey::Embedded { path, index } => {
            let path_to_fragment = root_dir.join(PathBuf::from(path.lookup()));
            let uri = get_uri(&path_to_fragment)?;

            // Embedded locations are always `.js` files, so we'll look in the
            // source feature cache first.
            let range = match source_feature_cache.and_then(|cache| cache.get(&uri)) {
                Some(response) => feature_location_to_range(&response, index, location),
                None => {
                    // If the file is not in the cache, read it from disk.
                    let content = get_file_contents(&path_to_fragment)?;
                    let response = extract_graphql::extract(&content);
                    feature_location_to_range(&response, index, location)
                }
            }?;

            Ok(lsp_types::Location { uri, range })
        }
        _ => Err(LSPRuntimeError::UnexpectedError(
            "Cannot get location of generated field in graphql file".to_string(),
        )),
    }
}

fn feature_location_to_range(
    source_features: &[JavaScriptSourceFeature],
    index: u16,
    location: Location,
) -> Result<Range, LSPRuntimeError> {
    let response_length = source_features.len();
    let embedded_source: &JavaScriptSourceFeature =
        source_features.get::<usize>(index.into()).ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!(
                "File {:?} does not contain enough graphql literals: {} needed; {} found",
                location.source_location().path(),
                index,
                response_length
            ))
        })?;
    let text_source = embedded_source.text_source();
    Ok(text_source.to_span_range(location.span()))
}

fn get_file_contents(path: &Path) -> LSPRuntimeResult<String> {
    let file = std::fs::read(path).map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))?;
    String::from_utf8(file).map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))
}

fn get_uri(path: &PathBuf) -> LSPRuntimeResult<Url> {
    Url::parse(&format!(
        "file://{}",
        path.to_str()
            .ok_or_else(|| LSPRuntimeError::UnexpectedError(format!(
                "Could not cast path {path:?} as string"
            )))?
    ))
    .map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))
}
