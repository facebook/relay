/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::FeatureFlag;
use common::SourceLocationKey;
use fixture_tests::Fixture;
use graphql_ir::build;
use graphql_ir::Program;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use relay_test_schema::get_test_schema_with_extensions;
use relay_transforms::disallow_readtime_features_in_mutations;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split("%extensions%").collect();

    if let [base, extensions] = parts.as_slice() {
        let source_location = SourceLocationKey::standalone(fixture.file_name);
        let ast = parse_executable(base, source_location)
            .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;
        let schema = get_test_schema_with_extensions(extensions);

        let ir = build(&schema, &ast.definitions)
            .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;
        let program = Program::from_definitions(Arc::clone(&schema), ir);
        disallow_readtime_features_in_mutations(
            &program,
            &FeatureFlag::Disabled,
            &FeatureFlag::Disabled,
            false,
        )
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

        Ok("OK".to_owned())
    } else {
        panic!("Expected exactly one %extensions% section marker.")
    }
}
