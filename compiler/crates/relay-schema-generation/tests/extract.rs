/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::SourceLocationKey;
use common::TextSource;
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use hermes_comments::find_nodes_after_comments;
use hermes_estree::IntoFunction;
use hermes_estree::Node;
use hermes_parser::ParserDialect;
use hermes_parser::ParserFlags;
use hermes_parser::parse;
use relay_schema_generation::RelayResolverExtractor;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let result = parse(
        fixture.content,
        fixture.file_name,
        ParserFlags {
            strict_mode: true,
            enable_jsx: false,
            dialect: ParserDialect::Flow,
            store_doc_block: false,
            store_comments: true,
        },
    )
    .unwrap();

    let attached_comments = find_nodes_after_comments(&result.ast, &result.comments);

    let extractor = RelayResolverExtractor::new();

    let output = attached_comments
        .into_iter()
        .filter_map(|(comment, _, node, _)| {
            let comment = comment.trim();
            match comment {
                "extract" => match node {
                    Node::FunctionDeclaration(node) => {
                        Some(extractor.extract_function(node.function()))
                    }
                    _ => None,
                },
                _ => None,
            }
        })
        .map(|result| match result {
            Ok(data) => {
                format!("{:#?}", data)
            }
            Err(diag) => diagnostics_to_sorted_string(fixture.content, &diag),
        })
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(output)
}

fn diagnostics_to_sorted_string(source: &str, diagnostics: &[Diagnostic]) -> String {
    let printer = DiagnosticPrinter::new(|source_location| match source_location {
        SourceLocationKey::Embedded { .. } => unreachable!(),
        SourceLocationKey::Standalone { .. } => unreachable!(),
        SourceLocationKey::Generated => Some(TextSource::from_whole_document(source)),
    });
    let mut printed = diagnostics
        .iter()
        .map(|diagnostic| printer.diagnostic_to_string(diagnostic))
        .collect::<Vec<_>>();
    printed.sort();
    printed.join("\n\n")
}
