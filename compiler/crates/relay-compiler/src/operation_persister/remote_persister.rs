/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use async_trait::async_trait;
use persist_query::{persist, PersistError};
use relay_config::RemotePersistConfig;
use std::iter::empty;
use tokio::sync::Semaphore;

use crate::OperationPersister;

pub struct RemotePersister {
    pub config: RemotePersistConfig,
    semaphore: Option<Semaphore>,
}

impl RemotePersister {
    pub fn new(config: RemotePersistConfig) -> Self {
        let semaphore = config.semaphore_permits.map(Semaphore::new);
        Self { config, semaphore }
    }
}

#[async_trait]
impl OperationPersister for RemotePersister {
    async fn persist_artifact(&self, artifact_text: String) -> Result<String, PersistError> {
        let params = &self.config.params;
        let url = &self.config.url;
        if let Some(semaphore) = &self.semaphore {
            let permit = (*semaphore).acquire().await.unwrap();
            let result = persist(&artifact_text, url, params, empty()).await;
            drop(permit);
            result
        } else {
            persist(&artifact_text, url, params, empty()).await
        }
    }
}
