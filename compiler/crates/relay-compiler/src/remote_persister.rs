/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{OperationPersister, PersistConfig};
use async_trait::async_trait;
use persist_query::{persist, PersistError};

pub struct RemotePersister;

#[async_trait]
impl OperationPersister for RemotePersister {
    async fn persist_artifact(
        &self,
        operation_text: String,
        persist_config: &PersistConfig,
    ) -> Result<String, PersistError> {
        let params = &persist_config.params;
        let url = &persist_config.url;
        if let Some(semaphore) = &persist_config.semaphore {
            let permit = (*semaphore).acquire().await.unwrap();
            let result = persist(&operation_text, url, params).await;
            drop(permit);
            result
        } else {
            persist(&operation_text, url, params).await
        }
    }

    fn worker_count(&self) -> usize {
        0
    }
}
