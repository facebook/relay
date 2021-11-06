/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use graphql_ir::{build, ExecutableDefinition, Selection};
use graphql_syntax::parse_executable;
use relay_test_schema::TEST_SCHEMA;
use relay_transforms::NodeIdentifier;

fn get_selection(def: &ExecutableDefinition) -> &Selection {
    if let ExecutableDefinition::Fragment(frag) = def {
        &frag.selections[0]
    } else {
        panic!("No selection found in: {:#?}", &def);
    }
}

fn are_selections_equal(graphql: &str) -> bool {
    let source_location = SourceLocationKey::standalone("test");
    let ast = parse_executable(graphql, source_location).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions).unwrap();
    let left = NodeIdentifier::from_selection(&TEST_SCHEMA, get_selection(&ir[0]));
    let right = NodeIdentifier::from_selection(&TEST_SCHEMA, get_selection(&ir[1]));
    left == right
}

#[test]
fn test_fields() {
    assert!(are_selections_equal(
        r#"
                fragment Left on User {
                    name @customDirective(level: 1)
                }
                fragment Right on User {
                    name @customDirective(level: 1)
                }
            "#
    ));

    assert!(!are_selections_equal(
        r#"
                fragment Left on User {
                    name @customDirective(level: 1)
                }
                fragment Right on User {
                    name @customDirective(level: 2)
                }
            "#
    ));

    assert!(are_selections_equal(
        // When there is an alias, we only compare the alias instead of the original name
        r#"
                fragment Left on User {
                    name: username @customDirective(level: 1)
                }
                fragment Right on User {
                    name @customDirective(level: 1)
                }
            "#
    ));

    assert!(are_selections_equal(
        // We don't compare arguments for field identities
        r#"
                fragment Left on User {
                    firstName(if: true, unless: false)
                }
                fragment Right on User {
                    firstName(if: false, unless: true)
                }
            "#
    ));

    assert!(are_selections_equal(
        r#"
                fragment Left on User {
                    zucktown: hometown @customDirective(level: 1){
                        id
                        lastName
                    }
                }
                fragment Right on User {
                    zucktown: hometown @customDirective(level: 1){
                        id
                        lastName
                    }
                }
            "#
    ));
}

#[test]
fn test_inline_fragments() {
    assert!(are_selections_equal(
        r#"
                fragment Left on Actor {
                    ... on User {
                        name
                    }
                }
                fragment Right on User {
                    ... on User {
                        name
                    }
                }
            "#
    ));

    assert!(!are_selections_equal(
        r#"
                fragment Left on Actor {
                    ... on Actor {
                        name
                    }
                }
                fragment Right on Actor {
                    ... on User {
                        name
                    }
                }
            "#
    ));

    assert!(!are_selections_equal(
        // We compare directives for inline fragments in Rust
        r#"
                fragment Left on Actor {
                    ... on User @defer(label: "Zuck") {
                        name
                    }
                }
                fragment Right on User {
                    ... on User @defer(label: "Mark") {
                        name
                    }
                }
            "#
    ));
}

#[test]
fn test_fragment_spreads() {
    assert!(are_selections_equal(
        r#"
                fragment Left on User {
                    ...CommonFragment
                }
                fragment Right on User {
                    ...CommonFragment
                }
                fragment CommonFragment on User {
                    name
                }
            "#
    ));

    assert!(!are_selections_equal(
        r#"
                fragment Left on User {
                    ...SpreadLeft
                }
                fragment Right on User {
                    ...Left
                }
                fragment SpreadLeft on User {
                    name
                }
            "#
    ));

    assert!(are_selections_equal(
        r#"
                fragment Left on User {
                    ...CommonFragment @arguments(pictureSize: [42])
                }
                fragment Right on User {
                    ...CommonFragment @arguments(pictureSize: [42])
                }
                fragment CommonFragment on User
                    @argumentDefinitions(pictureSize: {type: "[Int]"}) {
                    profilePicture(size: $pictureSize) {
                        uri
                    }
                }
            "#
    ));

    assert!(!are_selections_equal(
        // Fragment spread with different arguments are not equal
        r#"
                fragment Left on User {
                    ...CommonFragment @arguments(pictureSize: [0])
                }
                fragment Right on User {
                    ...CommonFragment @arguments(pictureSize: [42])
                }
                fragment CommonFragment on User
                    @argumentDefinitions(pictureSize: {type: "[Int]"}) {
                    profilePicture(size: $pictureSize) {
                        uri
                    }
                }
            "#
    ));

    assert!(are_selections_equal(
        // Ignore null arguments
        r#"
                fragment Left on User {
                    ...CommonFragment @arguments(pictureSize: [42], arg: null)
                }
                fragment Right on User {
                    ...CommonFragment @arguments(arg: null, pictureSize: [42])
                }
                fragment CommonFragment on User
                    @argumentDefinitions(pictureSize: {type: "[Int]"}, arg: {type: "Int"}) {
                    profilePicture(size: $pictureSize) {
                        uri
                    }
                }
            "#
    ));
}

#[test]
fn test_conditions() {
    assert!(are_selections_equal(
        r#"
                fragment Left on User {
                    ...CommonFragment @include(if: $conditional1) @skip(if: $conditional3)
                }
                fragment Right on User {
                    ...CommonFragment @include(if: $conditional1) @skip(if: $conditional3)
                }
                fragment CommonFragment on User {
                    name
                }
            "#
    ));

    assert!(!are_selections_equal(
        r#"
            fragment Left on User {
                ...CommonFragment @include(if: $conditional1)
            }
            fragment Right on User {
                ...CommonFragment @include(if: $conditional2)
            }
            fragment CommonFragment on User {
                name
            }
            "#
    ));
}
