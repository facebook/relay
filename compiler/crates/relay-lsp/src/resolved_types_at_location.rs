/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use lsp_types::Position;
use lsp_types::TextDocumentIdentifier;
use lsp_types::TextDocumentPositionParams;
use lsp_types::Url;
use lsp_types::request::Request;
use schema::Schema;
use serde::Deserialize;
use serde::Serialize;

use crate::FeatureResolutionInfo;
use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;

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
#[serde(rename_all = "camelCase")]
pub(crate) struct ResolvedTypesAtLocationResponse {
    pub path_and_schema_name: PathAndSchemaName,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PathAndSchemaName {
    pub path: Vec<String>,
    pub schema_name: String,
}

impl Request for ResolvedTypesAtLocation {
    type Params = ResolvedTypesAtLocationParams;
    type Result = ResolvedTypesAtLocationResponse;
    const METHOD: &'static str = "relay/getResolvedTypesAtLocation";
}

pub(crate) fn on_get_resolved_types_at_location(
    state: &impl GlobalState,
    params: <ResolvedTypesAtLocation as Request>::Params,
) -> LSPRuntimeResult<<ResolvedTypesAtLocation as Request>::Result> {
    let params = params.to_text_document_position_params()?;
    let project_name = state.extract_project_name_from_url(&params.text_document.uri)?;
    let schema = state.get_schema(&project_name)?;
    let schema_name = project_name.to_string();

    if let Ok(feature_resolution_info) = state.resolve_node(&params) {
        match feature_resolution_info {
            FeatureResolutionInfo::GraphqlNode(node_resolution_info) => {
                // If type_path is empty, type_path.resolve_current_field() will panic.
                if !node_resolution_info.type_path.0.is_empty() {
                    let type_and_field = node_resolution_info
                        .type_path
                        .resolve_current_field(&schema);
                    if let Some((_parent_type, field)) = type_and_field {
                        let type_name = schema.get_type_name(field.type_.inner()).to_string();
                        // TODO resolve enclosing types, not just types immediately under the cursor
                        return Ok(ResolvedTypesAtLocationResponse {
                            path_and_schema_name: PathAndSchemaName {
                                path: vec![type_name],
                                schema_name,
                            },
                        });
                    }
                }
            }
            FeatureResolutionInfo::DocblockNode(_) => {
                // Get types at location not implemented for docblocks yet.
                return Ok(ResolvedTypesAtLocationResponse {
                    path_and_schema_name: PathAndSchemaName {
                        path: Vec::default(),
                        schema_name,
                    },
                });
            }
        }
    }

    Ok(ResolvedTypesAtLocationResponse {
        path_and_schema_name: PathAndSchemaName {
            path: Vec::default(),
            schema_name,
        },
    })
}
