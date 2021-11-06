/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use log::info;
use std::{
    path::PathBuf,
    process::{Command, Stdio},
    sync::Mutex,
};

pub fn add_to_mercurial(
    root_dir: &PathBuf,
    added: &Mutex<Vec<PathBuf>>,
    removed: &Mutex<Vec<PathBuf>>,
) -> crate::errors::Result<()> {
    {
        let mut added = added.lock().unwrap();
        if !added.is_empty() {
            for added_files in added.chunks(100) {
                if Command::new("hg")
                    .current_dir(root_dir)
                    .arg("add")
                    .args(added_files)
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .stdin(Stdio::null())
                    .spawn()
                    .is_err()
                {
                    info!("Failed to run `hg add`.");
                }
            }
            added.clear();
        }
    }
    {
        let mut removed = removed.lock().unwrap();
        if !removed.is_empty() {
            for removed_files in removed.chunks(100) {
                if Command::new("hg")
                    .current_dir(root_dir)
                    .arg("forget")
                    .args(removed_files)
                    .stdout(Stdio::null())
                    .stderr(Stdio::null())
                    .stdin(Stdio::null())
                    .spawn()
                    .is_err()
                {
                    info!("Failed to run `hg forget`.");
                }
            }
            removed.clear();
        }
    }
    Ok(())
}
