/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Location;
use common::SourceLocationKey;
use common::Span;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_syntax::FragmentArgumentSyntaxKind;
use graphql_syntax::ParserFeatures;
use graphql_syntax::parse_executable_with_features;
use graphql_test_helpers::diagnostics_to_sorted_string;
use itertools::Itertools;
use relay_lsp::Feature;
use relay_lsp::rename::create_rename_request;
use relay_lsp::rename::get_locations_for_rename;
use relay_test_schema::get_test_schema;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let document = fixture.content;
    let cursor_position = document.find('|').unwrap() - 1;
    let source = document.replace("|", "");
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let ast = parse_executable_with_features(
        &source,
        source_location,
        ParserFeatures {
            fragment_argument_capability:
                FragmentArgumentSyntaxKind::SpreadArgumentsAndFragmentVariableDefinitions,
            allow_string_literal_alias: false,
        },
    )
    .map_err(|diagnostics| diagnostics_to_sorted_string(&source, &diagnostics))?;
    let feature = Feature::ExecutableDocument(ast.to_owned());
    let span = Span::from_usize(cursor_position, cursor_position);

    let rename_request = create_rename_request(feature, Location::new(source_location, span))
        .map_err(|_| "Rename failed")?;

    let schema = get_test_schema();
    let ir = build(&schema, &ast.definitions)
        .map_err(|diagnostics| diagnostics_to_sorted_string(&source, &diagnostics))?;
    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let locations_to_rename = get_locations_for_rename(rename_request, &program)
        .map_err(|_| "Could not get locations for planned text changes")?;

    Ok(rename_locations(locations_to_rename, &source))
}

fn rename_locations(locations: Vec<Location>, source: &str) -> String {
    let renamed_key = "RENAMED";
    let renamed_key_length = renamed_key.len() as i32;

    let spans = locations
        .iter()
        .map(|location| location.span())
        .sorted_by_key(|span| span.start)
        .collect::<Vec<_>>();

    let mut source_with_renames = source.to_string();
    let mut offset: i32 = 0;
    for span in spans {
        let start = (span.start as i32 + offset) as usize;
        let end = (span.end as i32 + offset) as usize;

        source_with_renames.replace_range(start..end, renamed_key);

        let original_length = end as i32 - start as i32;
        offset += renamed_key_length - original_length;
    }

    source_with_renames
}
