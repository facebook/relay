/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::OperationDefinitionName;
use lsp_types::TextDocumentPositionParams;
use lsp_types::request::Request;
use serde::Deserialize;
use serde::Serialize;

use crate::GlobalState;
use crate::LSPRuntimeError;
use crate::LSPRuntimeResult;

pub(crate) fn on_print_operation(
    state: &impl GlobalState,
    params: <PrintOperation as Request>::Params,
) -> LSPRuntimeResult<<PrintOperation as Request>::Result> {
    let text_document_uri = params
        .text_document_position_params
        .text_document
        .uri
        .clone();

    let project_name = state.extract_project_name_from_url(&text_document_uri)?;
    let executable_document_under_cursor =
        state.extract_executable_document_from_text(&params.text_document_position_params, 1);

    let operation_name = match executable_document_under_cursor {
        Ok((document, _)) => {
            get_first_operation_name(&document.definitions).ok_or(LSPRuntimeError::ExpectedError)
        }
        Err(_) => {
            let executable_definitions =
                state.resolve_executable_definitions(&text_document_uri)?;

            if executable_definitions.is_empty() {
                return Err(LSPRuntimeError::ExpectedError);
            }

            get_first_operation_name(&executable_definitions).ok_or(LSPRuntimeError::ExpectedError)
        }
    }?;

    state
        .get_operation_text(operation_name, &project_name)
        .map(|operation_text| PrintOperationResponse {
            operation_name: operation_name.0.to_string(),
            operation_text,
        })
}

fn get_first_operation_name(
    executable_definitions: &[graphql_syntax::ExecutableDefinition],
) -> Option<OperationDefinitionName> {
    executable_definitions.iter().find_map(|definition| {
        if let graphql_syntax::ExecutableDefinition::Operation(operation) = definition {
            if let Some(name) = &operation.name {
                return Some(OperationDefinitionName(name.value));
            }

            None
        } else {
            None
        }
    })
}

pub(crate) enum PrintOperation {}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PrintOperationParams {
    #[serde(flatten)]
    pub text_document_position_params: TextDocumentPositionParams,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PrintOperationResponse {
    pub operation_name: String,
    pub operation_text: String,
}

impl Request for PrintOperation {
    type Params = PrintOperationParams;
    type Result = PrintOperationResponse;
    const METHOD: &'static str = "relay/printOperation";
}
