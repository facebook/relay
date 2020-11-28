/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::FileGroup;
use super::WatchmanFile;
use crate::compiler_state::{ProjectName, ProjectSet, SourceSet};
use crate::config::{Config, SchemaLocation};
use fnv::FnvHashSet;
use std::collections::hash_map::Entry;
use std::collections::HashMap;
use std::ffi::OsStr;
use std::path::{Component, PathBuf};

/// The watchman query returns a list of files, but for the compiler we
/// need to categorize these files into multiple groups of files like
/// schema files, extensions and sources by their source set name.
///
/// See `FileGroup` for all groups of files.
pub fn categorize_files(
    config: &Config,
    files: &[WatchmanFile],
) -> HashMap<FileGroup, Vec<WatchmanFile>> {
    let categorizer = FileCategorizer::from_config(config);
    let mut categorized = HashMap::new();

    let mut has_disabled = false;
    let mut relevant_projects = FnvHashSet::default();
    for (project_name, project_config) in &config.projects {
        if project_config.enabled {
            relevant_projects.insert(project_name);
            if let Some(base_project) = &project_config.base {
                relevant_projects.insert(base_project);
            }
        } else {
            has_disabled = true;
        }
    }

    for file in files {
        let file_group = categorizer.categorize(&file.name);
        let should_skip = has_disabled
            && match &file_group {
                FileGroup::Source {
                    source_set: SourceSet::SourceSetName(name),
                }
                | FileGroup::Schema {
                    project_set: ProjectSet::ProjectName(name),
                }
                | FileGroup::Extension {
                    project_set: ProjectSet::ProjectName(name),
                }
                | FileGroup::Generated { project_name: name } => !relevant_projects.contains(name),
                FileGroup::Source {
                    source_set: SourceSet::SourceSetNames(names),
                }
                | FileGroup::Schema {
                    project_set: ProjectSet::ProjectNames(names),
                }
                | FileGroup::Extension {
                    project_set: ProjectSet::ProjectNames(names),
                } => !names.iter().any(|name| relevant_projects.contains(name)),
            };
        if !should_skip {
            categorized
                .entry(file_group)
                .or_insert_with(Vec::new)
                .push(file.clone());
        }
    }
    categorized
}

/// The FileCategorizer is created from a Config and categorizes files found by
/// Watchman into what kind of files they are, such as source files of a
/// specific source file group or generated files from some project.
pub struct FileCategorizer {
    extensions_mapping: PathMapping<ProjectSet>,
    default_generated_dir: &'static OsStr,
    generated_dir_mapping: PathMapping<ProjectName>,
    source_mapping: PathMapping<SourceSet>,
    schema_file_mapping: HashMap<PathBuf, ProjectSet>,
    schema_dir_mapping: PathMapping<ProjectSet>,
}

impl FileCategorizer {
    pub fn from_config(config: &Config) -> Self {
        let mut source_mapping = vec![];
        for (path, source_set) in &config.sources {
            source_mapping.push((path.clone(), source_set.clone()));
        }

        let mut extensions_map: HashMap<PathBuf, ProjectSet> = Default::default();
        for (&project_name, project_config) in &config.projects {
            for extension_dir in &project_config.extensions {
                match extensions_map.entry(extension_dir.clone()) {
                    Entry::Vacant(entry) => {
                        entry.insert(ProjectSet::ProjectName(project_name));
                    }
                    Entry::Occupied(mut entry) => {
                        entry.get_mut().insert(project_name);
                    }
                }
            }
        }

        let mut schema_file_mapping: HashMap<PathBuf, ProjectSet> = Default::default();
        for (&project_name, project_config) in &config.projects {
            if let SchemaLocation::File(schema_file) = &project_config.schema_location {
                match schema_file_mapping.entry(schema_file.clone()) {
                    Entry::Vacant(entry) => {
                        entry.insert(ProjectSet::ProjectName(project_name));
                    }
                    Entry::Occupied(mut entry) => {
                        entry.get_mut().insert(project_name);
                    }
                }
            }
        }

        let mut schema_dir_mapping_map: HashMap<PathBuf, ProjectSet> = Default::default();
        for (&project_name, project_config) in &config.projects {
            if let SchemaLocation::Directory(directory) = &project_config.schema_location {
                match schema_dir_mapping_map.entry(directory.clone()) {
                    Entry::Vacant(entry) => {
                        entry.insert(ProjectSet::ProjectName(project_name));
                    }
                    Entry::Occupied(mut entry) => {
                        entry.get_mut().insert(project_name);
                    }
                }
            }
        }

        let mut schema_dir_mapping = vec![];
        for (path, project_set) in schema_dir_mapping_map {
            schema_dir_mapping.push((path, project_set));
        }

        let mut generated_dir_mapping = Vec::new();
        for (&project_name, project_config) in &config.projects {
            if let Some(output) = &project_config.output {
                generated_dir_mapping.push((output.clone(), project_name));
            }
            if let Some(extra_artifacts_output) = &project_config.extra_artifacts_output {
                generated_dir_mapping.push((extra_artifacts_output.clone(), project_name));
            }
        }

        Self {
            extensions_mapping: PathMapping::new(extensions_map.into_iter().collect()),
            default_generated_dir: OsStr::new("__generated__"),
            generated_dir_mapping: PathMapping::new(generated_dir_mapping),
            schema_file_mapping,
            schema_dir_mapping: PathMapping::new(schema_dir_mapping),
            source_mapping: PathMapping::new(source_mapping),
        }
    }

