/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;
use std::process::Output;

use thiserror::Error;

/// Fixed set of validation errors with custom display messages
#[derive(Debug)]
pub struct ConfigError {
    pub path: PathBuf,
    pub code: ErrorCode,
}
impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Invalid config file: {:?}: {}", &self.path, &self.code)
    }
}

#[derive(Debug, Error)]
pub enum ErrorCode {
    #[error("Error parsing package.json: {error}")]
    PackageJsonParseError { error: serde_json::Error },

    #[error("Found key `{key}` in package.json, but failed incorrect value: {error}")]
    PackageJsonInvalidValue {
        key: String,
        error: serde_json::Error,
    },

    #[error("Error parsing JSON: {error}")]
    JsonParseError {
        #[from]
        error: serde_json::Error,
    },

    #[error("YAML file parsing not supported")]
    YamlFileUnsupported,

    #[error("Error running node: {}", String::from_utf8_lossy(&output.stderr))]
    NodeExecuteError { output: Output },
}
