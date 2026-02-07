/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;

use common::ConsoleLogger;
use fixture_tests::Fixture;
use futures_util::FutureExt;
use graphql_test_helpers::ProjectFixture;
use graphql_test_helpers::TestDir;
use relay_compiler::File;
use relay_compiler::FileSourceKind;
use relay_compiler::FileSourceResult;
use relay_compiler::LocalPersister;
use relay_compiler::OperationPersister;
use relay_compiler::RemotePersister;
use relay_compiler::WalkDirFileSourceResult;
use relay_compiler::build_project::generate_extra_artifacts::default_generate_extra_artifacts_fn;
use relay_compiler::compiler::Compiler;
use relay_compiler::config::Config;
use relay_compiler::errors::Error;
use relay_compiler::print_compiler_error;
use relay_config::PersistConfig;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let project_fixture = ProjectFixture::deserialize(fixture.content);
    let has_file_changes = !project_fixture.file_changes().is_empty();

    let test_dir = TestDir::new();

    project_fixture.write_to_dir(test_dir.path());

    let original_cwd = std::env::current_dir().expect("Could not get cwd");

    std::env::set_current_dir(test_dir.path()).expect("Could not set cwd");

    let run_future = async {
        let config = match Config::search(&PathBuf::from(test_dir.path())) {
            Ok(config) => config,
            Err(config_error) => {
                return format_compiler_error(test_dir.path(), config_error);
            }
        };

        let config = configure_test_config(config);
        let config = Arc::new(config);

        let compiler = Compiler::new(Arc::clone(&config), Arc::new(ConsoleLogger));
        let compiler_result = compiler.compile().await;

        match compiler_result {
            Ok(mut state) => {
                // If there are file changes, apply them and do an incremental rebuild
                if has_file_changes {
                    // Write file changes to disk
                    project_fixture.flush_file_changes_to_dir(test_dir.path());

                    // Build the list of changed files for the compiler
                    let changed_files: Vec<File> = project_fixture
                        .file_changes()
                        .keys()
                        .map(|path| File {
                            name: path.clone(),
                            exists: true,
                        })
                        .collect();

                    // Push file changes to compiler state
                    state.pending_file_source_changes.write().unwrap().push(
                        FileSourceResult::WalkDir(WalkDirFileSourceResult {
                            files: changed_files,
                            resolved_root: config.root_dir.clone(),
                        }),
                    );

                    // Do incremental build
                    let incremental_result = compiler.build_with_changed_files(&mut state).await;

                    match incremental_result {
                        Ok(()) => {
                            format_successful_output(test_dir.path(), &project_fixture, &state)
                        }
                        Err(compiler_error) => {
                            format_compiler_error(test_dir.path(), compiler_error)
                        }
                    }
                } else {
                    format_successful_output(test_dir.path(), &project_fixture, &state)
                }
            }
            Err(compiler_error) => format_compiler_error(test_dir.path(), compiler_error),
        }
    };

    let result = match std::panic::AssertUnwindSafe(run_future)
        .catch_unwind()
        .await
    {
        Err(panic_err) => {
            std::env::set_current_dir(original_cwd)
                .expect("Could set cwd (while handling panic from test)");
            std::panic::resume_unwind(panic_err)
        }
        Ok(ok) => Ok(ok),
    };

    std::env::set_current_dir(original_cwd).expect("Could set cwd");

    result
}

fn configure_test_config(mut config: Config) -> Config {
    config.file_source_config = FileSourceKind::WalkDir;
    config.has_schema_change_incremental_build = true;
    config.create_operation_persister = Some(Box::new(|project_config| {
        project_config.persist.as_ref().map(
            |persist_config| -> Box<dyn OperationPersister + Send + Sync> {
                match persist_config {
                    PersistConfig::Remote(remote_config) => {
                        Box::new(RemotePersister::new(remote_config.clone()))
                    }
                    PersistConfig::Local(local_config) => {
                        Box::new(LocalPersister::new(local_config.clone()))
                    }
                }
            },
        )
    }));
    config.generate_extra_artifacts = Some(Box::new(default_generate_extra_artifacts_fn));
    config
}

fn format_successful_output(
    test_dir: &Path,
    project_fixture: &ProjectFixture,
    state: &relay_compiler::compiler_state::CompilerState,
) -> String {
    let mut output = ProjectFixture::read_from_dir(test_dir);

    // Omit the input files from the output
    output.remove_files_by_keys(project_fixture.files().keys());
    output.remove_files_by_keys(project_fixture.file_changes().keys());

    let mut expected = output
        .serialize()
        // Jump through a few hoops to avoid having at-generated in either this
        // file or our generated `.expected` files, since that would confuse other
        // tools.
        .replace(&format!("{}generated", '@'), "<auto-generated>");

    expected.push_str(&format!("\n\nArtifact Map:\n{:?}", state.artifacts));
    expected
}

fn format_compiler_error(root_dir: &Path, error: Error) -> String {
    let output = print_compiler_error(root_dir, error);
    // Replace the test directory path with a placeholder for deterministic test output
    // On Windows, paths use backslashes, so we first replace the root directory,
    // then normalize all remaining backslashes to forward slashes for consistent output
    let output = output.replace(root_dir.to_str().unwrap(), "<TEST_DIR>");
    // Normalize path separators for cross-platform consistency
    output.replace('\\', "/")
}
