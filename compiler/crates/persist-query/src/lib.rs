/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod errors;

pub use errors::PersistError;
use hyper::{Body, Client, Method, Request};
use hyper_tls::HttpsConnector;
use serde::Deserialize;
use std::fmt;
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

pub async fn persist(
    document: &str,
    uri: &str,
    params: impl IntoIterator<Item = (&String, &String)>,
) -> Result<String, PersistError> {
    let request_body = {
        let mut request_body = form_urlencoded::Serializer::new(String::new());
        for param in params {
            request_body.append_pair(param.0, param.1);
        }
        request_body.append_pair("text", document);
        request_body.finish()
    };

    let req = Request::builder()
        .method(Method::POST)
        .uri(uri)
        .header("content-type", "application/x-www-form-urlencoded")
        .body(Body::from(request_body))
        .map_err(|err| PersistError::NetworkCreateError {
            error: Box::new(err),
        })?;
    let https = HttpsConnector::new();
    let client = Client::builder().build(https);
    let res = client.request(req).await?;
    let bytes = hyper::body::to_bytes(res.into_body()).await?;
    let result: Response = serde_json::from_slice(&bytes)?;

    match result {
        Response::Success { id } => Ok(id),
        Response::Error { error } => Err(PersistError::ErrorResponse {
            message: error.message,
        }),
    }
}
