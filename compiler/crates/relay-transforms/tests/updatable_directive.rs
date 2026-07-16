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
use graphql_ir::Program;
use graphql_ir::build;
use graphql_syntax::parse_executable;
use graphql_test_helpers::diagnostics_to_sorted_string;
use relay_test_schema::get_test_schema;
use relay_test_schema::get_test_schema_with_extensions;
use relay_transforms::validate_updatable_directive;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);

    let mut parts = fixture.content.split("%extensions%");
    let base = parts.next().expect("Pre-extension content required");
    let maybe_extensions = parts.next();
    let schema = if let Some(extensions) = maybe_extensions {
        get_test_schema_with_extensions(extensions)
    } else {
        get_test_schema()
    };

    let ast = parse_executable(base, source_location).unwrap();
    let ir_result = build(&schema, &ast.definitions);
    let ir = ir_result
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let program = Program::from_definitions(Arc::clone(&schema), ir);
    // Keep this feature enabled by default in this fixture suite so the existing
    // fixtures continue to exercise the intended final behavior. The production
    // feature flag remains disabled by default for gradual rollout.
    let feature_flag = match fixture.file_name {
        "typename-discriminated-unions-disabled.invalid.graphql" => FeatureFlag::Disabled,
        _ => FeatureFlag::Enabled,
    };
    validate_updatable_directive(&program, &feature_flag)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    Ok("OK".to_owned())
}
