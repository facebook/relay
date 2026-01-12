/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fs;
use std::path::PathBuf;

use relay_compiler::config::Config;
use tempfile::TempDir;

const TEST_SCHEMA: &str = r#"
type Query {
  node(id: ID!): Node
}

interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  name: String
}
"#;

/// Helper function to create a test directory structure
fn setup_test_dir() -> TempDir {
    TempDir::new().unwrap()
}

/// Helper function to create a file at the given path
fn create_file(base: &PathBuf, path: &str, content: &str) {
    let full_path = base.join(path);
    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent).unwrap();
    }
    fs::write(full_path, content).unwrap();
}

/// Helper function to create a directory at the given path
fn create_dir(base: &PathBuf, path: &str) {
    let full_path = base.join(path);
    fs::create_dir_all(full_path).unwrap();
}

#[test]
fn test_valid_config_with_all_paths_present() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create directory structure
    create_dir(&root, "src");
    create_dir(&root, "schema_extensions");
    create_file(&root, "schema.graphql", TEST_SCHEMA);

    // Create config
    let config_json = format!(
        r#"{{
            "sources": {{
                "src": "test_project"
            }},
            "projects": {{
                "test_project": {{
                    "schema": "schema.graphql",
                    "schemaExtensions": ["schema_extensions"],
                    "language": "javascript"
                }}
            }}
        }}"#
    );

    // This should succeed with all paths present
    let result = Config::from_string_for_test(&config_json);
    assert!(result.is_ok(), "Config should be valid when all paths exist");
}

#[test]
fn test_source_directory_does_not_exist() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create only schema, but not the source directory
    create_file(&root, "schema.graphql", TEST_SCHEMA);

    let config_json = r#"{
        "sources": {
            "nonexistent_src": "test_project"
        },
        "projects": {
            "test_project": {
                "schema": "schema.graphql",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(result.is_err(), "Config should fail when source directory does not exist");

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("does not exist") || err_msg.contains("not a directory"),
        "Error should mention that source does not exist or is not a directory. Got: {}",
        err_msg
    );
}

#[test]
fn test_schema_file_does_not_exist() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create source directory but not schema file
    create_dir(&root, "src");

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "projects": {
            "test_project": {
                "schema": "nonexistent_schema.graphql",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(result.is_err(), "Config should fail when schema file does not exist");

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("does not exist") || err_msg.contains("not a file"),
        "Error should mention that schema file does not exist or is not a file. Got: {}",
        err_msg
    );
}

#[test]
fn test_schema_file_is_directory() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create source directory and a directory instead of a schema file
    create_dir(&root, "src");
    create_dir(&root, "schema.graphql");

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "projects": {
            "test_project": {
                "schema": "schema.graphql",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(result.is_err(), "Config should fail when schema is a directory");

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("not a file"),
        "Error should mention that schema is not a file. Got: {}",
        err_msg
    );
}

#[test]
fn test_schema_directory_does_not_exist() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create source directory but not schema directory
    create_dir(&root, "src");

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "projects": {
            "test_project": {
                "schemaDir": "nonexistent_schema_dir",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(result.is_err(), "Config should fail when schema directory does not exist");

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("does not exist") || err_msg.contains("not a directory"),
        "Error should mention that schema directory does not exist or is not a directory. Got: {}",
        err_msg
    );
}

#[test]
fn test_schema_extension_directory_does_not_exist() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create source directory and schema file
    create_dir(&root, "src");
    create_file(&root, "schema.graphql", TEST_SCHEMA);

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "projects": {
            "test_project": {
                "schema": "schema.graphql",
                "schemaExtensions": ["nonexistent_extensions"],
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(
        result.is_err(),
        "Config should fail when schema extension directory does not exist"
    );

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("does not exist") || err_msg.contains("not a directory"),
        "Error should mention that schema extension does not exist or is not a directory. Got: {}",
        err_msg
    );
}

#[test]
fn test_excluded_source_directory() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create directory structure
    create_dir(&root, "node_modules");
    create_file(&root, "schema.graphql", TEST_SCHEMA);

    let config_json = r#"{
        "sources": {
            "node_modules": "test_project"
        },
        "excludes": ["**/node_modules/**"],
        "projects": {
            "test_project": {
                "schema": "schema.graphql",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(result.is_err(), "Config should fail when source matches exclude pattern");

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("exclude"),
        "Error should mention exclude pattern. Got: {}",
        err_msg
    );
}

#[test]
fn test_excluded_schema_file() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create directory structure
    create_dir(&root, "src");
    create_dir(&root, "__generated__");
    create_file(&root, "__generated__/schema.graphql", TEST_SCHEMA);

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "excludes": ["**/__generated__/**"],
        "projects": {
            "test_project": {
                "schema": "__generated__/schema.graphql",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(result.is_err(), "Config should fail when schema file matches exclude pattern");

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("exclude"),
        "Error should mention exclude pattern. Got: {}",
        err_msg
    );
}

