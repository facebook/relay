/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

use crate::{
    location::to_contents_and_lsp_location_of_graphql_literal,
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    node_resolution_info::NodeKind,
    node_resolution_info::NodeResolutionInfo,
    server::LSPState,
    utils::span_to_range_offset,
};
use common::{Location, PerfLogger};
use fnv::FnvHashMap;
use graphql_ir::{FragmentSpread, Program, Visitor};
use interner::StringKey;
use lsp_types::{
    request::{References, Request},
    Range,
};
use std::{
    path::PathBuf,
    sync::{Arc, RwLock},
};

fn get_references_response(
    node_resolution_info: NodeResolutionInfo,
    source_programs: &Arc<RwLock<FnvHashMap<StringKey, Program>>>,
    root_dir: &PathBuf,
) -> LSPRuntimeResult<Vec<lsp_types::Location>> {
    match node_resolution_info.kind {
        NodeKind::FragmentDefinition(fragment) => {
            let project_name = node_resolution_info.project_name;
            if let Some(source_program) = source_programs
                .read()
                .expect("get_references_response: Could not acquire read lock for source_programs")
                .get(&project_name)
            {
                let references = ReferenceFinder::get_references_to_fragment(
                    source_program,
                    fragment.name.value,
                )
                .into_iter()
                .map(|location| transform_reference_locations_to_lsp_locations(root_dir, location))
                .collect::<Result<Vec<_>, LSPRuntimeError>>()?;

                Ok(references)
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

fn transform_reference_locations_to_lsp_locations(
    root_dir: &PathBuf,
    location: Location,
) -> LSPRuntimeResult<lsp_types::Location> {
    let (contents, mut lsp_location) =
        to_contents_and_lsp_location_of_graphql_literal(location, root_dir)?;

    let range_offset =
        span_to_range_offset(*location.span(), &contents).ok_or(LSPRuntimeError::ExpectedError)?;
    log::debug!("range offset {:?}", range_offset);

    lsp_location.range = Range {
        start: lsp_location.range.start + range_offset.start,
        end: lsp_location.range.start + range_offset.end,
    };
    Ok(lsp_location)
}

#[derive(Debug, Clone)]
struct ReferenceFinder {
    references: Vec<Location>,
    name: StringKey,
}

impl ReferenceFinder {
    fn get_references_to_fragment(program: &Program, name: StringKey) -> Vec<Location> {
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

pub(crate) fn on_references<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: <References as Request>::Params,
) -> LSPRuntimeResult<<References as Request>::Result> {
    let node_resolution_info = state.resolve_node(params.text_document_position)?;
    let references_response = get_references_response(
        node_resolution_info,
        state.get_source_programs_ref(),
        state.root_dir(),
    )?;
    Ok(Some(references_response))
}
