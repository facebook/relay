/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use dependency_analyzer::*;
use fixture_tests::Fixture;
use fnv::FnvHashSet;
use graphql_ir::*;
use graphql_syntax::parse;
use interner::Intern;
use test_schema::TEST_SCHEMA;

fn format_definition(def: ExecutableDefinition) -> String {
    match def {
        ExecutableDefinition::Operation(operation) => format!("Operation: {}", operation.name.item),
        ExecutableDefinition::Fragment(fragment) => format!("Fragment: {}", fragment.name.item),
    }
}

// TODO: Test without using snapshot tests
pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let parts: Vec<&str> = fixture.content.split("%definitions%").collect();
    let first_line: &str = fixture.content.lines().next().unwrap();

    let changed_names = first_line[1..]
        .trim()
        .split(",")
        .map(|name| name.trim())
        .filter(|name| !name.is_empty())
        .map(|name| name.intern())
        .collect();

    let mut asts = parse(parts[0], fixture.file_name).unwrap().definitions;
    let mut base_names = FnvHashSet::default();
    for part in parts.iter().skip(1) {
        let defs = parse(part, fixture.file_name).unwrap().definitions;
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
        .map(|x| format_definition(x))
        .collect::<Vec<_>>();
    texts.sort();
    Ok(texts.join("\n\n"))
}
