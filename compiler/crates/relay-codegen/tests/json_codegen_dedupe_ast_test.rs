// @generated SignedSource<<509cf81350170d4c40fd13666d810f16>>

mod json_codegen_dedupe_ast;

use json_codegen_dedupe_ast::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn kitchen_sink() {
    let input = include_str!("json_codegen_dedupe_ast/fixtures/kitchen-sink.graphql");
    let expected = include_str!("json_codegen_dedupe_ast/fixtures/kitchen-sink.expected");
    test_fixture(transform_fixture, "kitchen-sink.graphql", "json_codegen_dedupe_ast/fixtures/kitchen-sink.expected", input, expected);
}

#[test]
fn stable_literals() {
    let input = include_str!("json_codegen_dedupe_ast/fixtures/stable-literals.graphql");
    let expected = include_str!("json_codegen_dedupe_ast/fixtures/stable-literals.expected");
    test_fixture(transform_fixture, "stable-literals.graphql", "json_codegen_dedupe_ast/fixtures/stable-literals.expected", input, expected);
}
