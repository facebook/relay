/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crossbeam::channel::SendError;
use lsp_server::{Message, ProtocolError};
use relay_compiler::errors::Error as CompilerError;
use serde_json::Error as SerdeError;
use std::io::Error as IOError;
use tokio::task::JoinError;

pub type LSPProcessResult<T> = std::result::Result<T, LSPProcessError>;

macro_rules! extend_error {
    ($error: ident) => {
        impl From<$error> for LSPProcessError {
            fn from(err: $error) -> Self {
                LSPProcessError::$error(err)
            }
        }
    };
}

#[derive(Debug)]
pub enum LSPProcessError {
    ProtocolError(ProtocolError),
    CompilerError(CompilerError),
    IOError(IOError),
    SerdeError(SerdeError),
    JoinError(JoinError),
    SendError(SendError<Message>),
}

extend_error!(CompilerError);
extend_error!(IOError);
extend_error!(ProtocolError);
extend_error!(SerdeError);
extend_error!(JoinError);

impl From<SendError<Message>> for LSPProcessError {
    fn from(err: SendError<Message>) -> Self {
        LSPProcessError::SendError(err)
    }
}
