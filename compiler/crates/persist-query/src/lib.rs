/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod errors;

use std::fmt;

use bytes::Bytes;
pub use errors::PersistError;
use http::Method;
use http::Request;
use http_body_util::BodyExt as _;
use http_body_util::Full;
use hyper_tls::HttpsConnector;
use hyper_util::client::legacy::Client;
use hyper_util::rt::TokioExecutor;
use serde::Deserialize;
use url::form_urlencoded;

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum Response {
    Success { id: String },
    Error { error: ResponseError },
}

#[derive(Debug, Deserialize)]
struct ResponseError {
    message: String,
}

impl fmt::Display for ResponseError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.message)
    }
}

/// The data that makes up a single persist HTTP request, before it is sent.
///
/// Constructed by [`build_persist_request`]. Callers that only need to inspect
/// or record what *would* be sent (e.g. in tests) can stop here; callers that
/// need to actually send the request pass this to [`persist`] or
/// [`dispatch_persist_request`].
#[derive(Debug, Clone)]
pub struct PersistRequest {
    /// The endpoint URL.
    pub uri: String,
    /// HTTP headers in the order they will be sent. `content-type` is always
    /// first, followed by any caller-supplied extra headers.
    pub headers: Vec<(String, String)>,
    /// URL-encoded form body (`application/x-www-form-urlencoded`). Extra
    /// params appear before `text`, matching the order [`build_persist_request`]
    /// appends them.
    pub body: String,
}

/// Build the HTTP request for a persist call without sending it.
///
/// Assembles the URL-encoded form body (extra `params` first, then `text`) and
/// the header list (`content-type` first, then `extra_headers`), exactly as
/// [`persist`] would before handing off to the HTTP client.
pub fn build_persist_request<'a>(
    document: &str,
    uri: &str,
    params: impl IntoIterator<Item = (&'a String, &'a String)>,
    extra_headers: impl IntoIterator<Item = (&'a String, &'a String)>,
) -> PersistRequest {
    let body = {
        let mut serializer = form_urlencoded::Serializer::new(String::new());
        for (k, v) in params {
            serializer.append_pair(k, v);
        }
        serializer.append_pair("text", document);
        serializer.finish()
    };

    let mut headers = vec![(
        "content-type".to_string(),
        "application/x-www-form-urlencoded".to_string(),
    )];
    for (k, v) in extra_headers {
        headers.push((k.clone(), v.clone()));
    }

    PersistRequest {
        uri: uri.to_string(),
        headers,
        body,
    }
}

async fn dispatch_persist_request(request: PersistRequest) -> Result<String, PersistError> {
    let mut builder = Request::builder().method(Method::POST).uri(&request.uri);
    for (k, v) in &request.headers {
        builder = builder.header(k, v);
    }
    let req = builder
        .body(Full::new(Bytes::from(request.body)))
        .map_err(|err| PersistError::NetworkCreateError {
            error: Box::new(err),
        })?;
    let https = HttpsConnector::new();
    let client = Client::builder(TokioExecutor::new()).build(https);
    let res = client.request(req).await?;
    let bytes = res.into_body().collect().await?.to_bytes();
    let result: Response =
        serde_json::from_slice(&bytes).map_err(|err| PersistError::DetailedResponseParseError {
            source: err,
            raw_response: String::from_utf8_lossy(&bytes).to_string(),
        })?;

    match result {
        Response::Success { id } => Ok(id),
        Response::Error { error } => Err(PersistError::ErrorResponse {
            message: error.message,
        }),
    }
}

pub async fn persist<'a>(
    document: &str,
    uri: &str,
    params: impl IntoIterator<Item = (&'a String, &'a String)>,
    extra_headers: impl IntoIterator<Item = (&'a String, &'a String)>,
) -> Result<String, PersistError> {
    dispatch_persist_request(build_persist_request(document, uri, params, extra_headers)).await
}
