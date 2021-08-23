/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
use common::{sync::ParallelIterator, PerfLogEvent, PerfLogger};
use serde_bser::value::Value;
use std::path::{Path, PathBuf};

pub use self::extract_graphql::{
    extract_graphql_strings_from_file, source_for_location, FsSourceReader, SourceReader,
};
pub use file_categorizer::{categorize_files, FileCategorizer};
pub use file_group::FileGroup;
use rayon::iter::IntoParallelRefIterator;
pub use read_file_to_string::read_file_to_string;
pub use source_control_update_status::SourceControlUpdateStatus;
pub use watchman_client::prelude::Clock;
use watchman_client::ResolvedRoot;
use watchman_file::WatchmanFile;
use watchman_file_source::{
    WatchmanFileSource, WatchmanFileSourceResult, WatchmanFileSourceSubscription,
};

pub enum FileSource<'config> {
    Watchman(WatchmanFileSource<'config>),
    // TODO(T88130396):
    // Oss(OssFileSource<'config>),
}

impl<'config> FileSource<'config> {
    pub async fn connect(
        config: &'config Config,
        perf_logger_event: &impl PerfLogEvent,
    ) -> Result<FileSource<'config>> {
        Ok(Self::Watchman(
            WatchmanFileSource::connect(config, perf_logger_event).await?,
        ))
    }

    pub async fn query(
        &self,
        perf_logger_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
    ) -> Result<CompilerState> {
        match self {
            Self::Watchman(file_source) => file_source.query(perf_logger_event, perf_logger).await,
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
        }
    }
}

#[derive(Debug, Clone)]
pub enum File {
    Watchman(WatchmanFile),
    // TODO(T88130396):
    // Oss(OssFile<'config>),
}

impl File {
    pub fn name(&self) -> &Path {
        match self {
            Self::Watchman(file) => &(*file.name),
        }
    }

    pub fn into_name(self) -> PathBuf {
        match self {
            Self::Watchman(file) => file.name.into_inner(),
        }
    }

    pub fn exists(&self) -> bool {
        match self {
            Self::Watchman(file) => (*file.exists),
        }
    }

    pub fn absolute_path(&self, resolved_root: Option<ResolvedRoot>) -> PathBuf {
        match self {
            Self::Watchman(file) => {
                let mut absolute_path = resolved_root.unwrap().path();
                absolute_path.push(&*file.name);
                absolute_path
            }
        }
    }
}

#[derive(Debug)]
pub enum FileSourceResult {
    Watchman(WatchmanFileSourceResult),
    // TODO(T88130396):
    // Oss(OssFileSourceResult<'config>),
}

impl FileSourceResult {
    pub fn clock(&self) -> Clock {
        match self {
            Self::Watchman(file_source) => file_source.clock.clone(),
        }
    }

    pub fn files(&self) -> impl ParallelIterator<Item = File> + '_ {
        match self {
            Self::Watchman(file_source_result) => file_source_result
                .files
                .par_iter()
                .map(|file| File::Watchman(file.to_owned())),
        }
    }

    pub fn resolved_root(&self) -> Option<ResolvedRoot> {
        match self {
            Self::Watchman(file_source_result) => Some(file_source_result.resolved_root.to_owned()),
        }
    }

    pub fn saved_state_info(&self) -> &Option<Value> {
        match self {
            Self::Watchman(file_source_result) => &file_source_result.saved_state_info,
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
                file_source_subscription.next_change().await
            }
        }
    }
}

#[derive(Debug)]
pub enum FileSourceSubscriptionNextChange {
    Result(FileSourceResult),
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
