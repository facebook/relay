/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fs;
use std::path::PathBuf;

use fixture_tests::Fixture;
use graphql_test_helpers::ProjectFixture;
use graphql_test_helpers::TestDir;
use relay_compiler::FileSourceKind;
use relay_compiler::config::Config;
use relay_compiler::subschema_extraction::compile_and_extract_subschema;

/// The fixture format for subschema extraction tests:
///
/// ```text
/// //- src/query.js
/// graphql`
///   query FooQuery {
///     me { name }
///   }
/// `;
///
/// //- relay.config.json
/// {
///   "language": "typescript",
///   "schema": "./schema.graphql"
/// }
///
/// //- schema.graphql
/// type Query { _: ID }
///
/// //- full_schema.graphql
/// type Query { me: User, other: User }
/// type User { name: String, age: Int }
/// ```
///
/// The test uses a well-known file `full_schema.graphql` as the source schema
/// from which to extract the subschema.
///
/// The test will:
/// 1. Parse the fixture and write files to a temp directory
/// 2. Load the Relay config
/// 3. Call the shared compile_and_extract_subschema function
/// 4. Return the extracted schema content
pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let project_fixture = ProjectFixture::deserialize(fixture.content);

    let test_dir = TestDir::new();

    // Write all files to disk
    project_fixture.write_to_dir(test_dir.path());

    // Well-known full schema file name
    let full_schema_path = PathBuf::from("full_schema.graphql");

    let original_cwd = std::env::current_dir().expect("Could not get cwd");

    std::env::set_current_dir(test_dir.path()).expect("Could not set cwd");

    let run_future = async {
        // Load the config
        let mut config =
            Config::search(&PathBuf::from(test_dir.path())).map_err(|e| format!("{:#}", e))?;

        config.file_source_config = FileSourceKind::WalkDir;

        // Use the shared function to compile and extract subschema
        let result = compile_and_extract_subschema(config, &full_schema_path)
            .await
            .map_err(|e| format!("{:#}", e))?;

        // Write the subschema to the original location
        let output_path = test_dir.path().join(&result.original_schema_path);
        fs::write(&output_path, &result.schema_content)
            .map_err(|e| format!("Failed to write subschema: {:#}", e))?;

        // Return the extracted subschema content
        Ok(result.schema_content)
    };

    let result = match std::panic::AssertUnwindSafe(futures_util::FutureExt::catch_unwind(
        std::panic::AssertUnwindSafe(run_future),
    ))
    .await
    {
        Err(panic_err) => {
            std::env::set_current_dir(original_cwd)
                .expect("Could set cwd (while handling panic from test)");
            std::panic::resume_unwind(panic_err)
        }
        Ok(ok) => ok,
    };

    std::env::set_current_dir(original_cwd).expect("Could set cwd");

    result
}
