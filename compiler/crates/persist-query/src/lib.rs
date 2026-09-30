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

use bytes::Bytes;
pub use errors::PersistError;
use http::HeaderMap;
use http::Method;
use http::Request;
use http::header::CONTENT_TYPE;
use http_body_util::BodyExt as _;
use http_body_util::Full;
use hyper_tls::HttpsConnector;
use hyper_util::client::legacy::Client;
use hyper_util::rt::TokioExecutor;
use serde::Deserialize;
use url::Url;
use url::form_urlencoded;

const MAX_RESPONSE_SNIPPET_BYTES: usize = 512;
const MAX_CONTENT_TYPE_BYTES: usize = 128;
const TRUNCATION_MARKER: &str = "… [truncated]";

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum Response {
    Success { id: String },
    Error { error: PersistResponseError },
}

#[derive(Debug, Deserialize)]
struct PersistResponseError {
    message: String,
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
    let endpoint = sanitize_endpoint(&request.uri);
    let mut builder = Request::builder().method(Method::POST).uri(&request.uri);
    for (k, v) in &request.headers {
        builder = builder.header(k, v);
    }
    let req = builder
        .body(Full::new(Bytes::from(request.body)))
        .map_err(|source| PersistError::RequestBuild {
            endpoint: endpoint.clone(),
            source,
        })?;
    let https = HttpsConnector::new();
    let client = Client::builder(TokioExecutor::new()).build(https);
    let response = client
        .request(req)
        .await
        .map_err(|source| PersistError::RequestDispatch {
            endpoint: endpoint.clone(),
            source,
        })?;
    let status = response.status();
    let content_type = response_content_type(response.headers());
    let bytes = response
        .into_body()
        .collect()
        .await
        .map_err(|source| PersistError::ResponseBody {
            endpoint: endpoint.clone(),
            status,
            content_type: content_type.clone(),
            source,
        })?
        .to_bytes();
    let response_snippet = bounded_response_snippet(&bytes);

    if !status.is_success() {
        return Err(PersistError::HttpStatus {
            endpoint,
            status,
            content_type,
            response_snippet,
        });
    }

    let result: Response = match serde_json::from_slice(&bytes) {
        Ok(result) => result,
        Err(source) => {
            return Err(PersistError::ResponseJson {
                endpoint,
                status,
                content_type,
                response_snippet,
                source,
            });
        }
    };

    match result {
        Response::Success { id } => Ok(id),
        Response::Error { error } => Err(PersistError::ResponseError {
            endpoint,
            status,
            content_type,
            response_snippet,
            message: bounded_response_snippet(error.message.as_bytes()),
        }),
    }
}

fn sanitize_endpoint(uri: &str) -> String {
    let Ok(parsed) = Url::parse(uri) else {
        return "<invalid endpoint>".to_string();
    };
    let origin = parsed.origin().ascii_serialization();
    if origin == "null" {
        return format!("{}:<redacted>", parsed.scheme());
    }

    format!("{origin}{}", parsed.path())
}

fn response_content_type(headers: &HeaderMap) -> String {
    headers.get(CONTENT_TYPE).map_or_else(
        || "<missing>".to_string(),
        |value| {
            let bytes = value.as_bytes();
            let mut content_type = bounded_text(bytes, MAX_CONTENT_TYPE_BYTES);
            if bytes.len() > MAX_CONTENT_TYPE_BYTES {
                content_type.push_str(TRUNCATION_MARKER);
            }
            content_type
        },
    )
}

fn bounded_response_snippet(bytes: &[u8]) -> String {
    let mut snippet = bounded_text(bytes, MAX_RESPONSE_SNIPPET_BYTES);
    if bytes.len() > MAX_RESPONSE_SNIPPET_BYTES {
        snippet.push_str(TRUNCATION_MARKER);
    }
    snippet
}

fn bounded_text(bytes: &[u8], max_bytes: usize) -> String {
    let end = bytes.len().min(max_bytes);
    let end = if bytes.len() > max_bytes {
        match std::str::from_utf8(&bytes[..end]) {
            Err(error) if error.error_len().is_none() => error.valid_up_to(),
            _ => end,
        }
    } else {
        end
    };
    String::from_utf8_lossy(&bytes[..end]).into_owned()
}

