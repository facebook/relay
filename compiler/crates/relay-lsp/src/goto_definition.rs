/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

use crate::{lsp::GotoDefinitionResponse, lsp_runtime_error::LSPRuntimeResult};
use crate::{
    lsp_runtime_error::LSPRuntimeError,
    utils::{NodeKind, NodeResolutionInfo},
};
use common::{Location, SourceLocationKey};
use graphql_ir::Program;
use interner::StringKey;
use lsp_types::Url;
use std::{
    collections::HashMap,
    path::PathBuf,
    sync::{Arc, RwLock},
};

pub fn get_goto_definition_response(
    node_resolution_info: NodeResolutionInfo,
    source_programs: &Arc<RwLock<HashMap<StringKey, Program>>>,
    root_dir: &PathBuf,
) -> LSPRuntimeResult<GotoDefinitionResponse> {
    match node_resolution_info.kind {
        NodeKind::FragmentSpread(fragment_name) => {
            let project_name = node_resolution_info.project_name;
            if let Some(source_program) = source_programs.read().unwrap().get(&project_name) {
                let fragment = source_program.fragment(fragment_name).ok_or_else(|| {
                    LSPRuntimeError::UnexpectedError(format!(
                        "Could not find fragment with name {}",
                        fragment_name
                    ))
                })?;

                Ok(GotoDefinitionResponse::Scalar(to_lsp_location(
                    fragment.name.location,
                    root_dir,
                )?))
            } else {
                Err(LSPRuntimeError::UnexpectedError(format!(
                    "Project name {} not found",
                    project_name
                )))
            }
        }
        _ => Err(LSPRuntimeError::ExpectedError),
    }
}

fn to_lsp_location(
    location: Location,
    root_dir: &PathBuf,
) -> LSPRuntimeResult<lsp_types::Location> {
    match location.source_location() {
        SourceLocationKey::Embedded { path, index } => {
            let path_to_fragment = root_dir.join(PathBuf::from(path.lookup()));
            let uri = get_uri(&path_to_fragment)?;
            let range = read_file_and_get_range(&path_to_fragment, index)?;

            Ok(lsp_types::Location { uri, range })
        }
        SourceLocationKey::Standalone { path } => {
            let path_to_fragment = root_dir.join(PathBuf::from(path.lookup()));
            let uri = get_uri(&path_to_fragment)?;
            Ok(lsp_types::Location {
                uri,
                range: lsp_types::Range {
                    start: lsp_types::Position {
                        line: 0,
                        character: 0,
                    },
                    end: lsp_types::Position {
                        line: 0,
                        character: 0,
                    },
                },
            })
        }
        SourceLocationKey::Generated => Err(LSPRuntimeError::UnexpectedError(
            "Cannot get location of a generated artifact".to_string(),
        )),
    }
}

fn read_file_and_get_range(
    path_to_fragment: &PathBuf,
    index: usize,
) -> LSPRuntimeResult<lsp_types::Range> {
    let file = std::fs::read(path_to_fragment)
        .map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))?;
    let file_contents =
        std::str::from_utf8(&file).map_err(|e| LSPRuntimeError::UnexpectedError(e.to_string()))?;

    let response =
        extract_graphql::parse_chunks(file_contents).map_err(LSPRuntimeError::UnexpectedError)?;
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

    Ok(lsp_types::Range {
        start: lsp_types::Position {
            line: source.line_index as u64,
            character: source.column_index as u64,
        },
        end: lsp_types::Position {
            line: (source.line_index + line_count) as u64,
            character: last_line.len() as u64,
        },
    })
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
