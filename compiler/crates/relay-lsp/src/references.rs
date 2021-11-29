/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

use crate::{
    location::read_contents_and_get_lsp_location_of_graphql_literal,
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    node_resolution_info::NodeKind,
    node_resolution_info::NodeResolutionInfo,
    server::GlobalState,
    utils::span_to_range_offset,
};
use common::{Location as IRLocation, SourceLocationKey};
use graphql_ir::{FragmentSpread, Program, Visitor};
use intern::string_key::StringKey;
use lsp_types::{
    request::{References, Request},
    Location as LSPLocation, Range,
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
                    .map(|location| transform_ir_location_to_lsp_location(root_dir, location))
                    .collect::<Result<Vec<_>, LSPRuntimeError>>()?;

            Ok(references)
        }
        _ => Err(LSPRuntimeError::ExpectedError),
    }
}

/// Given a root dir and a graphql_ir::Location, return a Result containing an
/// LSPLocation (i.e. lsp_types::Location).
///
/// IR Locations contain a description of where to find the graphql literal,
/// which can be embedded, standalone or generated; and the span of the ir node.
/// The IR Location's span contains the start and end character of the node.
///
/// LSP Locations contain a file URI and a pair of row/column offsets, and are
/// the formatted expected by the LSP Client (i.e. VSCode).
///
/// In order to convert from an IR Location to an LSP location, this function:
/// - reads the file containing the literal, extracts it, and gets the LSP Location
///   of the literal
/// - converts the IR Location's span to a range offset. Given the text of a literal,
///   convert the start/end characters to a pair of ("move over X characters" OR
///   "move down X lines and move to character Y")
/// - add this range offset to the LSP location's start, giving us the LSP location
///   of the IR node.
fn transform_ir_location_to_lsp_location(
    root_dir: &PathBuf,
    node_ir_location: IRLocation,
) -> LSPRuntimeResult<LSPLocation> {
    let (graphql_literal_text, lsp_location_of_graphql_literal) =
        read_contents_and_get_lsp_location_of_graphql_literal(node_ir_location, root_dir)?;

    // Case 1: for the standalone file, the lsp_location_of_graphql_literal is the result of what we need
    if let SourceLocationKey::Standalone { .. } = node_ir_location.source_location() {
        return Ok(lsp_location_of_graphql_literal);
    }

    // Case 2: for the embedded source, the lsp_location_of_graphql_literal should be swifted by the span range.
    let range_offset = span_to_range_offset(*node_ir_location.span(), &graphql_literal_text)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let mut lsp_location_of_node = lsp_location_of_graphql_literal;
    // update lsp_location_of_node to have a range that points to the ir node
    lsp_location_of_node.range = Range {
        start: lsp_location_of_node.range.start + range_offset.start,
        end: lsp_location_of_node.range.start + range_offset.end,
    };
    Ok(lsp_location_of_node)
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
