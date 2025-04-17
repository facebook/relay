/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! This module provides functionality for working with file sources in the Relay compiler.
//!
//! A file source represents a source code file that contains GraphQL code, such as files with `.graphql` or `.js` extensions (the
//! extension can be set in the relay compiler config). The `FileSource` struct represents a connection to a file source,
//! and provides methods for reading and parsing the contents of the file.
mod external_file_source;
mod extract_graphql;
mod file_categorizer;
mod file_filter;
mod file_group;
mod read_file_to_string;
mod source_control_update_status;
mod walk_dir_file_source;
mod watchman_file_source;
mod watchman_query_builder;

use std::path::PathBuf;
use std::sync::Arc;

use common::PerfLogEvent;
use common::PerfLogger;
use external_file_source::ExternalFileSource;
pub use file_categorizer::FileCategorizer;
pub use file_categorizer::categorize_files;
pub use file_group::FileGroup;
use graphql_watchman::WatchmanFileSourceResult;
use graphql_watchman::WatchmanFileSourceSubscription;
use graphql_watchman::WatchmanFileSourceSubscriptionNextChange;
use log::warn;
pub use read_file_to_string::read_file_to_string;
use serde::Deserialize;
use serde_bser::value::Value;
pub use source_control_update_status::SourceControlUpdateStatus;
pub use watchman_client::prelude::Clock;
use watchman_file_source::WatchmanFileSource;

pub use self::external_file_source::ExternalFileSourceResult;
pub use self::extract_graphql::FsSourceReader;
pub use self::extract_graphql::LocatedDocblockSource;
pub use self::extract_graphql::LocatedGraphQLSource;
pub use self::extract_graphql::LocatedJavascriptSourceFeatures;
pub use self::extract_graphql::SourceReader;
pub use self::extract_graphql::extract_javascript_features_from_file;
pub use self::extract_graphql::source_for_location;
use self::walk_dir_file_source::WalkDirFileSource;
use self::walk_dir_file_source::WalkDirFileSourceResult;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::config::FileSourceKind;
use crate::errors::Error;
use crate::errors::Result;

pub enum FileSource {
    Watchman(WatchmanFileSource),
    External(ExternalFileSource),
    WalkDir(WalkDirFileSource),
}

impl FileSource {
    pub async fn connect(
        config: &Arc<Config>,
        perf_logger_event: &impl PerfLogEvent,
    ) -> Result<FileSource> {
        match &config.file_source_config {
            FileSourceKind::Watchman => Ok(Self::Watchman(
                WatchmanFileSource::connect(config, perf_logger_event).await?,
            )),
            FileSourceKind::External(changed_files_list) => Ok(Self::External(
                ExternalFileSource::new(changed_files_list.to_path_buf(), Arc::clone(config)),
            )),
            FileSourceKind::WalkDir => {
                Ok(Self::WalkDir(WalkDirFileSource::new(Arc::clone(config))))
            }
        }
    }

    pub async fn query(
        &self,
        perf_logger_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
    ) -> Result<CompilerState> {
        match self {
            Self::Watchman(file_source) => file_source.query(perf_logger_event, perf_logger).await,
            Self::External(file_source) => {
                let result = file_source.create_compiler_state(perf_logger);
                if let Err(err) = &result {
                    perf_logger_event.string(
                        "external_file_source_create_compiler_state_error",
                        format!("{:?}", err),
                    );
                    warn!(
                        "Unable to create state from external source: {:?}. Sending a full watchman query...",
                        err
                    );
                    let watchman_file_source =
                        WatchmanFileSource::connect(&file_source.config, perf_logger_event).await?;
                    watchman_file_source
                        .full_query(perf_logger_event, perf_logger)
                        .await
                } else {
                    result
                }
            }
            Self::WalkDir(file_source) => file_source.create_compiler_state(perf_logger),
        }
    }

    pub async fn subscribe(
        self,
        perf_logger_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
    ) -> Result<(CompilerState, FileSourceSubscription)> {
        match self {
            Self::Watchman(file_source) => {
                let (compiler_state, watchman_subscription) = file_source
                    .subscribe(perf_logger_event, perf_logger)
                    .await?;
                Ok((
                    compiler_state,
                    FileSourceSubscription::Watchman(watchman_subscription),
                ))
            }
            Self::External(_) | Self::WalkDir(_) => {
                unimplemented!(
                    "watch-mode (subscribe) is not available for non-watchman file sources."
                )
            }
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct File {
    pub name: PathBuf,
    pub exists: bool,
}

impl File {
    pub fn absolute_path(&self, resolved_root: PathBuf) -> PathBuf {
        let mut absolute_path = resolved_root;
        absolute_path.push(&self.name);
        absolute_path
    }
}

#[derive(Debug)]
pub enum FileSourceResult {
    Watchman(WatchmanFileSourceResult),
    External(ExternalFileSourceResult),
    WalkDir(WalkDirFileSourceResult),
}

impl FileSourceResult {
    pub fn clock(&self) -> Option<Clock> {
        match self {
            Self::Watchman(file_source) => Some(file_source.clock.clone()),
            Self::External(_) => None,
            Self::WalkDir(_) => None,
        }
    }

    pub fn resolved_root(&self) -> PathBuf {
        match self {
            Self::Watchman(file_source_result) => file_source_result.resolved_root.path(),
            Self::External(file_source_result) => file_source_result.resolved_root.clone(),
            Self::WalkDir(file_source_result) => file_source_result.resolved_root.clone(),
        }
    }

    pub fn saved_state_info(&self) -> &Option<Value> {
        match self {
            Self::Watchman(file_source_result) => &file_source_result.saved_state_info,
            Self::External(_) => unimplemented!(),
            Self::WalkDir(_) => unimplemented!(),
        }
    }

    pub fn size(&self) -> usize {
        match self {
            Self::Watchman(file_source_result) => file_source_result.files.len(),
            Self::External(file_source_result) => file_source_result.files.len(),
            Self::WalkDir(file_source_result) => file_source_result.files.len(),
        }
    }
}

pub enum FileSourceSubscription {
    Watchman(WatchmanFileSourceSubscription), // Oss(OssFileSourceSubscription)
}

impl FileSourceSubscription {
    pub async fn next_change(&mut self) -> Result<FileSourceSubscriptionNextChange> {
        match self {
            Self::Watchman(file_source_subscription) => {
                file_source_subscription.next_change().await.map_or_else(
                    |err| Err(Error::from(err)),
                    |next_change| Ok(FileSourceSubscriptionNextChange::Watchman(next_change)),
                )
            }
        }
    }
}

#[derive(Debug)]
pub enum FileSourceSubscriptionNextChange {
    Watchman(WatchmanFileSourceSubscriptionNextChange),
}
