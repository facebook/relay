/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fs;
use std::io;
use std::path::Path;
use std::path::PathBuf;
use std::sync::atomic::AtomicUsize;
use std::sync::atomic::Ordering;

// Borrowed from Rust Analyzer
// https://github.com/matklad/rust-analyzer/blob/15c4b3fa7f9d97029d64a7e13a12aa1ee42316d7/crates/rust-analyzer/tests/slow-tests/testdir.rs
pub struct TestDir {
    path: PathBuf,
    keep: bool,
}

impl TestDir {
    pub fn new() -> TestDir {
        let base = std::env::temp_dir().join("testdir");
        let pid = std::process::id();

        static CNT: AtomicUsize = AtomicUsize::new(0);
        for _ in 0..100 {
            let cnt = CNT.fetch_add(1, Ordering::Relaxed);
            let path = base.join(format!("{}_{}", pid, cnt));
            if path.is_dir() {
                continue;
            }
            fs::create_dir_all(&path).unwrap();
            return TestDir { path, keep: false };
        }
        panic!("Failed to create a temporary directory")
    }
    #[allow(unused)]
    pub fn keep(mut self) -> TestDir {
        self.keep = true;
        self
    }
    pub fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for TestDir {
    fn drop(&mut self) {
        if self.keep {
            return;
        }
        remove_dir_all(&self.path).unwrap()
    }
}

#[cfg(not(windows))]
fn remove_dir_all(path: &Path) -> io::Result<()> {
    fs::remove_dir_all(path)
}

#[cfg(windows)]
fn remove_dir_all(path: &Path) -> io::Result<()> {
    for _ in 0..99 {
        if fs::remove_dir_all(path).is_ok() {
            return Ok(());
        }
        std::thread::sleep(std::time::Duration::from_millis(10))
    }
    fs::remove_dir_all(path)
}
