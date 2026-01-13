/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use glob::Pattern;

use crate::errors::ConfigValidationError;

pub struct PathValidator {
    root_dir: PathBuf,
    excludes: Vec<Pattern>,
    errors: Vec<ConfigValidationError>,
}

impl PathValidator {
    pub fn new(root_dir: PathBuf, excludes: &[String]) -> Self {
        Self {
            root_dir,
            excludes: excludes
                .iter()
                .filter_map(|exclude| Pattern::new(exclude).ok())
                .collect(),
            errors: Vec::new(),
        }
    }

    pub fn assert_is_included_source_dir(&mut self, path: &PathBuf) {
        let file_type = "source";
        self.assert_is_in_root(path, file_type);
        self.assert_is_not_excluded(path, file_type);
        // Also check if files inside the directory would be excluded
        self.assert_contents_not_excluded(path, file_type);
        if !self.assert_exists(path, file_type) {
            return;
        }
        self.assert_is_dir(path, file_type);
    }

    // Schemas are added as "extra roots" and thus will always be added even if
    // they are outside of the project or in the excludes list.
    pub fn assert_is_included_schema_file(&mut self, path: &PathBuf) {
        let file_type = "schema file";
        if !self.assert_exists(path, file_type) {
            return;
        }
        self.assert_is_file(path, file_type);
    }

    // Schemas are added as "extra roots" and thus will always be added even if
    // they are outside of the project or in the excludes list.
    pub fn assert_is_included_schema_dir(&mut self, path: &PathBuf) {
        let file_type = "schema directory";
        if !self.assert_exists(path, file_type) {
            return;
        }
        self.assert_is_dir(path, file_type);
    }

    pub fn assert_is_in_root(&mut self, path: &PathBuf, file_type: &str) {
        let abs_path = self.root_dir.join(path);
        if !abs_path.starts_with(&self.root_dir) {
            self.errors.push(ConfigValidationError::FileNotInRoot {
                file_type: file_type.to_string(),
                path: abs_path,
                project_root: self.root_dir.clone(),
            });
        }
    }

    pub fn assert_is_not_excluded(&mut self, path: &PathBuf, file_type: &str) {
        let abs_path = self.root_dir.join(path);

        // Find the first matching pattern
        let matching_pattern = self.excludes.iter().find(|pattern| {
            // Check if the path matches the pattern directly
            pattern.matches_path(&abs_path)
        });

        if let Some(pattern) = matching_pattern {
            self.errors.push(ConfigValidationError::FileMatchesExclude {
                file_type: file_type.to_string(),
                path: abs_path,
                pattern: pattern.as_str().to_string(),
            });
        }
    }

    /// For source directories, we also need to check if files inside would be
    /// excluded. This handles cases like source="node_modules" with
    /// excludes=["**/node_modules/**"] where the directory itself doesn't match
    /// but all files inside would be excluded.
    pub fn assert_contents_not_excluded(&mut self, path: &PathBuf, file_type: &str) {
        let abs_path = self.root_dir.join(path);
        // Check if a hypothetical file inside this directory would be excluded
        let test_path = abs_path.join("__test_file__");

        let matching_pattern = self
            .excludes
            .iter()
            .find(|pattern| pattern.matches_path(&test_path));

        if let Some(pattern) = matching_pattern {
            self.errors.push(ConfigValidationError::FileMatchesExclude {
                file_type: file_type.to_string(),
                path: abs_path,
                pattern: pattern.as_str().to_string(),
            });
        }
    }

    pub fn assert_exists(&mut self, path: &PathBuf, file_type: &str) -> bool {
        let abs_path = self.root_dir.join(path);
        if !abs_path.exists() {
            self.errors.push(ConfigValidationError::FileNotExistent {
                file_type: file_type.to_string(),
                path: abs_path,
            });
            false
        } else {
            true
        }
    }

    pub fn assert_is_dir(&mut self, path: &PathBuf, file_type: &str) {
        let abs_path = self.root_dir.join(path);
        if !abs_path.is_dir() {
            self.errors.push(ConfigValidationError::FileNotDirectory {
                file_type: file_type.to_string(),
                path: abs_path,
            });
        }
    }

    pub fn assert_is_file(&mut self, path: &PathBuf, file_type: &str) {
        let abs_path = self.root_dir.join(path);
        if !abs_path.is_file() {
            self.errors.push(ConfigValidationError::FileNotFile {
                file_type: file_type.to_string(),
                path: abs_path,
            });
        }
    }

    pub fn into_errors(self) -> Vec<ConfigValidationError> {
        self.errors
    }
}