pub async fn persist<'a>(
    document: &str,
    uri: &str,
    params: impl IntoIterator<Item = (&'a String, &'a String)>,
    extra_headers: impl IntoIterator<Item = (&'a String, &'a String)>,
) -> Result<String, PersistError> {
    dispatch_persist_request(build_persist_request(document, uri, params, extra_headers)).await
}

#[cfg(test)]
mod tests {
    use http::HeaderValue;

    use super::*;

    #[test]
    fn sanitized_endpoint_excludes_credentials_query_and_fragment() {
        let sanitized = sanitize_endpoint(
            "https://relay-user:relay-password@example.com:8443/persist/graphql?access_token=secret#private",
        );

        assert_eq!(sanitized, "https://example.com:8443/persist/graphql");
        assert!(!sanitized.contains("relay-user"));
        assert!(!sanitized.contains("relay-password"));
        assert!(!sanitized.contains("access_token"));
        assert!(!sanitized.contains("secret"));
        assert!(!sanitized.contains("private"));
    }

    #[test]
    fn invalid_endpoint_is_fully_redacted() {
        assert_eq!(
            sanitize_endpoint("not a URL?access_token=secret"),
            "<invalid endpoint>"
        );
    }

    #[test]
    fn response_content_type_is_bounded() {
        let mut headers = HeaderMap::new();
        headers.insert(
            CONTENT_TYPE,
            HeaderValue::from_str(&"x".repeat(MAX_CONTENT_TYPE_BYTES + 1))
                .expect("content type should be valid"),
        );

        assert_eq!(
            response_content_type(&headers),
            format!(
                "{}{}",
                "x".repeat(MAX_CONTENT_TYPE_BYTES),
                TRUNCATION_MARKER
            )
        );
    }

    #[test]
    fn bounded_response_snippet_preserves_utf8_boundary() {
        let body = format!(
            "{}éTAIL-MUST-NOT-APPEAR",
            "x".repeat(MAX_RESPONSE_SNIPPET_BYTES - 1)
        );

        let snippet = bounded_response_snippet(body.as_bytes());

        assert_eq!(
            snippet,
            format!(
                "{}{}",
                "x".repeat(MAX_RESPONSE_SNIPPET_BYTES - 1),
                TRUNCATION_MARKER
            )
        );
        assert!(!snippet.contains('\u{fffd}'));
        assert!(!snippet.contains("TAIL-MUST-NOT-APPEAR"));
    }

    #[test]
    fn bounded_text_preserves_malformed_bytes_when_not_truncated() {
        assert_eq!(bounded_text(b"body\xc3", 5), "body\u{fffd}");
    }
}

#[cfg(all(test, not(feature = "exclude-http-diagnostics-tests")))]
mod http_diagnostics_tests {
    use std::io::ErrorKind;
    use std::io::Read;
    use std::io::Write;
    use std::net::TcpListener;
    use std::thread;
    use std::time::Duration;
    use std::time::Instant;

    use http::StatusCode;

    use super::*;

    const TEST_SERVER_TIMEOUT: Duration = Duration::from_secs(5);
    const TEST_SERVER_POLL_INTERVAL: Duration = Duration::from_millis(10);

    #[tokio::test]
    async fn request_build_error_has_sanitized_endpoint_and_phase() {
        let header_name = "invalid\nheader".to_string();
        let header_value = "secret-value".to_string();
        let error = persist(
            "query Test { test }",
            "http://example.com/persist?access_token=secret",
            [],
            [(&header_name, &header_value)],
        )
        .await
        .expect_err("invalid header should fail request construction");
        let message = error.to_string();

        assert!(message.contains("phase=request-build"), "{message}");
        assert!(
            message.contains("endpoint=`http://example.com/persist`"),
            "{message}"
        );
        assert!(!message.contains("access_token"), "{message}");
        assert!(!message.contains("secret"), "{message}");
    }

