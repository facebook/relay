/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use core::panic;
use std::borrow::Cow;
use std::collections::HashMap;
use std::collections::hash_map::Entry;
use std::ffi::OsStr;
use std::path::Component;
use std::path::Path;
use std::path::PathBuf;

use common::sync::ParallelIterator;
use fnv::FnvHashSet;
use log::warn;
use rayon::iter::IntoParallelRefIterator;
use relay_config::ProjectName;
use relay_typegen::TypegenLanguage;

use super::File;
use super::FileGroup;
use super::file_filter::FileFilter;
use crate::FileSourceResult;
use crate::compiler_state::ProjectSet;
use crate::config::Config;
use crate::config::SchemaLocation;

/// The watchman query returns a list of files, but for the compiler we
/// need to categorize these files into multiple groups of files like
/// schema files, extensions and sources by their source set name.
///
/// See `FileGroup` for all groups of files.
pub fn categorize_files(
    config: &Config,
    file_source_result: &FileSourceResult,
) -> HashMap<FileGroup, Vec<File>> {
    let categorizer = FileCategorizer::from_config(config);

    let result = match file_source_result {
        FileSourceResult::Watchman(file_source_result) => {
            let mut relevant_projects = FnvHashSet::default();
            for (project_name, project_config) in &config.projects {
                if project_config.enabled {
                    relevant_projects.insert(project_name);
                    if let Some(base_project) = &project_config.base {
                        relevant_projects.insert(base_project);
                    }
                }
            }
            let has_disabled_projects = relevant_projects.len() < config.projects.len();
            file_source_result
                .files
                .par_iter()
                .map(|file| {
                    let file = File {
                        name: (*file.name).clone(),
                        exists: *file.exists,
                    };
                    let file_group =
                        categorizer
                            .categorize(&file.name, config)
                            .unwrap_or_else(|err| {
                                panic!(
                                    "Unexpected error in file categorizer for file `{}`: {}.",
                                    file.name.to_string_lossy(),
                                    err
                                )
                            });
                    (file_group, file)
                })
                .filter(|(file_group, _)| {
                    !(has_disabled_projects
                        && match &file_group {
                            FileGroup::Generated { project_name: name } => {
                                !relevant_projects.contains(name)
                            }
                            FileGroup::Source { project_set }
                            | FileGroup::Schema { project_set }
                            | FileGroup::Extension { project_set } => !project_set
                                .iter()
                                .any(|name| relevant_projects.contains(name)),
                            FileGroup::Ignore => false,
                        })
                })
                .collect::<Vec<_>>()
        }
        FileSourceResult::External(result) => {
            categorize_non_watchman_files(&categorizer, config, &result.files)
        }
        FileSourceResult::WalkDir(result) => {
            categorize_non_watchman_files(&categorizer, config, &result.files)
        }
    };
    let mut categorized = HashMap::new();
    for (file_group, file) in result {
        categorized
            .entry(file_group)
            .or_insert_with(Vec::new)
            .push(file);
    }
    categorized
}

fn categorize_non_watchman_files(
    categorizer: &FileCategorizer,
    config: &Config,
    files: &[File],
) -> Vec<(FileGroup, File)> {
    let file_filter = FileFilter::from_config(config);

    files
        .par_iter()
        .filter(|file| file_filter.is_file_relevant(&file.name))
        .filter_map(|file| {
            let file_group = categorizer
                .categorize(&file.name, config)
                .map_err(|err| {
                    warn!(
                        "Unexpected error in file categorizer for file `{}`: {}.",
                        file.name.to_string_lossy(),
                        err
                    );
                    err
                })
                .ok()?;
            Some((file_group, file.clone()))
        })
        .collect::<Vec<_>>()
}

/// The FileCategorizer is created from a Config and categorizes files found by
/// Watchman into what kind of files they are, such as source files of a
/// specific source file group or generated files from some project.
pub struct FileCategorizer {
    source_language: HashMap<ProjectName, TypegenLanguage>,
    extensions_mapping: PathMapping<ProjectSet>,
    default_generated_dir: &'static OsStr,
    generated_dir_mapping: PathMapping<ProjectName>,
    generated_sources: Vec<PathBuf>,
    source_mapping: PathMapping<ProjectSet>,
    schema_file_mapping: HashMap<PathBuf, ProjectSet>,
    schema_dir_mapping: PathMapping<ProjectSet>,
}

