/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::watchman_query_builder::{get_all_roots, get_watchman_expr};
use super::FileSourceResult;
use super::FileSourceSubscriptionNextChange;
use super::WatchmanFile;
use crate::errors::{Error, Result};
use crate::{compiler_state::CompilerState, config::Config, saved_state::SavedStateLoader};
use common::{PerfLogEvent, PerfLogger};
use log::{debug, info, warn};
use serde_bser::value::Value;
use std::process::Command;
pub use watchman_client::prelude::Clock;
use watchman_client::prelude::*;
use watchman_client::{Subscription as WatchmanSubscription, SubscriptionData};

pub struct WatchmanFileSource<'config> {
    client: Client,
    config: &'config Config,
    resolved_root: ResolvedRoot,
}

#[derive(Debug)]
pub struct WatchmanFileSourceResult {
    pub files: Vec<WatchmanFile>,
    pub resolved_root: ResolvedRoot,
    pub clock: Clock,
    pub saved_state_info: Option<Value>,
}

impl<'config> WatchmanFileSource<'config> {
    pub async fn connect(
        config: &'config Config,
        perf_logger_event: &impl PerfLogEvent,
    ) -> Result<WatchmanFileSource<'config>> {
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
        debug!(
            "WatchmanFileSource::connect(...) resolved_root = {:?}",
            resolved_root
        );
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
        info!("querying files to compile...");
        let query_time = perf_logger_event.start("file_source_query_time");
        // If the saved state flag is passed, load from it or fail.
        if let Some(saved_state_path) = &self.config.load_saved_state_file {
            let mut compiler_state = perf_logger_event.time("deserialize_saved_state", || {
                CompilerState::deserialize_from_file(&saved_state_path)
            })?;
            let file_source_result = self
                .query_file_result(Some(compiler_state.clock.clone()), perf_logger_event)
                .await?;
            compiler_state
                .pending_file_source_changes
                .write()
                .unwrap()
                .push(file_source_result);
            compiler_state.merge_file_source_changes(
                &self.config,
                perf_logger_event,
                perf_logger,
                true,
            )?;
            perf_logger_event.stop(query_time);
            return Ok(compiler_state);
        }

        // If saved state is configured, try using saved state unless the config
        // forces a full build.
        if let Config {
            compile_everything: false,
            saved_state_config: Some(saved_state_config),
            saved_state_loader: Some(saved_state_loader),
            saved_state_version,
            ..
        } = self.config
        {
            match self
                .try_saved_state(
                    perf_logger,
                    perf_logger_event,
                    saved_state_config.clone(),
                    saved_state_loader.as_ref(),
                    saved_state_version,
                )
                .await
            {
                Ok(load_result) => {
                    perf_logger_event.stop(query_time);
                    return load_result;
                }
                Err(saved_state_failure) => {
                    warn!(
                        "Unable to load saved state, falling back to full build: {}",
                        saved_state_failure
                    );
                }
            }
        }