    /// Categorizes a file. This method should be kept as cheap as possible by
    /// preprocessing the config in `from_config` and then re-using the
    /// `FileCategorizer`.
    pub fn categorize(&self, path: &PathBuf) -> FileGroup {
        if let Some(project_name) = self.generated_dir_mapping.find(path) {
            return FileGroup::Generated { project_name };
        }
        let extension = path
            .extension()
            .unwrap_or_else(|| panic!("Got unexpected path without extension: `{:?}`.", path));
        if extension == "js" {
            let source_set = self.source_mapping.get(path);
            if self.in_relative_generated_dir(path) {
                if let SourceSet::SourceSetName(source_set_name) = source_set {
                    FileGroup::Generated {
                        project_name: source_set_name,
                    }
                } else {
                    panic!(
                        "Overlapping input sources are incompatible with relative generated \
                        directories. Got `{:?}` in a relative generated directory with source set {:?}",
                        path, source_set
                    );
                }
            } else {
                FileGroup::Source { source_set }
            }
        } else if extension == "graphql" {
            if let Some(project_set) = self.schema_file_mapping.get(path) {
                FileGroup::Schema {
                    project_set: project_set.clone(),
                }
            } else if let Some(project_set) = self.extensions_mapping.find(path) {
                FileGroup::Extension { project_set }
            } else if let Some(project_set) = self.schema_dir_mapping.find(path) {
                FileGroup::Schema { project_set }
            } else {
                panic!(
                    "Expected *.graphql file `{:?}` to be either a schema or extension.",
                    path
                )
            }
        } else {
            panic!(
                "Received file {:?} from watchman with unexpected extension.",
                path
            )
        }
    }

    fn in_relative_generated_dir(&self, path: &PathBuf) -> bool {
        path.components().any(|comp| match comp {
            Component::Normal(comp) => comp == self.default_generated_dir,
            _ => false,
        })
    }
}

struct PathMapping<T: Clone>(Vec<(PathBuf, T)>);
impl<T: Clone> PathMapping<T> {
    fn new(mut entries: Vec<(PathBuf, T)>) -> Self {
        // Sort so that more specific paths come first, i.e.
        // - foo/bar -> A
        // - foo -> B
        // which ensures we categorize foo/bar/x.js as A.
        entries.sort_by(|(path_a, _), (path_b, _)| path_b.cmp(path_a));
        Self(entries)
    }

    fn get(&self, path: &PathBuf) -> T {
        self.find(path).unwrap_or_else(|| {
            panic!("Path `{:?}` not in of the the expected directories.", path);
        })
    }
    fn find(&self, path: &PathBuf) -> Option<T> {
        self.0.iter().find_map(|(prefix, item)| {
            if path.starts_with(prefix) {
                Some(item.clone())
            } else {
                None
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use interner::Intern;

    #[test]
    fn test_categorize() {
        let config = Config::from_string_for_test(
            r#"
                {
                    "sources": {
                        "src/js": "public",
                        "src/js/internal": "internal",
                        "src/vendor": "public",
                        "src/custom": "with_custom_generated_dir"
                    },
                    "projects": {
                        "public": {
                            "schema": "graphql/public.graphql"
                        },
                        "internal": {
                            "schema": "graphql/__generated__/internal.graphql"
                        },
                        "with_custom_generated_dir": {
                            "schema": "graphql/__generated__/custom.graphql",
                            "output": "graphql/custom-generated"
                        }
                    }
                }
            "#,
        )
        .unwrap();
        let categorizer = FileCategorizer::from_config(&config);

        assert_eq!(
            categorizer.categorize(&"src/js/a.js".into()),
            FileGroup::Source {
                source_set: SourceSet::SourceSetName("public".intern()),
            },
        );
        assert_eq!(
            categorizer.categorize(&"src/js/nested/b.js".into()),
            FileGroup::Source {
                source_set: SourceSet::SourceSetName("public".intern()),
            },
        );
        assert_eq!(
            categorizer.categorize(&"src/js/internal/nested/c.js".into()),
            FileGroup::Source {
                source_set: SourceSet::SourceSetName("internal".intern()),
            },
        );
        assert_eq!(
            // When custom output dir is provided, path is correctly categorized
            // even if it has same dirname in path as custom output folder.
            // Path is only categorized as generated if it matches the absolute path
            // of the provided custom output.
            categorizer.categorize(&"src/custom/custom-generated/c.js".into()),
            FileGroup::Source {
                source_set: SourceSet::SourceSetName("with_custom_generated_dir".intern()),
            },
        );
        assert_eq!(
            categorizer.categorize(&"src/js/internal/nested/__generated__/c.js".into()),
            FileGroup::Generated {
                project_name: "internal".intern()
            },
        );
        assert_eq!(
            categorizer.categorize(&"graphql/custom-generated/c.js".into()),
            FileGroup::Generated {
                project_name: "with_custom_generated_dir".intern()
            },
        );
        assert_eq!(
            categorizer.categorize(&"graphql/public.graphql".into()),
            FileGroup::Schema {
                project_set: ProjectSet::ProjectName("public".intern())
            },
        );
        assert_eq!(
            categorizer.categorize(&"graphql/__generated__/internal.graphql".into()),
            FileGroup::Schema {
                project_set: ProjectSet::ProjectName("internal".intern())
            },
        );
    }
}
