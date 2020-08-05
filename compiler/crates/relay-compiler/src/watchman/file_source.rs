/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::query_builder::{get_all_roots, get_watchman_expr};
use super::{Clock, WatchmanFile};
use crate::errors::{Error, Result};
use crate::{compiler_state::CompilerState, config::Config};
use common::{PerfLogEvent, PerfLogger};
use log::warn;
use serde_bser::value::Value;
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
    pub saved_state_info: Option<Value>,
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
        perf_logger_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
    ) -> Result<CompilerState> {
        // If the saved state flag is passed, load from it or fail.
        if let Some(saved_state_path) = &self.config.load_saved_state_file {
            let mut compiler_state = perf_logger_event.time("deserialize_saved_state", || {
                CompilerState::deserialize_from_file(&saved_state_path)
            })?;
            let file_source_result = self
                .query_file_result(Some(compiler_state.clock.clone()), perf_logger_event)
                .await?;
            compiler_state.merge_file_source_changes(
                &self.config,
                &file_source_result,
                perf_logger_event,
                perf_logger,
            )?;
            return Ok(compiler_state);
        }

        // If saved state is configured, try using saved state unless the config
        // forces a full build.
        if let Config {
            full_build: false,
            saved_state_config: Some(saved_state_config),
            saved_state_loader: Some(saved_state_loader),
            ..
        } = self.config
        {
            let scm_since = Clock::ScmAware(FatClockData {
                clock: ClockSpec::null(),
                scm: Some(saved_state_config.clone()),
            });
            let file_source_result = self
                .query_file_result(Some(scm_since), perf_logger_event)
                .await?;

            if let Some(saved_state_info) = &file_source_result.saved_state_info {
                let saved_state_path = saved_state_loader.load(&saved_state_info);
                if let Some(saved_state_path) = saved_state_path {
                    let mut compiler_state = perf_logger_event
                        .time("deserialize_saved_state", || {
                            CompilerState::deserialize_from_file(&saved_state_path)
                        })?;
                    compiler_state.merge_file_source_changes(
                        &self.config,
                        &file_source_result,
                        perf_logger_event,
                        perf_logger,
                    )?;
                    return Ok(compiler_state);
                } else {
                    warn!("got saved state response, but unable to read");
                }
            } else {
                warn!("no saved state in watchman response");
            }
        }

        // Finally, do a simple full query.
        let file_source_result = self.query_file_result(None, perf_logger_event).await?;
        let compiler_state = CompilerState::from_file_source_changes(
            &self.config,
            &file_source_result,
            perf_logger_event,
            perf_logger,
        )?;
        Ok(compiler_state)
    }

    /// Starts a subscription sending updates since the given clock.
    pub async fn subscribe(
        self,
        perf_logger_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
    ) -> Result<(CompilerState, FileSourceSubscription<'config>)> {
        let compiler_state = self.query(perf_logger_event, perf_logger).await?;

        let expression = get_watchman_expr(&self.config);

        let file_source_result = self
            .query_file_result(Some(compiler_state.clock.clone()), perf_logger_event)
            .await?;

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

        Ok((
            compiler_state,
            FileSourceSubscription {
                file_source: self,
                subscription,
            },
        ))
    }

    /// Internal method to issue a watchman query, returning a raw
    /// FileSourceResult.
    async fn query_file_result(
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
            saved_state_info: query_result.saved_state_info,
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
                    saved_state_info: None,
                }));
            }
        }
        Ok(None)
    }
}
