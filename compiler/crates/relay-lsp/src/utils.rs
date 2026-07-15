/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;
use std::path::PathBuf;

use common::Location;
use common::SourceLocationKey;
use common::Span;
use common::TextSource;
use dashmap::DashMap;
use docblock_syntax::parse_docblock;
use extract_graphql::JavaScriptSourceFeature;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::GraphQLSource;
use graphql_syntax::ParserFeatures;
use graphql_syntax::parse_executable_with_error_recovery_and_parser_features;
use intern::string_key::StringKey;
use log::debug;
use lsp_types::Position;
use lsp_types::TextDocumentPositionParams;
use lsp_types::Uri;
use percent_encoding::percent_decode_str;
use relay_compiler::FileCategorizer;
use relay_compiler::FileGroup;
use relay_compiler::ProjectConfig;
use relay_compiler::config::Config;
use relay_compiler::get_parser_features;
use relay_docblock::ParseOptions;
use relay_docblock::parse_docblock_ast;

use crate::Feature;
use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;

pub fn is_file_uri_in_dir(root_dir: &Path, file_uri: &Uri) -> bool {
    uri_to_file_path(file_uri).is_some_and(|file_path| file_path.starts_with(root_dir))
}

pub fn extract_executable_definitions_from_text_document(
    text_document_uri: &Uri,
    source_feature_cache: &DashMap<Uri, Vec<JavaScriptSourceFeature>>,
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
                SourceLocationKey::embedded(path.as_str(), i),
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
    uri: &Uri,
    root_dir: &Path,
    config: &Config,
) -> LSPRuntimeResult<FileGroup> {
    let absolute_file_path = uri_to_file_path(uri)
        .filter(|path| path.is_absolute())
        .ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!("Unable to convert URI to file path: {uri:?}"))
        })?;

    let file_path = absolute_file_path.strip_prefix(root_dir).map_err(|_e| {
        LSPRuntimeError::UnexpectedError(format!(
            "Failed to strip prefix {root_dir:?} from {absolute_file_path:?}"
        ))
    })?;

    file_categorizer.categorize(file_path, config).map_err(|_| {
        LSPRuntimeError::UnexpectedError(format!(
            "Unable to categorize the file correctly: {file_path:?}"
        ))
    })
}

