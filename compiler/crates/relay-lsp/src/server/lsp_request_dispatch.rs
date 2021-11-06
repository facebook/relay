/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use lsp_server::{
    ErrorCode, Request as ServerRequest, RequestId, RequestId as ServerRequestId,
    Response as ServerResponse, ResponseError,
};
use lsp_types::request::Request;

use crate::lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult};

pub struct LSPRequestDispatch<'state, TState> {
    request: lsp_server::Request,
    state: &'state TState,
}

impl<'state, TState> LSPRequestDispatch<'state, TState> {
    pub fn new(request: lsp_server::Request, state: &'state TState) -> Self {
        LSPRequestDispatch { request, state }
    }

    /// Calls handler if the LSPRequestDispatch's request's method matches the method
    /// of TRequest. Returns a Result which will be Ok if the handler was not called,
    /// or Err if the handler was called.
    /// Thus, multiple calls to `on_request_sync(...)?` can be chained. Doing so will
    /// cause LSPRequestDispatch to execute the first matching handler, if any.
    pub fn on_request_sync<TRequest: Request>(
        self,
        handler: fn(&TState, TRequest::Params) -> LSPRuntimeResult<TRequest::Result>,
    ) -> Result<Self, ServerResponse> {
        if self.request.method == TRequest::METHOD {
            match extract_request_params::<TRequest>(self.request) {
                Ok((request_id, params)) => {
                    let response = handler(self.state, params).and_then(|handler_result| {
                        serde_json::to_value(handler_result).map_err(|_err| {
                            LSPRuntimeError::UnexpectedError(
                                "Unable to serialize request response".to_string(),
                            )
                        })
                    });
                    let server_response = convert_to_lsp_response(request_id, response);

                    return Err(server_response);
                }
                Err(error) => {
                    return Err(convert_to_lsp_response(
                        ServerRequestId::from("default-lsp-id".to_string()),
                        Err(error),
                    ));
                }
            }
        }

        Ok(self)
    }

    pub fn request(self) -> lsp_server::Request {
        self.request
    }
}

fn convert_to_lsp_response(
    id: RequestId,
    result: LSPRuntimeResult<serde_json::Value>,
) -> ServerResponse {
    match result {
        Ok(result) => ServerResponse {
            id,
            result: Some(result),
            error: None,
        },
        Err(runtime_error) => {
            let response_error: Option<ResponseError> = runtime_error.into();
            let response_error = response_error.unwrap_or_else(|| ResponseError {
                code: ErrorCode::RequestCanceled as i32,
                message: "Request Canceled".to_string(),
                data: None,
            });
            ServerResponse {
                id,
                result: None,
                error: Some(response_error),
            }
        }
    }
}

fn extract_request_params<R>(req: ServerRequest) -> LSPRuntimeResult<(ServerRequestId, R::Params)>
where
    R: Request,
{
    std::panic::catch_unwind(|| {
        req.extract(R::METHOD)
            .expect("extract_request_params: could not extract request params")
    })
    .map_err(|err| {
        LSPRuntimeError::UnexpectedError(format!(
            "panic in the `extract_request_params`: {:?}",
            err
        ))
    })
}

#[cfg(test)]
mod test {
    use crate::lsp_runtime_error::LSPRuntimeResult;
    use lsp_types::{
        request::Request,
        request::{GotoDefinition, HoverRequest},
        Position, TextDocumentIdentifier, TextDocumentPositionParams, Url,
    };
    use std::sync::atomic::{AtomicI32, Ordering};

    use super::LSPRequestDispatch;

    #[test]
    fn calls_first_matching_request_handler() {
        let state: AtomicI32 = AtomicI32::new(0);
        let dispatch = LSPRequestDispatch::new(
            lsp_server::Request {
                id: "id".to_string().into(),
                method: "textDocument/definition".to_string(),
                params: serde_json::to_value(TextDocumentPositionParams {
                    text_document: TextDocumentIdentifier {
                        uri: Url::parse("https://example.net").unwrap(),
                    },
                    position: Position {
                        line: 0,
                        character: 0,
                    },
                })
                .unwrap(),
            },
            &state,
        );
        let dispatch = || -> Result<(), super::ServerResponse> {
            dispatch
                .on_request_sync::<HoverRequest>(hover_handler)?
                .on_request_sync::<GotoDefinition>(goto_definition_handler)?;
            Ok(())
        };
        let result = dispatch();
        assert!(result.is_err());
        assert_eq!(state.load(Ordering::Relaxed), 2);
    }

    fn hover_handler(
        state: &AtomicI32,
        _params: <HoverRequest as Request>::Params,
    ) -> LSPRuntimeResult<<HoverRequest as Request>::Result> {
        state.store(1, Ordering::Relaxed);

        Ok(None)
    }

    fn goto_definition_handler(
        state: &AtomicI32,
        _params: <GotoDefinition as Request>::Params,
    ) -> LSPRuntimeResult<<GotoDefinition as Request>::Result> {
        state.store(2, Ordering::Relaxed);

        Ok(None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use lsp_types::request::CodeActionRequest;
    use serde_json::json;

    #[test]
    fn test_extract_request_params_error() {
        let request_id = ServerRequestId::from("test-id".to_string());
        let request = ServerRequest {
            id: request_id,
            method: "textDocument/codeAction".to_string(),
            params: json!({
                "invalid_key": "invalid_value",
            }),
        };
        let result = extract_request_params::<CodeActionRequest>(request);
        // it returns an error, but not panic
        assert!(result.is_err());
    }
}
