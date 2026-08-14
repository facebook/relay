/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;
use std::sync::Mutex;

use async_trait::async_trait;
use md5::Digest;
use md5::Md5;
use persist_query::PersistRequest;
use persist_query::build_persist_request;
use relay_compiler::OperationPersister;
use relay_compiler::config::ArtifactForPersister;
use relay_compiler::config::PersistId;
use relay_compiler::config::PersistResult;
use relay_config::RemotePersistConfig;
use url::form_urlencoded;

/// URL scheme prefix that triggers mock persistence in integration tests.
///
/// Use a URL starting with this prefix in `relay.config.json` (e.g.
/// `"relay-test://persist"`) to capture outbound persist requests in the
/// snapshot instead of sending real HTTP traffic.
pub const TEST_PERSIST_URL_PREFIX: &str = "relay-test://";

#[derive(Clone)]
pub struct CapturedPersistRequest {
    pub request: PersistRequest,
    pub persist_id: String,
}

pub struct MockPersister {
    config: RemotePersistConfig,
    captured: Arc<Mutex<Vec<CapturedPersistRequest>>>,
}

impl MockPersister {
    pub fn new(
        config: RemotePersistConfig,
        captured: Arc<Mutex<Vec<CapturedPersistRequest>>>,
    ) -> Self {
        Self { config, captured }
    }
}

#[async_trait]
impl OperationPersister for MockPersister {
    async fn persist_artifact(&self, artifact: ArtifactForPersister) -> PersistResult<PersistId> {
        let mut hasher = Md5::new();
        hasher.update(artifact.text.as_bytes());
        let persist_id = hasher
            .finalize()
            .iter()
            .map(|b| format!("{b:02x}"))
            .collect::<String>();

        let request = build_persist_request(
            &artifact.text,
            &self.config.url,
            &self.config.params,
            &self.config.headers,
        );

        self.captured
            .lock()
            .expect("mock persister lock poisoned")
            .push(CapturedPersistRequest {
                request,
                persist_id: persist_id.clone(),
            });

        Ok(persist_id)
    }
}

/// Serialize captured persist requests into a snapshot-stable string.
///
/// Requests are sorted by URL-encoded body for determinism (parallel persist
/// calls complete in non-deterministic order; same document always produces the
/// same body). Headers appear under a `headers:` section using `key: value`
/// notation. Form params are URL-decoded and shown under a `params:` section
/// using `key=value` notation, with extra params first and `text` last (the
/// order [`build_persist_request`] builds the body). The `text` value is
/// truncated to its first line.
pub fn serialize_captured_requests(requests: &[CapturedPersistRequest]) -> String {
    if requests.is_empty() {
        return String::new();
    }

    let mut sorted = requests.to_vec();
    sorted.sort_by(|a, b| a.request.body.cmp(&b.request.body));

    let mut out = String::from("\n\nPersist Requests:");

    for captured in &sorted {
        let request = &captured.request;
        out.push_str(&format!("\n\nPOST {}\n", request.uri));

        out.push_str("headers:\n");
        for (k, v) in &request.headers {
            out.push_str(&format!("  {k}: {v}\n"));
        }

        out.push_str("params:\n");
        let params: Vec<(String, String)> = form_urlencoded::parse(request.body.as_bytes())
            .map(|(k, v)| (k.into_owned(), v.into_owned()))
            .collect();
        for (k, v) in &params {
            if k == "text" {
                out.push_str(&format!("  text={}\n", truncate_text(v)));
            } else {
                out.push_str(&format!("  {k}={v}\n"));
            }
        }

        out.push_str(&format!("persist_id: {}\n", captured.persist_id));
    }

    out
}

fn truncate_text(text: &str) -> String {
    let first_line = text.lines().next().unwrap_or("").trim();
    if text.lines().count() > 1 {
        format!("{first_line} ...")
    } else {
        first_line.to_string()
    }
}
