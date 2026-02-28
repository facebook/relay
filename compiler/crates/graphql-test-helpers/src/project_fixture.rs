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

/// Represents a file change: either an update with new content, or a deletion.
pub enum FileChange {
    Change(String),
    Delete,
}

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
///
/// File deletions are defined with `//-xx filename`:
/// ```text
/// //-xx bar.js
/// ```
/// Deletions have no content body — just the path.
pub struct ProjectFixture {
    // Relative path to file contents
    files: FnvHashMap<PathBuf, String>,
    // Relative path to file change (update or deletion)
    file_changes: FnvHashMap<PathBuf, FileChange>,
}

impl ProjectFixture {
    /// Construct a ProjectFixture directly from a files map.
    pub fn from_files(files: FnvHashMap<PathBuf, String>) -> Self {
        Self {
            files,
            file_changes: Default::default(),
        }
    }

    /// Parse a fixture file. Useful for parsing an existing fixture test.
    pub fn deserialize(input: &str) -> Self {
        let mut files: FnvHashMap<PathBuf, String> = Default::default();
        let mut file_changes: FnvHashMap<PathBuf, FileChange> = Default::default();
        let mut file_deletions: Vec<PathBuf> = Vec::new();
        let mut file_name: Option<PathBuf> = None;
        let mut is_file_change = false;
        let mut content: Vec<String> = Vec::new();

        let mut flush_pending =
            |file_name: &mut Option<PathBuf>, is_file_change: bool, content: &mut Vec<String>| {
                if let Some(prev_file_name) = file_name.take() {
                    let joined = content.join("\n");
                    if is_file_change {
                        file_changes.insert(prev_file_name, FileChange::Change(joined));
                    } else {
                        files.insert(prev_file_name, joined);
                    }
                    content.clear();
                }
            };

        for line in input.lines() {
            if line.starts_with("//-xx ") {
                flush_pending(&mut file_name, is_file_change, &mut content);
                file_deletions.push(PathBuf::from(line.trim_start_matches("//-xx ").trim()));
            } else if line.starts_with("//-++ ") {
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

        // Merge deletions into file_changes now that flush_pending's borrow is released
        for path in file_deletions {
            file_changes.insert(path, FileChange::Delete);
        }

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

        let mut sorted_changes: Vec<_> = self.file_changes.iter().collect();
        sorted_changes.sort_by(|x, y| x.0.cmp(y.0));

        let mut output: String = Default::default();

        for (file_name, content) in sorted {
            output.push_str(&format!("//- {}\n", format_normalized_path(&file_name)));
            output.push_str(&content);
            output.push('\n');
        }

        for (file_name, change) in sorted_changes {
            match change {
                FileChange::Change(content) => {
                    output.push_str(&format!("//-++ {}\n", format_normalized_path(file_name)));
                    output.push_str(content);
                    output.push('\n');
                }
                FileChange::Delete => {
                    output.push_str(&format!("//-xx {}\n", format_normalized_path(file_name)));
                }
            }
        }

        output
    }

    /// Serialize only the file changes and deletions as a fixture string.
    /// Omits the initial files. Useful for showing just what changed.
    pub fn serialize_changes(&self) -> String {
        let mut sorted_changes: Vec<_> = self.file_changes.iter().collect();
        sorted_changes.sort_by(|x, y| x.0.cmp(y.0));

        let mut output: String = Default::default();

        for (file_name, change) in sorted_changes {
            match change {
                FileChange::Change(content) => {
                    output.push_str(&format!("//-++ {}\n", format_normalized_path(file_name)));
                    output.push_str(content);
                    output.push('\n');
                }
                FileChange::Delete => {
                    output.push_str(&format!("//-xx {}\n", format_normalized_path(file_name)));
                }
            }
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
    /// during incremental compilation tests. Writes updated content for
    /// Change entries and removes files for Delete entries.
    pub fn flush_file_changes_to_dir(&self, dir: &Path) {
        for (file_name, change) in &self.file_changes {
            let file_path = dir.join(file_name);
            match change {
                FileChange::Change(content) => {
                    fs::write(file_path, content).expect("Expected to write file change");
                }
                FileChange::Delete => {
                    fs::remove_file(file_path).expect("Expected to delete file");
                }
            }
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
    pub fn file_changes(&self) -> &FnvHashMap<PathBuf, FileChange> {
        &self.file_changes
    }

    /// Create a new ProjectFixture with file_changes derived from the current
    /// state of a directory. Compares the directory contents against `self.files`
    /// to determine what changed: new or modified files become
    /// `FileChange::Change`, and files in `self.files` that no longer exist on
    /// disk become `FileChange::Delete`.
    pub fn with_changes_from_dir(&self, dir: &Path) -> Self {
        let current = Self::read_from_dir(dir);
        let mut file_changes: FnvHashMap<PathBuf, FileChange> = Default::default();

        // Detect new or modified files
        for (path, content) in &current.files {
            if self.files.get(path) != Some(content) {
                file_changes.insert(path.clone(), FileChange::Change(content.clone()));
            }
        }

        // Detect deleted files (skip paths outside the directory since
        // read_from_dir can't observe them)
        for path in self.files.keys() {
            if !path.starts_with("..") && !current.files.contains_key(path) {
                file_changes.insert(path.clone(), FileChange::Delete);
            }
        }

        Self {
            files: self.files.clone(),
            file_changes,
        }
    }

    /// Create a new ProjectFixture with file_changes derived from comparing
    /// against another ProjectFixture (in-memory analog of `with_changes_from_dir`).
    pub fn with_changes_from_fixture(&self, current: &ProjectFixture) -> Self {
        let mut file_changes: FnvHashMap<PathBuf, FileChange> = Default::default();

        // Detect new or modified files
        for (path, content) in &current.files {
            if self.files.get(path) != Some(content) {
                file_changes.insert(path.clone(), FileChange::Change(content.clone()));
            }
        }

        // Detect deleted files
        for path in self.files.keys() {
            if !path.starts_with("..") && !current.files.contains_key(path) {
                file_changes.insert(path.clone(), FileChange::Delete);
            }
        }

        Self {
            files: self.files.clone(),
            file_changes,
        }
    }

    /// Create a new ProjectFixture with file_changes merged into files.
    /// File changes override files with the same path. The resulting fixture
    /// has no file_changes (they're all merged into files).
    pub fn with_file_changes_applied(&self) -> Self {
        let mut merged_files = self.files.clone();
        for (path, change) in &self.file_changes {
            match change {
                FileChange::Change(content) => {
                    merged_files.insert(path.clone(), content.clone());
                }
                FileChange::Delete => {
                    merged_files.remove(path);
                }
            }
        }
        Self {
            files: merged_files,
            file_changes: Default::default(),
        }
    }

    /// Add a file change entry.
    pub fn add_file_change(&mut self, path: PathBuf, change: FileChange) {
        self.file_changes.insert(path, change);
    }
}

// Stringify a path such that it's stable across operating systems.
fn format_normalized_path(path: &Path) -> String {
    path.to_string_lossy()
        .to_string()
        .replace(MAIN_SEPARATOR, "/")
}
