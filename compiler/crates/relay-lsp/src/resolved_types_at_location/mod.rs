/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    server::LSPState,
};
use common::PerfLogger;
use lsp_types::{
    request::Request, Position, TextDocumentIdentifier, TextDocumentPositionParams, Url,
};
use schema::Schema;
use serde::{Deserialize, Serialize};

pub(crate) enum ResolvedTypesAtLocation {}

#[derive(Deserialize, Serialize)]
pub(crate) struct ResolvedTypesAtLocationParams {
    file_name: String,
    line: u32,
    character: u32,
}

impl ResolvedTypesAtLocationParams {
    fn to_text_document_position_params(&self) -> LSPRuntimeResult<TextDocumentPositionParams> {
        Ok(TextDocumentPositionParams {
            text_document: TextDocumentIdentifier {
                uri: Url::parse(&self.file_name).map_err(|_| LSPRuntimeError::ExpectedError)?,
            },
            position: Position {
                character: self.character,
                line: self.line,
            },
        })
    }
}

#[derive(Deserialize, Serialize)]
pub(crate) struct ResolvedTypesAtLocationResponse {
    pub path_and_schema_name: Option<PathAndSchemaName>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct PathAndSchemaName {
    pub path: Vec<String>,
    pub schema_name: String,
}

impl Request for ResolvedTypesAtLocation {
    type Params = ResolvedTypesAtLocationParams;
    type Result = ResolvedTypesAtLocationResponse;
    const METHOD: &'static str = "relay/getResolvedTypesAtLocation";
}

pub(crate) fn on_get_resolved_types_at_location<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: <ResolvedTypesAtLocation as Request>::Params,
) -> LSPRuntimeResult<<ResolvedTypesAtLocation as Request>::Result> {
    if let Ok(node_resolution_info) = state.resolve_node(params.to_text_document_position_params()?)
    {
        if let Some(schema) = state.get_schemas().get(&node_resolution_info.project_name) {
            // If type_path is empty, type_path.resolve_current_field() will panic.
            if !node_resolution_info.type_path.0.is_empty() {
                let type_and_field = node_resolution_info
                    .type_path
                    .resolve_current_field(&schema);
                if let Some((_parent_type, field)) = type_and_field {
                    let type_name = schema.get_type_name(field.type_.inner()).to_string();
                    // TODO resolve enclosing types, not just types immediately under the cursor
                    return Ok(ResolvedTypesAtLocationResponse {
                        path_and_schema_name: Some(PathAndSchemaName {
                            path: vec![type_name],
                            schema_name: node_resolution_info.project_name.to_string(),
                        }),
                    });
                }
            }
        }
    }

    Ok(ResolvedTypesAtLocationResponse {
        path_and_schema_name: None,
    })
}
