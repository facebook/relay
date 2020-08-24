/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::artifact_content::ArtifactContent;
use super::Artifact;
use crate::{config::PersistConfig, errors::BuildProjectError};
use lazy_static::lazy_static;
use log::debug;
use md5::{Digest, Md5};
use persist_query::persist;
use regex::Regex;
use std::{
    fs,
    path::PathBuf,
    sync::{Arc, Mutex},
};

lazy_static! {
    static ref RELAY_HASH_REGEX: Regex = Regex::new(r#"@relayHash (\w{32})\n"#).unwrap();
    static ref REQUEST_ID_REGEX: Regex = Regex::new(r#"@relayRequestID (\w+)\n"#).unwrap();
}

pub async fn persist_operations(
    root_dir: &PathBuf,
    artifacts: &mut [Artifact],
    persist_config: &PersistConfig,
) -> Result<(), BuildProjectError> {
    let mut handles = Vec::new();
    let persist_errors: Arc<Mutex<Vec<_>>> = Default::default();
    for artifact in artifacts {
        if let ArtifactContent::Operation {
            text,
            id_and_text_hash,
            ..
        } = &mut artifact.content
        {
            let text_hash = md5(text);
            let extracted_id = extract_persist_id(&root_dir.join(&artifact.path), &text_hash);
            if let Some(id) = extracted_id {
                *id_and_text_hash = Some((id, text_hash));
            } else {
                let text = text.clone();
                let url = persist_config.url.clone();
                let params = persist_config.params.clone();
                let errors = Arc::clone(&persist_errors);
                handles.push(async move {
                    let request = persist(&text, &url, &params);
                    match request.await {
                        Ok(id) => {
                            *id_and_text_hash = Some((id, text_hash));
                        }
                        Err(err) => {
                            errors.lock().unwrap().push(err);
                        }
                    };
                });
            }
        }
    }
    debug!("persisting {} documents", handles.len());
    futures::future::join_all(handles).await;
    debug!("done persisting");
    let errors = Arc::try_unwrap(persist_errors)
        .unwrap()
        .into_inner()
        .unwrap();
    if errors.is_empty() {
        Ok(())
    } else {
        Err(BuildProjectError::PersistErrors { errors })
    }
}

fn extract_persist_id(path: &PathBuf, text_hash: &str) -> Option<String> {
    let content = fs::read_to_string(path).ok()?;

    // Looks like a merge conflict, let's not trust this file.
    if content.contains("<<<<") || content.contains(">>>>") {
        return None;
    }

    // If the existing hash doesn't match the hash of the new query test, abort.
    if let Some(existing_hash) = extract_relay_hash(&content) {
        if existing_hash != text_hash {
            return None;
        }
    }

    extract_request_id(&content)
}

fn extract_relay_hash(content: &str) -> Option<&str> {
    RELAY_HASH_REGEX
        .captures(content)
        .and_then(|captures| captures.get(1).map(|m| m.as_str()))
}

fn extract_request_id(content: &str) -> Option<String> {
    REQUEST_ID_REGEX
        .captures(content)
        .map(|captures| captures[1].to_owned())
}

fn md5(data: &str) -> String {
    let mut md5 = Md5::new();
    md5.input(data);
    hex::encode(md5.result())
}
