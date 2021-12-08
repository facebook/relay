/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::{collections::HashMap, collections::HashSet, sync::Arc};

use super::make_markdown_table_documentation;
use super::resolve_completion_items;
use common::{SourceLocationKey, Span};
use graphql_ir::{build, Program};
use graphql_syntax::{parse_executable, parse_executable_with_error_recovery};
use intern::string_key::Intern;
use lsp_types::{CompletionItem, Documentation};
use relay_test_schema::get_test_schema;

fn parse_and_resolve_completion_items(
    source: &str,
    program: Option<Program>,
) -> Option<Vec<CompletionItem>> {
    let pos = source.find('|').unwrap() - 1;
    let next_source = source.replace("|", "");
    let document = parse_executable_with_error_recovery(
        &next_source,
        SourceLocationKey::standalone("/test/file"),
    )
    .item;

    let position_span = Span {
        start: pos as u32,
        end: pos as u32,
    };
    let test_schema = get_test_schema();

    resolve_completion_items(
        document,
        position_span,
        "test_project".intern(),
        &Arc::clone(&test_schema),
        Arc::clone(&test_schema),
        &program.unwrap_or_else(|| Program::new(Arc::clone(&test_schema))),
    )
}

fn build_test_program(source: &str) -> Program {
    let document = parse_executable(source, SourceLocationKey::Generated).unwrap();
    let ir = build(&get_test_schema(), &document.definitions).unwrap();
    Program::from_definitions(get_test_schema(), ir)
}

fn assert_labels(items: Vec<CompletionItem>, labels: Vec<&str>) {
    let mut completion_labels = items
        .into_iter()
        .map(|item| item.label)
        .collect::<HashSet<_>>();

    assert_eq!(
        completion_labels.len(),
        labels.len(),
        "Provided labels {:?} do not match completion items {:?}",
        &completion_labels,
        &labels
    );
    for label in labels {
        assert!(
            completion_labels.remove(label),
            "Expected to have {} in the set",
            label
        );
    }
    assert!(completion_labels.is_empty());
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
        None,
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
        None,
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
        None,
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
        None,
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
        None,
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
        None,
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
        None,
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
            "fb_actor_change",
        ],
    );
}

#[test]
fn directive_on_scalar_field() {
    let items = parse_and_resolve_completion_items(
        r#"
        fragment Test on User {
            profile_picture {
                uri @|
            }
        }
        "#,
        None,
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
            "fb_actor_change",
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
        None,
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
        None,
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
        None,
    );
    assert_labels(
        items.unwrap(),
        vec!["label", "initial_count", "use_customized_batch"],
    );
}

#[test]
fn fragment_spread_on_the_same_type() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on Viewer {
               ...T|
            }
        "#,
        Some(build_test_program(
            r#"
        fragment TestFragment on Viewer {
           __typename
        }

        fragment TestFragment2 on Viewer {
            __typename
         }
    "#,
        )),
    );
    assert_labels(items.unwrap(), vec!["TestFragment", "TestFragment2"]);
}

#[test]
fn fragment_spread_on_interface() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on Actor {
               ...T|
            }
        "#,
        Some(build_test_program(
            r#"
        fragment TestFragment on Page {
           __typename
        }

        fragment TestFragment2 on Node {
            __typename
        }
    "#,
        )),
    );
    assert_labels(items.unwrap(), vec!["TestFragment", "TestFragment2"]);
}

#[test]
fn argument_value() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on User {
                profilePicture(size:|) {
                    uri
                }
            }
        "#,
        Some(build_test_program(
            r#"
            fragment Test on User
                @argumentDefinitions(
                    pictureSize: {type: "[Int]"},
                    pictureSize2: {type: "[Int]"}
                ) {
                profilePicture(size: $pictureSize) {
                    uri
                }
            }
        "#,
        )),
    );
    assert_labels(items.unwrap(), vec!["$pictureSize", "$pictureSize2"]);
}

#[test]
fn argument_value_between_names() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on User {
                profilePicture(size: |, preset: SMALL) {
                    uri
                }
            }
        "#,
        Some(build_test_program(
            r#"
            fragment Test on User
                @argumentDefinitions(
                    pictureSize: {type: "[Int]"},
                    pictureSize2: {type: "[Int]"}
                ) {
                profilePicture(size: $pictureSize) {
                    uri
                }
            }
        "#,
        )),
    );
    assert_labels(items.unwrap(), vec!["$pictureSize", "$pictureSize2"]);
}

#[test]
fn empty_directive() {
    let items = parse_and_resolve_completion_items(
        r#"
        fragment Test on User {
            profile_picture @| {
                uri
            }
        }
        "#,
        None,
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
            "fb_actor_change",
        ],
    );
}

#[test]
fn field_documentation() {
    let items = parse_and_resolve_completion_items(
        r#"
            fragment Test on User {
                profile_picture {
                    uri|
                }
            }
        "#,
        None,
    )
    .unwrap();

    let docs = items
        .into_iter()
        .map(|item| (item.label, item.documentation))
        .collect::<HashMap<String, Option<Documentation>>>();

    assert_eq!(docs.len(), 4);
    assert_eq!(
        *docs.get("uri").unwrap(),
        Some(make_markdown_table_documentation(
            "uri",
            "String",
            "URI where the image can be found",
            "",
        ))
    );

    assert_eq!(
        *docs.get("width").unwrap(),
        Some(make_markdown_table_documentation(
            "width",
            "Int",
            "Width in pixels",
            "",
        ))
    );

    assert_eq!(
        *docs.get("height").unwrap(),
        Some(make_markdown_table_documentation(
            "height",
            "Int",
            "Height in pixels",
            "",
        ))
    );

    assert_eq!(
        *docs.get("test_enums").unwrap(),
        Some(make_markdown_table_documentation(
            "test_enums",
            "TestEnums",
            "",
            "",
        ))
    );
}
