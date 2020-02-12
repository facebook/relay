/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use dependency_analyzer::get_reachable_ast;
use fixture_tests::Fixture;
use graphql_syntax::*;

fn format_definition(def: ExecutableDefinition) -> String {
    match def {
        ExecutableDefinition::Operation(operation) => {
            format!("Operation: {}", operation.name.unwrap().value)
        }
        ExecutableDefinition::Fragment(fragment) => format!("Fragment: {}", fragment.name.value),
    }
}

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    let parts: Vec<&str> = fixture.content.split("%definitions%").collect();

    let definitions = parse(parts[0], fixture.file_name).unwrap();
    let base_definitions = parts
        .iter()
        .skip(1)
        .map(|part| parse(part, fixture.file_name).unwrap().definitions)
        .collect();
    let (result, base_definitions) = get_reachable_ast(definitions.definitions, base_definitions)?;

    let mut texts = result
        .into_iter()
        .map(|x| format_definition(x))
        .collect::<Vec<_>>();
    texts.sort_unstable();
    texts.push("========== Base definitions ==========".to_string());
    let mut defs = base_definitions
        .iter()
        .map(|key| key.lookup())
        .collect::<Vec<_>>();
    defs.sort_unstable();
    texts.push(defs.join(", "));
    Ok(texts.join("\n\n"))
}
