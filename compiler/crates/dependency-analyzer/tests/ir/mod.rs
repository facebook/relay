/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use dependency_analyzer::*;
use fixture_tests::Fixture;
use fnv::FnvHashSet;
use graphql_ir::*;
use graphql_syntax::parse_executable;
use interner::Intern;
use relay_test_schema::TEST_SCHEMA;

fn format_definition(def: ExecutableDefinition) -> String {
    match def {
        ExecutableDefinition::Operation(operation) => format!("Operation: {}", operation.name.item),
        ExecutableDefinition::Fragment(fragment) => format!("Fragment: {}", fragment.name.item),
    }
}

// TODO: Test without using snapshot tests
pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<&str> = fixture.content.split("%definitions%").collect();
    let first_line: &str = fixture.content.lines().next().unwrap();

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

    let definitions = build(&TEST_SCHEMA, &asts).unwrap();
    let result = get_reachable_ir(definitions, base_names, changed_names);

    let mut texts = result
        .into_iter()
        .map(format_definition)
        .collect::<Vec<_>>();
    texts.sort();
    Ok(texts.join("\n\n"))
}
