/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::{build, Program};
use graphql_syntax::parse_executable;
use graphql_text_printer::{print_fragment, print_operation};
use relay_transforms::flatten;
use std::sync::Arc;
use test_schema::get_test_schema_with_extensions;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let ast = parse_executable(fixture.content, source_location).unwrap();
    let schema = get_test_schema_with_extensions(
        r#"
directive @serverInlineDirective on INLINE_FRAGMENT"#,
    );
    let ir = build(&schema, &ast.definitions).unwrap();
    let context = Program::from_definitions(Arc::clone(&schema), ir);
    let flatten_context = flatten(&context, !fixture.content.contains("%for_printing%")).unwrap();

    assert_eq!(
        context.fragments().count(),
        flatten_context.fragments().count()
    );

    assert_eq!(
        context.operations().count(),
        flatten_context.operations().count()
    );

    let mut printed_queries = flatten_context
        .operations()
        .map(|def| print_operation(&schema, def))
        .collect::<Vec<_>>();

    let mut printed = flatten_context
        .fragments()
        .map(|def| print_fragment(&schema, def))
        .collect::<Vec<_>>();
    printed.append(&mut printed_queries);
    printed.sort();
    Ok(printed.join("\n\n"))
}