    #[tokio::test]
    async fn invalid_request_uri_is_fully_redacted() {
        let error = persist(
            "query Test { test }",
            "not a URL?access_token=secret",
            [],
            [],
        )
        .await
        .expect_err("invalid URI should fail request construction");
        let message = error.to_string();

        assert!(message.contains("phase=request-build"), "{message}");
        assert!(
            message.contains("endpoint=`<invalid endpoint>`"),
            "{message}"
        );
        assert!(!message.contains("access_token"), "{message}");
        assert!(!message.contains("secret"), "{message}");
    }

    #[tokio::test]
    async fn request_dispatch_error_has_sanitized_endpoint_and_phase() {
        let uri = "http://127.0.0.1:0/persist?access_token=secret";

        let error = persist("query Test { test }", uri, [], [])
            .await
            .expect_err("port zero should reject request dispatch");
        let message = error.to_string();

        assert!(message.contains("phase=request-dispatch"), "{message}");
        assert!(
            message.contains("endpoint=`http://127.0.0.1:0/persist`"),
            "{message}"
        );
        assert!(!message.contains("access_token"), "{message}");
        assert!(!message.contains("secret"), "{message}");
    }

    #[tokio::test]
    async fn non_success_status_reports_metadata_and_bounded_snippet() {
        let body = format!(
            "{}TAIL-MUST-NOT-APPEAR",
            "x".repeat(MAX_RESPONSE_SNIPPET_BYTES)
        );
        let (uri, server) = serve_once(http_response(
            "503 Service Unavailable",
            "text/plain; charset=utf-8",
            body.as_bytes(),
            None,
        ));

        let error = persist(
            "query Test { test }",
            &format!("{uri}?token=secret"),
            [],
            [],
        )
        .await
        .expect_err("non-success response should fail");
        server.join().expect("server should not panic");

        match &error {
            PersistError::HttpStatus {
                endpoint,
                status,
                content_type,
                response_snippet,
            } => {
                assert_eq!(endpoint, &uri);
                assert_eq!(*status, StatusCode::SERVICE_UNAVAILABLE);
                assert_eq!(content_type, "text/plain; charset=utf-8");
                assert!(response_snippet.ends_with("… [truncated]"));
                assert!(!response_snippet.contains("TAIL-MUST-NOT-APPEAR"));
            }
            other => panic!("expected HTTP status error, got {other:?}"),
        }
        let message = error.to_string();
        assert!(message.contains("phase=http-status"), "{message}");
        assert!(!message.contains("token=secret"), "{message}");
    }

    #[tokio::test]
    async fn invalid_json_reports_response_metadata_and_snippet() {
        let (uri, server) = serve_once(http_response(
            "200 OK",
            "application/json",
            b"not valid json",
            None,
        ));

        let error = persist(
            "query Test { test }",
            &format!("{uri}?token=secret"),
            [],
            [],
        )
        .await
        .expect_err("invalid JSON should fail");
        server.join().expect("server should not panic");

        match &error {
            PersistError::ResponseJson {
                endpoint,
                status,
                content_type,
                response_snippet,
                ..
            } => {
                assert_eq!(endpoint, &uri);
                assert_eq!(*status, StatusCode::OK);
                assert_eq!(content_type, "application/json");
                assert_eq!(response_snippet, "not valid json");
            }
            other => panic!("expected JSON response error, got {other:?}"),
        }
        let message = error.to_string();
        assert!(message.contains("phase=response-json"), "{message}");
        assert!(!message.contains("token=secret"), "{message}");
    }

    #[tokio::test]
    async fn incomplete_body_reports_response_metadata_and_phase() {
        let (uri, server) = serve_once(http_response(
            "200 OK",
            "application/json",
            br#"{"id":"incomplete"}"#,
            Some(1024),
        ));

        let error = persist(
            "query Test { test }",
            &format!("{uri}?token=secret"),
            [],
            [],
        )
        .await
        .expect_err("truncated response body should fail");
        server.join().expect("server should not panic");

        match &error {
            PersistError::ResponseBody {
                endpoint,
                status,
                content_type,
                ..
            } => {
                assert_eq!(endpoint, &uri);
                assert_eq!(*status, StatusCode::OK);
                assert_eq!(content_type, "application/json");
            }
            other => panic!("expected response body error, got {other:?}"),
        }
        let message = error.to_string();
        assert!(message.contains("phase=response-body"), "{message}");
        assert!(!message.contains("token=secret"), "{message}");
    }

