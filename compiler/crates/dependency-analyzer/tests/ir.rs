/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::sync::Arc;

use common::NoopPerfLoggerEvent;
use common::SourceLocationKey;
use dependency_analyzer::*;
use fixture_tests::Fixture;
use graphql_ir::*;
use graphql_syntax::parse_executable;
use intern::string_key::Intern;
use relay_test_schema::get_test_schema;
use relay_test_schema::get_test_schema_with_extensions;
use rustc_hash::FxHashSet;
use schema::SDLSchema;
use schema_diff::check::IncrementalBuildSchemaChange;

fn format_definition(def: ExecutableDefinition) -> String {
    match def {
        ExecutableDefinition::Operation(operation) => {
            format!("Operation: {}", operation.name.item)
        }
        ExecutableDefinition::Fragment(fragment) => format!("Fragment: {}", fragment.name.item),
    }
}

// Parses the schema extension changes.
// The schema extension section should begin with:
//   # <Type1>: changed1, changed2
//   # <Type2>: changed3
fn parse_schema_changes(extension_content: &str) -> FxHashSet<IncrementalBuildSchemaChange> {
    let mut changes: FxHashSet<IncrementalBuildSchemaChange> = HashSet::default();
    let lines: Vec<&str> = extension_content.lines().collect();
    for line in lines.iter() {
        if line.trim() == "" {
            continue;
        }
        if !line.trim().starts_with('#') {
            break;
        }
        let line_parts: Vec<&str> = line.split(':').collect();
        let type_ = line_parts[0];
        let changed_names = line_parts[1].split(',').map(|name| name.trim().intern());
        // slice to skip the "#"
        match type_[1..].trim() {
            "Enum" => {
                for key in changed_names {
                    changes.insert(IncrementalBuildSchemaChange::Enum(key));
                }
            }
            "Object" => {
                for key in changed_names {
                    changes.insert(IncrementalBuildSchemaChange::Object(key));
                }
            }
            "Union" => {
                for key in changed_names {
                    changes.insert(IncrementalBuildSchemaChange::Union(key));
                }
            }
            "InputObject" => {
                for key in changed_names {
                    changes.insert(IncrementalBuildSchemaChange::InputObject(key));
                }
            }
            "Interface" => {
                for key in changed_names {
                    changes.insert(IncrementalBuildSchemaChange::Interface(key));
                }
            }
            _ => panic!(
                "Included an incremental change for a schema type that does not have incremental builds"
            ),
        }
    }
    changes
}

// TODO: Test without using snapshot tests
pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts = fixture.content.split("%extensions%").collect::<Vec<_>>();

    let (content, schema, schema_changes): (
        &str,
        Arc<SDLSchema>,
        FxHashSet<IncrementalBuildSchemaChange>,
    ) = match parts.as_slice() {
        [content] => (content, get_test_schema(), HashSet::default()),
        [content, extension_content] => {
            let schema_changes = parse_schema_changes(extension_content);
            (
                content,
                get_test_schema_with_extensions(extension_content),
                schema_changes,
            )
        }
        _ => panic!("Expected one optional \"%extensions%\" section in the fixture."),
    };

    let parts: Vec<&str> = content.split("%definitions%").collect();
    let first_line: &str = content.lines().next().unwrap();

    let changed_names = first_line[1..]
        .trim()
        .split(',')
        .map(|name| name.trim())
        .filter(|name| !name.is_empty())
        .flat_map(|name| {
            // Note: this is a bit of a hack! Here, we don't know whether the stringkey represents
            // a fragment or operation name, so we mark both "a fragment named X" and "a query named
            // X" as having changed.
            vec![
                FragmentDefinitionName(name.intern()).into(),
                OperationDefinitionName(name.intern()).into(),
            ]
        })
        .collect();

    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let mut asts = parse_executable(parts[0], source_location)
        .unwrap()
        .definitions;
    let mut base_names: ExecutableDefinitionNameSet = Default::default();
    for part in parts.iter().skip(1) {
        let defs = parse_executable(part, source_location).unwrap().definitions;
        for def in defs {
            base_names.insert(match &def {
                graphql_syntax::ExecutableDefinition::Operation(node) => {
                    OperationDefinitionName(node.name.clone().unwrap().value).into()
                }
                graphql_syntax::ExecutableDefinition::Fragment(node) => {
                    FragmentDefinitionName(node.name.value).into()
                }
            });
            asts.push(def);
        }
    }

    let definitions = build(&schema, &asts).unwrap();
    let result = get_reachable_ir(
        definitions,
        base_names,
        changed_names,
        &schema,
        schema_changes,
        &NoopPerfLoggerEvent,
        None,
    );

    let mut texts = result
        .into_iter()
        .map(format_definition)
        .collect::<Vec<_>>();
    texts.sort();
    Ok(texts.join("\n\n"))
}

