/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::SourceLocationKey;
use common::Span;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_ir::build;
use graphql_ir::reexport::Intern;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use lsp_types::HoverContents;
use lsp_types::MarkedString;
use relay_lsp::ContentConsumerType;
use relay_lsp::DummyExtraDataProvider;
use relay_lsp::hover::get_hover;
use relay_test_schema::get_test_schema;
use relay_test_schema::get_test_schema_with_extensions;
use resolution_path::ResolvePosition;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extension%").collect();
    let (schema, document) = if let [document, extension] = parts.as_slice() {
        (get_test_schema_with_extensions(extension), *document)
    } else {
        (get_test_schema(), fixture.content)
    };
    let cursor_position = document.find('|').unwrap() - 1;
    let source = document.replace('|', "");
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let ast = parse_executable(&source, source_location)
        .map_err(|diagnostics| diagnostics_to_sorted_string(&source, &diagnostics))?;
    let ir = build(&schema, &ast.definitions)
        .map_err(|diagnostics| diagnostics_to_sorted_string(&source, &diagnostics))?;
    let program = Program::from_definitions(Arc::clone(&schema), ir);

    let path = ast.resolve((), Span::from_usize(cursor_position, cursor_position));

    let schema_name = "Some Schema Name".intern();

    let extra_data_provider = DummyExtraDataProvider::new();

    let hover_contents = get_hover(
        &path,
        &schema,
        schema_name,
        &extra_data_provider,
        &schema,
        &program,
        ContentConsumerType::Relay,
    )
    .ok_or("<NO HOVER RESPONSE>")?
    .contents;

    Ok(print_hover_contents(hover_contents))
}

fn print_hover_contents(contents: HoverContents) -> String {
    match contents {
        HoverContents::Scalar(scalar) => print_marked_string(scalar),
        HoverContents::Array(arr) => arr
            .into_iter()
            .map(print_marked_string)
            .collect::<Vec<_>>()
            .join("\n--\n"),
        HoverContents::Markup(markup) => markup.value,
    }
}

fn print_marked_string(marked_string: MarkedString) -> String {
    match marked_string {
        MarkedString::String(string) => string,
        MarkedString::LanguageString(language_string) => format!(
            "```{}\n{}\n```",
            language_string.language, language_string.value
        ),
    }
}
