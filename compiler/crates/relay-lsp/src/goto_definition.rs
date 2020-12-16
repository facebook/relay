/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

use crate::{
    location::to_lsp_location_of_graphql_literal,
    lsp::GotoDefinitionResponse,
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    node_resolution_info::NodeKind,
    node_resolution_info::NodeResolutionInfo,
    server::LSPState,
    LSPExtraDataProvider,
};
use common::PerfLogger;
use graphql_ir::Program;
use interner::StringKey;
use lsp_types::{
    request::{GotoDefinition, Request},
    Url,
};
use std::{
    collections::HashMap,
    path::PathBuf,
    str,
    sync::{Arc, RwLock},
};

fn get_goto_definition_response(
    node_resolution_info: NodeResolutionInfo,
    source_programs: &Arc<RwLock<HashMap<StringKey, Program>>>,
    root_dir: &PathBuf,
    // https://github.com/rust-lang/rust-clippy/issues/3971
    #[allow(clippy::borrowed_box)] extra_data_provider: &Box<dyn LSPExtraDataProvider + 'static>,
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

                Ok(GotoDefinitionResponse::Scalar(
                    to_lsp_location_of_graphql_literal(fragment.name.location, root_dir)?,
                ))
            } else {
                Err(LSPRuntimeError::UnexpectedError(format!(
                    "Project name {} not found",
                    project_name
                )))
            }
        }
        NodeKind::FieldName => {
            let project_name = node_resolution_info.project_name;
            let programs = source_programs.read().unwrap();
            let source_program = programs.get(&project_name).ok_or_else(|| {
                LSPRuntimeError::UnexpectedError(format!("Project name {} not found", project_name))
            })?;
            let field = node_resolution_info
                .type_path
                .resolve_current_field(&source_program.schema)
                .ok_or_else(|| {
                    LSPRuntimeError::UnexpectedError("Could not resolve field".to_string())
                })?;
            let parent_name = source_program
                .schema
                .get_type_name(field.parent_type.unwrap());

            let provider_response = extra_data_provider
                .resolve_field_definition(
                    project_name.to_string(),
                    root_dir,
                    parent_name.to_string(),
                    field.name.to_string(),
                )
                .ok_or(LSPRuntimeError::ExpectedError)?;
            let (path, line) = provider_response.map_err(|e| -> LSPRuntimeError {
                LSPRuntimeError::UnexpectedError(format!(
                    "Error resolving field definition location: {}",
                    e
                ))
            })?;
            Ok(GotoDefinitionResponse::Scalar(get_location(&path, line)?))
        }
        _ => Err(LSPRuntimeError::ExpectedError),
    }
}

pub(crate) fn on_goto_definition<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: <GotoDefinition as Request>::Params,
) -> LSPRuntimeResult<<GotoDefinition as Request>::Result> {
    let node_resolution_info = state.resolve_node(params)?;

    let goto_definition_response = get_goto_definition_response(
        node_resolution_info,
        state.get_source_programs_ref(),
        state.root_dir(),
        &state.extra_data_provider,
    )?;

    Ok(Some(goto_definition_response))
}

fn get_location(path: &str, line: u64) -> Result<lsp_types::Location, LSPRuntimeError> {
    let start = lsp_types::Position { line, character: 0 };
    let range = lsp_types::Range { start, end: start };

    let uri = Url::parse(&format!("file://{}", path)).map_err(|e| {
        LSPRuntimeError::UnexpectedError(format!("Could not parse path as URL: {}", e))
    })?;

    Ok(lsp_types::Location { uri, range })
}
