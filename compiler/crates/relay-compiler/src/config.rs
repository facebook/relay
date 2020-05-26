/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::generate_extra_artifacts::GenerateExtraArtifactsFn;
use crate::compiler_state::{ProjectName, SourceSetName};
use crate::errors::{ConfigValidationError, Error, Result};
use interner::StringKey;
use regex::Regex;
use relay_typegen::TypegenConfig;
use serde::Deserialize;
use std::collections::{HashMap, HashSet};
use std::fmt;
use std::path::PathBuf;

/// The full compiler config. This is a combination of:
/// - the configuration file
/// - the absolute path to the root of the compiled projects
/// - command line options
/// - TODO: injected code to produce additional files
pub struct Config {
    /// Root directory of all projects to compile. Any other paths in the
    /// compiler should be relative to this root unless otherwise noted.
    pub root_dir: PathBuf,
    pub sources: HashMap<PathBuf, SourceSetName>,
    pub blacklist: Vec<String>,
    pub projects: HashMap<ProjectName, ProjectConfig>,
    pub header: Vec<String>,
    pub codegen_command: Option<String>,
    /// If this is false, the compiler won't write any artifact files.
    pub write_artifacts: bool,
    /// If set, the compiler will only compile the given project
    pub only_project: Option<StringKey>,
    /// If set, tries to initialize the compiler from the saved state file.
    pub load_saved_state_file: Option<PathBuf>,
    /// Function to genetate extra
    pub generate_extra_operation_artifacts: Option<GenerateExtraArtifactsFn>,
}

impl Config {
    /// Call a function for every active project in this Config
    pub fn for_each_project<F>(&self, mut func: F)
    where
        F: FnMut(&ProjectConfig) -> (),
    {
        match self.only_project {
            Some(project_key) => {
                let project_config = self
                    .projects
                    .get(&project_key)
                    .unwrap_or_else(|| panic!("Expected the project {} to exist", &project_key));
                func(project_config)
            }
            None => {
                for project in self.projects.values() {
                    func(project)
                }
            }
        }
    }

    pub fn load(root_dir: PathBuf, config_path: PathBuf) -> Result<Self> {
        let config_string =
            std::fs::read_to_string(&config_path).map_err(|err| Error::ConfigFileRead {
                config_path: config_path.clone(),
                source: err,
            })?;
        Self::from_string(root_dir, config_path, &config_string, true)
    }

    /// Loads a config file without validation for use in tests.
    #[cfg(test)]
    pub fn from_string_for_test(config_string: &str) -> Result<Self> {
        Self::from_string(
            "/virtual/root".into(),
            "/virtual/root/virtual_config.json".into(),
            config_string,
            false,
        )
    }

    /// `validate_fs` disables all filesystem checks for existence of files
    fn from_string(
        root_dir: PathBuf,
        config_path: PathBuf,
        config_string: &str,
        validate_fs: bool,
    ) -> Result<Self> {
        let config_file: ConfigFile =
            serde_json::from_str(&config_string).map_err(|err| Error::ConfigFileParse {
                config_path: config_path.clone(),
                source: err,
            })?;
        let projects = config_file
            .projects
            .into_iter()
            .map(|(project_name, config_file_project)| {
                let schema_location =
                    match (config_file_project.schema, config_file_project.schema_dir) {
                        (Some(schema_file), None) => Ok(SchemaLocation::File(schema_file)),
                        (None, Some(schema_dir)) => Ok(SchemaLocation::Directory(schema_dir)),
                        _ => Err(Error::ConfigFileValidation {
                            config_path: config_path.clone(),
                            validation_errors: vec![
                                ConfigValidationError::ProjectNeedsSchemaXorSchemaDir {
                                    project_name,
                                },
                            ],
                        }),
                    }?;

                let shard_strip_regex = match config_file_project.shard_strip_regex {
                    None => Ok(None),
                    Some(ref val) => match Regex::new(val) {
                        Ok(val) => Ok(Some(val)),
                        Err(error) => Err(Error::ConfigFileValidation {
                            config_path: config_path.clone(),
                            validation_errors: vec![
                                ConfigValidationError::InvalidShardPathStripRegex {
                                    project_name,
                                    error,
                                },
                            ],
                        }),
                    },
                }?;

                let project_config = ProjectConfig {
                    name: project_name,
                    base: config_file_project.base,
                    extensions: config_file_project.extensions,
                    output: config_file_project.output,
                    extra_artifacts_output: config_file_project.extra_artifacts_output,
                    extra_artifacts_generation_enabled: config_file_project
                        .extra_artifacts_generation_enabled,
                    shard_output: config_file_project.shard_output,
                    shard_strip_regex,
                    schema_location,
                    typegen_config: config_file_project.typegen_config,
                    persist: config_file_project.persist,
                };
                Ok((project_name, project_config))
            })
            .collect::<Result<HashMap<_, _>>>()?;
        let config = Self {
            root_dir,
            sources: config_file.sources,
            blacklist: config_file.blacklist,
            projects,
            header: config_file.header,
            codegen_command: config_file.codegen_command,
            write_artifacts: true,
            only_project: None,
            load_saved_state_file: None,
            generate_extra_operation_artifacts: None,
        };

        let mut validation_errors = Vec::new();
        config.validate_consistency(&mut validation_errors);
        if validate_fs {
            config.validate_paths(&mut validation_errors);
        }
        if validation_errors.is_empty() {
            Ok(config)
        } else {
            Err(Error::ConfigFileValidation {
                config_path,
                validation_errors,
            })
        }
    }

