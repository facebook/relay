/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvHashSet;
use glob::Pattern;
use intern::string_key::StringKey;

use crate::{
    compiler_state::SourceSet,
    config::{Config, SchemaLocation},
};
use std::path::{Path, PathBuf};

/// The FileFilter is intended to be used for input sources other than
/// Watchman. The FileFilter is created from `Config` and trys to replicate
/// the filtering done in Watchman. One addition is that this can filter
/// out files from disabled projects.
/// It allows paths defined in `config.sources` with `config.excludes` applied,
/// then allows paths defined for extensions, schemas, and output dirs.
pub struct FileFilter {
    sources_roots: Vec<PathBuf>,
    extra_roots: Vec<PathBuf>,
    excludes: Vec<Pattern>,
}

impl FileFilter {
    pub fn from_config(config: &Config) -> Self {
        let mut enabled_projects_including_base = FnvHashSet::default();
        for project in config.enabled_projects() {
            enabled_projects_including_base.insert(project.name);
            if let Some(base) = project.base {
                enabled_projects_including_base.insert(base);
            }
        }
        Self {
            sources_roots: get_sources_root(config, &enabled_projects_including_base),
            extra_roots: get_extra_roots(config, &enabled_projects_including_base),
            excludes: config
                .excludes
                .iter()
                .map(|p| Pattern::new(p).unwrap())
                .collect(),
        }
    }

    pub fn is_file_relevant(&self, path: &Path) -> bool {
        self.extra_roots.iter().any(|root| path.starts_with(root))
            || (self.sources_roots.iter().any(|root| path.starts_with(root))
                && !self
                    .excludes
                    .iter()
                    .any(|exclude| exclude.matches_path(path)))
    }
}

// Get roots for extensions, schemas and output dirs
fn get_extra_roots(config: &Config, enabled_projects: &FnvHashSet<StringKey>) -> Vec<PathBuf> {
    let mut roots = vec![];
    for project_config in config.projects.values() {
        if !enabled_projects.contains(&project_config.name) {
            continue;
        }
        roots.extend(&project_config.schema_extensions);
        if let Some(output_dir) = &project_config.output {
            roots.push(output_dir);
        }
        if let Some(output_dir) = &project_config.extra_artifacts_output {
            roots.push(output_dir);
        }
        match &project_config.schema_location {
            SchemaLocation::File(path) | SchemaLocation::Directory(path) => roots.push(path),
        }
    }
    unify_roots(roots)
}

fn get_sources_root(config: &Config, enabled_projects: &FnvHashSet<StringKey>) -> Vec<PathBuf> {
    unify_roots(
        config
            .sources
            .iter()
            .filter_map(|(path, source_set)| {
                let is_enabled = match source_set {
                    SourceSet::SourceSetName(name) => enabled_projects.contains(name),
                    SourceSet::SourceSetNames(names) => {
                        names.iter().any(|name| enabled_projects.contains(name))
                    }
                };
                is_enabled.then(|| path)
            })
            .collect(),
    )
}

// A copy of watchman_query_builder::unify_roots, but takes Vec<&PathBuf> as the input
fn unify_roots(mut paths: Vec<&PathBuf>) -> Vec<PathBuf> {
    paths.sort();
    let mut roots = Vec::new();
    for path in paths {
        match roots.last() {
            Some(prev) if path.starts_with(&prev) => {
                // skip
            }
            _ => {
                roots.push(path.clone());
            }
        }
    }
    roots
}
