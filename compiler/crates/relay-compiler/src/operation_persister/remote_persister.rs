/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use async_trait::async_trait;
use persist_query::PersistError;
use persist_query::persist;
use relay_config::RemotePersistConfig;
use tokio::sync::Semaphore;

use crate::OperationPersister;
use crate::config::ArtifactForPersister;

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
        let semaphore = config.semaphore_permits.map(Semaphore::new);
        Self { config, semaphore }
    }
}

#[async_trait]
impl OperationPersister for RemotePersister {
    async fn persist_artifact(
        &self,
        artifact: ArtifactForPersister,
    ) -> Result<String, PersistError> {
        let params = &self.config.params;
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
