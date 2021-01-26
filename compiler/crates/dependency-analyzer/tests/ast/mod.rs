/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use dependency_analyzer::{get_reachable_ast, ReachableAst};
use fixture_tests::Fixture;
use graphql_syntax::*;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<&str> = fixture.content.split("%definitions%").collect();

    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let definitions = parse_executable(parts[0], source_location).unwrap();
    let base_definitions = parts
        .iter()
        .skip(1)
        .flat_map(|part| parse_executable(part, source_location).unwrap().definitions)
        .collect();
    let ReachableAst {
        definitions: result,
        base_fragment_names,
    } = get_reachable_ast(definitions.definitions, base_definitions);

    let mut texts = result
        .into_iter()
        .map(|def| def.name().unwrap().to_string())
        .collect::<Vec<_>>();
    texts.sort_unstable();
    texts.push("========== Base definitions ==========".to_string());
    let mut defs = base_fragment_names
        .iter()
        .map(|key| key.lookup())
        .collect::<Vec<_>>();
    defs.sort_unstable();
    texts.push(defs.join(", "));
    Ok(texts.join("\n"))
}
