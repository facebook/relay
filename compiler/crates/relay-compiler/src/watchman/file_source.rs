/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::errors::{Error, Result};
use super::Clock;
use super::{
    query_builder::{get_all_roots, get_watchman_expr},
    WatchmanFile,
};
use crate::config::Config;
use common::PerfLogEvent;
use watchman_client::prelude::*;
use watchman_client::{Subscription as WatchmanSubscription, SubscriptionData};

pub struct FileSource<'config> {
    client: Client,
    config: &'config Config,
    resolved_root: ResolvedRoot,
}

#[derive(Debug)]
pub struct FileSourceResult {
    pub files: Vec<WatchmanFile>,
    pub resolved_root: ResolvedRoot,
    pub clock: Clock,
}

#[derive(Debug)]
pub struct QueryParams {
    pub since: Clock,
}

impl<'config> FileSource<'config> {
    pub async fn connect(
        config: &'config Config,
        perf_logger_event: &impl PerfLogEvent,
    ) -> Result<FileSource<'config>> {
        let connect_timer = perf_logger_event.start("file_source_connect_time");
        let client = Connector::new().connect().await?;
        let canonical_root = CanonicalPath::canonicalize(&config.root_dir).map_err(|err| {
            Error::CanonicalizeRoot {
                root: config.root_dir.clone(),
                source: err,
            }
        })?;
        let resolved_root = client.resolve_root(canonical_root).await?;
        perf_logger_event.stop(connect_timer);

        Ok(Self {
            client,
            config,
            resolved_root,
        })
    }

    /// Executes a point query (as opposed to a subscription) to find all files
    /// to compile and returns the result.
    pub async fn query(
        &self,
        since_clock: Option<Clock>,
        perf_logger_event: &impl PerfLogEvent,
    ) -> Result<FileSourceResult> {
        let expression = get_watchman_expr(&self.config);

        let query_timer = perf_logger_event.start("watchman_query_time");
        // If `since` is available, we should not pass the `path` parameter.
        // Watchman ignores `since` parameter if both `path` and `since` are
        // passed as the request params
        let request = if since_clock.is_some() {
            QueryRequestCommon {
                expression: Some(expression),
                since: since_clock,
                ..Default::default()
            }
        } else {
            let query_roots = get_all_roots(&self.config)
                .into_iter()
                .map(PathGeneratorElement::RecursivePath)
                .collect();
            QueryRequestCommon {
                expression: Some(expression),
                path: Some(query_roots),
                ..Default::default()
            }
        };
        let query_result = self
            .client
            .query::<WatchmanFile>(&self.resolved_root, request)
            .await?;
        perf_logger_event.stop(query_timer);

        let files = query_result.files.ok_or_else(|| Error::EmptyQueryResult)?;
        Ok(FileSourceResult {
            files,
            resolved_root: self.resolved_root.clone(),
            clock: query_result.clock,
        })
    }

    /// Starts a subscription sending updates since the given clock.
    pub async fn subscribe(
        self,
        file_source_result: FileSourceResult,
    ) -> Result<FileSourceSubscription<'config>> {
        let expression = get_watchman_expr(&self.config);

        let (subscription, _initial) = self
            .client
            .subscribe::<WatchmanFile>(
                &self.resolved_root,
                SubscribeRequest {
                    expression: Some(expression),
                    since: Some(file_source_result.clock.clone()),
                    ..Default::default()
                },
            )
            .await?;

        Ok(FileSourceSubscription {
            file_source: self,
            subscription,
        })
    }
}

pub struct FileSourceSubscription<'config> {
    file_source: FileSource<'config>,
    subscription: WatchmanSubscription<WatchmanFile>,
}

impl<'config> FileSourceSubscription<'config> {
    /// Awaits changes from Watchman and provides the next set of changes
    /// if there were any changes to files
    pub async fn next_change(&mut self) -> Result<Option<FileSourceResult>> {
        let update = self.subscription.next().await?;
        if let SubscriptionData::FilesChanged(changes) = update {
            if let Some(files) = changes.files {
                return Ok(Some(FileSourceResult {
                    files,
                    resolved_root: self.file_source.resolved_root.clone(),
                    clock: changes.clock,
                }));
            }
        }
        Ok(None)
    }
}
