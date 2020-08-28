/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    config::{ArtifactPersister, PersistConfig},
    errors::BuildProjectError,
    Artifact, ArtifactContent,
};
use lazy_static::lazy_static;
use log::debug;
use md5::{Digest, Md5};
use regex::Regex;
use std::{fs, path::PathBuf};

lazy_static! {
    static ref RELAY_HASH_REGEX: Regex = Regex::new(r#"@relayHash (\w{32})\n"#).unwrap();
    static ref REQUEST_ID_REGEX: Regex = Regex::new(r#"@relayRequestID (\w+)\n"#).unwrap();
}

pub async fn persist_operations(
    artifacts: &mut [Artifact],
    root_dir: &PathBuf,
    persist_config: &PersistConfig,
    artifact_persister: &Box<dyn ArtifactPersister + Send + Sync>,
) -> Result<(), BuildProjectError> {
    let handles = artifacts.iter_mut().map(|artifact| async move {
        if let ArtifactContent::Operation {
            ref text,
            ref mut id_and_text_hash,
            ..
        } = artifact.content
        {
            let text_hash = md5(text);
            let path = root_dir.join(&artifact.path);
            let persist_id = if let Some(extracted_id) = extract_persist_id(&path, &text_hash) {
                extracted_id
            } else {
                artifact_persister
                    .persist_artifact(text.to_string(), persist_config)
                    .await?
            };
            *id_and_text_hash = Some((persist_id, text_hash));
        }
        Ok(())
    });

    debug!("persisting {} documents", handles.len());
    let results = futures::future::join_all(handles).await;
    debug!("done persisting");
    let errors = results
        .into_iter()
        .filter_map(Result::err)
        .collect::<Vec<_>>();
    if !errors.is_empty() {
        return Err(BuildProjectError::PersistErrors { errors });
    }
    Ok(())
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
