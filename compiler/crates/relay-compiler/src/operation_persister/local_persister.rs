/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;
use std::fs::File;
use std::io::BufWriter;
use std::io::Write;

use async_trait::async_trait;
use dashmap::DashMap;
use md5::Md5;
use persist_query::PersistError;
use relay_config::LocalPersistAlgorithm;
use relay_config::LocalPersistConfig;
use sha1::Digest;
use sha1::Sha1;
use sha2::Sha256;

use crate::OperationPersister;
use crate::config::ArtifactForPersister;

/// A local persister that stores GraphQL documents in a file on disk.
///
/// This struct implements the `OperationPersister` trait, which defines the interface for persisting GraphQL operations.
pub struct LocalPersister {
    /// The configuration for the local persister.
    config: LocalPersistConfig,
    /// A map of query IDs to query texts.
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
                md5.update(operation_text);
                hex::encode(md5.finalize())
            }
            LocalPersistAlgorithm::SHA1 => {
                let mut hash = Sha1::new();
                hash.update(&operation_text);
                hex::encode(hash.finalize())
            }
            LocalPersistAlgorithm::SHA256 => {
                let mut hash = Sha256::new();
                hash.update(&operation_text);
                hex::encode(hash.finalize())
            }
        }
    }
}

#[async_trait]
impl OperationPersister for LocalPersister {
    async fn persist_artifact(
        &self,
        artifact: ArtifactForPersister,
    ) -> Result<String, PersistError> {
        let operation_hash = self.hash_operation(artifact.text.clone());

        if !self.query_map.contains_key(&operation_hash) {
            self.query_map.insert(operation_hash.clone(), artifact.text);
        }

        Ok(operation_hash)
    }

    fn finalize(&self) -> Result<(), PersistError> {
        let ordered: BTreeMap<_, _> = self
            .query_map
            .iter()
            .map(|x| (x.key().clone(), x.value().clone()))
            .collect();

        let mut writer = BufWriter::new(File::create(&self.config.file)?);
        serde_json::to_writer_pretty(&mut writer, &ordered)?;
        writer.write_all(b"\n")?;
        writer.flush()?;
        Ok(())
    }
}