impl FileCategorizer {
    pub fn from_config(config: &Config) -> Self {
        let mut source_mapping = vec![];
        for (path, project_set) in &config.sources {
            source_mapping.push((path.clone(), project_set.clone()));
        }
        for (path, project_set) in &config.generated_sources {
            source_mapping.push((path.clone(), project_set.clone()));
        }

        let default_generated_dir = OsStr::new("__generated__");
        let mut generated_sources = vec![];
        for (path, _project_set) in &config.generated_sources {
            if in_relative_generated_dir(default_generated_dir, path) {
                generated_sources.push(path.clone());
            }
        }

        let mut extensions_map: HashMap<PathBuf, ProjectSet> = Default::default();
        for (&project_name, project_config) in &config.projects {
            for extension_path in &project_config.schema_extensions {
                match extensions_map.entry(extension_path.clone()) {
                    Entry::Vacant(entry) => {
                        entry.insert(ProjectSet::of(project_name));
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
                        entry.insert(ProjectSet::of(project_name));
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
                        entry.insert(ProjectSet::of(project_name));
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
        let source_language: HashMap<ProjectName, TypegenLanguage> = config
            .projects
            .iter()
            .map(|(project_name, project_config)| {
                (*project_name, project_config.typegen_config.language)
            })
            .collect::<HashMap<_, _>>();

        Self {
            source_language,
            extensions_mapping: PathMapping::new(extensions_map.into_iter().collect()),
            default_generated_dir,
            generated_dir_mapping: PathMapping::new(generated_dir_mapping),
            generated_sources,
            schema_file_mapping,
            schema_dir_mapping: PathMapping::new(schema_dir_mapping),
            source_mapping: PathMapping::new(source_mapping),
        }
    }

    /// Categorizes a file. This method should be kept as cheap as possible by
    /// preprocessing the config in `from_config` and then re-using the
    /// `FileCategorizer`.
    pub fn categorize(&self, path: &Path, config: &Config) -> Result<FileGroup, Cow<'static, str>> {
        let extension = path.extension();

        let in_generated_sources = self
            .generated_sources
            .iter()
            .any(|generated_root| path.starts_with(generated_root));

        if let Some(project_name) = self.generated_dir_mapping.find(path) {
            if let Some(extension) = extension {
                if is_source_code_extension(extension) {
                    if !in_generated_sources {
                        return Ok(FileGroup::Generated { project_name });
                    }
                } else if is_extra_extensions(extension) {
                    return Ok(FileGroup::Generated { project_name });
                } else {
                    return Ok(FileGroup::Ignore);
                }
            } else {
                return Ok(FileGroup::Ignore);
            };
        }

        let extension = extension.ok_or(Cow::Borrowed("Got unexpected path without extension."))?;

        if is_source_code_extension(extension) {
            let project_set = self
                .source_mapping
                .find(path)
                .ok_or(Cow::Borrowed("File is not in any source set."))?;
            let filtered_project_set = filter_projects_for_path(config, path, project_set);
            if let Some(project_set) = filtered_project_set {
                let in_generated_dir = in_relative_generated_dir(self.default_generated_dir, path);
                // If the path is in a generated directory and is not a generated source
                // Some generated files can be treated as sources files. For example, resolver codegen.
                if in_generated_dir && !in_generated_sources {
                    if project_set.has_multiple_projects() {
                        Err(Cow::Owned(format!(
                            "Overlapping input sources are incompatible with relative generated \
                        directories. Got file in a relative generated directory with source set {project_set:?}.",
                        )))
                    } else {
                        let project_name = project_set.into_iter().next().unwrap();
                        Ok(FileGroup::Generated { project_name })
                    }
                } else {
                    let is_valid_extension =
                        self.is_valid_extension_for_project_set(&project_set, extension, path);
                    if is_valid_extension {
                        Ok(FileGroup::Source { project_set })
                    } else {
                        Err(Cow::Borrowed("Invalid extension for a generated file."))
                    }
                }
            } else {
                Ok(FileGroup::Ignore)
            }
        } else if is_schema_extension(extension) {
            if let Some(project_set) = self.schema_file_mapping.get(path) {
                Ok(FileGroup::Schema {
                    project_set: project_set.clone(),
                })
            } else if let Some(project_set) = self.extensions_mapping.find(path) {
                Ok(FileGroup::Extension { project_set })
            } else if let Some(project_set) = self.schema_dir_mapping.find(path) {
                Ok(FileGroup::Schema { project_set })
            } else {
                Err(Cow::Borrowed(
                    "Expected *.graphql/*.gql file to be either a schema or extension.",
                ))
            }
        } else {
            Err(Cow::Borrowed(
                "File categorizer encounter a file with unsupported extension.",
            ))
        }
    }

    fn is_valid_extension_for_project_set(
        &self,
        project_set: &ProjectSet,
        extension: &OsStr,
        path: &Path,
    ) -> bool {
        for project_name in project_set.iter() {
            if let Some(language) = self.source_language.get(project_name)
                && !is_valid_source_code_extension(language, extension)
            {
                warn!("Unexpected file `{path:?}` for language `{language:?}`.");
                return false;
            }
        }
        true
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

    fn find(&self, path: &Path) -> Option<T> {
        self.0.iter().find_map(|(prefix, item)| {
            if path.starts_with(prefix) {
                Some(item.clone())
            } else {
                None
            }
        })
    }
}

fn filter_projects_for_path(
    config: &Config,
    path: &Path,
    project_set: ProjectSet,
) -> Option<ProjectSet> {
    let project_names: Vec<ProjectName> = project_set
        .iter()
        .filter(|project_name| {
            if let Some(project_config) = config.projects.get(*project_name) {
                if let Some(glob_set) = &project_config.excludes_extensions {
                    !glob_set.is_match(path)
                } else {
                    true
                }
            } else {
                true
            }
        })
        .cloned()
        .collect();
    if project_names.is_empty() {
        None
    } else {
        Some(ProjectSet::new(project_names))
    }
}

fn in_relative_generated_dir(default_generated_dir: &OsStr, path: &Path) -> bool {
    path.components().any(|comp| match comp {
        Component::Normal(comp) => comp == default_generated_dir,
        _ => false,
    })
}

fn is_source_code_extension(extension: &OsStr) -> bool {
    extension == "js" || extension == "jsx" || extension == "ts" || extension == "tsx"
}

fn is_schema_extension(extension: &OsStr) -> bool {
    extension == "graphql" || extension == "gql"
}

fn is_extra_extensions(extension: &OsStr) -> bool {
    extension == "php" || extension == "json"
}

fn is_valid_source_code_extension(typegen_language: &TypegenLanguage, extension: &OsStr) -> bool {
    match typegen_language {
        TypegenLanguage::TypeScript => is_source_code_extension(extension),
        TypegenLanguage::Flow | TypegenLanguage::JavaScript => {
            extension == "js" || extension == "jsx"
        }
    }
}

#[cfg(test)]
mod tests {
    use intern::string_key::Intern;

    use super::*;

    fn create_test_config() -> Config {
        Config::from_string_for_test(
            r#"
                {
                    "sources": {
                        "src/js": "public",
                        "src/js/internal": "internal",
                        "src/vendor": "public",
                        "src/custom": "with_custom_generated_dir",
                        "src/typescript": "typescript",
                        "src/custom_overlapping": ["with_custom_generated_dir", "overlapping_generated_dir"],
                        "src/react_native.native.js": ["public"],
                        "src/component.react.native.js": ["public"]
                    },
                    "generatedSources": {
                        "src/resolver_codegen/__generated__": "public"
                    },
                    "projects": {
                        "public": {
                            "schema": "graphql/public.graphql",
                            "language": "flow",
                            "excludesExtensions": [
                                "*.native.js"
                            ]
                        },
                        "internal": {
                            "schema": "graphql/__generated__/internal.graphql",
                            "language": "flow"
                        },
                        "with_custom_generated_dir": {
                            "schema": "graphql/__generated__/custom.graphql",
                            "output": "graphql/custom-generated",
                            "language": "flow"
                        },
                        "typescript": {
                            "schema": "graphql/ts_schema.graphql",
                            "language": "typescript"
                        },
                        "overlapping_generated_dir": {
                            "schema": "graphql/__generated__/custom.graphql",
                            "language": "flow"
                        }
                    }
                }
            "#,
        )
        .unwrap()
    }

    #[test]
    fn test_categorize() {
        let config = create_test_config();
        let categorizer = FileCategorizer::from_config(&config);

        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("src/js/a.js"), &config)
                .unwrap(),
            FileGroup::Source {
                project_set: ProjectSet::of("public".intern().into()),
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("src/js/__generated__/a.js"), &config)
                .unwrap(),
            FileGroup::Generated {
                project_name: "public".intern().into(),
            },
        );
        assert_eq!(
            categorizer
                .categorize(
                    &PathBuf::from("src/resolver_codegen/__generated__/resolvers.js"),
                    &config
                )
                .unwrap(),
            FileGroup::Source {
                project_set: ProjectSet::of("public".intern().into()),
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("src/js/nested/b.js"), &config)
                .unwrap(),
            FileGroup::Source {
                project_set: ProjectSet::of("public".intern().into()),
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("src/js/internal/nested/c.js"), &config)
                .unwrap(),
            FileGroup::Source {
                project_set: ProjectSet::of("internal".intern().into()),
            },
        );
        assert_eq!(
            // When custom output dir is provided, path is correctly categorized
            // even if it has same dirname in path as custom output folder.
            // Path is only categorized as generated if it matches the absolute path
            // of the provided custom output.
            categorizer
                .categorize(&PathBuf::from("src/custom/custom-generated/c.js"), &config)
                .unwrap(),
            FileGroup::Source {
                project_set: ProjectSet::of("with_custom_generated_dir".intern().into()),
            },
        );
        assert_eq!(
            categorizer
                .categorize(
                    &PathBuf::from("src/js/internal/nested/__generated__/c.js"),
                    &config
                )
                .unwrap(),
            FileGroup::Generated {
                project_name: "internal".intern().into()
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("graphql/custom-generated/c.js"), &config)
                .unwrap(),
            FileGroup::Generated {
                project_name: "with_custom_generated_dir".intern().into()
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("graphql/public.graphql"), &config)
                .unwrap(),
            FileGroup::Schema {
                project_set: ProjectSet::of("public".intern().into())
            },
        );
        assert_eq!(
            categorizer
                .categorize(
                    &PathBuf::from("graphql/__generated__/internal.graphql"),
                    &config
                )
                .unwrap(),
            FileGroup::Schema {
                project_set: ProjectSet::of("internal".intern().into())
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("src/typescript/a.ts"), &config)
                .unwrap(),
            FileGroup::Source {
                project_set: ProjectSet::of("typescript".intern().into()),
            },
        );
    }

    #[test]
    fn test_invalid_extension() {
        let config = create_test_config();
        let categorizer = FileCategorizer::from_config(&config);
        assert_eq!(
            categorizer.categorize(&PathBuf::from("src/js/a.cpp"), &config),
            Err(Cow::Borrowed(
                "File categorizer encounter a file with unsupported extension."
            ))
        );
    }

    #[test]
    fn test_extension_mismatch_panic() {
        let config = create_test_config();
        let categorizer = FileCategorizer::from_config(&config);
        assert_eq!(
            categorizer.categorize(&PathBuf::from("src/js/a.ts"), &config),
            Err(Cow::Borrowed("Invalid extension for a generated file."))
        );
    }

    #[test]
    fn test_categorize_errors() {
        let config = create_test_config();
        let categorizer = FileCategorizer::from_config(&config);

        assert_eq!(
            categorizer.categorize(&PathBuf::from("src/js/a.graphql"), &config),
            Err(Cow::Borrowed(
                "Expected *.graphql/*.gql file to be either a schema or extension."
            )),
        );

        assert_eq!(
            categorizer.categorize(&PathBuf::from("src/js/a.gql"), &config),
            Err(Cow::Borrowed(
                "Expected *.graphql/*.gql file to be either a schema or extension."
            )),
        );

        assert_eq!(
            categorizer.categorize(&PathBuf::from("src/js/noextension"), &config),
            Err(Cow::Borrowed("Got unexpected path without extension.")),
        );

        assert_eq!(
            categorizer.categorize(
                &PathBuf::from("src/custom_overlapping/__generated__/c.js"),
                &config
            ),
            Err(Cow::Borrowed(
                "Overlapping input sources are incompatible with relative generated directories. Got file in a relative generated directory with source set ProjectSet([Named(\"with_custom_generated_dir\"), Named(\"overlapping_generated_dir\")])."
            )),
        );
    }

    #[test]
    fn test_filter_projects_for_path() {
        let config = create_test_config();
        assert_eq!(
            filter_projects_for_path(
                &config,
                &PathBuf::from("src/react_native.native.js"),
                ProjectSet::new(vec![ProjectName::Named("public".intern())])
            ),
            None
        );
        assert_eq!(
            filter_projects_for_path(
                &config,
                &PathBuf::from("src/component.react.native.js"),
                ProjectSet::new(vec![ProjectName::Named("public".intern())])
            ),
            None
        );
        assert_eq!(
            filter_projects_for_path(
                &config,
                &PathBuf::from("src/typescript"),
                ProjectSet::new(vec![ProjectName::Named("public".intern())])
            ),
            Some(ProjectSet::new(vec![ProjectName::Named("public".intern())]))
        );
    }
}