        // Finally, do a simple full query.
        let file_source_result = self.query_file_result(None, perf_logger_event).await?;
        let compiler_state = perf_logger_event.time("from_file_source_changes", || {
            CompilerState::from_file_source_changes(
                &self.config,
                &file_source_result,
                perf_logger_event,
                perf_logger,
            )
        })?;
        perf_logger_event.stop(query_time);
        Ok(compiler_state)
    }

    /// Starts a subscription sending updates since the given clock.
    pub async fn subscribe(
        self,
        perf_logger_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
    ) -> Result<(CompilerState, WatchmanFileSourceSubscription)> {
        let timer = perf_logger_event.start("file_source_subscribe_time");
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
                    since: Some(file_source_result.clock()),
                    defer: vec!["hg.update"],
                    ..Default::default()
                },
            )
            .await?;

        perf_logger_event.stop(timer);

        Ok((
            compiler_state,
            WatchmanFileSourceSubscription::new(self.resolved_root.clone(), subscription),
        ))
    }

    /// Internal method to issue a watchman query, returning a raw
    /// WatchmanFileSourceResult.
    async fn query_file_result(
        &self,
        since_clock: Option<Clock>,
        perf_logger_event: &impl PerfLogEvent,
    ) -> Result<FileSourceResult> {
        let expression = get_watchman_expr(&self.config);
        debug!(
            "WatchmanFileSource::query_file_result(...) get_watchman_expr = {:?}",
            &expression
        );

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
        debug!(
            "WatchmanFileSource::query_file_result(...) request = {:?}",
            &request
        );
        let query_result = self
            .client
            .query::<WatchmanFile>(&self.resolved_root, request)
            .await?;
        perf_logger_event.stop(query_timer);

        // print debug information for this result
        // (file list will include only files with specified extension)
        debug_query_results(&query_result, "graphql");

        let files = query_result.files.ok_or(Error::EmptyQueryResult)?;
        Ok(FileSourceResult::Watchman(WatchmanFileSourceResult {
            files,
            resolved_root: self.resolved_root.clone(),
            clock: query_result.clock,
            saved_state_info: query_result.saved_state_info,
        }))
    }

    /// Tries to load saved state with a watchman query.
    /// The return value is a nested Result:
    /// The outer Result indicates the result of a possible saved state infrastructure failure.
    /// The inner Result is a potential parse error.
    async fn try_saved_state(
        &self,
        perf_logger: &impl PerfLogger,
        perf_logger_event: &impl PerfLogEvent,
        saved_state_config: ScmAwareClockData,
        saved_state_loader: &'_ (dyn SavedStateLoader + Send + Sync),
        saved_state_version: &str,
    ) -> std::result::Result<Result<CompilerState>, &'static str> {
        let scm_since = Clock::ScmAware(FatClockData {
            clock: ClockSpec::null(),
            scm: Some(saved_state_config),
        });
        debug!(
            "WatchmanFileSource::try_saved_state(...) scm_since = {:?}",
            &scm_since
        );
        let file_source_result = self
            .query_file_result(Some(scm_since), perf_logger_event)
            .await
            .map_err(|_| "query failed")?;
        debug!(
            "WatchmanFileSource::try_saved_state(...) file_source_result = {:?}",
            &file_source_result
        );
        let saved_state_info = file_source_result
            .saved_state_info()
            .as_ref()
            .ok_or("no saved state in watchman response")?;
        debug!(
            "WatchmanFileSource::saved_state_info(...) file_source_result = {:?}",
            &saved_state_info
        );
        let saved_state_path = perf_logger_event.time("saved_state_loading_time", || {
            saved_state_loader
                .load(&saved_state_info, self.config)
                .ok_or("unable to load")
        })?;
        let mut compiler_state = perf_logger_event
            .time("deserialize_saved_state", || {
                CompilerState::deserialize_from_file(&saved_state_path)
            })
            .map_err(|err| {
                let error_event = perf_logger.create_event("saved_state_loader_error");
                error_event.string("error", format!("Failed to deserialize: {}", err));
                perf_logger.complete_event(error_event);
                perf_logger.flush();
                "failed to deserialize"
            })?;
        // For cases, where we want to debug saved state integration, that doesn't include
        // saved_state format changes we may need to disable this by adding this env variable
        if std::env::var("RELAY_COMPILER_IGNORE_SAVED_STATE_VERSION").is_err()
            && compiler_state.saved_state_version != saved_state_version
        {
            return Err("Saved state version doesn't match.");
        }
        compiler_state
            .pending_file_source_changes
            .write()
            .unwrap()
            .push(file_source_result);
        if let Err(parse_error) = perf_logger_event.time("merge_file_source_changes", || {
            compiler_state.merge_file_source_changes(
                &self.config,
                perf_logger_event,
                perf_logger,
                true,
            )
        }) {
            Ok(Err(parse_error))
        } else {
            Ok(Ok(compiler_state))
        }
    }
}

pub struct WatchmanFileSourceSubscription {
    resolved_root: ResolvedRoot,
    subscription: WatchmanSubscription<WatchmanFile>,
    base_revision: String,
}

impl WatchmanFileSourceSubscription {
    fn new(resolved_root: ResolvedRoot, subscription: WatchmanSubscription<WatchmanFile>) -> Self {
        Self {
            resolved_root,
            subscription,
            base_revision: get_base_revision(None),
        }
    }

