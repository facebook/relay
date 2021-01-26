/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use js_config_loader::{search, ConfigError, ErrorCode};
use serde::Deserialize;
use std::fs::create_dir_all;
use tempfile::tempdir;

#[derive(Debug, Deserialize)]
struct TestConfig {
    name: String,
}

#[test]
fn package_json_and_rc_same_dir() {
    let dir = tempdir().unwrap();
    let dir_d = dir.path().join("a/b/c/d");
    let dir_f = dir.path().join("a/b/c/d/e/f");
    create_dir_all(&dir_f).unwrap();

    std::fs::write(dir_d.join("package.json"), r#"{ "false": "hope" }"#).unwrap();
    std::fs::write(dir_d.join(".foorc"), r#"{ "name": "correct" }"#).unwrap();

    let config = search::<TestConfig>("foo", &dir_f).unwrap().unwrap();
    assert_eq!(config.value.name, "correct");
}

#[test]
fn rc_json_invalid_syntax() {
    let dir = tempdir().unwrap();
    let dir_d = dir.path().join("a/b/c/d");
    let dir_f = dir.path().join("a/b/c/d/e/f");
    create_dir_all(&dir_f).unwrap();

    std::fs::write(dir_d.join(".foorc"), "invalid").unwrap();

    match search::<TestConfig>("foo", &dir_f) {
        Err(ConfigError {
            code: ErrorCode::JsonParseError { error },
            path,
        }) => {
            assert!(error.is_syntax());
            assert_eq!(path.file_name().unwrap(), ".foorc");
        }
        other => {
            panic!("unexpected value: {:?}", other);
        }
    }
}

#[test]
fn package_json() {
    let dir = tempdir().unwrap();
    let dir_d = dir.path().join("a/b/c/d");
    let dir_f = dir.path().join("a/b/c/d/e/f");
    create_dir_all(&dir_f).unwrap();

    std::fs::write(
        dir_d.join("package.json"),
        r#"
            {
                "foo": { "name": "correct" }
            }
        "#,
    )
    .unwrap();
    std::fs::write(dir_d.join(".foorc"), r#"{ "name": "wrong" }"#).unwrap();

    let config = search::<TestConfig>("foo", &dir_f).unwrap().unwrap();
    assert_eq!(config.value.name, "correct");
}

#[test]
fn package_json_invalid_syntax() {
    let dir = tempdir().unwrap();
    let dir_d = dir.path().join("a/b/c/d");
    let dir_f = dir.path().join("a/b/c/d/e/f");
    create_dir_all(&dir_f).unwrap();

    std::fs::write(dir_d.join("package.json"), "invalid").unwrap();
    std::fs::write(dir_d.join(".foorc"), r#"{ "name": "wrong" }"#).unwrap();

    match search::<TestConfig>("foo", &dir_f).unwrap_err() {
        ConfigError {
            path: _,
            code: ErrorCode::PackageJsonParseError { error },
        } => {
            assert!(error.is_syntax());
        }
        other => panic!("incorrect error: {:?}", other),
    }
}

#[test]
fn package_json_invalid_format() {
    let dir = tempdir().unwrap();
    let dir_d = dir.path().join("a/b/c/d");
    let dir_f = dir.path().join("a/b/c/d/e/f");
    create_dir_all(&dir_f).unwrap();

    std::fs::write(
        dir_d.join("package.json"),
        r#"
            {
                "foo": { "incorrect": 1 }
            }
        "#,
    )
    .unwrap();
    std::fs::write(dir_d.join(".foorc"), r#"{ "name": "wrong" }"#).unwrap();

    match search::<TestConfig>("foo", &dir_f).unwrap_err() {
        ConfigError {
            path: _,
            code: ErrorCode::PackageJsonInvalidValue { key, error },
        } => {
            assert_eq!(key, "foo");
            assert!(error.is_data());
        }
        other => panic!("incorrect error: {:?}", other),
    }
}

#[test]
fn config_js() {
    let dir = tempdir().unwrap();
    let dir_d = dir.path().join("a/b/c/d");
    let dir_f = dir.path().join("a/b/c/d/e/f");
    create_dir_all(&dir_f).unwrap();

    std::fs::write(
        dir_d.join("foo.config.js"),
        r#"
        module.exports = { name: "correct" };
        "#,
    )
    .unwrap();

    let config = search::<TestConfig>("foo", &dir_f).unwrap().unwrap();
    assert_eq!(config.value.name, "correct");
}

#[test]
fn config_js_invalid_js() {
    let dir = tempdir().unwrap();
    let dir_d = dir.path().join("a/b/c/d");
    let dir_f = dir.path().join("a/b/c/d/e/f");
    create_dir_all(&dir_f).unwrap();

    std::fs::write(
        dir_d.join("foo.config.js"),
        r#"
        module.exports = foo();
        "#,
    )
    .unwrap();

    match search::<TestConfig>("foo", &dir_f).unwrap_err() {
        ConfigError {
            code: ErrorCode::NodeExecuteError { output: _ },
            path,
        } => {
            assert_eq!(path.file_name().unwrap(), "foo.config.js");
        }
        other => panic!("incorrect error: {:?}", other),
    }
}

#[test]
fn unsupported_file() {
    let dir = tempdir().unwrap();
    let dir_d = dir.path().join("a/b/c/d");
    let dir_f = dir.path().join("a/b/c/d/e/f");
    create_dir_all(&dir_f).unwrap();

    std::fs::write(dir_d.join(".foorc.yaml"), "name: correct").unwrap();

    match search::<TestConfig>("foo", &dir_f).unwrap_err() {
        ConfigError {
            code: ErrorCode::YamlFileUnsupported,
            path,
        } => {
            assert_eq!(path.file_name().unwrap(), ".foorc.yaml");
        }
        other => panic!("incorrect error: {:?}", other),
    }
}
