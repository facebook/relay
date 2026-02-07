/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fs;
use std::path::MAIN_SEPARATOR;
use std::path::Path;
use std::path::PathBuf;

use fnv::FnvHashMap;
use walkdir::WalkDir;

/// A file format that supports encoding multiple files in a directory as a
/// single file. Useful for encoding a multi-file setup as input into a
/// compiler test.
///
/// Inspired by rust-analyzer's fixture format:
/// https://github.com/rust-lang/rust-analyzer/blob/d3cc3bc00e310ff49268ce0c593eaa6bf4724bbd/crates/test-utils/src/fixture.rs
///
/// ## Format
///
/// Files are defined with `//- filename`:
/// ```text
/// //- foo.js
/// content of foo.js
/// //- bar.js
/// content of bar.js
/// ```
///
/// File changes (for incremental compilation tests) are defined with `//-++ filename`:
/// ```text
/// //-++ foo.js
/// updated content of foo.js
/// ```
pub struct ProjectFixture {
    // Relative path to file contents
    files: FnvHashMap<PathBuf, String>,
    // Relative path to file change contents
    file_changes: FnvHashMap<PathBuf, String>,
}

impl ProjectFixture {
    /// Parse a fixture file. Useful for parsing an existing fixture test.
    pub fn deserialize(input: &str) -> Self {
        let mut files: FnvHashMap<PathBuf, String> = Default::default();
        let mut file_changes: FnvHashMap<PathBuf, String> = Default::default();
        let mut file_name: Option<PathBuf> = None;
        let mut is_file_change = false;
        let mut content: Vec<String> = Vec::new();

        let mut flush_pending =
            |file_name: &mut Option<PathBuf>, is_file_change: bool, content: &mut Vec<String>| {
                if let Some(prev_file_name) = file_name.take() {
                    let joined = content.join("\n");
                    if is_file_change {
                        file_changes.insert(prev_file_name, joined);
                    } else {
                        files.insert(prev_file_name, joined);
                    }
                    content.clear();
                }
            };

        for line in input.lines() {
            if line.starts_with("//-++ ") {
                flush_pending(&mut file_name, is_file_change, &mut content);
                file_name = Some(PathBuf::from(line.trim_start_matches("//-++ ").trim()));
                is_file_change = true;
            } else if line.starts_with("//- ") {
                flush_pending(&mut file_name, is_file_change, &mut content);
                file_name = Some(PathBuf::from(line.trim_start_matches("//- ").trim()));
                is_file_change = false;
            } else {
                content.push(line.to_string())
            }
        }
        flush_pending(&mut file_name, is_file_change, &mut content);

        Self {
            files,
            file_changes,
        }
    }

    /// Serialize ProjectFixture as a fixture file string.
    /// Useful for encoding the results of a compiler integration test as
    /// a single output file.
    pub fn serialize(&self) -> String {
        let mut sorted: Vec<_> = self.files.clone().into_iter().collect();
        sorted.sort_by(|x, y| x.0.cmp(&y.0));

        let mut sorted_changes: Vec<_> = self.file_changes.clone().into_iter().collect();
        sorted_changes.sort_by(|x, y| x.0.cmp(&y.0));

        let mut output: String = Default::default();

        for (file_name, content) in sorted {
            output.push_str(&format!("//- {}\n", format_normalized_path(&file_name)));
            output.push_str(&content);
            output.push('\n');
        }

        for (file_name, content) in sorted_changes {
            output.push_str(&format!("//-++ {}\n", format_normalized_path(&file_name)));
            output.push_str(&content);
            output.push('\n');
        }

        output
    }

    /// Write the files contained in this ProjectFixture to a directory.
    /// Useful for writing a fixture file to a temp directory before running an
    /// integration test.
    pub fn write_to_dir(&self, dir: &Path) {
        fs::create_dir_all(dir).expect("Expected to create temp dir");

        for (file_name, content) in &self.files {
            let file_path = dir.join(file_name);
            fs::create_dir_all(file_path.clone().parent().unwrap())
                .expect("Expected to create dir");
            fs::write(file_path, content).expect("Expected to write file");
        }
    }

    /// Write file changes to an existing directory.
    /// Assumes the directory already exists. Useful for applying file changes
    /// during incremental compilation tests.
    pub fn flush_file_changes_to_dir(&self, dir: &Path) {
        for (file_name, content) in &self.file_changes {
            let file_path = dir.join(file_name);
            fs::write(file_path, content).expect("Expected to write file change");
        }
    }

    /// Construct a ProjectFixture from an existing directory on disk.
    /// Useful for collecting the output of an integration test which
    /// has resulted in files being written to disk.
    pub fn read_from_dir(dir: &Path) -> Self {
        let mut files: FnvHashMap<PathBuf, String> = Default::default();
        for entry in WalkDir::new(dir).into_iter() {
            let dir_entry = entry.expect("To get entry");
            if dir_entry.metadata().expect("foo").is_file() {
                let relative_path = dir_entry
                    .path()
                    .strip_prefix(dir)
                    .expect("Paths should be relative.");
                let content = fs::read_to_string(dir_entry.path()).expect("To read file");
                files.insert(relative_path.into(), content);
            }
        }

        Self {
            files,
            file_changes: Default::default(),
        }
    }

    /// Remove files in another ProjectFixture from this ProjectFixture.
    /// Useful for removing pre-existing files from an output ProjectFixture.
    pub fn remove_files(&mut self, other: Self) {
        for other_file in other.files.keys() {
            self.files.remove(other_file);
        }
    }

    /// Remove files by their keys from this ProjectFixture.
    /// Useful for removing specific files without consuming another ProjectFixture.
    pub fn remove_files_by_keys<'a>(&mut self, keys: impl Iterator<Item = &'a PathBuf>) {
        for key in keys {
            self.files.remove(key);
        }
    }

    /// Return files map
    pub fn files(&self) -> &FnvHashMap<PathBuf, String> {
        &self.files
    }

    /// Return file changes map
    pub fn file_changes(&self) -> &FnvHashMap<PathBuf, String> {
        &self.file_changes
    }
}

// Stringify a path such that it's stable across operating systems.
fn format_normalized_path(path: &Path) -> String {
    path.to_string_lossy()
        .to_string()
        .replace(MAIN_SEPARATOR, "/")
}
