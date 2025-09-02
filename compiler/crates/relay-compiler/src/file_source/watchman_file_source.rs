/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::PerfLogEvent;
use common::PerfLogger;
use graphql_watchman::WatchmanFile;
use graphql_watchman::WatchmanFileSourceResult;
use graphql_watchman::WatchmanFileSourceSubscription;
use log::debug;
use log::info;
use log::warn;
use relay_saved_state_loader::SavedStateConfig;
use relay_saved_state_loader::SavedStateLoader;
pub use watchman_client::prelude::Clock;
use watchman_client::prelude::*;

use super::FileSourceResult;
use super::watchman_query_builder::get_watchman_expr;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::errors::Error;
use crate::errors::Result;

pub struct WatchmanFileSource {
    client: Arc<Client>,
    config: Arc<Config>,
    resolved_root: ResolvedRoot,
}

impl WatchmanFileSource {
    pub async fn connect(
        config: &Arc<Config>,
        perf_logger_event: &impl PerfLogEvent,
    ) -> Result<WatchmanFileSource> {
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
        debug!("WatchmanFileSource::connect(...) resolved_root = {resolved_root:?}");
        Ok(Self {
            client: Arc::new(client),
            config: config.clone(),
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
        info!("Querying files to compile...");
        let query_time = perf_logger_event.start("file_source_query_time");
        // If the saved state flag is passed, load from it or fail.
        if let Some(saved_state_path) = &self.config.load_saved_state_file {
            let mut compiler_state = perf_logger_event.time("deserialize_saved_state", || {
                CompilerState::deserialize_from_file(saved_state_path)
            })?;
            let query_timer = perf_logger_event.start("watchman_query_time");
            let file_source_result = query_file_result(
                &self.config,
                &self.client,
                &self.resolved_root.clone(),
                compiler_state.clock.clone(),
                false,
            )
            .await?;
            perf_logger_event.stop(query_timer);
            compiler_state
                .pending_file_source_changes
                .write()
                .unwrap()
                .push(file_source_result);
            compiler_state.merge_file_source_changes(&self.config, perf_logger, true)?;
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
        } = self.config.as_ref()
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
                    perf_logger_event.string("try_saved_state_result", "success".to_owned());
                    return load_result;
                }
                Err(saved_state_failure) => {
                    perf_logger_event
                        .string("try_saved_state_result", saved_state_failure.to_owned());
                    warn!(
                        "Unable to load saved state, falling back to full build: {saved_state_failure}"
                    );
                }
            }
        }

        // Finally, do a simple full query.
        let full_query_result = self.full_query(perf_logger_event, perf_logger).await;

