/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::WatchmanFile;
use log::debug;
use serde_bser::value::Value;
use std::process::Command;
use watchman_client::prelude::*;
use watchman_client::{Subscription as WatchmanSubscription, SubscriptionData};

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

#[derive(Debug)]
pub struct WatchmanFileSourceResult {
    pub files: Vec<WatchmanFile>,
    pub resolved_root: ResolvedRoot,
    pub clock: Clock,
    pub saved_state_info: Option<Value>,
}

pub struct WatchmanFileSourceSubscription {
    resolved_root: ResolvedRoot,
    subscription: WatchmanSubscription<WatchmanFile>,
    base_revision: Option<String>,
}

impl WatchmanFileSourceSubscription {
    pub fn new(
        resolved_root: ResolvedRoot,
        subscription: WatchmanSubscription<WatchmanFile>,
    ) -> Self {
        Self {
            resolved_root,
            subscription,
            base_revision: get_base_hg_revision(None),
        }
    }

    /// Awaits changes from Watchman and provides the next set of changes
    /// if there were any changes to files
    pub async fn next_change(
        &mut self,
    ) -> Result<WatchmanFileSourceSubscriptionNextChange, watchman_client::Error> {
        match self.subscription.next().await? {
            SubscriptionData::FilesChanged(changes) => {
                if let Some(files) = changes.files {
                    debug!("number of files in this update: {}", files.len());
                    return Ok(WatchmanFileSourceSubscriptionNextChange::Result(
                        WatchmanFileSourceResult {
                            files,
                            resolved_root: self.resolved_root.clone(),
                            clock: changes.clock,
                            saved_state_info: None,
                        },
                    ));
                }
            }
            SubscriptionData::StateEnter { state_name, .. } => {
                if state_name == "hg.update" {
                    return Ok(WatchmanFileSourceSubscriptionNextChange::SourceControlUpdateEnter);
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
                    let current_base_revision = get_base_hg_revision(current_commit);
                    if current_base_revision != self.base_revision {
                        self.base_revision = current_base_revision;
                        return Ok(WatchmanFileSourceSubscriptionNextChange::SourceControlUpdate);
                    } else {
                        return Ok(
                            WatchmanFileSourceSubscriptionNextChange::SourceControlUpdateLeave,
                        );
                    }
                }
            }
            SubscriptionData::Canceled => {
                return Err(watchman_client::Error::WatchmanResponseError {
                    message: String::from("Watchman subscription canceled"),
                });
            }
        }
        Ok(WatchmanFileSourceSubscriptionNextChange::None)
    }
}

/// Base revision in this case is a common ancestor of two revisions:
/// `master` and current commit hash or `.`
///
/// TODO: Make this dynamic on the default branch name.
fn get_base_hg_revision(commit_hash: Option<String>) -> Option<String> {
    let output = Command::new("hg")
        .arg("log".to_string())
        .arg("-r".to_string())
        .arg(format!(
            "ancestor(master, {})",
            commit_hash.unwrap_or_else(|| ".".to_string())
        ))
        .arg("-T={node}")
        .output()
        .ok()?;

    if output.stdout.is_empty() {
        return None;
    }

    Some(String::from_utf8_lossy(&output.stdout).to_string())
}
