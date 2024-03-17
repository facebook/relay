/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::path::MAIN_SEPARATOR;

use fnv::FnvHashMap;
use walkdir::WalkDir;

/// A file format that supports encoding multiple files in a directory as a
/// single file. Useful for encoding a multi-file setup as input into a
/// compiler test.
///
/// Inspired by rust-analyzer's fixture format:
/// https://github.com/rust-lang/rust-analyzer/blob/d3cc3bc00e310ff49268ce0c593eaa6bf4724bbd/crates/test-utils/src/fixture.rs
pub struct ProjectFixture {
    // Relative path to file contents
    files: FnvHashMap<PathBuf, String>,
}

impl ProjectFixture {
    /// Parse a fixture file. Useful for parsing an existing fixture test.
    pub fn deserialize(input: &str) -> Self {
        let mut files: FnvHashMap<PathBuf, String> = Default::default();
        let mut file_name: Option<PathBuf> = None;
        let mut content: Vec<String> = Vec::new();
        for line in input.lines() {
            if line.starts_with("//- ") {
                if let Some(prev_file_name) = file_name {
                    files.insert(prev_file_name, content.join("\n"));
                    content = Vec::new();
                }
                file_name = Some(PathBuf::from(line.trim_start_matches("//- ").trim()));
            } else {
                content.push(line.to_string())
            }
        }
        if let Some(prev_file_name) = file_name {
            files.insert(prev_file_name, content.join("\n"));
        }

        Self { files }
    }

    /// Serialize ProjectFixture as a fixture file string.
    /// Useful for encoding the results of a compiler integration test as
    /// a single output file.
    pub fn serialize(&self) -> String {
        let mut sorted: Vec<_> = self.files.clone().into_iter().collect();
        sorted.sort_by(|x, y| x.0.cmp(&y.0));

        let mut output: String = Default::default();

        for (file_name, content) in sorted {
            output.push_str(&format!("//- {}\n", format_normalized_path(&file_name)));
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

        Self { files }
    }

    /// Remove files in another ProjectFixture from this ProjectFixture.
    /// Useful for removing pre-existing files from an output ProjectFixture.
    pub fn remove_files(&mut self, other: Self) {
        for other_file in other.files.keys() {
            self.files.remove(other_file);
        }
    }
}

// Stringify a path such that it's stable across operating systems.
fn format_normalized_path(path: &Path) -> String {
    path.to_string_lossy()
        .to_string()
        .replace(MAIN_SEPARATOR, "/")
}