    /// Validated internal consistency of the config.
    fn validate_consistency(&self, errors: &mut Vec<ConfigValidationError>) {
        let source_set_names: HashSet<_> = self.sources.values().collect();

        for (&project_name, project_config) in &self.projects {
            // there should be a source for each project matching the project name
            if !source_set_names.contains(&project_name) {
                errors.push(ConfigValidationError::ProjectSourceMissing { project_name });
            }

            // If a base of the project is set, it should exist
            if let Some(base_name) = project_config.base {
                if self.projects.get(&base_name).is_none() {
                    errors.push(ConfigValidationError::ProjectBaseMissing {
                        project_name,
                        base_project_name: base_name,
                    })
                }
            }
        }
    }

    /// Validates that all paths actually exist on disk.
    fn validate_paths(&self, errors: &mut Vec<ConfigValidationError>) {
        if !self.root_dir.is_dir() {
            errors.push(ConfigValidationError::RootNotDirectory {
                root_dir: self.root_dir.clone(),
            });
            // early return, no point in continuing validation
            return;
        }

        // each source should point to an existing directory
        for source_dir in self.sources.keys() {
            let abs_source_dir = self.root_dir.join(source_dir);
            if !abs_source_dir.exists() {
                errors.push(ConfigValidationError::SourceNotExistent {
                    source_dir: abs_source_dir.clone(),
                });
            } else if !abs_source_dir.is_dir() {
                errors.push(ConfigValidationError::SourceNotDirectory {
                    source_dir: abs_source_dir.clone(),
                });
            }
        }

        for (&project_name, project) in &self.projects {
            match &project.schema_location {
                SchemaLocation::File(schema_file) => {
                    let abs_schema_file = self.root_dir.join(schema_file);
                    if !abs_schema_file.exists() {
                        errors.push(ConfigValidationError::SchemaFileNotExistent {
                            project_name,
                            schema_file: abs_schema_file.clone(),
                        });
                    } else if !abs_schema_file.is_file() {
                        errors.push(ConfigValidationError::SchemaFileNotFile {
                            project_name,
                            schema_file: abs_schema_file.clone(),
                        });
                    }
                }
                SchemaLocation::Directory(schema_dir) => {
                    let abs_schema_dir = self.root_dir.join(schema_dir);
                    if !abs_schema_dir.exists() {
                        errors.push(ConfigValidationError::SchemaDirNotExistent {
                            project_name,
                            schema_dir: abs_schema_dir.clone(),
                        });
                    } else if !abs_schema_dir.is_dir() {
                        errors.push(ConfigValidationError::SchemaDirNotDirectory {
                            project_name,
                            schema_dir: abs_schema_dir.clone(),
                        });
                    }
                }
            }
        }
    }
}

