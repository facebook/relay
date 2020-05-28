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
use std::cmp::Reverse;
use std::collections::hash_map::Entry;
use std::collections::{HashMap, HashSet};
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
    for file in files {
        categorized
            .entry(categorizer.categorize(&file.name))
            .or_insert_with(Vec::new)
            .push(file.clone());
    }
    categorized
}

/// The FileCategorizer is created from a Config and categorizes files found by
/// Watchman into what kind of files they are, such as source files of a
/// specific source file group or generated files from some project.
pub struct FileCategorizer {
    extensions_mapping: PathMapping<ProjectName>,
    default_generated_dir: &'static OsStr,
    generated_dir_paths: HashSet<PathBuf>,
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

        source_mapping.sort_by_key(|item| Reverse(item.0.clone()));

        let extensions_mapping = PathMapping(
            config
                .projects
                .iter()
                .flat_map(|(project_name, project_config)| {
                    project_config
                        .extensions
                        .iter()
                        .map(move |extension_dir| (extension_dir.clone(), *project_name))
                })
                .collect(),
        );

        let mut schema_file_mapping: HashMap<PathBuf, ProjectSet> = Default::default();
        for (project_name, project_config) in config.projects.iter() {
            if let SchemaLocation::File(schema_file) = &project_config.schema_location {
                match schema_file_mapping.entry(schema_file.clone()) {
                    Entry::Vacant(entry) => {
                        entry.insert(ProjectSet::ProjectName(*project_name));
                    }
                    Entry::Occupied(mut entry) => {
                        let next_project_set = match entry.get() {
                            ProjectSet::ProjectName(current_project) => {
                                ProjectSet::ProjectNames(vec![*project_name, *current_project])
                            }
                            ProjectSet::ProjectNames(current_projects) => {
                                let mut next_projects = vec![*project_name];
                                for current_project in current_projects {
                                    next_projects.push(current_project.clone());
                                }
                                ProjectSet::ProjectNames(next_projects)
                            }
                        };
                        entry.insert(next_project_set);
                    }
                }
            }
        }

        let mut schema_dir_mapping_map: HashMap<PathBuf, ProjectSet> = Default::default();
        for (project_name, project_config) in config.projects.iter() {
            if let SchemaLocation::Directory(directory) = &project_config.schema_location {
                match schema_dir_mapping_map.entry(directory.clone()) {
                    Entry::Vacant(entry) => {
                        entry.insert(ProjectSet::ProjectName(*project_name));
                    }
                    Entry::Occupied(mut entry) => {
                        let next_project_set = match entry.get() {
                            ProjectSet::ProjectName(current_project) => {
                                ProjectSet::ProjectNames(vec![*project_name, *current_project])
                            }
                            ProjectSet::ProjectNames(current_projects) => {
                                let mut next_projects = vec![*project_name];
                                for current_project in current_projects {
                                    next_projects.push(current_project.clone());
                                }
                                ProjectSet::ProjectNames(next_projects)
                            }
                        };
                        entry.insert(next_project_set);
                    }
                }
            }
        }

        let mut schema_dir_mapping = vec![];
        for (path, project_set) in schema_dir_mapping_map {
            schema_dir_mapping.push((path, project_set));
        }

        let default_generated_dir = OsStr::new("__generated__");
        let generated_dir_paths: HashSet<PathBuf> = config
            .projects
            .iter()
            .filter_map(|(_, project_config)| project_config.output.clone())
            .collect();

        Self {
            extensions_mapping,
            default_generated_dir,
            generated_dir_paths,
            schema_file_mapping,
            schema_dir_mapping: PathMapping(schema_dir_mapping),
            source_mapping: PathMapping(source_mapping),
        }
    }

    pub fn categorize(&self, path: &PathBuf) -> FileGroup {
        let extension = path
            .extension()
            .unwrap_or_else(|| panic!("Got unexpected path without extension: `{:?}`.", path));
        if extension == "js" {
            if self.in_generated_dir(path) {
                FileGroup::Generated
            } else {
                FileGroup::Source {
                    source_set: self.source_mapping.get(path).clone(),
                }
            }
        } else if extension == "graphql" {
            if let Some(project_set) = self.schema_file_mapping.get(path) {
                FileGroup::Schema {
                    project_set: project_set.clone(),
                }
            } else if let Some(project_name) = self.extensions_mapping.find(path) {
                FileGroup::Extension { project_name }
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

    fn in_generated_dir(&self, path: &PathBuf) -> bool {
        self.in_absolute_generated_dir(path) || self.in_relative_generated_dir(path)
    }

    fn in_absolute_generated_dir(&self, path: &PathBuf) -> bool {
        self.generated_dir_paths
            .iter()
            .any(|generated_dir_path| path.starts_with(generated_dir_path))
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
            FileGroup::Generated,
        );
        assert_eq!(
            categorizer.categorize(&"graphql/custom-generated/c.js".into()),
            FileGroup::Generated,
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
