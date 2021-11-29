/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use crate::lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult};
use common::{SourceLocationKey, Span};
use dashmap::DashMap;
use graphql_syntax::{
    parse_executable_with_error_recovery, ExecutableDefinition, ExecutableDocument, GraphQLSource,
};
use intern::string_key::StringKey;
use log::debug;
use lsp_types::{Position, TextDocumentPositionParams, Url};
use relay_compiler::{compiler_state::SourceSet, FileCategorizer, FileGroup};

pub fn extract_executable_definitions_from_text_document(
    text_document_uri: &Url,
    graphql_source_cache: &DashMap<Url, Vec<GraphQLSource>>,
) -> LSPRuntimeResult<Vec<ExecutableDefinition>> {
    let graphql_sources = graphql_source_cache
        .get(text_document_uri)
        // If the source isn't present in the source cache, then that means that
        // the source has no graphql documents.
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let definitions = graphql_sources
        .iter()
        .map(|graphql_source| {
            let document = parse_executable_with_error_recovery(
                &graphql_source.text,
                SourceLocationKey::standalone(&text_document_uri.to_string()),
            )
            .item;

            document.definitions
        })
        .flatten()
        .collect::<Vec<ExecutableDefinition>>();

    Ok(definitions)
}

pub fn extract_project_name_from_url(
    file_categorizer: &FileCategorizer,
    url: &Url,
    root_dir: &PathBuf,
) -> LSPRuntimeResult<StringKey> {
    let absolute_file_path = PathBuf::from(url.path());
    let file_path = absolute_file_path.strip_prefix(root_dir).map_err(|_e| {
        LSPRuntimeError::UnexpectedError(format!(
            "Failed to strip prefix {:?} from {:?}",
            root_dir, absolute_file_path
        ))
    })?;

    let project_name = if let FileGroup::Source { source_set } =
        file_categorizer.categorize(file_path).map_err(|_| {
            LSPRuntimeError::UnexpectedError(format!(
                "Unable to categorize the file correctly: {:?}",
                file_path
            ))
        })? {
        match source_set {
            SourceSet::SourceSetName(source) => source,
            SourceSet::SourceSetNames(sources) => sources[0],
        }
    } else {
        return Err(LSPRuntimeError::UnexpectedError(format!(
            "File path {:?} is not a source set",
            file_path
        )));
    };
    Ok(project_name)
}

/// Return a parsed executable document for this LSP request, only if the request occurs
/// within a GraphQL document.
pub fn extract_executable_document_from_text(
    graphql_source_cache: &DashMap<Url, Vec<GraphQLSource>>,
    text_document_position: &TextDocumentPositionParams,
    index_offset: usize,
) -> LSPRuntimeResult<(ExecutableDocument, Span)> {
    let uri = &text_document_position.text_document.uri;
    let position = text_document_position.position;

    let graphql_sources = graphql_source_cache
        .get(uri)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let graphql_source = graphql_sources
        .iter()
        .find(|graphql_source| {
            let range = graphql_source.to_range();
            position >= range.start && position <= range.end
        })
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let document = parse_executable_with_error_recovery(
        &graphql_source.text,
        SourceLocationKey::standalone(&uri.to_string()),
    )
    .item;

    // Now we need to take the `Position` and map that to an offset relative
    // to this GraphQL document, as the `Span`s in the document are relative.
    debug!("Successfully parsed the definitions for a target GraphQL source");
    // Map the position to a zero-length span, relative to this GraphQL source.
    let position_span =
        position_to_span(&position, graphql_source, index_offset).ok_or_else(|| {
            LSPRuntimeError::UnexpectedError("Failed to map positions to spans".to_string())
        })?;

    // Now we need to walk the Document, tracking our path along the way, until
    // we find the position within the document. Note that the GraphQLSource will
    // already be updated *with the characters that triggered the completion request*
    // since the change event fires before completion.
    debug!("position_span: {:?}", position_span);

    Ok((document, position_span))
}

/// Maps the LSP `Position` type back to a relative span, so we can find out which syntax node(s)
/// this request came from
fn position_to_span(
    position: &Position,
    source: &GraphQLSource,
    index_offset: usize,
) -> Option<Span> {
    position_to_offset(position, index_offset, source.line_index, &source.text)
        .map(|offset| Span::new(offset, offset))
}