#[test]
fn test_excluded_schema_extension_directory() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create directory structure
    create_dir(&root, "src");
    create_dir(&root, "__generated__/extensions");
    create_file(&root, "schema.graphql", TEST_SCHEMA);

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "excludes": ["**/__generated__/**"],
        "projects": {
            "test_project": {
                "schema": "schema.graphql",
                "schemaExtensions": ["__generated__/extensions"],
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(
        result.is_err(),
        "Config should fail when schema extension directory matches exclude pattern"
    );

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("exclude"),
        "Error should mention exclude pattern. Got: {}",
        err_msg
    );
}

#[test]
fn test_multiple_schema_extensions_with_one_invalid() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create directory structure with one valid and one invalid extension
    create_dir(&root, "src");
    create_dir(&root, "extensions_valid");
    create_file(&root, "schema.graphql", TEST_SCHEMA);

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "projects": {
            "test_project": {
                "schema": "schema.graphql",
                "schemaExtensions": ["extensions_valid", "extensions_invalid"],
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(
        result.is_err(),
        "Config should fail when one schema extension directory does not exist"
    );

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("does not exist") || err_msg.contains("not a directory"),
        "Error should mention that an extension does not exist or is not a directory. Got: {}",
        err_msg
    );
}

#[test]
fn test_source_directory_is_file() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create a file instead of a directory for source
    create_file(&root, "src", "This is a file, not a directory");
    create_file(&root, "schema.graphql", TEST_SCHEMA);

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "projects": {
            "test_project": {
                "schema": "schema.graphql",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(result.is_err(), "Config should fail when source is a file instead of directory");

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("not a directory"),
        "Error should mention that source is not a directory. Got: {}",
        err_msg
    );
}

#[test]
fn test_schema_extension_is_file() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create a file instead of a directory for schema extension
    create_dir(&root, "src");
    create_file(&root, "schema.graphql", TEST_SCHEMA);
    create_file(&root, "extensions", "This is a file, not a directory");

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "projects": {
            "test_project": {
                "schema": "schema.graphql",
                "schemaExtensions": ["extensions"],
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(
        result.is_err(),
        "Config should fail when schema extension is a file instead of directory"
    );

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("not a directory"),
        "Error should mention that extension is not a directory. Got: {}",
        err_msg
    );
}

#[test]
fn test_multi_project_config_with_mixed_valid_and_invalid_paths() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create structure for project1 (valid) but not project2 (invalid)
    create_dir(&root, "src1");
    create_file(&root, "schema1.graphql", TEST_SCHEMA);
    // Don't create src2 directory

    let config_json = r#"{
        "sources": {
            "src1": "project1",
            "src2": "project2"
        },
        "projects": {
            "project1": {
                "schema": "schema1.graphql",
                "language": "javascript"
            },
            "project2": {
                "schema": "schema2.graphql",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(
        result.is_err(),
        "Config should fail when any project has invalid paths"
    );

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("does not exist") || err_msg.contains("not a directory"),
        "Error should mention missing paths. Got: {}",
        err_msg
    );
}

#[test]
fn test_valid_schema_dir_instead_of_schema_file() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create directory structure with schema directory
    create_dir(&root, "src");
    create_dir(&root, "schema_dir");
    create_file(&root, "schema_dir/schema.graphql", TEST_SCHEMA);

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "projects": {
            "test_project": {
                "schemaDir": "schema_dir",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(result.is_ok(), "Config should be valid with schema directory");
}

#[test]
fn test_schema_dir_is_file() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create a file instead of a directory for schema_dir
    create_dir(&root, "src");
    create_file(&root, "schema_dir", "This is a file, not a directory");

    let config_json = r#"{
        "sources": {
            "src": "test_project"
        },
        "projects": {
            "test_project": {
                "schemaDir": "schema_dir",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(
        result.is_err(),
        "Config should fail when schema directory is a file"
    );

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("not a directory"),
        "Error should mention that schema directory is not a directory. Got: {}",
        err_msg
    );
}

#[test]
fn test_nested_directory_structures() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create nested directory structures
    create_dir(&root, "apps/app1/src");
    create_dir(&root, "apps/app1/schema_extensions");
    create_file(&root, "apps/app1/schema.graphql", TEST_SCHEMA);

    let config_json = r#"{
        "sources": {
            "apps/app1/src": "app1"
        },
        "projects": {
            "app1": {
                "schema": "apps/app1/schema.graphql",
                "schemaExtensions": ["apps/app1/schema_extensions"],
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(result.is_ok(), "Config should be valid with nested directories");
}

#[test]
fn test_custom_exclude_patterns() {
    let temp_dir = setup_test_dir();
    let root = temp_dir.path().to_path_buf();

    // Create directory structure
    create_dir(&root, "src");
    create_dir(&root, "test");
    create_file(&root, "schema.graphql", TEST_SCHEMA);

    let config_json = r#"{
        "sources": {
            "src": "test_project",
            "test": "test_project"
        },
        "excludes": ["**/test/**"],
        "projects": {
            "test_project": {
                "schema": "schema.graphql",
                "language": "javascript"
            }
        }
    }"#;

    let result = Config::from_string_for_test(config_json);
    assert!(
        result.is_err(),
        "Config should fail when source matches custom exclude pattern"
    );

    let err = result.unwrap_err();
    let err_msg = format!("{}", err);
    assert!(
        err_msg.contains("exclude"),
        "Error should mention exclude pattern. Got: {}",
        err_msg
    );
}
