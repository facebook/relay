/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use lsp_server::{ErrorCode, ResponseError};

pub type LSPRuntimeResult<T> = std::result::Result<T, LSPRuntimeError>;

#[derive(Debug, Clone)]
pub enum LSPRuntimeError {
    ExpectedError,
    UnexpectedError(String),
}

impl From<LSPRuntimeError> for Option<ResponseError> {
    fn from(err: LSPRuntimeError) -> Self {
        match err {
            LSPRuntimeError::ExpectedError => None,
            LSPRuntimeError::UnexpectedError(message) => Some(ResponseError {
                code: ErrorCode::UnknownErrorCode as i32,
                message,
                data: None,
            }),
        }
    }
}
