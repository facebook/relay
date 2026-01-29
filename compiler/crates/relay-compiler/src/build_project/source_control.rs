/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use std::process::Stdio;
use std::sync::Mutex;

use log::debug;
use log::info;

pub trait SourceControl {
    fn add_files(&self, root_dir: &Path, added: &Mutex<Vec<PathBuf>>) -> crate::errors::Result<()>;

    fn remove_files(
        &self,
        root_dir: &Path,
        removed: &Mutex<Vec<PathBuf>>,
    ) -> crate::errors::Result<()>;
}

trait SourceControlStartAndStopCommands {
    fn start_tracking_command() -> Command;

    fn stop_tracking_command() -> Command;
}

impl<T> SourceControl for T
where
    T: SourceControlStartAndStopCommands,
{
    fn add_files(&self, root_dir: &Path, added: &Mutex<Vec<PathBuf>>) -> crate::errors::Result<()> {
        let mut added = added.lock().unwrap();
        if !added.is_empty() {
            for added_files in added.chunks(100) {
                if Self::start_tracking_command()
                    .current_dir(root_dir)
                    .args(added_files)
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .stdin(Stdio::null())
                    .spawn()
                    .is_err()
                {
                    info!("Failed to run source control 'add' operation.");
                }
            }
            added.clear();
        }
        Ok(())
    }

    fn remove_files(
        &self,
        root_dir: &Path,
        removed: &Mutex<Vec<PathBuf>>,
    ) -> crate::errors::Result<()> {
        let mut removed = removed.lock().unwrap();
        if !removed.is_empty() {
            for removed_files in removed.chunks(100) {
                if Self::stop_tracking_command()
                    .current_dir(root_dir)
                    .args(removed_files)
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .stdin(Stdio::null())
                    .spawn()
                    .is_err()
                {
                    info!("Failed to run source control 'remove' operation.");
                }
            }
            removed.clear();
        }
        Ok(())
    }
}

/// Sapling is Meta's fork of Mercurial.
/// Inside Meta, it is available as both
/// `sl`, and `hg`.
struct Sapling;

impl SourceControlStartAndStopCommands for Sapling {
    fn start_tracking_command() -> Command {
        let mut command = Command::new("sl");
        command.arg("add");
        command
    }

    fn stop_tracking_command() -> Command {
        let mut command = Command::new("sl");
        command.arg("forget");
        command
    }
}

struct Git;

impl SourceControlStartAndStopCommands for Git {
    fn start_tracking_command() -> Command {
        let mut command = Command::new("git");
        command.arg("add");
        command
    }

    fn stop_tracking_command() -> Command {
        let mut command = Command::new("git");
        command.arg("rm").arg("--cached");
        command
    }
}

pub fn source_control_for_root(root_dir: &PathBuf) -> Option<Box<dyn SourceControl + Send + Sync>> {
    let check_git = Command::new("git")
        .arg("status")
        .current_dir(root_dir)
        .output();

    if let Ok(check_git) = check_git
        && check_git.status.success()
    {
        debug!("Enabling git source control integration");
        return Some(Box::new(Git));
    }

    // Warning: `sl` can support git repos, so it's important that we
    // check the native `git` command first due to differences in
    // staging behavior between the two.
    let check_sapling = Command::new("sl")
        .arg("root")
        .current_dir(root_dir)
        .output();

    if let Ok(check_sapling) = check_sapling
        && check_sapling.status.success()
    {
        let possible_steam_locomotive_check = Command::new("sl").arg("--version").output();

        // The "Steam Locomotive" command also uses `sl` and doesn't have an easy way to detect
        // if it is actually the `sl` command (it exits with code 0 if run as `sl root`), so we
        // need to do some additional checking to make sure we can enable Sapling integration:
        if let Ok(output) = possible_steam_locomotive_check {
            if output.status.success()
                && String::from_utf8_lossy(&output.stdout).contains("Sapling")
            {
                debug!("Enabling Sapling source control integration");
                return Some(Box::new(Sapling));
            } else {
                debug!(
                    "The `sl` command is not Sapling, so Sapling source control integration is disabled"
                );
            }
        }
    }

    None
}
