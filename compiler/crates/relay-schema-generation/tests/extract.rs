/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::FeatureFlag;
use common::SourceLocationKey;
use common::TextSource;
use fixture_tests::Fixture;
use flow_parser::ast::statement::StatementInner;
use graphql_cli::DiagnosticPrinter;
use relay_schema_generation::RelayResolverExtractor;
use relay_schema_generation::find_nodes_after_comments::AttachedNode;
use relay_schema_generation::find_nodes_after_comments::find_nodes_after_comments;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let mut extractor = RelayResolverExtractor::new(&FeatureFlag::Enabled);
    let ast = extractor
        .parse_source(fixture.content, SourceLocationKey::generated())
        .unwrap();

    let attached_comments = find_nodes_after_comments(&ast);

    let output = attached_comments
        .into_iter()
        .filter_map(|(comment, _, node, _)| {
            let comment = comment.trim();
            match comment {
                "extract" => match node {
                    AttachedNode::Statement(statement) => match &**statement {
                        StatementInner::FunctionDeclaration { inner, .. } => {
                            Some(extractor.extract_function(inner))
                        }
                        _ => None,
                    },
                    AttachedNode::ObjectTypeProperty(_) => None,
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
