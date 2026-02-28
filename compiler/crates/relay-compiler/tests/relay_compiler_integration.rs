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
use graphql_test_helpers::FileChange;
use graphql_test_helpers::ProjectFixture;
use relay_compiler::File;
use relay_compiler::FileSourceKind;
use relay_compiler::FileSourceResult;
use relay_compiler::InMemoryVfs;
use relay_compiler::LocalPersister;
use relay_compiler::OperationPersister;
use relay_compiler::RemotePersister;
use relay_compiler::Vfs;
use relay_compiler::VfsSourceReader;
use relay_compiler::WalkDirFileSourceResult;
use relay_compiler::build_project::generate_extra_artifacts::default_generate_extra_artifacts_fn;
use relay_compiler::compiler::Compiler;
use relay_compiler::config::Config;
use relay_compiler::errors::Error;
use relay_config::PersistConfig;

/// The virtual root used for all VFS-based tests.
const VIRTUAL_ROOT: &str = "/virtual/root";

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let project_fixture = ProjectFixture::deserialize(fixture.content);

    if project_fixture.file_changes().is_empty() {
        return transform_project_fixture(&project_fixture).await;
    }

    let incremental_result = transform_project_fixture(&project_fixture).await;
    let full_result = transform_project_fixture(&project_fixture.with_file_changes_applied()).await;

    if incremental_result == full_result {
        return incremental_result;
    }

    let incremental_string = match incremental_result {
        Ok(incremental_result) => incremental_result,
        Err(incremental_error) => incremental_error,
    };
    let full_string = match full_result {
        Ok(full_result) => full_result,
        Err(full_error) => full_error,
    };

    Err(format!(
        "INCREMENTAL COMPILATION BUG DETECTED!\n\nIncremental and full results differ!\n\nIncremental:\n{}\n\nFull:\n{}\n",
        incremental_string, full_string
    ))
}

/// Populate an InMemoryVfs from a ProjectFixture's initial files.
fn write_fixture_to_vfs(fixture: &ProjectFixture, vfs: &InMemoryVfs, root: &Path) {
    for (file_name, content) in fixture.files() {
        let file_path = normalize_vfs_path(&root.join(file_name));
        vfs.add_file(file_path, content.as_bytes().to_vec());
    }
}

/// Apply file changes from a ProjectFixture to an InMemoryVfs.
fn flush_file_changes_to_vfs(fixture: &ProjectFixture, vfs: &InMemoryVfs, root: &Path) {
    for (file_name, change) in fixture.file_changes() {
        let file_path = normalize_vfs_path(&root.join(file_name));
        match change {
            FileChange::Change(content) => {
                vfs.add_file(file_path, content.as_bytes().to_vec());
            }
            FileChange::Delete => {
                vfs.remove_file(&file_path).expect("Failed to remove file");
            }
        }
    }
}

/// Normalize a path by resolving `.` and `..` components lexically.
fn normalize_vfs_path(path: &Path) -> PathBuf {
    let mut result = PathBuf::new();
    for component in path.components() {
        match component {
            std::path::Component::CurDir => {}
            std::path::Component::ParentDir => {
                result.pop();
            }
            other => result.push(other),
        }
    }
    result
}

/// Build a ProjectFixture from the current VFS state for diffing.
fn read_fixture_from_vfs(vfs: &InMemoryVfs, root: &Path) -> ProjectFixture {
    let snapshot = vfs.snapshot();
    let mut files = fnv::FnvHashMap::default();
    for (path, content) in snapshot {
        if let Ok(relative) = path.strip_prefix(root) {
            if let Ok(s) = String::from_utf8(content) {
                files.insert(relative.to_path_buf(), s);
            }
        }
    }
    ProjectFixture::from_files(files)
}

/// Extract the relay config JSON content from a project fixture.
/// Looks for `relay.config.json` in the fixture files.
fn extract_config_string(fixture: &ProjectFixture) -> Option<String> {
    fixture
        .files()
        .get(Path::new("relay.config.json"))
        .cloned()
}

