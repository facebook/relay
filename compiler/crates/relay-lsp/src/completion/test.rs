/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::{
    collections::HashSet,
    sync::{Arc, RwLock},
};

use super::resolve_completion_items;
use common::{SourceLocationKey, Span};
use graphql_syntax::parse_executable_with_error_recovery;
use interner::Intern;
use lsp_types::CompletionItem;
use relay_test_schema::get_test_schema;

fn parse_and_resolve_completion_items(source: &str) -> Option<Vec<CompletionItem>> {
    let pos = source.find('|').unwrap() - 1;
    let next_source = source.replace("|", "");
    let document = parse_executable_with_error_recovery(
        &next_source,
        SourceLocationKey::Standalone {
            path: "/test/file".intern(),
        },
    )
    .item;

    let position_span = Span {
        start: pos as u32,
        end: pos as u32,
    };

    let source_programs = Arc::new(RwLock::new(Default::default()));
    resolve_completion_items(
        document,
        position_span,
        "test_project".intern(),
        &get_test_schema(),
        &source_programs,
    )
}

fn assert_labels(items: Vec<CompletionItem>, labels: Vec<&str>) {
    assert_eq!(items.len(), labels.len());
    let mut current_labels = items
        .into_iter()
        .map(|item| item.label)
        .collect::<HashSet<_>>();
    for label in labels {
        assert!(current_labels.remove(label));
    }
    assert!(current_labels.is_empty());
}

#[test]
fn scalar_field() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on User {
                profile_picture {
                    uri|
                }
            }
        "#,
    );
    assert_labels(items.unwrap(), vec!["uri", "width", "height", "test_enums"]);
}

#[test]
fn linked_field() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on Viewer {
                marketplace_settings {
                    locatio| {
                    }
                }
            }
        "#,
    );
    assert_labels(items.unwrap(), vec!["location", "categories"]);
}

#[test]
fn whitespace_in_linked_field() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on User {
                profile_picture {
                    uri
                    |
                }
            }
        "#,
    );
    assert_labels(items.unwrap(), vec!["uri", "width", "height", "test_enums"]);
}

#[test]
fn whitespace_in_fragment() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on Image {
                |
            }
        "#,
    );
    assert_labels(items.unwrap(), vec!["uri", "width", "height", "test_enums"]);
}

#[test]
fn whitespace_in_inline_fragment() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on Node {
                ... on Image {
                    |
                }
            }
        "#,
    );
    assert_labels(items.unwrap(), vec!["uri", "width", "height", "test_enums"]);
}

#[test]
fn inline_fragment() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on Viewer {
                ... on a|
            }
        "#,
    );
    assert_labels(items.unwrap(), vec!["Viewer"]);
}

#[test]
fn directive() {
    let items = parse_and_resolve_completion_items(
        r#"
        fragment Test on User {
            profile_picture @a| {
                uri
            }
        }
        "#,
    );
    assert_labels(
        items.unwrap(),
        vec![
            "prependEdge",
            "deleteRecord",
            "appendNode",
            "deleteEdge",
            "__clientField",
            "appendEdge",
            "required",
            "stream_connection",
            "match",
            "customDirective",
            "prependNode",
            "fixme_fat_interface",
            "stream",
            "include",
            "connection",
            "skip",
        ],
    );
}

#[test]
fn empty_argument_list() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on Viewer {
                profile_picture @stream(|) {
                    uri
                }
            }
        "#,
    );
    assert_labels(
        items.unwrap(),
        vec!["label", "initial_count", "if", "use_customized_batch"],
    );
}

#[test]
fn argument_name_without_value() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on Viewer {
                profile_picture @stream(i|) {
                    uri
                }
            }
        "#,
    );
    assert_labels(
        items.unwrap(),
        vec!["label", "initial_count", "if", "use_customized_batch"],
    );
}

#[test]
fn argument_name_with_existing_name() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on Viewer {
                profile_picture @stream(
                    if: false
                    |
                ) {
                    uri
                }
            }
        "#,
    );
    assert_labels(
        items.unwrap(),
        vec!["label", "initial_count", "use_customized_batch"],
    );
}
