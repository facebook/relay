/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use thiserror::Error;

#[derive(Debug, Error)]
pub enum PersistError {
    #[error("Network create error: {error}")]
    NetworkCreateError {
        error: Box<dyn std::error::Error + Send>,
    },

    #[error("Network error: {source}")]
    NetworkError {
        #[from]
        source: hyper::Error,
    },

    #[error("Persisting failed: {message}")]
    ErrorResponse { message: String },

    #[error("Failed parsing response: {source}")]
    ResponseParseError {
        #[from]
        source: serde_json::Error,
    },

    #[error("IO Error: {source}")]
    IOError {
        #[from]
        source: std::io::Error,
    },
}