/// Given a file system state run the compiler and return the compiler output.
///
/// If there are file changes in the ProjectFixture, an initial build will be
/// done followed by an incremental build with the file changes applied.
pub async fn transform_project_fixture(project_fixture: &ProjectFixture) -> Result<String, String> {
    let has_file_changes = !project_fixture.file_changes().is_empty();
    let root = PathBuf::from(VIRTUAL_ROOT);

    // Create and populate VFS
    let vfs = Arc::new(InMemoryVfs::new());
    write_fixture_to_vfs(project_fixture, &vfs, &root);

    // Build config from the relay.config.json in the fixture
    let config_string = extract_config_string(project_fixture)
        .expect("Test fixture must contain relay.config.json");

    let config = match Config::from_string_for_test_with_vfs(
        &config_string,
        vfs.clone() as Arc<dyn Vfs>,
    ) {
        Ok(config) => config,
        Err(config_error) => {
            return Ok(format_compiler_error(&root, config_error, &vfs));
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
                // Write file changes to VFS
                flush_file_changes_to_vfs(project_fixture, &vfs, &root);

                // Build the list of changed files for the compiler
                let changed_files: Vec<File> = project_fixture
                    .file_changes()
                    .iter()
                    .map(|(path, change)| File {
                        name: path.clone(),
                        exists: match change {
                            FileChange::Change(_) => true,
                            FileChange::Delete => false,
                        },
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
                        Ok(format_successful_output(&root, &vfs, project_fixture, &state))
                    }
                    Err(compiler_error) => {
                        Ok(format_compiler_error(&root, compiler_error, &vfs))
                    }
                }
            } else {
                Ok(format_successful_output(&root, &vfs, project_fixture, &state))
            }
        }
        Err(compiler_error) => {
            let error_string = format_compiler_error(&root, compiler_error, &vfs);
            if has_file_changes {
                panic!(
                    "Invalid incremental test fixutre. Test fixtures with file changes must compile successfully in the initial build. Errored with:\n\n{}",
                    error_string
                );
            }
            Ok(error_string)
        }
    }
}

fn configure_test_config(mut config: Config) -> Config {
    config.file_source_config = FileSourceKind::WalkDir;
    config.has_schema_change_incremental_build = true;
    let vfs = config.vfs.clone();
    config.create_operation_persister = Some(Box::new(move |project_config| {
        let vfs = vfs.clone();
        project_config.persist.as_ref().map(
            move |persist_config| -> Box<dyn OperationPersister + Send + Sync> {
                match persist_config {
                    PersistConfig::Remote(remote_config) => {
                        Box::new(RemotePersister::new(remote_config.clone()))
                    }
                    PersistConfig::Local(local_config) => {
                        Box::new(LocalPersister::new(local_config.clone(), vfs.clone()))
                    }
                }
            },
        )
    }));
    config.generate_extra_artifacts = Some(Box::new(default_generate_extra_artifacts_fn));
    config
}

fn format_successful_output(
    root: &Path,
    vfs: &InMemoryVfs,
    project_fixture: &ProjectFixture,
    state: &relay_compiler::compiler_state::CompilerState,
) -> String {
    // Get the effective input state (initial files with any file changes applied)
    let effective_input = project_fixture.with_file_changes_applied();

    // Read the current VFS state as a ProjectFixture and diff against the effective input
    let current = read_fixture_from_vfs(vfs, root);
    let diff = effective_input.with_changes_from_fixture(&current);

    let mut expected = diff
        .serialize_changes()
        .replace(&format!("{}generated", '@'), "<auto-generated>");

    expected.push_str(&format!("\n\nArtifact Map:\n{:?}", state.artifacts));
    expected
}

fn format_compiler_error(root_dir: &Path, error: Error, vfs: &Arc<InMemoryVfs>) -> String {
    let source_reader = Box::new(VfsSourceReader {
        vfs: vfs.clone() as Arc<dyn Vfs>,
    });
    let output = relay_compiler::errors::print_compiler_error_with_source_reader(
        root_dir,
        error,
        source_reader,
    );
    // Replace the test directory path with a placeholder for deterministic test output
    let output = output.replace(root_dir.to_str().unwrap(), "<TEST_DIR>");
    // Normalize path separators for cross-platform consistency
    output.replace('\\', "/")
}
