/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::{ProjectName, SourceSetName};
use crate::config::{Config, SchemaLocation};
use std::cmp::Reverse;
use std::collections::HashMap;
use std::ffi::OsStr;
use std::path::{Component, PathBuf};

#[derive(Debug, PartialEq, Eq, Hash)]
pub enum FileGroup {
    Generated,
    Schema { project_name: ProjectName },
    Extension { project_name: ProjectName },
    Source { source_set: SourceSetName },
}

/// The FileCategorizer is created from a Config and categorizes files found by
/// Watchman into what kind of files they are, such as source files of a
/// specific source file group or generated files from some project.
pub struct FileCategorizer {
    extensions_mapping: PathMapping<ProjectName>,
    generated_str: &'static OsStr,
    source_mapping: PathMapping<SourceSetName>,
    schema_file_mapping: HashMap<PathBuf, ProjectName>,
    schema_dir_mapping: PathMapping<ProjectName>,
}

impl FileCategorizer {
    pub fn from_config(config: &Config) -> Self {
        let mut source_mapping: Vec<(PathBuf, SourceSetName)> =
            config.sources.clone().into_iter().collect();
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

        let schema_file_mapping: HashMap<PathBuf, ProjectName> = config
            .projects
            .iter()
            .filter_map(
                |(&project_name, project_config)| match &project_config.schema_location {
                    SchemaLocation::File(schema_file) => Some((schema_file.clone(), project_name)),
                    SchemaLocation::Directory(_) => None,
                },
            )
            .collect();
        let schema_dir_mapping = PathMapping(
            config
                .projects
                .iter()
                .filter_map(|(&project_name, project_config)| {
                    match &project_config.schema_location {
                        SchemaLocation::File(_) => None,
                        SchemaLocation::Directory(schema_dir) => {
                            Some((schema_dir.clone(), project_name))
                        }
                    }
                })
                .collect(),
        );

        let generated_str = OsStr::new("__generated__");
        Self {
            extensions_mapping,
            generated_str,
            schema_file_mapping,
            schema_dir_mapping,
            source_mapping: PathMapping(source_mapping),
        }
    }

    pub fn categorize(&self, path: &PathBuf) -> FileGroup {
        let extension = path
            .extension()
            .unwrap_or_else(|| panic!("Got unexpected path without extension: `{:?}`.", path));
        if extension == "js" {
            if self.in_relative_generated_dir(path) {
                FileGroup::Generated
            } else {
                let source_set = self.source_mapping.get(path);
                FileGroup::Source { source_set }
            }
        } else if extension == "graphql" {
            if let Some(&project_name) = self.schema_file_mapping.get(path) {
                FileGroup::Schema { project_name }
            } else if let Some(project_name) = self.extensions_mapping.find(path) {
                FileGroup::Extension { project_name }
            } else if let Some(project_name) = self.schema_dir_mapping.find(path) {
                FileGroup::Schema { project_name }
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
            Component::Normal(comp) => comp == self.generated_str,
            _ => false,
        })
    }
}

struct PathMapping<T: Copy>(Vec<(PathBuf, T)>);
impl<T: Copy> PathMapping<T> {
    fn get(&self, path: &PathBuf) -> T {
        self.find(path).unwrap_or_else(|| {
            panic!("Path `{:?}` not in of the the expected directories.", path);
        })
    }
    fn find(&self, path: &PathBuf) -> Option<T> {
        self.0.iter().find_map(|(prefix, item)| {
            if path.starts_with(prefix) {
                Some(*item)
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
                        "src/vendor": "public"
                    },
                    "projects": {
                        "public": {
                            "schema": "graphql/public.graphql"
                        },
                        "internal": {
                            "schema": "graphql/__generated__/internal.graphql"
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
                source_set: SourceSetName("public".intern()),
            },
        );
        assert_eq!(
            categorizer.categorize(&"src/js/nested/b.js".into()),
            FileGroup::Source {
                source_set: SourceSetName("public".intern()),
            },
        );
        assert_eq!(
            categorizer.categorize(&"src/js/internal/nested/c.js".into()),
            FileGroup::Source {
                source_set: SourceSetName("internal".intern()),
            },
        );
        assert_eq!(
            categorizer.categorize(&"src/js/internal/nested/__generated__/c.js".into()),
            FileGroup::Generated,
        );
        assert_eq!(
            categorizer.categorize(&"graphql/public.graphql".into()),
            FileGroup::Schema {
                project_name: ProjectName("public".intern())
            },
        );
        assert_eq!(
            categorizer.categorize(&"graphql/__generated__/internal.graphql".into()),
            FileGroup::Schema {
                project_name: ProjectName("internal".intern())
            },
        );
    }
}
