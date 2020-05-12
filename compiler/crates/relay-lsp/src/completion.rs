/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the completion language feature
use crate::lsp::Position;
use common::Span;
use graphql_syntax::{Document, GraphQLSource};
use interner::StringKey;
use log::info;

use graphql_syntax::{
    ExecutableDefinition, LinkedField, List, OperationDefinition, OperationKind, Selection,
};

#[derive(Debug)]
pub enum CompletionPathItem {
    Operation(OperationKind),
    LinkedField(StringKey),
}

#[derive(Default, Debug)]
pub struct CompletionPath(Vec<CompletionPathItem>);

impl CompletionPath {
    pub fn push(&mut self, item: CompletionPathItem) {
        self.0.push(item)
    }
}

pub fn get_path_completion_position(document: Document, position_span: Span) -> CompletionPath {
    let mut completion_path = CompletionPath::default();

    for definition in document.definitions {
        match &definition {
            ExecutableDefinition::Operation(operation) => {
                if operation.location.contains(position_span) {
                    // TODO don't unwrap here
                    let (_, kind) = operation.operation.clone().unwrap();
                    completion_path.push(CompletionPathItem::Operation(kind));

                    info!(
                        "Completion request is within operation: {:?}",
                        operation.name
                    );
                    let OperationDefinition { selections, .. } = operation;

                    if selections.span.contains(position_span) {
                        // TODO(brandondail) handle when the completion occurs at/within the start token
                        info!("Completion request is within a selection");
                        populate_completion_path_from_selection(
                            selections,
                            position_span,
                            &mut completion_path,
                        );
                    }
                }
                // Check if the position span is within this operation's span
            }
            ExecutableDefinition::Fragment(fragment) => {
                if fragment.location.contains(position_span) {
                    info!("Completion request is within fragment: {:?}", fragment.name);
                }
            }
        }
    }

    completion_path
}

fn populate_completion_path_from_selection(
    selections: &List<Selection>,
    position_span: Span,
    completion_path: &mut CompletionPath,
) {
    for item in &selections.items {
        if item.span().contains(position_span) {
            match item {
                Selection::LinkedField(node) => {
                    let LinkedField {
                        name, selections, ..
                    } = node;
                    completion_path.push(CompletionPathItem::LinkedField(name.value));
                    populate_completion_path_from_selection(
                        selections,
                        position_span,
                        completion_path,
                    );
                }
                Selection::ScalarField(_node) => {}
                Selection::FragmentSpread(_node) => {}
                Selection::InlineFragment(_node) => {}
            }
        }
    }
}

/// Maps the LSP `Position` type back to a relative span, so we can find out which syntax node(s)
/// this completion request came from
pub fn position_to_span(position: Position, source: &GraphQLSource) -> Option<Span> {
    let mut index_of_last_line = 0;
    let mut line_index = source.line_index as u64;

    let mut chars = source.text.chars().enumerate().peekable();

    while let Some((index, chr)) = chars.next() {
        let is_newline = match chr {
            // Line terminators: https://www.ecma-international.org/ecma-262/#sec-line-terminators
            '\u{000A}' | '\u{000D}' | '\u{2028}' | '\u{2029}' => match (chr, chars.peek()) {
                // <CLRF>
                ('\u{000D}', Some((_, '\u{000D}'))) => false,
                _ => true,
            },
            _ => false,
        };

        if is_newline {
            line_index += 1;
            index_of_last_line = index as u64;
        }

        if line_index == position.line {
            let start_offset = index_of_last_line + position.character;
            return Some(Span::new(start_offset as u32, 0));
        }
    }
    None
}
