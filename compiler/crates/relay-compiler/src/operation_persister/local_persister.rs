/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use async_trait::async_trait;
use dashmap::DashMap;
use md5::Md5;
use persist_query::PersistError;
use relay_config::{LocalPersistAlgorithm, LocalPersistConfig};
use sha1::{Digest, Sha1};
use sha2::Sha256;
use std::collections::BTreeMap;

use crate::OperationPersister;

pub struct LocalPersister {
    config: LocalPersistConfig,
    query_map: DashMap<String, String>,
}

impl LocalPersister {
    pub fn new(config: LocalPersistConfig) -> Self {
        let query_map: DashMap<String, String> = match std::fs::read_to_string(&config.file) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_e) => {
                panic!(
                    "LocalPersister: Expected the {} file to exist.",
                    &config.file.display(),
                )
            }
        };

        Self { config, query_map }
    }

    fn hash_operation(&self, operation_text: String) -> String {
        match self.config.algorithm {
            LocalPersistAlgorithm::MD5 => {
                let mut md5 = Md5::new();
                md5.input(operation_text);
                hex::encode(md5.result())
            }
            LocalPersistAlgorithm::SHA1 => {
                let mut hash = Sha1::new();
                hash.input(&operation_text);
                hex::encode(hash.result())
            }
            LocalPersistAlgorithm::SHA256 => {
                let mut hash = Sha256::new();
                hash.input(&operation_text);
                hex::encode(hash.result())
            }
        }
    }
}

#[async_trait]
impl OperationPersister for LocalPersister {
    async fn persist_artifact(&self, artifact_text: String) -> Result<String, PersistError> {
        let operation_hash = self.hash_operation(artifact_text.clone());

        if !self.query_map.contains_key(&operation_hash) {
            self.query_map.insert(operation_hash.clone(), artifact_text);
        }

        Ok(operation_hash)
    }

    fn finalize(&self) -> Result<(), PersistError> {
        let ordered: BTreeMap<_, _> = self
            .query_map
            .iter()
            .map(|x| (x.key().clone(), x.value().clone()))
            .collect();

        let content = serde_json::to_string_pretty(&ordered)?;
        std::fs::write(&self.config.file, content)?;

        Ok(())
    }
}
