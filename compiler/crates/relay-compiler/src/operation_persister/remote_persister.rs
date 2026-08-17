/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::LazyLock;

use async_trait::async_trait;
use persist_query::PersistError;
use persist_query::persist;
use relay_config::RemotePersistConfig;
use relay_config::SCHEMA_TEXT_PARAM;
use tokio::sync::Semaphore;

use crate::OperationPersister;
use crate::config::ArtifactForPersister;

/// `persist` takes its parameters as `&String` pairs, so the key needs an owner
/// that outlives the call.
static SCHEMA_TEXT_KEY: LazyLock<String> = LazyLock::new(|| SCHEMA_TEXT_PARAM.to_owned());

/// Concurrent requests allowed when the schema is being sent and the project
/// did not set `concurrency`.
///
/// `persist_operations` drives every document's future at once through
/// `join_all`, and `persist` builds the whole form body before its first
/// `await`. Without a bound, each in-flight body embeds its own copy of the
/// schema, so peak memory scales with documents x schema size — hundreds of
/// megabytes for a large project. Bounding it here rather than relying on
/// `concurrency` keeps that off the default path.
///
/// `RemotePersistConfig::include_schema_text` states this value as a literal,
/// because that doc is public — it renders into the config JSON schema and the
/// LSP, where this name cannot be resolved. Change both together.
const DEFAULT_SCHEMA_TEXT_CONCURRENCY: usize = 16;

/// The configured params, plus `schema_text` when the project's schema is
/// being sent.
///
/// The schema arrives on the artifact rather than being read here: it is
/// the one the compiler built this project's programs from, assembled once
/// per build and shared by every document.
///
/// Public so a test persister can assemble a body the way the real one does
/// instead of reimplementing this and drifting from it.
pub fn persist_params<'a>(
    config: &'a RemotePersistConfig,
    artifact: &'a ArtifactForPersister,
) -> Result<Vec<(&'a String, &'a String)>, PersistError> {
    let mut params: Vec<(&String, &String)> = config.params.iter().collect();
    if config.include_schema_text {
        let schema_text = artifact.schema_text.as_ref().ok_or_else(|| {
            PersistError::ErrorResponse {
                message: format!(
                    "`persistConfig.includeSchemaText` is set, but this project produced no schema text to send for `{SCHEMA_TEXT_PARAM}`. A `schemaCompact` schema is a binary format and cannot be sent as text; use `schema` or `schemaDir`."
                ),
            }
        })?;
        params.push((&SCHEMA_TEXT_KEY, schema_text));
    }

    Ok(params)
}

/// A remote persister that sends GraphQL documents to a server for persistence.
///
/// This struct implements the `OperationPersister` trait, which defines the interface for persisting GraphQL operations.
#[derive(Debug)]
pub struct RemotePersister {
    /// The configuration for the remote persister.
    pub config: RemotePersistConfig,
    /// An optional semaphore to limit the number of concurrent connections to the remote server.
    pub semaphore: Option<Semaphore>,
}

impl RemotePersister {
    /// Creates a new `RemotePersister` instance with the given configuration and semaphore.
    pub fn new(config: RemotePersistConfig) -> Self {
        let semaphore = config
            .semaphore_permits
            .or(config
                .include_schema_text
                .then_some(DEFAULT_SCHEMA_TEXT_CONCURRENCY))
            .map(Semaphore::new);

        Self { config, semaphore }
    }
}

#[async_trait]
impl OperationPersister for RemotePersister {
    async fn persist_artifact(
        &self,
        artifact: ArtifactForPersister,
    ) -> Result<String, PersistError> {
        let params = persist_params(&self.config, &artifact)?;
        let headers = &self.config.headers;

        let url = &self.config.url;
        if let Some(semaphore) = &self.semaphore {
            let permit = (*semaphore).acquire().await.unwrap();
            let result = persist(&artifact.text, url, params, headers).await;
            drop(permit);
            result
        } else {
            persist(&artifact.text, url, params, headers).await
        }
    }
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;
    use std::sync::Arc;

    use super::*;

