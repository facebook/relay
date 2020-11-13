/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::{collections::HashMap, path::PathBuf};

use common::{SourceLocationKey, Span};
use graphql_syntax::OperationKind;
use graphql_syntax::{parse_executable, ExecutableDocument, GraphQLSource};
use interner::StringKey;
use log::info;
use lsp_types::{Position, TextDocumentPositionParams, Url};
use relay_compiler::{compiler_state::SourceSet, FileCategorizer, FileGroup};
use schema::{Schema, Type};

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
/// An item in the list of type metadata that we can use to resolve the leaf
/// type the request (completion/hover) is being made against
pub enum TypePathItem {
    Operation(OperationKind),
    FragmentDefinition { type_name: StringKey },
    InlineFragment { type_name: StringKey },
    LinkedField { name: StringKey },
    ScalarField { name: StringKey },
}

/// Return a `GraphQLSource` for a given position, if the position
/// falls within a graphql literal.
pub fn get_graphql_source<'a>(
    text_document_position: &'a TextDocumentPositionParams,
    graphql_source_cache: &'a HashMap<Url, Vec<GraphQLSource>>,
) -> Option<&'a GraphQLSource> {
    let TextDocumentPositionParams {
        text_document,
        position,
    } = text_document_position;
    let url = &text_document.uri;

    let graphql_sources = graphql_source_cache.get(url)?;

    info!("Current sources: {:#?}", *graphql_sources);
    info!("position: {:?}", position);

    // We have GraphQL documents, now check if the position
    // falls within the range of one of these documents.
    let graphql_source = graphql_sources.iter().find(|graphql_source| {
        let range = graphql_source.to_range();
        position >= &range.start && position <= &range.end
    })?;

    Some(graphql_source)
}

/// Return a `CompletionPath` for this request, only if the completion request occurs
/// within a GraphQL document. Otherwise return `None`
pub fn extract_executable_document_from_text(
    text_document_position: TextDocumentPositionParams,
    graphql_source_cache: &HashMap<Url, Vec<GraphQLSource>>,
    file_categorizer: &FileCategorizer,
    root_dir: &PathBuf,
) -> Option<(ExecutableDocument, Span, StringKey)> {
    let graphql_source = get_graphql_source(&text_document_position, graphql_source_cache)?;
    let url = &text_document_position.text_document.uri;
    let position = text_document_position.position;
    let absolute_file_path = PathBuf::from(url.path());
    let file_path = if let Ok(file_path) = absolute_file_path.strip_prefix(root_dir) {
        file_path
    } else {
        info!("Failed to parse file path: {:#?}", &absolute_file_path);
        return None;
    };
    let project_name =
        if let FileGroup::Source { source_set } = file_categorizer.categorize(&file_path.into()) {
            match source_set {
                SourceSet::SourceSetName(source) => source,
                SourceSet::SourceSetNames(sources) => sources[0],
            }
        } else {
            return None;
        };

    match parse_executable(
        &graphql_source.text,
        SourceLocationKey::standalone(&url.to_string()),
    ) {
        Ok(document) => {
            // Now we need to take the `Position` and map that to an offset relative
            // to this GraphQL document, as the `Span`s in the document are relative.
            info!("Successfully parsed the definitions for a target GraphQL source");
            // Map the position to a zero-length span, relative to this GraphQL source.
            let position_span = match position_to_span(position, &graphql_source) {
                Some(span) => span,
                // Exit early if we can't map the position for some reason
                None => return None,
            };
            // Now we need to walk the Document, tracking our path along the way, until
            // we find the position within the document. Note that the GraphQLSource will
            // already be updated *with the characters that triggered the completion request*
            // since the change event fires before completion.
            info!("position_span: {:?}", position_span);


            Some((document, position_span, project_name))
        }
        Err(err) => {
            info!("Failed to parse this target!");
            info!("{:?}", err);
            None
        }
    }
}

/// Maps the LSP `Position` type back to a relative span, so we can find out which syntax node(s)
/// this completion request came from
fn position_to_span(position: Position, source: &GraphQLSource) -> Option<Span> {
    let mut index_of_last_line = 0;
    let mut line_index = source.line_index as u64;

    let mut chars = source.text.chars().enumerate().peekable();

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
            index_of_last_line = index as u64;
        }

        if line_index == position.line {
            let start_offset = (index_of_last_line + position.character) as u32;
            return Some(Span::new(start_offset, start_offset));
        }
    }
    None
}

/// Given a root path item and the schema this function will return a root type of the document
/// For operations -> Query/Mutation/Subscription
/// For fragments -> type of the fragment
pub fn resolve_root_type(root_path_item: TypePathItem, schema: &Schema) -> Option<Type> {
    match root_path_item {
        TypePathItem::Operation(kind) => match kind {
            OperationKind::Query => schema.query_type(),
            OperationKind::Mutation => schema.mutation_type(),
            OperationKind::Subscription => schema.subscription_type(),
        },
        TypePathItem::FragmentDefinition { type_name } => schema.get_type(type_name),
        _ => {
            // TODO(brandondail) log here
            None
        }
    }
}