pub fn get_project_name_from_file_group(file_group: &FileGroup) -> Result<StringKey, String> {
    let project_set = match file_group {
        FileGroup::Source { project_set } => Ok(project_set),
        FileGroup::Schema { project_set } => Ok(project_set),
        FileGroup::Extension { project_set } => Ok(project_set),
        FileGroup::CompactSchema { project_set } => Ok(project_set),
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
    js_source_feature_cache: &DashMap<Uri, Vec<JavaScriptSourceFeature>>,
    schema_source_cache: &DashMap<Uri, GraphQLSource>,
    text_document_position: &TextDocumentPositionParams,
    index_offset: usize,
) -> LSPRuntimeResult<(Feature, Location)> {
    let uri = &text_document_position.text_document.uri;
    let position = text_document_position.position;

    if let Some(schema_source) = schema_source_cache.get(uri) {
        let source_location_key = SourceLocationKey::standalone(uri.as_str());
        let schema_document = graphql_syntax::parse_schema_document(
            &schema_source.text_source().text,
            source_location_key,
        )
        .map_err(|_| LSPRuntimeError::ExpectedError)?;

        let position_span = position_to_span(&position, schema_source.text_source(), index_offset)
            .ok_or_else(|| {
                LSPRuntimeError::UnexpectedError("Failed to map positions to spans".to_string())
            })?;

        return Ok((
            Feature::SchemaDocument(schema_document),
            Location::new(source_location_key, position_span),
        ));
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

    let source_location_key = SourceLocationKey::embedded(uri.path().as_str(), index);

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
            debug!("position_span: {position_span:?}");

            Ok((
                Feature::ExecutableDocument(document),
                Location::new(source_location_key, position_span),
            ))
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
                            allow_legacy_relay_resolver_tag: &project_config
                                .feature_flags
                                .allow_legacy_relay_resolver_tag,
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

            Ok((
                Feature::DocblockIr(docblock_ir),
                Location::new(source_location_key, position_span),
            ))
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

/// Converts a `file://` URI into a filesystem path, handling both Unix and
/// Windows paths.
///
/// This restores the behavior that was lost when relay-lsp migrated from
/// `lsp_types::Url` (backed by the `url` crate) to `lsp_types::Uri` (backed by
/// `fluent-uri`). `Url::to_file_path()` used to percent-decode the path and
/// normalize Windows drive letters, whereas `Uri::path()` exposes only the
/// raw, still-percent-encoded path. Without this, Windows editors that send
/// URIs such as `file:///c%3A/dir/file.graphql` produce the path
/// `/c%3A/dir/file.graphql`, which is neither absolute nor a real file (see
/// https://github.com/facebook/relay/issues/5347).
///
/// Returns `None` for non-`file` URIs.
pub fn uri_to_file_path(uri: &Uri) -> Option<PathBuf> {
    if !uri
        .scheme()
        .is_some_and(|scheme| scheme.eq_lowercase("file"))
    {
        return None;
    }

    // Percent-decode the path, e.g. `%3A` -> `:` for Windows drive letters and
    // `%20` -> ` ` for paths containing spaces.
    let decoded = percent_decode_str(uri.path().as_str()).decode_utf8_lossy();
    Some(decoded_uri_path_to_file_path(&decoded))
}

/// Maps the (already percent-decoded) path component of a `file://` URI to a
/// filesystem path.
fn decoded_uri_path_to_file_path(decoded_path: &str) -> PathBuf {
    // A `file://` URI always begins its path with `/`. On Windows the path is
    // of the form `/C:/dir/file`, and the leading slash must be removed so it
    // maps to the absolute path `C:/dir/file`. Unix paths (`/home/user`) are
    // used verbatim.
    let path = decoded_path
        .strip_prefix('/')
        .filter(|rest| is_windows_drive_prefix(rest))
        .unwrap_or(decoded_path);
    PathBuf::from(path)
}

/// Returns `true` if `path` begins with a Windows drive-letter component such
/// as `C:`, `C:/`, or `C:\`.
fn is_windows_drive_prefix(path: &str) -> bool {
    let bytes = path.as_bytes();
    bytes.len() >= 2
        && bytes[0].is_ascii_alphabetic()
        && bytes[1] == b':'
        && (bytes.len() == 2 || bytes[2] == b'/' || bytes[2] == b'\\')
}

/// Converts a filesystem path to a `file://` URI, handling both Unix and Windows paths.
pub fn path_to_file_uri(path: &Path) -> Option<Uri> {
    let path_str = path.to_str()?;
    str_path_to_file_uri(path_str)
}

/// Converts a directory path to a `file://` URI with a trailing slash.
pub fn dir_to_file_uri(path: &Path) -> Option<Uri> {
    let path_str = path.to_str()?;
    let with_slash = format!("{path_str}/");
    str_path_to_file_uri(&with_slash)
}

fn str_path_to_file_uri(path: &str) -> Option<Uri> {
    let normalized = path.replace('\\', "/");
    let uri_str = if normalized.starts_with('/') {
        format!("file://{normalized}")
    } else {
        format!("file:///{normalized}")
    };
    uri_str.parse::<Uri>().ok()
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use lsp_types::Uri;

    use super::is_windows_drive_prefix;
    use super::path_to_file_uri;
    use super::uri_to_file_path;

    fn uri(s: &str) -> Uri {
        s.parse::<Uri>().unwrap()
    }

    #[test]
    fn uri_to_file_path_unix() {
        assert_eq!(
            uri_to_file_path(&uri("file:///Users/alice/project/src/foo.graphql")),
            Some(PathBuf::from("/Users/alice/project/src/foo.graphql"))
        );
    }

    #[test]
    fn uri_to_file_path_windows_percent_encoded_drive_letter() {
        // Editors such as VSCode encode the drive-letter colon as `%3A`. This
        // is the exact shape reported in facebook/relay#5347.
        assert_eq!(
            uri_to_file_path(&uri(
                "file:///c%3A/Development/repo-relay-compiler-bug/src/something.graphql"
            )),
            Some(PathBuf::from(
                "c:/Development/repo-relay-compiler-bug/src/something.graphql"
            ))
        );
    }

    #[test]
    fn uri_to_file_path_windows_unencoded_drive_letter() {
        assert_eq!(
            uri_to_file_path(&uri("file:///C:/Development/foo.graphql")),
            Some(PathBuf::from("C:/Development/foo.graphql"))
        );
    }

    #[test]
    fn uri_to_file_path_decodes_spaces() {
        assert_eq!(
            uri_to_file_path(&uri("file:///Users/alice/my%20project/foo.graphql")),
            Some(PathBuf::from("/Users/alice/my project/foo.graphql"))
        );
    }

    #[test]
    fn uri_to_file_path_rejects_non_file_scheme() {
        assert_eq!(
            uri_to_file_path(&uri("https://example.com/foo.graphql")),
            None
        );
    }

    #[test]
    fn uri_to_file_path_roundtrips_windows_path() {
        // `path_to_file_uri` (the reverse direction) followed by
        // `uri_to_file_path` should recover a usable absolute Windows path.
        let file_uri = path_to_file_uri(&PathBuf::from("C:\\Development\\foo.graphql")).unwrap();
        assert_eq!(
            uri_to_file_path(&file_uri),
            Some(PathBuf::from("C:/Development/foo.graphql"))
        );
    }

    #[test]
    fn windows_drive_prefix_detection() {
        assert!(is_windows_drive_prefix("C:"));
        assert!(is_windows_drive_prefix("c:/dir"));
        assert!(is_windows_drive_prefix("Z:\\dir"));
        assert!(!is_windows_drive_prefix("Users/alice"));
        assert!(!is_windows_drive_prefix("/c:/dir"));
        assert!(!is_windows_drive_prefix("cc:/dir"));
        assert!(!is_windows_drive_prefix("1:/dir"));
    }
}
