/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use http::StatusCode;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PersistError {
    #[error("Persist request failed (phase=request-build, endpoint=`{endpoint}`): {source}")]
    RequestBuild {
        endpoint: String,
        #[source]
        source: http::Error,
    },

    #[error("Persist request failed (phase=request-dispatch, endpoint=`{endpoint}`): {source}")]
    RequestDispatch {
        endpoint: String,
        #[source]
        source: hyper_util::client::legacy::Error,
    },

    #[error(
        "Persist request failed (phase=response-body, endpoint=`{endpoint}`, status={status}, content-type={content_type:?}): {source}"
    )]
    ResponseBody {
        endpoint: String,
        status: StatusCode,
        content_type: String,
        #[source]
        source: hyper::Error,
    },

    #[error(
        "Persist request failed (phase=http-status, endpoint=`{endpoint}`, status={status}, content-type={content_type:?}): response snippet {response_snippet:?}"
    )]
    HttpStatus {
        endpoint: String,
        status: StatusCode,
        content_type: String,
        response_snippet: String,
    },

    #[error(
        "Persist request failed (phase=response-json, endpoint=`{endpoint}`, status={status}, content-type={content_type:?}): {source}; response snippet {response_snippet:?}"
    )]
    ResponseJson {
        endpoint: String,
        status: StatusCode,
        content_type: String,
        response_snippet: String,
        #[source]
        source: serde_json::Error,
    },

    #[error(
        "Persist request failed (phase=response-error, endpoint=`{endpoint}`, status={status}, content-type={content_type:?}): server message {message:?}; response snippet {response_snippet:?}"
    )]
    ResponseError {
        endpoint: String,
        status: StatusCode,
        content_type: String,
        response_snippet: String,
        message: String,
    },

    #[error("Network create error: {error}")]
    NetworkCreateError {
        error: Box<dyn std::error::Error + Send>,
    },

    #[error("Network error: {source}")]
    NetworkError {
        #[from]
        source: hyper::Error,
    },

    #[error("HTTP client error: {source}")]
    HyperClientError {
        #[from]
        source: hyper_util::client::legacy::Error,
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

    #[error("Failed parsing response: {source}. Raw response: {raw_response}")]
    DetailedResponseParseError {
        source: serde_json::Error,
        raw_response: String,
    },
}
