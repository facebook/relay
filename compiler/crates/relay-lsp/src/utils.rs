/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use common::SourceLocationKey;
use common::Span;
use common::TextSource;
use dashmap::DashMap;
use docblock_syntax::parse_docblock;
use extract_graphql::JavaScriptSourceFeature;
use graphql_syntax::parse_executable_with_error_recovery_and_parser_features;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::GraphQLSource;
use graphql_syntax::ParserFeatures;
use intern::string_key::StringKey;
use log::debug;
use lsp_types::Position;
use lsp_types::TextDocumentPositionParams;
use lsp_types::Url;
use relay_compiler::get_parser_features;
use relay_compiler::FileCategorizer;
use relay_compiler::FileGroup;
use relay_compiler::ProjectConfig;
use relay_docblock::parse_docblock_ast;
use relay_docblock::ParseOptions;

use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::Feature;

pub fn is_file_uri_in_dir(root_dir: PathBuf, file_uri: &Url) -> bool {
    let file_path_result = file_uri.to_file_path();

    match file_path_result {
        Ok(file_path) => file_path.starts_with(root_dir),
        Err(()) => false,
    }
}

pub fn extract_executable_definitions_from_text_document(
    text_document_uri: &Url,
    source_feature_cache: &DashMap<Url, Vec<JavaScriptSourceFeature>>,
    parser_features: ParserFeatures,
) -> LSPRuntimeResult<Vec<ExecutableDefinition>> {
    let source_features = source_feature_cache
        .get(text_document_uri)
        // If the source isn't present in the source cache, then that means that
        // the source has no graphql documents.
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let path = text_document_uri.path();

    let definitions = source_features
        .iter()
        .enumerate()
        .filter_map(|(i, feature)| match feature {
            JavaScriptSourceFeature::Docblock(_) => None,
            JavaScriptSourceFeature::GraphQL(graphql_source) => Some((i, graphql_source)),
        })
        .flat_map(|(i, graphql_source)| {
            let document = parse_executable_with_error_recovery_and_parser_features(
                &graphql_source.text_source().text,
                SourceLocationKey::embedded(path, i),
                parser_features,
            )
            .item;

            document.definitions
        })
        .collect::<Vec<ExecutableDefinition>>();

    Ok(definitions)
}

pub fn get_file_group_from_uri(
    file_categorizer: &FileCategorizer,
    url: &Url,
    root_dir: &PathBuf,
) -> LSPRuntimeResult<FileGroup> {
    let absolute_file_path = url.to_file_path().map_err(|_| {
        LSPRuntimeError::UnexpectedError(format!("Unable to convert URL to file path: {:?}", url))
    })?;

    let file_path = absolute_file_path.strip_prefix(root_dir).map_err(|_e| {
        LSPRuntimeError::UnexpectedError(format!(
            "Failed to strip prefix {:?} from {:?}",
            root_dir, absolute_file_path
        ))
    })?;

    file_categorizer.categorize(file_path).map_err(|_| {
        LSPRuntimeError::UnexpectedError(format!(
            "Unable to categorize the file correctly: {:?}",
            file_path
        ))
    })
}

pub fn get_project_name_from_file_group(file_group: &FileGroup) -> Result<StringKey, String> {
    let project_set = match file_group {
        FileGroup::Source { project_set } => Ok(project_set),
        FileGroup::Schema { project_set } => Ok(project_set),
        FileGroup::Extension { project_set } => Ok(project_set),
        _ => Err("Not part of a source set"),
    }?;

    let project_name = *project_set
        .first()
        .ok_or("Expected to find at least one project")?;

    Ok(project_name.into())
}

