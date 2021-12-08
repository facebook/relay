/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::SourceLocationKey;
use dependency_analyzer::*;
use fixture_tests::Fixture;
use fnv::FnvHashSet;
use graphql_ir::*;
use graphql_syntax::parse_executable;
use intern::string_key::Intern;
use relay_test_schema::{get_test_schema, get_test_schema_with_extensions};
use relay_transforms::DependencyMap;
use schema::SDLSchema;

fn format_definition(def: ExecutableDefinition) -> String {
    match def {
        ExecutableDefinition::Operation(operation) => format!("Operation: {}", operation.name.item),
        ExecutableDefinition::Fragment(fragment) => format!("Fragment: {}", fragment.name.item),
    }
}

/// Extract an ImplicitDependnecyMap from a multiline string of the format:
///     parent_a --> child_a
///     parent_b --> child_c, child_d
fn parse_dependencies(src: &str) -> DependencyMap {
    let mut dependency_map: DependencyMap = Default::default();
    for line in src.trim().split('\n').collect::<Vec<_>>() {
        let segments = line.split(" --> ").collect::<Vec<_>>();
        match segments.as_slice() {
            [parent, children_str] => {
                let mut children = FnvHashSet::default();
                for child in children_str.split(", ") {
                    children.insert(child.intern());
                }
                dependency_map.insert(parent.intern(), children);
            }
            _ => panic!(
                "Expected dependency section to be of the from \"parent --> child_a, child_b\""
            ),
        }
    }

    dependency_map
}

// TODO: Test without using snapshot tests
pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts = fixture.content.split("%extensions%").collect::<Vec<_>>();

    let (content, schema): (&str, Arc<SDLSchema>) = match parts.as_slice() {
        [content] => (content, get_test_schema()),
        [content, extension_content] => {
            (content, get_test_schema_with_extensions(extension_content))
        }
        _ => panic!("Expected one optional \"%extensions%\" section in the fxiture."),
    };

    let parts = content.split("%dependencies%").collect::<Vec<_>>();

    let (content, implicit_dependencies): (&str, DependencyMap) = match parts.as_slice() {
        [content] => (content, Default::default()),
        [content, depenedency_content] => (content, parse_dependencies(depenedency_content)),
        _ => panic!("Expected one optional \"%dependencies%\" section in the fxiture."),
    };
    let parts: Vec<&str> = content.split("%definitions%").collect();
    let first_line: &str = content.lines().next().unwrap();

    let changed_names = first_line[1..]
        .trim()
        .split(',')
        .map(|name| name.trim())
        .filter(|name| !name.is_empty())
        .map(|name| name.intern())
        .collect();

    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let mut asts = parse_executable(parts[0], source_location)
        .unwrap()
        .definitions;
    let mut base_names = FnvHashSet::default();
    for part in parts.iter().skip(1) {
        let defs = parse_executable(part, source_location).unwrap().definitions;
        for def in defs {
            base_names.insert(match &def {
                graphql_syntax::ExecutableDefinition::Operation(node) => {
                    node.name.clone().unwrap().value
                }
                graphql_syntax::ExecutableDefinition::Fragment(node) => node.name.value,
            });
            asts.push(def);
        }
    }

    let definitions = build(&schema, &asts).unwrap();
    let result = get_reachable_ir(
        definitions,
        base_names,
        changed_names,
        &implicit_dependencies,
        &schema,
    );

    let mut texts = result
        .into_iter()
        .map(format_definition)
        .collect::<Vec<_>>();
    texts.sort();
    Ok(texts.join("\n\n"))
}
