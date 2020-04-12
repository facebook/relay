// @generated SignedSource<<93029bdc388d8f29dc72479a1c2bc93d>>

mod skip_unreachable_nodes;

use skip_unreachable_nodes::transform_fixture;
use fixture_tests::test_fixture;

#[test]
fn keeps_other_fields() {
    let input = include_str!("skip_unreachable_nodes/fixtures/keeps-other-fields.graphql");
    let expected = include_str!("skip_unreachable_nodes/fixtures/keeps-other-fields.expected");
    test_fixture(transform_fixture, "keeps-other-fields.graphql", "skip_unreachable_nodes/fixtures/keeps-other-fields.expected", input, expected);
}

#[test]
fn removes_include_false() {
    let input = include_str!("skip_unreachable_nodes/fixtures/removes-include-false.graphql");
    let expected = include_str!("skip_unreachable_nodes/fixtures/removes-include-false.expected");
    test_fixture(transform_fixture, "removes-include-false.graphql", "skip_unreachable_nodes/fixtures/removes-include-false.expected", input, expected);
}

#[test]
fn removes_recursively_empty_definitions() {
    let input = include_str!("skip_unreachable_nodes/fixtures/removes-recursively-empty-definitions.graphql");
    let expected = include_str!("skip_unreachable_nodes/fixtures/removes-recursively-empty-definitions.expected");
    test_fixture(transform_fixture, "removes-recursively-empty-definitions.graphql", "skip_unreachable_nodes/fixtures/removes-recursively-empty-definitions.expected", input, expected);
}

#[test]
fn removes_skip_true() {
    let input = include_str!("skip_unreachable_nodes/fixtures/removes-skip-true.graphql");
    let expected = include_str!("skip_unreachable_nodes/fixtures/removes-skip-true.expected");
    test_fixture(transform_fixture, "removes-skip-true.graphql", "skip_unreachable_nodes/fixtures/removes-skip-true.expected", input, expected);
}