    fn config(include_schema_text: bool) -> RemotePersistConfig {
        let mut config = RemotePersistConfig {
            url: "https://example.com/persist".to_owned(),
            params: Default::default(),
            headers: Default::default(),
            semaphore_permits: None,
            include_query_text: false,
            include_schema_text,
        };
        config.params.insert("app".to_owned(), "123".to_owned());

        config
    }

    fn artifact(schema_text: Option<&str>) -> ArtifactForPersister {
        ArtifactForPersister {
            text: "query Foo { id }".to_owned(),
            relative_path: PathBuf::from("Test.graphql.js"),
            override_schema: None,
            schema_text: schema_text.map(|text| Arc::new(text.to_owned())),
        }
    }

    /// The params as owned pairs, so assertions do not have to juggle borrows.
    fn params(
        persister: &RemotePersister,
        artifact: &ArtifactForPersister,
    ) -> Result<Vec<(String, String)>, PersistError> {
        persist_params(&persister.config, artifact).map(|params| {
            params
                .into_iter()
                .map(|(name, value)| (name.clone(), value.clone()))
                .collect()
        })
    }

    #[test]
    fn sends_only_the_configured_params_without_include_schema_text() {
        let persister = RemotePersister::new(config(false));

        assert_eq!(
            params(&persister, &artifact(None)).unwrap(),
            vec![("app".to_owned(), "123".to_owned())],
            "sending the schema is opt-in: leaving it off must not add a `schema_text` param"
        );
    }

    #[test]
    fn ignores_a_schema_on_the_artifact_when_the_config_did_not_ask_for_one() {
        let persister = RemotePersister::new(config(false));

        assert_eq!(
            params(&persister, &artifact(Some("type Query { field: String }"))).unwrap(),
            vec![("app".to_owned(), "123".to_owned())],
            "the config decides what is sent, not the artifact"
        );
    }

    #[test]
    fn sends_the_schema_the_document_was_compiled_against() {
        let persister = RemotePersister::new(config(true));

        assert_eq!(
            params(&persister, &artifact(Some("type Query { field: String }"))).unwrap(),
            vec![
                ("app".to_owned(), "123".to_owned()),
                (
                    SCHEMA_TEXT_PARAM.to_owned(),
                    "type Query { field: String }".to_owned()
                ),
            ],
            "the schema goes over the wire next to the configured params"
        );
    }

    #[test]
    fn reports_a_project_with_no_schema_text_to_send() {
        // `schemaCompact` is the only way to reach this: the config asked for a
        // schema the project cannot produce. Failing here beats silently
        // persisting documents against whatever schema the endpoint defaults to.
        let persister = RemotePersister::new(config(true));

        let message = params(&persister, &artifact(None)).unwrap_err().to_string();
        assert!(
            message.contains("schemaCompact"),
            "the error must name the unsupported option: {message}"
        );
        assert!(
            message.contains("includeSchemaText"),
            "the error must name the config that asked for it: {message}"
        );
    }

    #[test]
    fn bounds_concurrency_when_sending_the_schema_without_an_explicit_limit() {
        // Every in-flight request carries its own copy of the schema, and
        // `persist_operations` polls one future per document at once, so an
        // unbounded default would scale peak memory with documents x schema.
        let persister = RemotePersister::new(config(true));

        assert_eq!(
            persister
                .semaphore
                .as_ref()
                .map(|semaphore| semaphore.available_permits()),
            Some(DEFAULT_SCHEMA_TEXT_CONCURRENCY)
        );
    }

    #[test]
    fn leaves_concurrency_unbounded_when_not_sending_the_schema() {
        // The bound exists for the schema payload; without it, the previous
        // default stands.
        let persister = RemotePersister::new(config(false));

        assert!(persister.semaphore.is_none());
    }

    #[test]
    fn an_explicit_concurrency_wins_over_the_schema_default() {
        let mut config = config(true);
        config.semaphore_permits = Some(2);
        let persister = RemotePersister::new(config);

        assert_eq!(
            persister
                .semaphore
                .as_ref()
                .map(|semaphore| semaphore.available_permits()),
            Some(2)
        );
    }
}
