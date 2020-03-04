/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

use hyper::{Body, Client, Method, Request};
use hyper_tls::HttpsConnector;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::fmt;
use url::form_urlencoded;

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
enum Response {
    Success { id: String },
    Error { error: ResponseError },
}

#[derive(Debug, Serialize, Deserialize)]
struct ResponseError {
    message: String,
}

impl fmt::Display for ResponseError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.message)
    }
}

impl Error for ResponseError {}

impl Response {
    fn from_bytes(bytes: &[u8]) -> Self {
        serde_json::from_slice(bytes).expect("Failed to deserialize response from the API: {:?}")
    }
}

pub async fn persist(
    document: &str,
    uri: &str,
    params: impl IntoIterator<Item = (&String, &String)>,
) -> Result<String, Box<dyn Error>> {
    let mut request_body = form_urlencoded::Serializer::new(String::new());
    for param in params {
        request_body.append_pair(&param.0, &param.1);
    }
    request_body.append_pair("text", &document);

    let req = Request::builder()
        .method(Method::POST)
        .uri(uri)
        .header("content-type", "application/x-www-form-urlencoded")
        .body(Body::from(request_body.finish()))?;
    let https = HttpsConnector::new();
    let client = Client::builder().build::<_, Body>(https);
    let res = client.request(req).await?;
    let bytes = hyper::body::to_bytes(res.into_body()).await?;
    let result = Response::from_bytes(bytes.as_ref());

    match result {
        Response::Success { id } => Ok(id),
        Response::Error { error } => Err(Box::new(error)),
    }
}
