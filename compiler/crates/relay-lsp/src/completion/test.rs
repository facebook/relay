/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::{Arc, RwLock};

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

fn assert_labels(items: Vec<CompletionItem>, lables: Vec<&str>) {
    assert_eq!(items.len(), lables.len());
    for i in 0..items.len() {
        let item = &items[i];
        let label = lables[i];
        assert_eq!(item.label, label);
    }
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
