/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod external_file_source;
mod extract_graphql;
mod file_categorizer;
mod file_filter;
mod file_group;
mod glob_file_source;
mod read_file_to_string;
mod source_control_update_status;
mod watchman_file_source;
mod watchman_query_builder;

use crate::compiler_state::CompilerState;
use crate::config::{Config, FileSourceKind};
use crate::errors::{Error, Result};
use common::{PerfLogEvent, PerfLogger};
use graphql_watchman::{
    WatchmanFileSourceResult, WatchmanFileSourceSubscription,
    WatchmanFileSourceSubscriptionNextChange,
};
use log::warn;
use serde::Deserialize;
use serde_bser::value::Value;
use std::path::PathBuf;

use self::external_file_source::ExternalFileSourceResult;
pub use self::extract_graphql::{
    extract_graphql_strings_from_file, source_for_location, FsSourceReader, SourceReader,
};
use self::glob_file_source::{GlobFileSource, GlobFileSourceResult};
use external_file_source::ExternalFileSource;
pub use file_categorizer::{categorize_files, FileCategorizer};
pub use file_group::FileGroup;
pub use read_file_to_string::read_file_to_string;
pub use source_control_update_status::SourceControlUpdateStatus;
pub use watchman_client::prelude::Clock;
use watchman_file_source::WatchmanFileSource;

pub enum FileSource<'config> {
    Watchman(WatchmanFileSource<'config>),
    External(ExternalFileSource<'config>),
    Glob(GlobFileSource<'config>),
}

impl<'config> FileSource<'config> {
    pub async fn connect(
        config: &'config Config,
        perf_logger_event: &impl PerfLogEvent,
    ) -> Result<FileSource<'config>> {
        match &config.file_source_config {
            FileSourceKind::Watchman => Ok(Self::Watchman(
                WatchmanFileSource::connect(config, perf_logger_event).await?,
            )),
            FileSourceKind::External(changed_files_list) => Ok(Self::External(
                ExternalFileSource::new(changed_files_list.to_path_buf(), config),
            )),
            FileSourceKind::Glob => Ok(Self::Glob(GlobFileSource::new(config))),
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
                        WatchmanFileSource::connect(file_source.config, perf_logger_event).await?;
                    watchman_file_source
                        .full_query(perf_logger_event, perf_logger)
                        .await
                } else {
                    result
                }
            }
            Self::Glob(file_source) => file_source.create_compiler_state(perf_logger),
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
            Self::External(_) | Self::Glob(_) => {
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
    Glob(GlobFileSourceResult),
}

impl FileSourceResult {
    pub fn clock(&self) -> Option<Clock> {
        match self {
            Self::Watchman(file_source) => Some(file_source.clock.clone()),
            Self::External(_) => None,
            Self::Glob(_) => None,
        }
    }

    pub fn resolved_root(&self) -> PathBuf {
        match self {
            Self::Watchman(file_source_result) => file_source_result.resolved_root.path(),
            Self::External(file_source_result) => file_source_result.resolved_root.clone(),
            Self::Glob(file_source_result) => file_source_result.resolved_root.clone(),
        }
    }

    pub fn saved_state_info(&self) -> &Option<Value> {
        match self {
            Self::Watchman(file_source_result) => &file_source_result.saved_state_info,
            Self::External(_) => unimplemented!(),
            Self::Glob(_) => unimplemented!(),
        }
    }

    pub fn size(&self) -> usize {
        match self {
            Self::Watchman(file_source_result) => file_source_result.files.len(),
            Self::External(file_source_result) => file_source_result.files.len(),
            Self::Glob(file_source_result) => file_source_result.files.len(),
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
