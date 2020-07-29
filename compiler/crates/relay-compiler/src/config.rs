/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::artifact_writer::{
    ArtifactDifferenceWriter, ArtifactFileWriter, ArtifactWriter,
};
use crate::build_project::generate_extra_artifacts::GenerateExtraArtifactsFn;
use crate::compiler_state::{ProjectName, SourceSet};
use crate::errors::{ConfigValidationError, Error, Result};
use crate::saved_state::SavedStateLoader;
use rayon::prelude::*;
use regex::Regex;
use relay_typegen::TypegenConfig;
use serde::Deserialize;
use std::collections::{HashMap, HashSet};
use std::fmt;
use std::path::PathBuf;
use watchman_client::pdu::ScmAwareClockData;

/// The full compiler config. This is a combination of:
/// - the configuration file
/// - the absolute path to the root of the compiled projects
/// - command line options
/// - TODO: injected code to produce additional files
pub struct Config {
    /// Root directory of all projects to compile. Any other paths in the
    /// compiler should be relative to this root unless otherwise noted.
    pub root_dir: PathBuf,
    pub sources: HashMap<PathBuf, SourceSet>,
    pub excludes: Vec<String>,
    pub projects: HashMap<ProjectName, ProjectConfig>,
    pub header: Vec<String>,
    pub codegen_command: Option<String>,
    /// If set, tries to initialize the compiler from the saved state file.
    pub load_saved_state_file: Option<PathBuf>,
    /// Function to generate extra
    pub generate_extra_operation_artifacts: Option<GenerateExtraArtifactsFn>,
    /// Path to which to write the output of the compilation
    pub codegen_filepath: Option<PathBuf>,
    pub full_build: bool,

    pub saved_state_config: Option<ScmAwareClockData>,
    pub saved_state_loader: Option<Box<dyn SavedStateLoader + Send + Sync>>,
}

impl Config {
    /// Iterator over projects that are enabled.
    pub fn enabled_projects(&self) -> impl Iterator<Item = &ProjectConfig> {
        self.projects
            .values()
            .filter(|project_config| project_config.enabled)
    }

    /// Rayon parallel iterator over projects that are enabled.
    pub fn par_enabled_projects(&self) -> impl ParallelIterator<Item = &ProjectConfig> {
        self.projects
            .par_iter()
            .map(|(_project_name, project_config)| project_config)
            .filter(|project_config| project_config.enabled)
    }

    pub fn load(config_path: PathBuf) -> Result<Self> {
        let config_string =
            std::fs::read_to_string(&config_path).map_err(|err| Error::ConfigFileRead {
                config_path: config_path.clone(),
                source: err,
            })?;
        Self::from_string(config_path, &config_string, true)
    }

    /// Loads a config file without validation for use in tests.
    #[cfg(test)]
    pub fn from_string_for_test(config_string: &str) -> Result<Self> {
        Self::from_string(
            "/virtual/root/virtual_config.json".into(),
            config_string,
            false,
        )
    }

    /// `validate_fs` disables all filesystem checks for existence of files
    fn from_string(config_path: PathBuf, config_string: &str, validate_fs: bool) -> Result<Self> {
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
                    enabled: true,
                    extensions: config_file_project.extensions,
                    output: config_file_project.output,
                    extra_artifacts_output: config_file_project.extra_artifacts_output,
                    shard_output: config_file_project.shard_output,
                    shard_strip_regex,
                    schema_location,
                    typegen_config: config_file_project.typegen_config,
                    persist: config_file_project.persist,
                };
                Ok((project_name, project_config))
            })
            .collect::<Result<HashMap<_, _>>>()?;

        let config_file_dir = config_path.parent().unwrap();
        let root_dir = if let Some(config_root) = config_file.root {
            config_file_dir.join(config_root).canonicalize().unwrap()
        } else {
            config_file_dir.to_owned()
        };

        let config = Self {
            root_dir,
            sources: config_file.sources,
            excludes: config_file.excludes,
            full_build: false,
            projects,
            header: config_file.header,
            codegen_command: config_file.codegen_command,
            load_saved_state_file: None,
            generate_extra_operation_artifacts: None,
            codegen_filepath: None,
            saved_state_config: config_file.saved_state_config,
            saved_state_loader: None,
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
        let mut source_set_names: HashSet<_> = Default::default();
        for value in self.sources.values() {
            match value {
                SourceSet::SourceSetName(name) => {
                    source_set_names.insert(*name);
                }
                SourceSet::SourceSetNames(names) => {
                    for name in names {
                        source_set_names.insert(*name);
                    }
                }
            };
        }

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

    pub fn create_artifact_writer(&self) -> Box<dyn ArtifactWriter> {
        if let Some(ref codegen_filepath) = self.codegen_filepath {
            Box::new(ArtifactDifferenceWriter::new(codegen_filepath.clone()))
        } else {
            Box::new(ArtifactFileWriter {})
        }
    }
}

impl fmt::Debug for Config {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let Config {
            root_dir,
            sources,
            excludes,
            full_build,
            projects,
            header,
            codegen_command,
            load_saved_state_file,
            generate_extra_operation_artifacts,
            codegen_filepath,
            saved_state_config,
            saved_state_loader,
        } = self;
        f.debug_struct("Config")
            .field("root_dir", root_dir)
            .field("sources", sources)
            .field("excludes", excludes)
            .field("full_build", full_build)
            .field("projects", projects)
            .field("header", header)
            .field("codegen_command", codegen_command)
            .field("load_saved_state_file", load_saved_state_file)
            .field("saved_state_config", saved_state_config)
            .field(
                "generate_extra_operation_artifacts",
                if generate_extra_operation_artifacts.is_some() {
                    &"Some(Fn)"
                } else {
                    &"None"
                },
            )
            .field("codegen_filepath", codegen_filepath)
            .field(
                "saved_state_loader",
                if saved_state_loader.is_some() {
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
    pub shard_output: bool,
    pub shard_strip_regex: Option<Regex>,
    pub extensions: Vec<PathBuf>,
    pub enabled: bool,
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
    /// Root directory relative to the config file. Defaults to the directory
    /// where the config is located.
    #[serde(default)]
    root: Option<PathBuf>,

    #[serde(default)]
    header: Vec<String>,
    #[serde(default)]
    codegen_command: Option<String>,

    /// A mapping from directory paths (relative to the root) to a source set.
    /// If a path is a subdirectory of another path, the more specific path
    /// wins.
    sources: HashMap<PathBuf, SourceSet>,

    /// Glob patterns that should not be part of the sources even if they are
    /// in the source set directories.
    #[serde(default)]
    excludes: Vec<String>,

    /// Configuration of projects to compile.
    projects: HashMap<ProjectName, ConfigFileProject>,

    /// Watchman saved state config.
    saved_state_config: Option<ScmAwareClockData>,
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

    /// Generate Query ($Parameters files)
    #[serde(default)]
    should_generate_parameters_file: bool,
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
