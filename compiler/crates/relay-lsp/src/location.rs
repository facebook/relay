/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::{Path, PathBuf};

use common::{Location, SourceLocationKey};
use lsp_types::Url;

use crate::lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult};

pub fn to_lsp_location_of_graphql_literal(
    location: Location,
    root_dir: &Path,
) -> LSPRuntimeResult<lsp_types::Location> {
    Ok(read_contents_and_get_lsp_location_of_graphql_literal(location, root_dir)?.1)
}

pub fn read_contents_and_get_lsp_location_of_graphql_literal(
    location: Location,
    root_dir: &Path,
) -> LSPRuntimeResult<(String, lsp_types::Location)> {
    match location.source_location() {
        SourceLocationKey::Embedded { path, index } => {
            let path_to_fragment = root_dir.join(PathBuf::from(path.lookup()));
            let uri = get_uri(&path_to_fragment)?;
            let (file_contents, range) =
                read_embedded_file_and_get_range(&path_to_fragment, index.try_into().unwrap())?;

            Ok((file_contents, lsp_types::Location { uri, range }))
        }
        SourceLocationKey::Standalone { .. } => read_graphql_file_and_get_range(location, root_dir),
        SourceLocationKey::Generated => Err(LSPRuntimeError::UnexpectedError(
            "Cannot get location of a generated artifact".to_string(),
        )),
    }
}

pub fn read_graphql_file_and_get_range(
    location: Location,
    root_dir: &Path,
) -> LSPRuntimeResult<(String, lsp_types::Location)> {
    match location.source_location() {
        SourceLocationKey::Standalone { path } => {
            let abspath = root_dir.join(PathBuf::from(path.lookup()));

            let file = std::fs::read(abspath.clone())
                .map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))?;
            let file_contents = std::str::from_utf8(&file)
                .map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))?;

            let uri = get_uri(&abspath)?;
            let range = location.span().to_range(file_contents, 0, 0);
            Ok((file_contents.to_owned(), lsp_types::Location { uri, range }))
        }
        _ => Err(LSPRuntimeError::UnexpectedError(
            "Cannot get location of embedded or generated field in graphql file".to_string(),
        )),
    }
}

fn read_embedded_file_and_get_range(
    path_to_fragment: &PathBuf,
    index: usize,
) -> LSPRuntimeResult<(String, lsp_types::Range)> {
    let file = std::fs::read(path_to_fragment)
        .map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))?;
    let file_contents =
        std::str::from_utf8(&file).map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))?;

    let response = extract_graphql::parse_chunks(file_contents);
    let source = response.get(index).ok_or_else(|| {
        LSPRuntimeError::UnexpectedError(format!(
            "File {:?} does not contain enough graphql literals: {} needed; {} found",
            path_to_fragment,
            index,
            response.len()
        ))
    })?;

    let lines = source.text.lines().enumerate();
    let (line_count, last_line) = lines.last().ok_or_else(|| {
        LSPRuntimeError::UnexpectedError(format!(
            "Encountered empty graphql literal in {:?} (literal {})",
            path_to_fragment, index
        ))
    })?;

    Ok((
        source.text.to_string(),
        lsp_types::Range {
            start: lsp_types::Position {
                line: source.line_index as u32,
                character: source.column_index as u32,
            },
            end: lsp_types::Position {
                line: (source.line_index + line_count) as u32,
                character: last_line.len() as u32,
            },
        },
    ))
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
