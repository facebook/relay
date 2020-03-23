/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use graphql_ir::{build, Program};
use graphql_syntax::parse;
use graphql_text_printer::{print_fragment, print_operation};
use graphql_transforms::{flatten, sort_selections};
use test_schema::test_schema_with_extensions;

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let file_key = FileKey::new(fixture.file_name);
    let ast = parse(fixture.content, file_key).unwrap();
    let schema = test_schema_with_extensions(
        r#"
directive @__clientExtension(
  label: String!
  if: Boolean = true
) on INLINE_FRAGMENT
directive @serverInlineDirective on INLINE_FRAGMENT"#,
    );
    let ir = build(&schema, &ast.definitions).unwrap();
    let context = Program::from_definitions(&schema, ir);
    let flatten_context = flatten(&context, !fixture.content.contains("%for_printing%"));
    let next_context = sort_selections(&flatten_context);

    assert_eq!(
        context.fragments().count(),
        next_context.fragments().count()
    );

    assert_eq!(
        context.operations().count(),
        next_context.operations().count()
    );

    let mut printed_queries = next_context
        .operations()
        .map(|def| print_operation(&schema, def))
        .collect::<Vec<_>>();

    let mut printed = next_context
        .fragments()
        .map(|def| print_fragment(&schema, def))
        .collect::<Vec<_>>();
    printed.append(&mut printed_queries);
    printed.sort();
    Ok(printed.join("\n\n"))
}
