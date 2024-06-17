/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::VecDeque;
use std::path::Path;

use common::Location;
use common::SourceLocationKey;
use extract_graphql::JavaScriptSourceFeature;
use graphql_syntax::parse_executable_with_error_recovery;
use graphql_syntax::List;
use graphql_syntax::Selection;
use lsp_types::request::FoldingRangeRequest;
use lsp_types::request::Request;
use lsp_types::FoldingRange;

use crate::GlobalState;
use crate::LSPRuntimeError;
use crate::LSPRuntimeResult;

/// Resolve a [`FoldingRangeRequest`] request to folding ranges
pub fn on_get_folding_ranges(
    state: &impl GlobalState,
    params: <FoldingRangeRequest as Request>::Params,
) -> LSPRuntimeResult<<FoldingRangeRequest as Request>::Result> {
    let uri = params.text_document.uri;
    let file_path = uri
        .to_file_path()
        .map_err(|_| LSPRuntimeError::ExpectedError)?;

    let embedded_sources = state.get_source_features(&uri)?;

    if embedded_sources.is_empty() {
        return Err(LSPRuntimeError::ExpectedError);
    }

    let documents = embedded_sources
        .into_iter()
        .enumerate()
        .filter(|(_, embedded_source)| match embedded_source {
            JavaScriptSourceFeature::GraphQL(_) => true,
            _ => false,
        })
        .map(|(index, embedded_source)| {
            let text_source = embedded_source.text_source();
            let source_location = SourceLocationKey::embedded(file_path.to_str().unwrap(), index);
            let document =
                parse_executable_with_error_recovery(&text_source.text, source_location).item;

            (source_location, document.definitions)
        });

    let mut folding_ranges = Vec::new();

    for (source_location, definitions) in documents {
        let mut stack = VecDeque::new();

        for definition in &definitions {
            let selections = match definition {
                graphql_syntax::ExecutableDefinition::Fragment(fragment) => &fragment.selections,
                graphql_syntax::ExecutableDefinition::Operation(operation) => &operation.selections,
            };

            stack.push_front(selections);
        }

        while let Some(selections) = stack.pop_front() {
            for selection in &selections.items {
                let child_selections = match selection {
                    graphql_syntax::Selection::LinkedField(linked_field) => {
                        &linked_field.selections
                    }
                    graphql_syntax::Selection::InlineFragment(inline_fragment) => {
                        &inline_fragment.selections
                    }
                    _ => continue,
                };

                let range =
                    get_folding_range_from_selections(&child_selections, source_location, state);

                match range {
                    Ok(range) => {
                        folding_ranges.push(range);

                        stack.push_front(&child_selections);
                    }
                    Err(_) => continue,
                };
            }
        }
    }

    Ok(Some(folding_ranges))
}

fn get_folding_range_from_selections(
    selections: &List<Selection>,
    source_location: SourceLocationKey,
    state: &impl GlobalState,
) -> LSPRuntimeResult<FoldingRange> {
    let start = state.transform_relay_location_in_editor_to_lsp_location(Location::new(
        source_location,
        selections.start.span,
    ))?;

    let last_child_selection = selections
        .items
        .last()
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let end = state.transform_relay_location_in_editor_to_lsp_location(Location::new(
        source_location,
        last_child_selection.span(),
    ))?;

    Ok(FoldingRange {
        start_line: start.range.start.line,
        start_character: Some(start.range.start.character),
        end_line: end.range.end.line,
        end_character: Some(end.range.end.character),
        ..Default::default()
    })
}
