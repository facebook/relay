/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::file_filter::FileFilter;
use super::File;
use super::FileGroup;
use crate::compiler_state::{ProjectName, ProjectSet, SourceSet};
use crate::config::{Config, SchemaLocation};
use crate::FileSourceResult;
use common::sync::ParallelIterator;
use core::panic;
use fnv::FnvHashSet;
use log::warn;
use rayon::iter::IntoParallelRefIterator;
use relay_typegen::TypegenLanguage;
use std::borrow::Cow;
use std::collections::HashMap;
use std::ffi::OsStr;
use std::path::{Component, PathBuf};
use std::{collections::hash_map::Entry, path::Path};

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
                    let file_group = categorizer.categorize(&file.name).unwrap_or_else(|err| {
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
                            FileGroup::Source {
                                source_set: SourceSet::SourceSetName(name),
                            }
                            | FileGroup::Schema {
                                project_set: ProjectSet::ProjectName(name),
                            }
                            | FileGroup::Extension {
                                project_set: ProjectSet::ProjectName(name),
                            }
                            | FileGroup::Generated { project_name: name } => {
                                !relevant_projects.contains(name)
                            }
                            FileGroup::Source {
                                source_set: SourceSet::SourceSetNames(names),
                            }
                            | FileGroup::Schema {
                                project_set: ProjectSet::ProjectNames(names),
                            }
                            | FileGroup::Extension {
                                project_set: ProjectSet::ProjectNames(names),
                            } => !names.iter().any(|name| relevant_projects.contains(name)),
                        })
                })
                .collect::<Vec<_>>()
        }
        FileSourceResult::External(result) => {
            categorize_non_watchman_files(&categorizer, config, &result.files)
        }
        FileSourceResult::Glob(result) => {
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
                .categorize(&file.name)
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
            for extension_dir in &project_config.schema_extensions {
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
    pub fn categorize(&self, path: &Path) -> Result<FileGroup, Cow<'static, str>> {
        if let Some(project_name) = self.generated_dir_mapping.find(path) {
            return Ok(FileGroup::Generated { project_name });
        }
        let extension = path
            .extension()
            .ok_or(Cow::Borrowed("Got unexpected path without extension."))?;

        if is_source_code_extension(extension) {
            let source_set = self
                .source_mapping
                .find(path)
                .ok_or(Cow::Borrowed("File is not in any source set."))?;
            if self.in_relative_generated_dir(path) {
                if let SourceSet::SourceSetName(source_set_name) = source_set {
                    Ok(FileGroup::Generated {
                        project_name: source_set_name,
                    })
                } else {
                    Err(Cow::Owned(format!(
                        "Overlapping input sources are incompatible with relative generated \
                        directories. Got file in a relative generated directory with source set {:?}.",
                        source_set,
                    )))
                }
            } else {
                let is_valid_extension =
                    self.is_valid_extension_for_source_set(&source_set, extension, path);
                if is_valid_extension {
                    Ok(FileGroup::Source { source_set })
                } else {
                    Err(Cow::Borrowed("Invalid extension for a generated file."))
                }
            }
        } else if extension == "graphql" {
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
                    "Expected *.graphql file to be either a schema or extension.",
                ))
            }
        } else {
            Err(Cow::Borrowed(
                "File categorizer encounter a file with unsupported extension.",
            ))
        }
    }

    fn in_relative_generated_dir(&self, path: &Path) -> bool {
        path.components().any(|comp| match comp {
            Component::Normal(comp) => comp == self.default_generated_dir,
            _ => false,
        })
    }

    fn is_valid_extension_for_source_set(
        &self,
        source_set: &SourceSet,
        extension: &OsStr,
        path: &Path,
    ) -> bool {
        match source_set {
            SourceSet::SourceSetName(source_set_name) => {
                if let Some(language) = self.source_language.get(source_set_name) {
                    if !is_valid_source_code_extension(language, extension) {
                        warn!(
                            "Unexpected file `{:?}` for language `{:?}`.",
                            path, language
                        );
                        return false;
                    }
                }
            }
            SourceSet::SourceSetNames(source_set_names) => {
                for source_set_name in source_set_names {
                    if let Some(language) = self.source_language.get(source_set_name) {
                        if !is_valid_source_code_extension(language, extension) {
                            warn!(
                                "Unexpected file `{:?}` for language `{:?}`.",
                                path, language
                            );
                            return false;
                        }
                    }
                }
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

fn is_source_code_extension(extension: &OsStr) -> bool {
    extension == "js" || extension == "jsx" || extension == "ts" || extension == "tsx"
}

fn is_valid_source_code_extension(typegen_language: &TypegenLanguage, extension: &OsStr) -> bool {
    match typegen_language {
        TypegenLanguage::TypeScript => is_source_code_extension(extension),
        TypegenLanguage::Flow => extension == "js" || extension == "jsx",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use intern::string_key::Intern;

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
                        "src/custom_overlapping": ["with_custom_generated_dir", "overlapping_generated_dir"]
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
                        },
                        "typescript": {
                            "schema": "graphql/ts_schema.graphql",
                            "language": "typescript"
                        },
                        "overlapping_generated_dir": {
                            "schema": "graphql/__generated__/custom.graphql"
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
                .categorize(&PathBuf::from("src/js/a.js"))
                .unwrap(),
            FileGroup::Source {
                source_set: SourceSet::SourceSetName("public".intern()),
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("src/js/nested/b.js"))
                .unwrap(),
            FileGroup::Source {
                source_set: SourceSet::SourceSetName("public".intern()),
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("src/js/internal/nested/c.js"))
                .unwrap(),
            FileGroup::Source {
                source_set: SourceSet::SourceSetName("internal".intern()),
            },
        );
        assert_eq!(
            // When custom output dir is provided, path is correctly categorized
            // even if it has same dirname in path as custom output folder.
            // Path is only categorized as generated if it matches the absolute path
            // of the provided custom output.
            categorizer
                .categorize(&PathBuf::from("src/custom/custom-generated/c.js"))
                .unwrap(),
            FileGroup::Source {
                source_set: SourceSet::SourceSetName("with_custom_generated_dir".intern()),
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("src/js/internal/nested/__generated__/c.js"))
                .unwrap(),
            FileGroup::Generated {
                project_name: "internal".intern()
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("graphql/custom-generated/c.js"))
                .unwrap(),
            FileGroup::Generated {
                project_name: "with_custom_generated_dir".intern()
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("graphql/public.graphql"))
                .unwrap(),
            FileGroup::Schema {
                project_set: ProjectSet::ProjectName("public".intern())
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("graphql/__generated__/internal.graphql"))
                .unwrap(),
            FileGroup::Schema {
                project_set: ProjectSet::ProjectName("internal".intern())
            },
        );
        assert_eq!(
            categorizer
                .categorize(&PathBuf::from("src/typescript/a.ts"))
                .unwrap(),
            FileGroup::Source {
                source_set: SourceSet::SourceSetName("typescript".intern()),
            },
        );
    }

    #[test]
    fn test_invalid_extension() {
        let config = create_test_config();
        let categorizer = FileCategorizer::from_config(&config);
        assert_eq!(
            categorizer.categorize(&PathBuf::from("src/js/a.cpp")),
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
            categorizer.categorize(&PathBuf::from("src/js/a.ts")),
            Err(Cow::Borrowed("Invalid extension for a generated file."))
        );
    }

    #[test]
    fn test_categorize_errors() {
        let config = create_test_config();
        let categorizer = FileCategorizer::from_config(&config);

        assert_eq!(
            categorizer.categorize(&PathBuf::from("src/js/a.graphql")),
            Err(Cow::Borrowed(
                "Expected *.graphql file to be either a schema or extension."
            )),
        );

        assert_eq!(
            categorizer.categorize(&PathBuf::from("src/js/noextension")),
            Err(Cow::Borrowed("Got unexpected path without extension.")),
        );

        assert_eq!(
            categorizer.categorize(&PathBuf::from("src/custom_overlapping/__generated__/c.js")),
            Err(Cow::Borrowed(
                "Overlapping input sources are incompatible with relative generated directories. Got file in a relative generated directory with source set SourceSetNames([\"with_custom_generated_dir\", \"overlapping_generated_dir\"])."
            )),
        );
    }
}
