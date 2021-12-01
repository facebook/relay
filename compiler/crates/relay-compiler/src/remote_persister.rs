/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::OperationPersister;
use async_trait::async_trait;
use fnv::FnvBuildHasher;
use indexmap::IndexMap;
use persist_query::{persist, PersistError};
use serde::{Deserialize, Serialize};

type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;

#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RemotePersistConfig {
    /// URL to send a POST request to to persist.
    pub url: String,
    /// The document will be in a POST parameter `text`. This map can contain
    /// additional parameters to send.
    pub params: FnvIndexMap<String, String>,
}

pub struct RemotePersister {
    config: RemotePersistConfig,
}

impl RemotePersister {
    pub fn new(config: RemotePersistConfig) -> Self {
        Self { config }
    }
}

#[async_trait]
impl OperationPersister for RemotePersister {
    async fn persist_artifact(&self, operation_text: String) -> Result<String, PersistError> {
        let params = &self.config.params;
        let url = &self.config.url;
        persist(&operation_text, url, params).await
    }

    fn worker_count(&self) -> usize {
        0
    }
}
