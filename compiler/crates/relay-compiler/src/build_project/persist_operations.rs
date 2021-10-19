/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    config::{Config, ProjectConfig},
    config::{OperationPersister, PersistConfig},
    errors::BuildProjectError,
    Artifact, ArtifactContent,
};
use common::{sync::ParallelIterator, PerfLogEvent};
use lazy_static::lazy_static;
use log::debug;
use md5::{Digest, Md5};
use rayon::iter::IntoParallelRefMutIterator;
use regex::Regex;
use relay_codegen::QueryID;
use relay_transforms::Programs;
use std::{fs, path::PathBuf};

lazy_static! {
    static ref RELAY_HASH_REGEX: Regex = Regex::new(r#"@relayHash (\w{32})\n"#).unwrap();
    static ref REQUEST_ID_REGEX: Regex = Regex::new(r#"@relayRequestID (.+)\n"#).unwrap();
}

pub async fn persist_operations(
    artifacts: &mut [Artifact],
    root_dir: &PathBuf,
    persist_config: &PersistConfig,
    config: &Config,
    project_config: &ProjectConfig,
    operation_persister: &'_ (dyn OperationPersister + Send + Sync),
    log_event: &impl PerfLogEvent,
    programs: &Programs,
) -> Result<(), BuildProjectError> {
    let handles = artifacts
        .par_iter_mut()
        .flat_map(|artifact| {
            if let ArtifactContent::Operation {
                ref text,
                ref mut id_and_text_hash,
                ref reader_operation,
                ..
            } = artifact.content
            {
                if let Some(Some(virtual_id_file_name)) = config
                    .generate_virtual_id_file_name
                    .as_ref()
                    .map(|gen_name| gen_name(project_config, reader_operation, &programs.reader))
                {
                    *id_and_text_hash = Some(QueryID::External(virtual_id_file_name));
                    None
                } else {
                    let text_hash = md5(text);
                    let artifact_path = root_dir.join(&artifact.path);
                    let extracted_persist_id = if config.repersist_operations {
                        None
                    } else {
                        extract_persist_id(&artifact_path, &text_hash)
                    };
                    if let Some(id) = extracted_persist_id {
                        *id_and_text_hash = Some(QueryID::Persisted { id, text_hash });
                        None
                    } else {
                        let text = text.clone();
                        Some(async move {
                            operation_persister
                                .persist_artifact(text, persist_config)
                                .await
                                .map(|id| {
                                    *id_and_text_hash = Some(QueryID::Persisted { id, text_hash });
                                })
                        })
                    }
                }
            } else {
                None
            }
        })
        .collect::<Vec<_>>();
    log_event.number("persist_documents", handles.len());
    log_event.number("worker_count", operation_persister.worker_count());
    let results = futures::future::join_all(handles).await;
    debug!("done persisting");
    let errors = results
        .into_iter()
        .filter_map(Result::err)
        .collect::<Vec<_>>();
    if !errors.is_empty() {
        let error = BuildProjectError::PersistErrors { errors };
        log_event.string("error", error.to_string());
        return Err(error);
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