impl fmt::Debug for Config {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let Config {
            root_dir,
            sources,
            blacklist,
            projects,
            header,
            codegen_command,
            write_artifacts,
            only_project,
            load_saved_state_file,
            generate_extra_operation_artifacts,
        } = self;
        f.debug_struct("Config")
            .field("root_dir", root_dir)
            .field("sources", sources)
            .field("blacklist", blacklist)
            .field("projects", projects)
            .field("header", header)
            .field("codegen_command", codegen_command)
            .field("write_artifacts", write_artifacts)
            .field("only_project", only_project)
            .field("load_saved_state_file", load_saved_state_file)
            .field(
                "generate_extra_operation_artifacts",
                if generate_extra_operation_artifacts.is_some() {
                    &"Some(Fn)"
                } else {
                    &"None"
                },
            )
            .finish()
    }
}

#[derive(Debug)]
pub struct ProjectConfig {
    pub name: ProjectName,
    pub base: Option<ProjectName>,
    pub output: Option<PathBuf>,
    pub extra_artifacts_output: Option<PathBuf>,
    pub extra_artifacts_generation_enabled: bool,
    pub shard_output: bool,
    pub shard_strip_regex: Option<Regex>,
    pub extensions: Vec<PathBuf>,
    pub schema_location: SchemaLocation,
    pub typegen_config: TypegenConfig,
    pub persist: Option<PersistConfig>,
}

#[derive(Clone, Debug)]
pub enum SchemaLocation {
    File(PathBuf),
    Directory(PathBuf),
}

/// Schema of the compiler configuration JSON file.
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct ConfigFile {
    #[serde(default)]
    header: Vec<String>,
    #[serde(default)]
    codegen_command: Option<String>,

    /// A mapping from directory paths (relative to the root) to a source set.
    /// If a path is a subdirectory of another path, the more specific path
    /// wins.
    sources: HashMap<PathBuf, SourceSetName>,

    /// Glob patterns that should not be part of the sources even if they are
    /// in the source set directories.
    #[serde(default)]
    blacklist: Vec<String>,

    /// Configuration of projects to compile.
    projects: HashMap<ProjectName, ConfigFileProject>,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
struct ConfigFileProject {
    /// If a base project is set, the documents of that project can be
    /// referenced, but won't produce output artifacts.
    /// Extensions from the base project will be added as well and the schema
    /// of the base project should be a subset of the schema of this project.
    #[serde(default)]
    base: Option<ProjectName>,

    /// A project without an output directory will put the generated files in
    /// a __generated__ directory next to the input file.
    /// All files in these directories should be generated by the Relay
    /// compiler, so that the compiler can cleanup extra files.
    #[serde(default)]
    output: Option<PathBuf>,

    /// Some projects may need to generate extra artifacts. For those, we may
    /// need to provide an additional directory to put them.
    /// By default the will use `output` *if available
    extra_artifacts_output: Option<PathBuf>,

    /// Enable extra file generation for project
    #[serde(default)]
    extra_artifacts_generation_enabled: bool,

    /// If `output` is provided and `shard_output` is `true`, shard the files
    /// by putting them under `{output_dir}/{source_relative_path}`
    #[serde(default)]
    shard_output: bool,

    /// Regex to match and strip parts of the `source_relative_path`
    #[serde(default)]
    shard_strip_regex: Option<String>,

    /// Directory containing *.graphql files with schema extensions.
    #[serde(default)]
    extensions: Vec<PathBuf>,

    /// Path to the schema.graphql or a directory containing a schema broken up
    /// in multiple *.graphql files.
    /// Exactly 1 of these options needs to be defined.
    schema: Option<PathBuf>,
    schema_dir: Option<PathBuf>,

    /// If this option is set, the compiler will persist queries using this
    /// config.
    persist: Option<PersistConfig>,

    #[serde(flatten)]
    typegen_config: TypegenConfig,
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PersistConfig {
    /// URL to send a POST request to to persist.
    pub url: String,
    /// The document will be in a POST parameter `text`. This map can contain
    /// additional parameters to send.
    pub params: HashMap<String, String>,
}
