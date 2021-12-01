/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::OperationPersister;
use async_trait::async_trait;
use persist_query::PersistError;
use serde::{Deserialize, Serialize};
use sha1::{Digest, Sha1};
use std::collections::HashMap;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct FilePersistConfig {
  /// Path to a file to persist the document to.
  pub file_path: PathBuf,
}

pub struct FilePersister {
  file_path: PathBuf,
}

impl FilePersister {
  pub fn new(path: PathBuf, root_path: PathBuf) -> Self {
    // Append the incoming path to the project's root.
    let mut file_path = root_path.clone();
    file_path.push(path);
    Self { file_path }
  }

  fn hash_operation(&self, operation_text: String) -> String {
    let mut hash = Sha1::new();
    hash.input(&operation_text);
    hex::encode(hash.result())
  }
}

#[async_trait]
impl OperationPersister for FilePersister {
  async fn persist_artifact(&self, operation_text: String) -> Result<String, PersistError> {
    let mut map: HashMap<String, String> = if self.file_path.exists() {
      let existing_content = std::fs::read_to_string(&self.file_path);
      match existing_content {
        Ok(content) => serde_json::from_str(&content).unwrap(),
        Err(_e) => HashMap::new(),
      }
    } else {
      HashMap::new()
    };

    let op_hash = self.hash_operation(operation_text.clone());

    map.insert(op_hash.clone(), operation_text);
    let content = serde_json::to_string_pretty(&map).unwrap();
    std::fs::write(&self.file_path, content).unwrap();

    Ok(op_hash)
  }

  fn worker_count(&self) -> usize {
    0
  }
}