    /// Awaits changes from Watchman and provides the next set of changes
    /// if there were any changes to files
    pub async fn next_change(&mut self) -> Result<FileSourceSubscriptionNextChange> {
        match self.subscription.next().await? {
            SubscriptionData::FilesChanged(changes) => {
                if let Some(files) = changes.files {
                    debug!("number of files in this update: {}", files.len());
                    return Ok(FileSourceSubscriptionNextChange::Result(
                        FileSourceResult::Watchman(WatchmanFileSourceResult {
                            files,
                            resolved_root: self.resolved_root.clone(),
                            clock: changes.clock,
                            saved_state_info: None,
                        }),
                    ));
                }
            }
            SubscriptionData::StateEnter { state_name, .. } => {
                if state_name == "hg.update" {
                    return Ok(FileSourceSubscriptionNextChange::SourceControlUpdateEnter);
                }
            }
            SubscriptionData::StateLeave {
                state_name,
                metadata,
            } => {
                if state_name == "hg.update" {
                    let current_commit = if let Some(Value::ByteString(value)) = metadata {
                        Some(value.to_string())
                    } else {
                        None
                    };
                    let current_base_revision = get_base_revision(current_commit);
                    if current_base_revision != self.base_revision {
                        self.base_revision = current_base_revision;
                        return Ok(FileSourceSubscriptionNextChange::SourceControlUpdate);
                    } else {
                        return Ok(FileSourceSubscriptionNextChange::SourceControlUpdateLeave);
                    }
                }
            }
            SubscriptionData::Canceled => {
                return Err(Error::WatchmanSubscriptionCanceled);
            }
        }
        Ok(FileSourceSubscriptionNextChange::None)
    }
}

/// Base revision in this case is a common ancestor of two revisions:
/// `master` and current commit hash or `.`
fn get_base_revision(commit_hash: Option<String>) -> String {
    let output = Command::new("hg")
        .arg("log".to_string())
        .arg("-r".to_string())
        .arg(format!(
            "ancestor(master, {})",
            commit_hash.unwrap_or_else(|| ".".to_string())
        ))
        .arg("-T={node}")
        .output()
        .expect("Expect `hg` command getting base revision.");

    if output.stdout.is_empty() {
        panic!(
            "Failed to get base revision hash:\n {:?}",
            String::from_utf8_lossy(&output.stderr)
        );
    }

    String::from_utf8_lossy(&output.stdout).to_string()
}

fn debug_query_results(query_result: &QueryResult<WatchmanFile>, extension_filter: &str) {
    if let Ok(rust_log) = std::env::var("RUST_LOG") {
        if rust_log == *"debug" {
            debug!(
                "WatchmanFileSource::query_file_result(...) query_result.version = {:?}",
                query_result.version
            );
            debug!(
                "WatchmanFileSource::query_file_result(...) query_result.clock = {:?}",
                query_result.clock
            );
            debug!(
                "WatchmanFileSource::query_file_result(...) query_result.is_fresh_instance = {:?}",
                query_result.is_fresh_instance
            );
            debug!(
                "WatchmanFileSource::query_file_result(...) query_result.saved_state_info = {:?}",
                query_result.saved_state_info
            );
            debug!(
                "WatchmanFileSource::query_file_result(...) query_result.state_metadata = {:?}",
                query_result.state_metadata
            );
            if let Some(files) = &query_result.files {
                debug!(
                    "WatchmanFileSource::query_file_result(...) query_result.files(only=*.{}) = \n{}",
                    extension_filter,
                    files
                        .iter()
                        .filter_map(|file| {
                            if file.name.extension().is_some()
                                && file.name.extension().unwrap() == extension_filter
                            {
                                Some(format!(
                                    "name: {:?}, hash: {:?}, exists: {}",
                                    *file.name, *file.hash, *file.exists
                                ))
                            } else {
                                None
                            }
                        })
                        .collect::<Vec<String>>()
                        .join("\n")
                );
            } else {
                debug!("WatchmanFileSource::query_file_result(...): no files found");
            }
        }
    }
}
