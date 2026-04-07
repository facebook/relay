/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Core formatting logic for prettier-compatible GraphQL printing.
//!
//! This module provides functionality to format GraphQL source files
//! and JavaScript files containing graphql template literals using
//! the Rust prettier-style printing utilities.

use common::SourceLocationKey;
use extract_graphql::JavaScriptSourceFeature;
use extract_graphql::extract;
use graphql_syntax::parse_executable;
use graphql_text_printer::prettier_print_executable_document;

/// Format a GraphQL source string using prettier-compatible formatting.
///
/// Parses the input as a GraphQL executable document and returns
/// the formatted output.
pub fn format_graphql_source(source: &str) -> anyhow::Result<String> {
    let document = parse_executable(source, SourceLocationKey::generated())
        .map_err(|errors| anyhow::anyhow!("Parse error: {:?}", errors))?;
    Ok(prettier_print_executable_document(&document))
}

/// Format a JavaScript file containing graphql template literals.
///
/// Extracts all `graphql` template literals from the source, formats
/// each GraphQL source using prettier-compatible formatting, and
/// replaces the original content with the formatted version.
///
/// Returns the full file with all graphql tags formatted.
pub fn format_js_file(source: &str) -> anyhow::Result<String> {
    let features = extract(source);
    if features.is_empty() {
        return Ok(source.to_string());
    }

    // Collect all GraphQL sources with their positions
    let mut replacements: Vec<(usize, usize, String)> = Vec::new();

    for feature in features {
        if let JavaScriptSourceFeature::GraphQL(graphql_source) = feature {
            let text_source = graphql_source.text_source();
            let original = &text_source.text;
            let formatted = format_graphql_source(original)?;

            // We need to find the original position in the source
            // The text_source contains line_index and column_index but not byte offset
            // We'll search for the exact original text in the source
            if let Some(start_pos) = find_graphql_content_position(source, original) {
                let end_pos = start_pos + original.len();
                replacements.push((start_pos, end_pos, formatted));
            }
        }
    }

    // Sort replacements by start position in reverse order
    // so we can apply them from the end to preserve positions
    replacements.sort_by(|a, b| b.0.cmp(&a.0));

    let mut result = source.to_string();
    for (start, end, replacement) in replacements {
        // Trim the trailing newline from prettier output if present
        // to match the formatting style of the original
        let replacement = replacement.trim_end();
        result.replace_range(start..end, replacement);
    }

    Ok(result)
}

/// Find the byte position of a GraphQL content string within a source.
///
/// This searches for the pattern `graphql`WHITESPACE`CONTENT`
/// and returns the byte offset of CONTENT.
fn find_graphql_content_position(source: &str, content: &str) -> Option<usize> {
    // Look for patterns like: graphql` followed by the content
    let pattern_start = "graphql";
    let mut search_start = 0;

    while let Some(graphql_pos) = source[search_start..].find(pattern_start) {
        let actual_pos = search_start + graphql_pos;
        let after_graphql = actual_pos + pattern_start.len();

        // Find the opening backtick
        let remaining = &source[after_graphql..];
        let backtick_offset = remaining.find('`')?;

        // Check if only whitespace between graphql and backtick
        let between = &remaining[..backtick_offset];
        if !between.chars().all(|c| c.is_whitespace()) {
            search_start = actual_pos + 1;
            continue;
        }

        let content_start = after_graphql + backtick_offset + 1;

        // Verify this is the right content by checking if it matches
        if source[content_start..].starts_with(content) {
            return Some(content_start);
        }

        search_start = actual_pos + 1;
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_graphql_source_simple() {
        let input = r#"query  UserQuery { user { id name } }"#;
        let result = format_graphql_source(input).unwrap();
        assert!(result.contains("query UserQuery"));
        assert!(result.contains("user {"));
    }

    #[test]
    fn test_format_js_file_simple() {
        let input = r#"
import {graphql} from 'react-relay';

const query = graphql`query UserQuery { user { id } }`;
"#;
        let result = format_js_file(input).unwrap();
        assert!(result.contains("graphql`"));
        assert!(result.contains("query UserQuery"));
    }

    #[test]
    fn test_format_js_file_no_graphql() {
        let input = r#"
const x = 1;
const y = 2;
"#;
        let result = format_js_file(input).unwrap();
        assert_eq!(result, input);
    }
}
