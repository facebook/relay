/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::SourceLocationKey;
use dependency_analyzer::*;
use fixture_tests::Fixture;
use graphql_ir::*;
use graphql_syntax::parse_executable;
use intern::string_key::Intern;
use relay_test_schema::get_test_schema;
use relay_test_schema::get_test_schema_with_extensions;
use schema::SDLSchema;

fn format_definition(def: ExecutableDefinition) -> String {
    match def {
        ExecutableDefinition::Operation(operation) => {
            format!("Operation: {}", operation.name.item)
        }
        ExecutableDefinition::Fragment(fragment) => format!("Fragment: {}", fragment.name.item),
    }
}

// TODO: Test without using snapshot tests
pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts = fixture.content.split("%extensions%").collect::<Vec<_>>();

    let (content, schema): (&str, Arc<SDLSchema>) = match parts.as_slice() {
        [content] => (content, get_test_schema()),
        [content, extension_content] => {
            (content, get_test_schema_with_extensions(extension_content))
        }
        _ => panic!("Expected one optional \"%extensions%\" section in the fxiture."),
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
    let result = get_reachable_ir(definitions, base_names, changed_names, &schema);

    let mut texts = result
        .into_iter()
        .map(format_definition)
        .collect::<Vec<_>>();
    texts.sort();
    Ok(texts.join("\n\n"))
}
