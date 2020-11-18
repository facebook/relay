/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

use crate::lsp::{GotoDefinitionResponse, Message, ServerRequestId, ServerResponse};
use crate::utils::{NodeKind, NodeResolutionInfo};
use common::{Location, SourceLocationKey};
use crossbeam::Sender;
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
) -> Option<GotoDefinitionResponse> {
    match node_resolution_info.kind {
        NodeKind::FragmentSpread(fragment_name) => {
            let project_name = node_resolution_info.project_name;
            if let Some(source_program) = source_programs.read().unwrap().get(&project_name) {
                let fragment = source_program.fragment(fragment_name)?;

                Some(GotoDefinitionResponse::Scalar(to_lsp_location(
                    fragment.name.location,
                    root_dir,
                )?))
            } else {
                None
            }
        }
        _ => None,
    }
}

pub fn send_goto_definition_response(
    goto_definition_response: Option<GotoDefinitionResponse>,
    request_id: ServerRequestId,
    sender: &Sender<Message>,
) {
    let result = goto_definition_response.and_then(|response| serde_json::to_value(response).ok());
    sender
        .send(Message::Response(ServerResponse {
            id: request_id,
            result,
            error: None,
        }))
        .ok();
}

fn to_lsp_location(location: Location, root_dir: &PathBuf) -> Option<lsp_types::Location> {
    match location.source_location() {
        SourceLocationKey::Embedded { path, index } => {
            let path_to_fragment = root_dir.join(PathBuf::from(path.lookup()));
            let uri = get_uri(&path_to_fragment)?;
            let range = read_file_and_get_range(&path_to_fragment, index)?;

            Some(lsp_types::Location { uri, range })
        }
        SourceLocationKey::Standalone { path } => {
            let path_to_fragment = root_dir.join(PathBuf::from(path.lookup()));
            let uri = get_uri(&path_to_fragment)?;
            Some(lsp_types::Location {
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
        SourceLocationKey::Generated => None,
    }
}

fn read_file_and_get_range(path_to_fragment: &PathBuf, index: usize) -> Option<lsp_types::Range> {
    let file = std::fs::read(path_to_fragment).ok()?;
    let file_contents = std::str::from_utf8(&file).ok()?;

    let response = extract_graphql::parse_chunks(file_contents).ok()?;
    let source = response.get(index)?;

    let lines = source.text.lines().enumerate();
    let (line_count, last_line) = lines.last()?;

    Some(lsp_types::Range {
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

fn get_uri(path: &PathBuf) -> Option<Url> {
    Url::parse(&format!("file://{}", path.to_str()?)).ok()
}
