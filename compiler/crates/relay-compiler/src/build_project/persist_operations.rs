/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::LazyLock;

use common::PerfLogEvent;
use common::sync::ParallelIterator;
use log::debug;
use md5::Digest;
use md5::Md5;
use persist_query::PersistError;
use rayon::iter::IntoParallelRefMutIterator;
use regex::Regex;
use relay_codegen::QueryID;
use relay_transforms::Programs;

use crate::Artifact;
use crate::ArtifactContent;
use crate::OperationPersister;
use crate::config::ArtifactForPersister;
use crate::config::Config;
use crate::config::ProjectConfig;
use crate::errors::BuildProjectError;

static RELAY_HASH_REGEX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r#"@relayHash (\w{32})\n"#).unwrap());
static REQUEST_ID_REGEX: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r#"@relayRequestID (.+)\n"#).unwrap());

#[expect(
    clippy::too_many_arguments,
    reason = "Threading the schema text down from the caller that holds the compiler state adds an eighth; splitting the persist inputs into a struct would touch every caller for no behavioral gain."
)]
pub async fn persist_operations(
    artifacts: &mut [Artifact],
    root_dir: &Path,
    config: &Config,
    project_config: &ProjectConfig,
    operation_persister: &'_ (dyn OperationPersister + Send + Sync),
    log_event: &impl PerfLogEvent,
    programs: &Programs,
    schema_text: Option<Arc<String>>,
) -> Result<(), BuildProjectError> {
    let handles = artifacts
        .par_iter_mut()
        .flat_map(|artifact| {
            if let ArtifactContent::Operation {
                ref text,
                ref mut id_and_text_hash,
                ref reader_operation,
                ref normalization_operation,
                ..
            } = artifact.content
            {
                if let Some(Some(virtual_id_file_name)) = config
                    .generate_virtual_id_file_name
                    .as_ref()
                    .map(|gen_name| gen_name(project_config, reader_operation, &programs.reader))
                {
                    if text.is_some() {
                        *id_and_text_hash = Some(QueryID::External(virtual_id_file_name));
                    }
                    None
                } else if let Some(text) = text {
                    let text_hash = md5(text);
                    let relative_path = artifact.path.to_owned();
                    let mut override_schema = None;
                    if let Some(custom_override_schema_determinator) =
                        config.custom_override_schema_determinator.as_ref()
                    {
                        override_schema = custom_override_schema_determinator(
                            project_config,
                            normalization_operation,
                        );
                    }
                    let artifact_path = root_dir.join(&artifact.path);
                    let previous_id = if config.repersist_operations {
                        None
                    } else {
                        extract_persist_id(&artifact_path, &text_hash)
                    };
                    let text = text.clone();
                    // An `Arc` clone: the same schema for every document.
                    let schema_text = schema_text.clone();
                    Some(async move {
                        operation_persister
                            .persist_artifact_with_previous_id(
                                ArtifactForPersister {
                                    text,
                                    relative_path,
                                    override_schema,
                                    schema_text,
                                },
                                previous_id,
                            )
                            .await
                            .map(|id| {
                                *id_and_text_hash = Some(QueryID::Persisted { id, text_hash });
                            })
                    })
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect::<Vec<_>>();
    log_event.number("persist_documents", handles.len());
    let results = futures::future::join_all(handles).await;
    let errors = finalize_after_successful_persists(operation_persister, results).await;
    if let Err(errors) = errors {
        let error = BuildProjectError::PersistErrors {
            errors,
            project_name: project_config.name,
        };
        log_event.string("error", error.to_string());
        return Err(error);
    }
    debug!("done persisting");
    Ok(())
}

async fn finalize_after_successful_persists(
    operation_persister: &(dyn OperationPersister + Send + Sync),
    results: Vec<Result<(), PersistError>>,
) -> Result<(), Vec<PersistError>> {
    let errors = results
        .into_iter()
        .filter_map(Result::err)
        .collect::<Vec<_>>();
    if !errors.is_empty() {
        return Err(errors);
    }

    operation_persister
        .finalize()
        .await
        .map_err(|error| vec![error])
}

fn extract_persist_id(path: &PathBuf, text_hash: &str) -> Option<String> {
    let content = fs::read_to_string(path).ok()?;

    // Looks like a merge conflict, let's not trust this file.
    if content.contains("<<<<") || content.contains(">>>>") {
        return None;
    }

    // Require @relayHash to be present and matching. If absent, we cannot verify
    // that the persist ID is still valid for the current query text — re-persist.
    let existing_hash = extract_relay_hash(&content)?;
    if existing_hash != text_hash {
        return None;
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
    md5.update(data);
    hex::encode(md5.finalize())
}

#[cfg(test)]
mod tests {
    use std::sync::atomic::AtomicUsize;
    use std::sync::atomic::Ordering;

    use async_trait::async_trait;

    use super::*;
    use crate::config::PersistId;
    use crate::config::PersistResult;

    #[derive(Default)]
    struct RecordingPersister {
        finalize_calls: AtomicUsize,
    }

    #[async_trait]
    impl OperationPersister for RecordingPersister {
        async fn persist_artifact(
            &self,
            _artifact: ArtifactForPersister,
        ) -> PersistResult<PersistId> {
            Ok("persisted-id".to_owned())
        }

        async fn finalize(&self) -> PersistResult<()> {
            self.finalize_calls.fetch_add(1, Ordering::SeqCst);
            Ok(())
        }
    }

    #[tokio::test]
    async fn finalizes_after_all_operations_succeed() {
        let persister = RecordingPersister::default();

        finalize_after_successful_persists(&persister, vec![Ok(()), Ok(())])
            .await
            .expect("successful operations should finalize");

        assert_eq!(persister.finalize_calls.load(Ordering::SeqCst), 1);
    }

    #[tokio::test]
    async fn does_not_finalize_after_any_operation_fails() {
        let persister = RecordingPersister::default();
        let results = vec![
            Err(PersistError::ErrorResponse {
                message: "first failure".to_owned(),
            }),
            Ok(()),
            Err(PersistError::ErrorResponse {
                message: "second failure".to_owned(),
            }),
        ];

        let errors = finalize_after_successful_persists(&persister, results)
            .await
            .expect_err("persist failures should skip finalization");

        assert_eq!(errors.len(), 2, "all persist errors should be retained");
        assert_eq!(persister.finalize_calls.load(Ordering::SeqCst), 0);
    }
}
