/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

use crate::{
    location::to_lsp_location_of_graphql_literal, lsp::GotoDefinitionResponse,
    lsp_runtime_error::LSPRuntimeResult, node_resolution_info::NodeKind,
};
use crate::{lsp_runtime_error::LSPRuntimeError, node_resolution_info::NodeResolutionInfo};
use graphql_ir::Program;
use interner::StringKey;
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
        _ => Err(LSPRuntimeError::ExpectedError),
    }
}
