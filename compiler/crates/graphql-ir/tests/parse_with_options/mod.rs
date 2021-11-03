/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{FeatureFlag, SourceLocationKey};
use fixture_tests::Fixture;
use fnv::FnvHashMap;
use graphql_cli::DiagnosticPrinter;
use graphql_ir::{
    build_ir_with_extra_features, BuilderOptions, FragmentVariablesSemantic, RelayMode,
};
use graphql_syntax::{parse_executable_with_features, ParserFeatures};
use indexmap::IndexSet;
use interner::StringKey;
use relay_test_schema::TEST_SCHEMA;
use std::str::FromStr;

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let source_location = SourceLocationKey::standalone(fixture.file_name);
    let features = ParserFeatures {
        enable_variable_definitions: true,
    };
    let ast = parse_executable_with_features(fixture.content, source_location, features).unwrap();
    let mut sources = FnvHashMap::default();
    sources.insert(source_location, fixture.content);


    let mut allowed_argnames = IndexSet::new();
    allowed_argnames.insert(StringKey::from_str("arg_with_enabled_provider0").unwrap());
    allowed_argnames.insert(StringKey::from_str("arg_with_enabled_provider1").unwrap());

    let enable_provided_variables = FeatureFlag::Limited {
        allowlist: allowed_argnames,
    };
    let builder_options = BuilderOptions {
        allow_undefined_fragment_spreads: false,
        fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
        relay_mode: Some(RelayMode {
            enable_provided_variables: &enable_provided_variables,
        }),
        default_anonymous_operation_name: None,
    };

    build_ir_with_extra_features(&TEST_SCHEMA, &ast.definitions, &builder_options)
        .map(|x| format!("{:#?}", x))
        .map_err(|errors| {
            errors
                .into_iter()
                .map(|error| {
                    let printer = DiagnosticPrinter::new(|_| Some(fixture.content.to_string()));
                    printer.diagnostic_to_string(&error)
                })
                .collect::<Vec<_>>()
                .join("\n\n")
        })
}
