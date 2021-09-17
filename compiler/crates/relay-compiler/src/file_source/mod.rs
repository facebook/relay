/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod external_file_source;
mod extract_graphql;
mod file_categorizer;
mod file_group;
mod read_file_to_string;
mod source_control_update_status;
mod watchman_file;
mod watchman_file_source;
mod watchman_query_builder;

use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::errors::Result;
use common::{PerfLogEvent, PerfLogger};
use serde::Deserialize;
use serde_bser::value::Value;
use std::path::PathBuf;

use self::external_file_source::ExternalFileSourceResult;
pub use self::extract_graphql::{
    extract_graphql_strings_from_file, source_for_location, FsSourceReader, SourceReader,
};
use external_file_source::ExternalFileSource;
pub use file_categorizer::{categorize_files, FileCategorizer};
pub use file_group::FileGroup;
pub use read_file_to_string::read_file_to_string;
pub use source_control_update_status::SourceControlUpdateStatus;
pub use watchman_client::prelude::Clock;
use watchman_file::WatchmanFile;
use watchman_file_source::{
    WatchmanFileSource, WatchmanFileSourceResult, WatchmanFileSourceSubscription,
};

pub enum FileSource<'config> {
    Watchman(WatchmanFileSource<'config>),
    External(ExternalFileSource<'config>),
    // TODO(T88130396):
    // Oss(OssFileSource<'config>),
}

impl<'config> FileSource<'config> {
    pub async fn connect(
        config: &'config Config,
        perf_logger_event: &impl PerfLogEvent,
    ) -> Result<FileSource<'config>> {
        if config.changed_files_list.is_some() {
            Ok(Self::External(ExternalFileSource::new(config)))
        } else {
            Ok(Self::Watchman(
                WatchmanFileSource::connect(config, perf_logger_event).await?,
            ))
        }
    }

    pub async fn query(
        &self,
        perf_logger_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
    ) -> Result<CompilerState> {
        match self {
            Self::Watchman(file_source) => file_source.query(perf_logger_event, perf_logger).await,
            Self::External(file_source) => file_source.create_compiler_state(perf_logger),
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
            Self::External(_) => {
                unimplemented!("watch-mode (subscribe) is not available for external file source.")
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
    // TODO(T88130396):
    // Oss(OssFileSourceResult<'config>)
}

impl FileSourceResult {
    pub fn clock(&self) -> Clock {
        match self {
            Self::Watchman(file_source) => file_source.clock.clone(),
            Self::External(_) => unimplemented!(),
        }
    }

    pub fn files(&self) -> Vec<File> {
        match self {
            Self::Watchman(file_source_result) => file_source_result
                .files
                .iter()
                .map(|file| File {
                    name: (*file.name).clone(),
                    exists: *file.exists,
                })
                .collect::<Vec<File>>(),
            Self::External(file_source_result) => file_source_result.files.clone(),
        }
    }

    pub fn resolved_root(&self) -> PathBuf {
        match self {
            Self::Watchman(file_source_result) => file_source_result.resolved_root.path(),
            Self::External(file_source_result) => file_source_result.resolved_root.clone(),
        }
    }

    pub fn saved_state_info(&self) -> &Option<Value> {
        match self {
            Self::Watchman(file_source_result) => &file_source_result.saved_state_info,
            Self::External(_) => unimplemented!(),
        }
    }

    pub fn size(&self) -> usize {
        match self {
            Self::Watchman(file_source_result) => file_source_result.files.len(),
            Self::External(file_source_result) => file_source_result.files.len(),
        }
    }
}

pub enum FileSourceSubscription {
    Watchman(WatchmanFileSourceSubscription), // Oss(OssFileSourceSubscription)
}

impl FileSourceSubscription {
    pub async fn next_change(&mut self) -> Result<FileSourceSubscriptionNextChange> {
        match self {
            Self::Watchman(file_source_subscription) => file_source_subscription
                .next_change()
                .await
                .map(|next_change| FileSourceSubscriptionNextChange::Watchman(next_change)),
        }
    }
}

#[derive(Debug)]
pub enum FileSourceSubscriptionNextChange {
    Watchman(WatchmanFileSourceSubscriptionNextChange),
}

#[derive(Debug)]
pub enum WatchmanFileSourceSubscriptionNextChange {
    Result(WatchmanFileSourceResult),
    /// This value indicated the beginning of the source control update.
    /// We may stop the compilation process and wait for the next event.
    SourceControlUpdateEnter,
    /// If source control update has not changed the base revision of the commit
    /// We may continue the `watch(...)` loop of the compiler, expecting to receive
    /// a `Result` event after `SourceControlUpdateLeave`.
    SourceControlUpdateLeave,
    /// When source control update completed and we detected changed base revision,
    /// we may need to create a new compiler state.
    SourceControlUpdate,
    None,
}
