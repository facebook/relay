/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::Program;
use graphql_ir::Validator;
use graphql_ir::build;
use graphql_ir::reexport::string_key::Lookup;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use relay_test_schema::TEST_SCHEMA;
use relay_transforms::ValidateUnusedVariables;
use relay_transforms::VariableMapEntry;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let ast = parse_executable(fixture.content, source_location).unwrap();
    let ir = build(&TEST_SCHEMA, &ast.definitions)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let program = Program::from_definitions(Arc::clone(&TEST_SCHEMA), ir);
    let mut validator = ValidateUnusedVariables::new(&program);
    let result = validator.validate_program(&program);
    result.map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    // If we didn't error, print out the state of the fragment cache so we can
    // validate which entries get populated.
    let mut lines = validator
        .visitor
        .visited_fragments
        .iter()
        .map(|(name, variables_entry)| match variables_entry {
            VariableMapEntry::Pending => format!("{} -> PENDING", name),
            VariableMapEntry::Populated(variables) => {
                let mut variables_string = variables
                    .keys()
                    .map(|key| key.0.lookup())
                    .collect::<Vec<_>>();

                variables_string.sort();

                format!("{} -> POPULATED ({:?})", name, variables_string.join(", "))
            }
        })
        .collect::<Vec<_>>();

    lines.sort();

    if lines.is_empty() {
        Ok("OK.\n\nNo Cached Fragments.".to_string())
    } else {
        Ok(format!("OK.\n\nCached Fragments:\n{}", lines.join("\n")))
    }
}
