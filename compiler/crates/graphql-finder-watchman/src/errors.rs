/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Failed to canonicalize root: `{root}`.")]
    CanonicalizeRoot {
        root: PathBuf,
        source: std::io::Error,
    },

    #[error("Watchman error.")]
    Watchman {
        #[from]
        source: watchman_client::Error,
    },

    #[error("Watchman query returned no results.")]
    EmptyQueryResult,

    #[error("Failed to read file: `{file}`.")]
    FileRead {
        file: PathBuf,
        source: std::io::Error,
    },

    #[error("Syntax error: {error}")]
    Syntax { error: String },
}
