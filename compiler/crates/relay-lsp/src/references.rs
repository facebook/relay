/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

use crate::{
    location::transform_relay_location_to_lsp_location,
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    node_resolution_info::NodeKind,
    node_resolution_info::NodeResolutionInfo,
    server::GlobalState,
};
use common::Location as IRLocation;
use graphql_ir::{FragmentSpread, Program, Visitor};
use intern::string_key::StringKey;
use lsp_types::{
    request::{References, Request},
    Location as LSPLocation,
};
use std::path::PathBuf;

fn get_references_response(
    node_resolution_info: NodeResolutionInfo,
    program: &Program,
    root_dir: &PathBuf,
) -> LSPRuntimeResult<Vec<LSPLocation>> {
    match node_resolution_info.kind {
        NodeKind::FragmentDefinition(fragment) => {
            let references =
                ReferenceFinder::get_references_to_fragment(program, fragment.name.value)
                    .into_iter()
                    .map(|location| transform_relay_location_to_lsp_location(root_dir, location))
                    .collect::<Result<Vec<_>, LSPRuntimeError>>()?;

            Ok(references)
        }
        _ => Err(LSPRuntimeError::ExpectedError),
    }
}

#[derive(Debug, Clone)]
struct ReferenceFinder {
    references: Vec<IRLocation>,
    name: StringKey,
}

impl ReferenceFinder {
    fn get_references_to_fragment(program: &Program, name: StringKey) -> Vec<IRLocation> {
        let mut reference_finder = ReferenceFinder {
            references: vec![],
            name,
        };
        reference_finder.visit_program(program);
        reference_finder.references
    }
}

impl Visitor for ReferenceFinder {
    const NAME: &'static str = "ReferenceFinder";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if spread.fragment.item == self.name {
            self.references.push(spread.fragment.location);
        }
    }
}

pub fn on_references(
    state: &impl GlobalState,
    params: <References as Request>::Params,
) -> LSPRuntimeResult<<References as Request>::Result> {
    let node_resolution_info = state.resolve_node(&params.text_document_position)?;
    let references_response = get_references_response(
        node_resolution_info,
        &state
            .get_program(&state.extract_project_name_from_url(
                &params.text_document_position.text_document.uri,
            )?)?,
        &state.root_dir(),
    )?;
    Ok(Some(references_response))
}
