/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use crate::lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult};
use common::{SourceLocationKey, Span, TextSource};
use dashmap::DashMap;
use extract_graphql::JavaScriptSourceFeature;
use graphql_syntax::{
    parse_executable_with_error_recovery, ExecutableDefinition, ExecutableDocument,
};
use intern::string_key::StringKey;
use log::debug;
use lsp_types::{Position, TextDocumentPositionParams, Url};
use relay_compiler::{FileCategorizer, FileGroup};

pub fn extract_executable_definitions_from_text_document(
    text_document_uri: &Url,
    source_feature_cache: &DashMap<Url, Vec<JavaScriptSourceFeature>>,
) -> LSPRuntimeResult<Vec<ExecutableDefinition>> {
    let source_features = source_feature_cache
        .get(text_document_uri)
        // If the source isn't present in the source cache, then that means that
        // the source has no graphql documents.
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let definitions = source_features
        .iter()
        .filter_map(|feature| match feature {
            JavaScriptSourceFeature::Docblock(_) => None,
            JavaScriptSourceFeature::GraphQL(graphql_source) => Some(graphql_source),
        })
        .map(|graphql_source| {
            let document = parse_executable_with_error_recovery(
                &graphql_source.text_source().text,
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

    let project_name = if let FileGroup::Source { project_set } =
        file_categorizer.categorize(file_path).map_err(|_| {
            LSPRuntimeError::UnexpectedError(format!(
                "Unable to categorize the file correctly: {:?}",
                file_path
            ))
        })? {
        *project_set.first().ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!(
                "Expected to find at least one project for {:?}",
                file_path
            ))
        })?
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
    source_feature_cache: &DashMap<Url, Vec<JavaScriptSourceFeature>>,
    text_document_position: &TextDocumentPositionParams,
    index_offset: usize,
) -> LSPRuntimeResult<(ExecutableDocument, Span)> {
    let uri = &text_document_position.text_document.uri;
    let position = text_document_position.position;

    let source_features = source_feature_cache
        .get(uri)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let graphql_source = source_features
        .iter()
        .find_map(|source_feature| {
            if let JavaScriptSourceFeature::GraphQL(graphql_source) = source_feature {
                let range = graphql_source.text_source().to_range();
                if position >= range.start && position <= range.end {
                    Some(graphql_source)
                } else {
                    None
                }
            } else {
                None
            }
        })
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let document = parse_executable_with_error_recovery(
        &graphql_source.text_source().text,
        SourceLocationKey::standalone(&uri.to_string()),
    )
    .item;

    // Now we need to take the `Position` and map that to an offset relative
    // to this GraphQL document, as the `Span`s in the document are relative.
    debug!("Successfully parsed the definitions for a target GraphQL source");
    // Map the position to a zero-length span, relative to this GraphQL source.
    let position_span = position_to_span(&position, graphql_source.text_source(), index_offset)
        .ok_or_else(|| {
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
fn position_to_span(position: &Position, source: &TextSource, index_offset: usize) -> Option<Span> {
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