/// Return a parsed executable document, or parsed Docblock IR for this LSP
/// request, only if the request occurs within a GraphQL document or Docblock.
pub fn extract_feature_from_text(
    project_config: &ProjectConfig,
    js_source_feature_cache: &DashMap<Url, Vec<JavaScriptSourceFeature>>,
    schema_source_cache: &DashMap<Url, GraphQLSource>,
    text_document_position: &TextDocumentPositionParams,
    index_offset: usize,
) -> LSPRuntimeResult<(Feature, Span)> {
    let uri = &text_document_position.text_document.uri;
    let position = text_document_position.position;

    if let Some(schema_source) = schema_source_cache.get(uri) {
        let source_location_key = SourceLocationKey::standalone(uri.as_ref());
        let schema_document = graphql_syntax::parse_schema_document(
            &schema_source.text_source().text,
            source_location_key,
        )
        .map_err(|_| LSPRuntimeError::ExpectedError)?;

        let position_span = position_to_span(&position, schema_source.text_source(), index_offset)
            .ok_or_else(|| {
                LSPRuntimeError::UnexpectedError("Failed to map positions to spans".to_string())
            })?;

        return Ok((Feature::SchemaDocument(schema_document), position_span));
    }

    let source_features = js_source_feature_cache
        .get(uri)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let (index, javascript_feature) = source_features
        .iter()
        .enumerate()
        .find(|(_, source_feature)| {
            let range = source_feature.text_source().to_range();
            position >= range.start && position <= range.end
        })
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let source_location_key = SourceLocationKey::embedded(uri.as_ref(), index);

    let parser_features = get_parser_features(project_config);

    match javascript_feature {
        JavaScriptSourceFeature::GraphQL(graphql_source) => {
            let document = parse_executable_with_error_recovery_and_parser_features(
                &graphql_source.text_source().text,
                source_location_key,
                parser_features,
            )
            .item;

            // Now we need to take the `Position` and map that to an offset relative
            // to this GraphQL document, as the `Span`s in the document are relative.
            debug!("Successfully parsed the definitions for a target GraphQL source");
            // Map the position to a zero-length span, relative to this GraphQL source.
            let position_span =
                position_to_span(&position, graphql_source.text_source(), index_offset)
                    .ok_or_else(|| {
                        LSPRuntimeError::UnexpectedError(
                            "Failed to map positions to spans".to_string(),
                        )
                    })?;

            // Now we need to walk the Document, tracking our path along the way, until
            // we find the position within the document. Note that the GraphQLSource will
            // already be updated *with the characters that triggered the completion request*
            // since the change event fires before completion.
            debug!("position_span: {:?}", position_span);

            Ok((Feature::ExecutableDocument(document), position_span))
        }
        JavaScriptSourceFeature::Docblock(docblock_source) => {
            let text_source = &docblock_source.text_source();
            let text = &text_source.text;

            let executable_definitions_in_file = extract_executable_definitions_from_text_document(
                uri,
                js_source_feature_cache,
                parser_features,
            )?;
            let docblock_ir = parse_docblock(text, source_location_key)
                .and_then(|ast| {
                    parse_docblock_ast(
                        &project_config.name,
                        &ast,
                        Some(&executable_definitions_in_file),
                        &ParseOptions {
                            enable_interface_output_type: &project_config
                                .feature_flags
                                .relay_resolver_enable_interface_output_type,
                            allow_resolver_non_nullable_return_type: &project_config
                                .feature_flags
                                .allow_resolver_non_nullable_return_type,
                        },
                    )
                })
                .map_err(|_| {
                    LSPRuntimeError::UnexpectedError("Failed to parse docblock".to_string())
                })?
                .ok_or_else(|| {
                    LSPRuntimeError::UnexpectedError("No docblock IR found".to_string())
                })?;

            let position_span =
                position_to_offset(&position, index_offset, text_source.line_index, text)
                    .map(|offset| Span::new(offset, offset))
                    .ok_or_else(|| {
                        LSPRuntimeError::UnexpectedError(
                            "Failed to map positions to spans".to_string(),
                        )
                    })?;

            Ok((Feature::DocblockIr(docblock_ir), position_span))
        }
    }
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