#[test]
fn client_edge_fragments_include_transitive_callers() {
    let schema = get_test_schema_with_extensions(
        r#"extend type User {
            best_friend: User @relay_resolver(import_path: "BestFriendResolver")
        }"#,
    );
    let source = r#"
        query ReadQuery { me { ...SharedA } }
        query ExecQuery { me { ...SharedA ...SharedB } }
        query OtherQuery { me { ...SharedB } }
        query UnrelatedQuery { me { name } }
        fragment SharedA on User { best_friend { name } }
        fragment SharedB on User { best_friend { name } }
    "#;
    assert_eq!(
        reachable_names_with_resolver_context(&schema, source, None),
        vec!["ReadQuery", "SharedA"],
    );
    assert_eq!(
        reachable_names_with_resolver_context(&schema, source, Some(&[])),
        vec!["ExecQuery", "OtherQuery", "ReadQuery", "SharedA", "SharedB"],
    );
}

#[test]
fn interface_client_edge_fragments_include_callers() {
    let schema = get_test_schema_with_extensions(
        r#"
        interface Cat { id: ID!, friend: User }
        extend type Query { cat: Cat }
        type Tabby implements Cat @__RelayResolverModel {
            id: ID!
            friend: User @relay_resolver(import_path: "TabbyResolver")
        }
        "#,
    );
    let source = r#"
        query ReadQuery { cat { ...SharedCat } }
        query ExecQuery { cat { ...SharedCat } }
        fragment SharedCat on Cat { friend { name } }
    "#;
    assert_eq!(
        reachable_names_with_resolver_context(&schema, source, Some(&[])),
        vec!["ExecQuery", "ReadQuery", "SharedCat"],
    );
}

#[test]
fn scalar_and_client_only_resolvers_do_not_expand_callers() {
    let schema = get_test_schema_with_extensions(
        r#"
        type ClientValue @__RelayResolverModel { id: ID!, name: String }
        extend type User {
            client_name: String @relay_resolver(import_path: "ClientNameResolver")
            client_value: ClientValue @relay_resolver(import_path: "ClientValueResolver")
        }
        "#,
    );
    let source = r#"
        query ReadQuery { me { ...Shared_user } }
        query ExecQuery { me { ...Shared_user } }
        fragment Shared_user on User { client_name client_value { name } }
    "#;
    assert_eq!(
        reachable_names_with_resolver_context(&schema, source, Some(&[])),
        vec!["ReadQuery", "Shared_user"],
    );
}

#[test]
fn removed_spreads_rebuild_client_edge_fragments_with_remaining_callers() {
    let schema = get_test_schema_with_extensions(
        r#"extend type User {
            best_friend: User @relay_resolver(import_path: "BestFriendResolver")
        }"#,
    );
    // `ReadQuery` used to spread `Wrapper` and `Plain`.
    let source = r#"
        query ReadQuery { me { name } }
        query WrapperQuery { me { ...Wrapper } }
        query SharedQuery { me { ...Shared } }
        query PlainQuery { me { ...Plain } }
        fragment Wrapper on User { ...Shared }
        fragment Shared on User { best_friend { name } }
        fragment Plain on User { name }
    "#;
    assert_eq!(
        reachable_names_with_resolver_context(&schema, source, None),
        vec!["ReadQuery"],
    );
    assert_eq!(
        reachable_names_with_resolver_context(&schema, source, Some(&["Wrapper", "Plain"])),
        vec![
            "Plain",
            "ReadQuery",
            "Shared",
            "SharedQuery",
            "Wrapper",
            "WrapperQuery"
        ],
    );
}

fn reachable_names_with_resolver_context(
    schema: &SDLSchema,
    source: &str,
    removed_spread_names: Option<&[&str]>,
) -> Vec<String> {
    let ast = parse_executable(source, SourceLocationKey::generated()).unwrap();
    let definitions = build(schema, &ast.definitions).unwrap();
    let mut names: Vec<_> = get_reachable_ir(
        definitions,
        Default::default(),
        FxHashSet::from_iter([OperationDefinitionName("ReadQuery".intern()).into()]),
        schema,
        Default::default(),
        &NoopPerfLoggerEvent,
        removed_spread_names.map(|names| {
            names
                .iter()
                .map(|name| FragmentDefinitionName(name.intern()).into())
                .collect()
        }),
    )
    .into_iter()
    .map(|definition| definition.name_with_location().item.to_string())
    .collect();
    names.sort();
    names
}
