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
    resolution_path::utils::find_selection_parent_type,
    resolution_path::{
        IdentParent, IdentPath, LinkedFieldPath, ResolutionPath, ResolvePosition, ScalarFieldPath,
        SelectionParent, TypeConditionPath,
    },
    server::LSPState,
    server::SourcePrograms,
    FieldDefinitionSourceInfo, LSPExtraDataProvider,
};
use common::PerfLogger;
use interner::StringKey;
use lsp_types::{
    request::{GotoDefinition, Request},
    Url,
};
use schema::Schema;
use serde::{Deserialize, Serialize};
use std::{path::PathBuf, str};

fn get_goto_definition_response<'a>(
    node_path: ResolutionPath<'a>,
    project_name: StringKey,
    source_programs: &SourcePrograms,
    root_dir: &PathBuf,
    extra_data_provider: &(dyn LSPExtraDataProvider + 'static),
) -> LSPRuntimeResult<GotoDefinitionResponse> {
    match node_path {
        ResolutionPath::Ident(IdentPath {
            inner: fragment_name,
            parent: IdentParent::FragmentSpreadName(_),
        }) => {
            if let Some(source_program) = source_programs.get(&project_name) {
                let fragment = source_program
                    .fragment(fragment_name.value)
                    .ok_or_else(|| {
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
        ResolutionPath::Ident(IdentPath {
            inner: field_name,
            parent:
                IdentParent::LinkedFieldName(LinkedFieldPath {
                    inner: _,
                    parent: selection_path,
                }),
        }) => resolve_field(
            field_name.value.to_string(),
            selection_path.parent,
            project_name,
            source_programs,
            extra_data_provider,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: field_name,
            parent:
                IdentParent::ScalarFieldName(ScalarFieldPath {
                    inner: _,
                    parent: selection_path,
                }),
        }) => resolve_field(
            field_name.value.to_string(),
            selection_path.parent,
            project_name,
            source_programs,
            extra_data_provider,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::TypeConditionType(TypeConditionPath {
                    inner: type_condition,
                    parent: _,
                }),
        }) => {
            let provider_response = extra_data_provider.resolve_field_definition(
                project_name.to_string(),
                type_condition.type_.value.to_string(),
                None,
            );
            let FieldDefinitionSourceInfo {
                file_path,
                line_number,
                is_local,
            } = provider_response.map_err(|e| -> LSPRuntimeError {
                LSPRuntimeError::UnexpectedError(format!(
                    "Error resolving field definition location: {}",
                    e
                ))
            })?;
            if is_local {
                Ok(GotoDefinitionResponse::Scalar(get_location(
                    &file_path,
                    line_number,
                )?))
            } else {
                Err(LSPRuntimeError::ExpectedError)
            }
        }
        _ => Err(LSPRuntimeError::ExpectedError),
    }
}

fn resolve_field<'a>(
    field_name: String,
    selection_parent: SelectionParent<'a>,
    project_name: StringKey,
    source_programs: &SourcePrograms,
    extra_data_provider: &(dyn LSPExtraDataProvider + 'static),
) -> LSPRuntimeResult<GotoDefinitionResponse> {
    let source_program = source_programs.get(&project_name).ok_or_else(|| {
        LSPRuntimeError::UnexpectedError(format!("Project name {} not found", project_name))
    })?;

    let parent_type = find_selection_parent_type(selection_parent, &source_program.schema)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let parent_name = source_program.schema.get_type_name(parent_type);

    let provider_response = extra_data_provider.resolve_field_definition(
        project_name.to_string(),
        parent_name.to_string(),
        Some(field_name),
    );
    let FieldDefinitionSourceInfo {
        file_path,
        line_number,
        is_local,
    } = provider_response.map_err(|e| -> LSPRuntimeError {
        LSPRuntimeError::UnexpectedError(format!(
            "Error resolving field definition location: {}",
            e
        ))
    })?;
    if is_local {
        Ok(GotoDefinitionResponse::Scalar(get_location(
            &file_path,
            line_number,
        )?))
    } else {
        Err(LSPRuntimeError::ExpectedError)
    }
}

pub(crate) fn on_goto_definition<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: <GotoDefinition as Request>::Params,
) -> LSPRuntimeResult<<GotoDefinition as Request>::Result> {
    let (document, position_span, project_name) =
        state.extract_executable_document_from_text(&params, 1)?;
    let path = document.resolve((), position_span);

    let goto_definition_response = get_goto_definition_response(
        path,
        project_name,
        state.get_source_programs_ref(),
        state.root_dir(),
        state.extra_data_provider.as_ref(),
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

pub(crate) enum GetSourceLocationOfTypeDefinition {}

#[derive(Deserialize, Serialize)]
pub(crate) struct GetSourceLocationOfTypeDefinitionParams {
    type_name: String,
    field_name: Option<String>,
    schema_name: String,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct GetSourceLocationOfTypeDefinitionResult {
    field_definition_source_info: FieldDefinitionSourceInfo,
}

impl Request for GetSourceLocationOfTypeDefinition {
    type Params = GetSourceLocationOfTypeDefinitionParams;
    type Result = GetSourceLocationOfTypeDefinitionResult;
    const METHOD: &'static str = "$/getSourceLocationOfTypeDefinition";
}

pub(crate) fn on_get_source_location_of_type_definition<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: <GetSourceLocationOfTypeDefinition as Request>::Params,
) -> LSPRuntimeResult<<GetSourceLocationOfTypeDefinition as Request>::Result> {
    let field_definition_source_info = state
        .extra_data_provider
        .resolve_field_definition(params.schema_name, params.type_name, params.field_name)
        .map_err(LSPRuntimeError::UnexpectedError)?;
    Ok(GetSourceLocationOfTypeDefinitionResult {
        field_definition_source_info,
    })
}