        perf_logger_event.stop(query_time);
        full_query_result
    }

    pub async fn full_query(
        &self,
        perf_logger_event: &impl PerfLogEvent,
        perf_logger: &impl PerfLogger,
    ) -> Result<CompilerState> {
        let file_source_result = query_file_result(
            &self.config,
            &self.client,
            &self.resolved_root.clone(),
            None,
            false,
        )
        .await?;
        let compiler_state = perf_logger_event.time("from_file_source_changes", || {
            CompilerState::from_file_source_changes(
                &self.config,
                &file_source_result,
                perf_logger_event,
                perf_logger,
            )
        })?;
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

        let query_timer = perf_logger_event.start("watchman_query_time_before_subscribe");
        let file_source_result = query_file_result(
            &self.config,
            &self.client,
            &self.resolved_root.clone(),
            compiler_state.clock.clone(),
            true,
        )
        .await?;
        perf_logger_event.stop(query_timer);

        let query_timer = perf_logger_event.start("watchman_query_time_subscribe");
        let (subscription, _initial) = self
            .client
            .subscribe::<WatchmanFile>(
                &self.resolved_root,
                SubscribeRequest {
                    expression: Some(expression),
                    since: file_source_result.clock(),
                    defer: vec!["hg.update"],
                    ..Default::default()
                },
            )
            .await?;
        perf_logger_event.stop(query_timer);

        perf_logger_event.stop(timer);

        Ok((
            compiler_state,
            WatchmanFileSourceSubscription::new(self.resolved_root.clone(), subscription),
        ))
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
        let try_saved_state_event = perf_logger_event.start("try_saved_state_time");
        let scm_since = Clock::ScmAware(FatClockData {
            clock: ClockSpec::null(),
            scm: Some(saved_state_config),
        });
        debug!(
            "WatchmanFileSource::try_saved_state(...) scm_since = {:?}",
            &scm_since
        );

        // Issue two watchman queries: One to get the saved state info, and one to get the changed files.
        // We'll download and deserialize saved state from manifold while the second watchman query executes.

        let since = Some(scm_since.clone());
        let root = self.resolved_root.clone();
        let saved_state_query_timer = perf_logger_event.start("saved_state_info_query_time");
        let saved_state_result = query_file_result(&self.config, &self.client, &root, since, true)
            .await
            .map_err(|_| "query failed")?;
        perf_logger_event.stop(saved_state_query_timer);

        let since = Some(scm_since.clone());
        let config = Arc::clone(&self.config);
        let client = Arc::clone(&self.client);
        let root = self.resolved_root.clone();
        let changed_files_result_future = tokio::task::spawn(async move {
            query_file_result(&config, &client, &root, since, false)
                .await
                .map_err(|_| "query failed")
        });

        // First, use saved state query to download saved state from manifold.
        debug!(
            "WatchmanFileSource::try_saved_state(...) saved_state_result = {:?}",
            &saved_state_result
        );
        let saved_state_info = saved_state_result
            .saved_state_info()
            .as_ref()
            .ok_or("no saved state in watchman response")?;
        debug!(
            "WatchmanFileSource::saved_state_info(...) file_source_result = {:?}",
            &saved_state_info
        );

        let saved_state_load_timer = perf_logger_event.start("saved_state_loading_time");
        let saved_state_path = saved_state_loader
            .load(
                saved_state_info,
                &SavedStateConfig {
                    saved_state_version: self.config.saved_state_version.clone(),
                },
            )
            .await
            .ok_or("unable to load")?;
        perf_logger_event.stop(saved_state_load_timer);

        let mut compiler_state = perf_logger_event
            .time("deserialize_saved_state", || {
                CompilerState::deserialize_from_file(&saved_state_path)
            })
            .map_err(|err| {
                let error_event = perf_logger.create_event("saved_state_loader_error");
                error_event.string("error", format!("Failed to deserialize: {err}"));
                error_event.complete();
                "failed to deserialize"
            })?;
        // For cases, where we want to debug saved state integration, that doesn't include
        // saved_state format changes we may need to disable this by adding this env variable
        if std::env::var("RELAY_COMPILER_IGNORE_SAVED_STATE_VERSION").is_err()
            && compiler_state.saved_state_version != saved_state_version
        {
            return Err("Saved state version doesn't match.");
        }

        // Then await the changed files query.
        let saved_state_await_changed_files_time =
            perf_logger_event.start("saved_state_await_changed_files_time");
        let file_source_result = changed_files_result_future
            .await
            .map_err(|_| "query failed")??;
        perf_logger_event.stop(saved_state_await_changed_files_time);

        compiler_state
            .pending_file_source_changes
            .write()
            .unwrap()
            .push(file_source_result);

        if let Some(update_compiler_state_from_saved_state) =
            &self.config.update_compiler_state_from_saved_state
        {
            let update_compiler_state_from_saved_state_time =
                perf_logger_event.start("update_compiler_state_from_saved_state_time");
            update_compiler_state_from_saved_state(&mut compiler_state, &self.config);
            perf_logger_event.stop(update_compiler_state_from_saved_state_time);
        }

        match perf_logger_event.time("merge_file_source_changes", || {
            let result = compiler_state.merge_file_source_changes(&self.config, perf_logger, true);
            perf_logger_event.stop(try_saved_state_event);
            result
        }) {
            Err(parse_error) => Ok(Err(parse_error)),
            _ => Ok(Ok(compiler_state)),
        }
    }
}

async fn query_file_result(
    config: &Config,
    client: &Client,
    resolved_root: &ResolvedRoot,
    since_clock: Option<Clock>,
    omit_changed_files: bool,
) -> Result<FileSourceResult> {
    let expression = get_watchman_expr(config);
    debug!(
        "WatchmanFileSource::query_file_result(...) get_watchman_expr = {:?}",
        &expression
    );

    // If `since` is available, we should not pass the `path` parameter.
    // Watchman ignores `since` parameter if both `path` and `since` are
    // passed as the request params
    let request = if since_clock.is_some() {
        QueryRequestCommon {
            omit_changed_files,
            empty_on_fresh_instance: omit_changed_files,
            expression: Some(expression),
            since: since_clock,
            ..Default::default()
        }
    } else {
        let query_roots = config
            .get_all_roots()
            .into_iter()
            .map(PathGeneratorElement::RecursivePath)
            .collect();
        QueryRequestCommon {
            omit_changed_files,
            empty_on_fresh_instance: omit_changed_files,
            expression: Some(expression),
            path: Some(query_roots),
            ..Default::default()
        }
    };
    debug!(
        "WatchmanFileSource::query_file_result(...) request = {:?}",
        &request
    );
    let query_result = client.query::<WatchmanFile>(resolved_root, request).await?;

    // print debug information for this result
    // (file list will include only files with specified extension)
    debug_query_results(&query_result, "graphql");

    let files = query_result.files.ok_or(Error::EmptyQueryResult)?;
    Ok(FileSourceResult::Watchman(WatchmanFileSourceResult {
        files,
        resolved_root: resolved_root.clone(),
        clock: query_result.clock,
        saved_state_info: query_result.saved_state_info,
    }))
}

fn debug_query_results(query_result: &QueryResult<WatchmanFile>, extension_filter: &str) {
    if let Ok(rust_log) = std::env::var("RUST_LOG")
        && rust_log == *"debug"
    {
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
                            Some(format!("name: {:?}, exists: {}", *file.name, *file.exists))
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
