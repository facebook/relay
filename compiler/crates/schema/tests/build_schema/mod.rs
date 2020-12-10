/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use graphql_test_helpers::diagnostics_to_sorted_string;
use schema::{build_schema, build_schema_from_flat_buffer, build_schema_with_extensions, Schema};
use schema_print::serialize_as_fb;
use std::collections::BTreeMap;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();
    let result = match parts.as_slice() {
        [base] => build_schema(base),
        [base, extensions] => build_schema_with_extensions(&[base], &[extensions]),
        _ => panic!("Expected a single extension block"),
    };

    result
        .map(print_schema_and_flat_buffer_schema)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))
}

fn print_schema_and_flat_buffer_schema(schema: Schema) -> String {
    let bytes = serialize_as_fb(&schema);
    let mut fb_schema = build_schema_from_flat_buffer(&bytes).unwrap();

    // Hydrate types
    for (key, _value) in schema.get_type_map().collect::<BTreeMap<_, _>>() {
        fb_schema.get_type(*key);
    }
    // Hydrate directives
    for directive in schema.get_directives() {
        fb_schema.get_directive(directive.name);
    }
    format!(
        "Text Schema:{}\n\nFlatBuffer Schema:{}",
        schema.snapshot_print(),
        fb_schema.snapshot_print()
    )
}
