/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::artifact_content::ArtifactContent;
use super::Artifact;
use crate::{
    config::{Config, PersistConfig},
    errors::BuildProjectError,
};
use lazy_static::lazy_static;
use md5::{Digest, Md5};
use persist_query::persist;
use regex::Regex;
use std::{fs, path::PathBuf};

lazy_static! {
    static ref RELAY_HASH_REGEX: Regex = Regex::new(r#"@relayHash (\w{32})\n"#).unwrap();
    static ref REQUEST_ID_REGEX: Regex = Regex::new(r#"@relayRequestID (\w+)\n"#).unwrap();
}

pub async fn persist_operations(
    config: &Config,
    artifacts: &mut [Artifact<'_>],
    persist_config: &PersistConfig,
) -> Result<(), BuildProjectError> {
    for artifact in artifacts {
        if let ArtifactContent::Operation {
            text,
            id_and_text_hash,
            ..
        } = &mut artifact.content
        {
            let text_hash = md5(text);
            let extracted_id =
                extract_persist_id(&config.root_dir.join(&artifact.path), &text_hash);

            let id = if let Some(id) = extracted_id {
                id
            } else {
                persist(&text, &persist_config.url, &persist_config.params)
                    .await
                    .map_err(BuildProjectError::PersistError)?
            };
            *id_and_text_hash = Some((id, text_hash));
        }
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