    #[tokio::test]
    async fn server_error_response_reports_context() {
        let server_message = format!(
            "persist denied\ncontrol: \u{1}{}TAIL-MUST-NOT-APPEAR",
            "x".repeat(MAX_RESPONSE_SNIPPET_BYTES)
        );
        let body = serde_json::to_vec(&serde_json::json!({
            "error": {"message": server_message}
        }))
        .expect("serialize server error response");
        let (uri, server) = serve_once(http_response("200 OK", "application/json", &body, None));

        let error = persist(
            "query Test { test }",
            &format!("{uri}?token=secret"),
            [],
            [],
        )
        .await
        .expect_err("server error response should fail");
        server.join().expect("server should not panic");

        match &error {
            PersistError::ResponseError {
                endpoint,
                status,
                content_type,
                response_snippet,
                message,
            } => {
                assert_eq!(endpoint, &uri);
                assert_eq!(*status, StatusCode::OK);
                assert_eq!(content_type, "application/json");
                assert!(response_snippet.ends_with("… [truncated]"));
                assert!(message.ends_with("… [truncated]"));
                assert!(!message.contains("TAIL-MUST-NOT-APPEAR"));
            }
            other => panic!("expected server response error, got {other:?}"),
        }
        let message = error.to_string();
        assert!(message.contains("phase=response-error"), "{message}");
        assert!(
            message.contains("persist denied\\ncontrol: \\u{1}"),
            "{message}"
        );
        assert!(!message.contains('\n'), "{message}");
        assert!(!message.contains('\u{1}'), "{message}");
        assert!(!message.contains("TAIL-MUST-NOT-APPEAR"), "{message}");
        assert!(!message.contains("token=secret"), "{message}");
    }

    #[tokio::test]
    async fn successful_response_returns_persisted_id() {
        let (uri, server) = serve_once(http_response(
            "200 OK",
            "application/json",
            br#"{"id":"persisted-id"}"#,
            None,
        ));

        let id = persist("query Test { test }", &uri, [], [])
            .await
            .expect("successful response should return its persisted ID");
        server.join().expect("server should not panic");

        assert_eq!(id, "persisted-id");
    }

    fn serve_once(response: Vec<u8>) -> (String, thread::JoinHandle<()>) {
        let listener = TcpListener::bind("127.0.0.1:0").expect("bind local HTTP server");
        listener
            .set_nonblocking(true)
            .expect("make local HTTP server nonblocking");
        let address = listener.local_addr().expect("read local server address");
        let server = thread::spawn(move || {
            let deadline = Instant::now() + TEST_SERVER_TIMEOUT;
            let (mut stream, _) = loop {
                match listener.accept() {
                    Ok(connection) => break connection,
                    Err(error) if error.kind() == ErrorKind::WouldBlock => {
                        assert!(
                            Instant::now() < deadline,
                            "timed out waiting for persist request"
                        );
                        thread::sleep(TEST_SERVER_POLL_INTERVAL);
                    }
                    Err(error) => panic!("accept persist request: {error}"),
                }
            };
            stream
                .set_nonblocking(false)
                .expect("make accepted persist connection blocking");
            stream
                .set_read_timeout(Some(TEST_SERVER_TIMEOUT))
                .expect("bound persist request read");
            stream
                .set_write_timeout(Some(TEST_SERVER_TIMEOUT))
                .expect("bound persist response write");
            let mut request = [0; 4096];
            let bytes_read = stream.read(&mut request).expect("read persist request");
            assert!(bytes_read > 0, "persist request should not be empty");
            stream.write_all(&response).expect("write HTTP response");
        });
        (format!("http://{address}/persist"), server)
    }

    fn http_response(
        status: &str,
        content_type: &str,
        body: &[u8],
        declared_length: Option<usize>,
    ) -> Vec<u8> {
        let mut response = format!(
            "HTTP/1.1 {status}\r\nContent-Type: {content_type}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
            declared_length.unwrap_or(body.len())
        )
        .into_bytes();
        response.extend_from_slice(body);
        response
    }
}