/// Find a character position in the GraphQL source text
/// from the Position (line, character) of the cursor in the IDE.
/// If the Position is outside of the source text, return None.
pub fn position_to_offset(
    position: &Position,
    index_offset: usize,
    line_index: usize,
    graphql_source_text: &str,
) -> Option<u32> {
    let mut index_of_first_character_of_current_line = 0;
    let mut line_index = line_index as u32;

    let mut chars = graphql_source_text.chars().enumerate().peekable();

    while let Some((index, chr)) = chars.next() {
        let is_newline = match chr {
            // Line terminators: https://www.ecma-international.org/ecma-262/#sec-line-terminators
            '\u{000A}' | '\u{000D}' | '\u{2028}' | '\u{2029}' => {
                !matches!((chr, chars.peek()), ('\u{000D}', Some((_, '\u{000D}'))))
            }
            _ => false,
        };

        if is_newline {
            line_index += 1;
            // Add index_offset to account for different position index between hover and autocomplete
            index_of_first_character_of_current_line = index + index_offset;
        }

        if line_index == position.line {
            let start_offset =
                (index_of_first_character_of_current_line + position.character as usize) as u32;
            return Some(start_offset);
        }
    }
    None
}

#[derive(Debug)]
pub(crate) struct SameLineOffset {
    character_offset: u32,
}

#[derive(Debug)]
pub(crate) struct DifferentLineOffset {
    line_offset: u32,
    character: u32,
}

/// Represents the offset from a given position to another position.
/// The SameLineOffset variant represents moving to a later character
/// position on the same line. The NewPositionOffset represents moving to
/// a later line, and an arbitrary character position.
#[derive(Debug)]
pub(crate) enum PositionOffset {
    SameLineOffset(SameLineOffset),
    DifferentLineOffset(DifferentLineOffset),
}

impl std::ops::Add<PositionOffset> for Position {
    type Output = Self;

    fn add(self, offset: PositionOffset) -> Self::Output {
        match offset {
            PositionOffset::SameLineOffset(SameLineOffset { character_offset }) => Position {
                line: self.line,
                character: self.character + character_offset,
            },
            PositionOffset::DifferentLineOffset(DifferentLineOffset {
                line_offset,
                character,
            }) => Position {
                line: self.line + line_offset,
                character,
            },
        }
    }
}

#[derive(Debug)]
pub(crate) struct RangeOffset {
    pub start: PositionOffset,
    pub end: PositionOffset,
}

/// Returns a RangeOffset that represents the offset from the start
/// of the source to the contents of the span.
pub(crate) fn span_to_range_offset(span: Span, text: &str) -> Option<RangeOffset> {
    if text.len() < span.end as usize {
        return None;
    }

    let mut start_position_offset = None;
    let mut end_position_offset = None;
    let Span { start, end } = span;
    let span_start = start;
    let span_end = end;
    let mut characters_iterated = 0u32;

    // For each line, determine whether the start and end of the span
    // occur on that line.
    for (line_index, line) in text.lines().enumerate() {
        let line_length = line.len() as u32;
        if start_position_offset.is_none() && characters_iterated + line_length >= span_start {
            start_position_offset = Some(if line_index == 0 {
                PositionOffset::SameLineOffset(SameLineOffset {
                    character_offset: span_start,
                })
            } else {
                PositionOffset::DifferentLineOffset(DifferentLineOffset {
                    line_offset: line_index as u32,
                    character: span_start - characters_iterated,
                })
            });
        }
        if end_position_offset.is_none() && characters_iterated + line_length >= span_end {
            end_position_offset = Some(if line_index == 0 {
                PositionOffset::SameLineOffset(SameLineOffset {
                    character_offset: span_end,
                })
            } else {
                PositionOffset::DifferentLineOffset(DifferentLineOffset {
                    line_offset: line_index as u32,
                    character: span_end - characters_iterated,
                })
            });
            break;
        }
        characters_iterated += line_length;
        // we also need to advance characters_iterated by 1 to account for the line break
        characters_iterated += 1;
    }

    Some(RangeOffset {
        start: start_position_offset?,
        end: end_position_offset?,
    })
}
