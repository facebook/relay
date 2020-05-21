/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use lsp_server::ProtocolError;
use relay_compiler::errors::Error as CompilerError;
use serde_json::Error as SerdeError;
use std::io::Error as IOError;

pub type Result<T> = std::result::Result<T, LSPError>;

macro_rules! extend_error {
    ($error: ident) => {
        impl From<$error> for LSPError {
            fn from(err: $error) -> Self {
                LSPError::$error(err)
            }
        }
    };
}

#[derive(Debug)]
pub enum LSPError {
    ProtocolError(ProtocolError),
    CompilerError(CompilerError),
    IOError(IOError),
    SerdeError(SerdeError),
}

extend_error!(CompilerError);
extend_error!(IOError);
extend_error!(ProtocolError);
extend_error!(SerdeError);
