/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! The config module provides functionality for managing the configuration of the Relay compiler.
use std::env::current_dir;
use std::ffi::OsStr;
use std::fmt;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;
use std::vec;

use async_trait::async_trait;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::FeatureFlags;
use common::Rollout;
use common::ScalarName;
use dunce::canonicalize;
use fnv::FnvBuildHasher;
use fnv::FnvHashSet;
use globset::Glob;
use globset::GlobSetBuilder;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use indexmap::IndexMap;
use intern::string_key::StringKey;
use js_config_loader::LoaderSource;
use persist_query::PersistError;
use rayon::prelude::*;
use regex::Regex;
use relay_config::CustomType;
use relay_config::DiagnosticReportConfig;
pub use relay_config::ExtraArtifactsConfig;
use relay_config::JsModuleFormat;
pub use relay_config::LocalPersistConfig;
use relay_config::ModuleImportConfig;
pub use relay_config::PersistConfig;
pub use relay_config::ProjectConfig;
use relay_config::ProjectName;
pub use relay_config::RemotePersistConfig;
use relay_config::ResolversSchemaModuleConfig;
use relay_config::SchemaConfig;
pub use relay_config::SchemaLocation;
use relay_config::TypegenConfig;
pub use relay_config::TypegenLanguage;
use relay_docblock::DocblockIr;
use relay_saved_state_loader::SavedStateLoader;
use relay_transforms::CustomTransformsConfig;
use schemars::JsonSchema;
use schemars::SchemaGenerator;
use schemars::generate::SchemaSettings;
use schemars::{self};
use serde::Deserialize;
use serde::Deserializer;
use serde::Serialize;
use serde::de::Error as DeError;
use serde_json::Value;
use sha1::Digest;
use sha1::Sha1;
use watchman_client::pdu::ScmAwareClockData;

use crate::GraphQLAsts;
use crate::build_project::AdditionalValidations;
use crate::build_project::artifact_writer::ArtifactFileWriter;
use crate::build_project::artifact_writer::ArtifactWriter;
use crate::build_project::generate_extra_artifacts::GenerateExtraArtifactsFn;
use crate::build_project::get_artifacts_file_hash_map::GetArtifactsFileHashMapFn;
use crate::compiler_state::CompilerState;
use crate::compiler_state::DeserializableProjectSet;
use crate::compiler_state::ProjectSet;
use crate::errors::ConfigValidationError;
use crate::errors::Error;
use crate::errors::Result;
use crate::source_control_for_root;
use crate::status_reporter::ConsoleStatusReporter;
use crate::status_reporter::StatusReporter;

pub type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;

type PostArtifactsWriter = Box<
    dyn Fn(&Config) -> std::result::Result<(), Box<dyn std::error::Error + Send + Sync>>
        + Send
        + Sync,
>;

type OperationPersisterCreator =
    Box<dyn Fn(&ProjectConfig) -> Option<Box<dyn OperationPersister + Send + Sync>> + Send + Sync>;

type UpdateCompilerStateFromSavedState =
    Option<Box<dyn Fn(&mut CompilerState, &Config) + Send + Sync>>;

type ShouldExtractFullSource = Box<dyn Fn(&str) -> bool + Send + Sync>;

type GenerateVirtualIdFieldName =
    Box<dyn Fn(&ProjectConfig, &OperationDefinition, &Program) -> Option<StringKey> + Send + Sync>;

type CustomExtractRelayResolvers = Box<
    dyn Fn(
            ProjectName,
            &FnvIndexMap<ScalarName, CustomType>,
            &CompilerState,
            Option<&GraphQLAsts>,
        ) -> DiagnosticsResult<(Vec<DocblockIr>, Vec<DocblockIr>)>
        // (Types, Fields)
        + Send
        + Sync,
>;

type CustomOverrideSchemaDeterminator =
    Box<dyn Fn(&ProjectConfig, &OperationDefinition) -> Option<String> + Send + Sync>;

/// The full compiler config. This is a combination of:
/// - the configuration file
/// - the absolute path to the root of the compiled projects
/// - command line options
/// - TODO: injected code to produce additional files
pub struct Config {
    /// Optional name for this config. This might be used by compiler extension
    /// code like logging or extra artifact generation.
    pub name: Option<String>,
    /// Root directory of all projects to compile. Any other paths in the
    /// compiler should be relative to this root unless otherwise noted.
    pub root_dir: PathBuf,
    pub sources: FnvIndexMap<PathBuf, ProjectSet>,
    pub excludes: Vec<String>,
    /// Some projects may need to include extra source directories without being
    /// affected by exclusion globs from the `excludes` config (e.g. generated
    /// directories).
    pub generated_sources: FnvIndexMap<PathBuf, ProjectSet>,
    pub projects: FnvIndexMap<ProjectName, ProjectConfig>,
    pub header: Vec<String>,
    pub codegen_command: Option<String>,
    /// If set, tries to initialize the compiler from the saved state file.
    pub load_saved_state_file: Option<PathBuf>,
    /// Function to generate extra
    pub generate_extra_artifacts: Option<GenerateExtraArtifactsFn>,
    pub generate_virtual_id_file_name: Option<GenerateVirtualIdFieldName>,

    /// Path to which to write the output of the compilation
    pub artifact_writer: Box<dyn ArtifactWriter + Send + Sync>,
    // Function to get the file hash for an artifact file.
    pub get_artifacts_file_hash_map: Option<GetArtifactsFileHashMapFn>,

    /// Compile all files. Persist ids are still re-used unless
    /// `Config::repersist_operations` is also set.
    pub compile_everything: bool,

    /// Do not reuse persist ids from artifacts even if the text hash matches.
    pub repersist_operations: bool,

    pub saved_state_config: Option<ScmAwareClockData>,
    pub saved_state_loader: Option<Box<dyn SavedStateLoader + Send + Sync>>,
    pub saved_state_version: String,

    /// Function that creates a function that is
    /// called to save operation text (e.g. to a database) and to generate an id.
    pub create_operation_persister: Option<OperationPersisterCreator>,

    pub post_artifacts_write: Option<PostArtifactsWriter>,

    /// Validations that can be added to the config that will be called in addition to default
    /// validation rules.
    pub additional_validations: Option<AdditionalValidations>,

    pub status_reporter: Box<dyn StatusReporter + Send + Sync>,

    /// We may generate some content in the artifacts that's stripped in production if __DEV__ variable is set
    /// This config option is here to define the name of that special variable
    pub is_dev_variable_name: Option<String>,

    /// Type of file source to use in the Compiler
    pub file_source_config: FileSourceKind,

    /// A set of custom transform functions, that can be applied before,
    /// and after each major transformation step (common, operations, etc)
    /// in the `apply_transforms(...)`.
    pub custom_transforms: Option<CustomTransformsConfig>,
    pub custom_override_schema_determinator: Option<CustomOverrideSchemaDeterminator>,
    pub export_persisted_query_ids_to_file: Option<PathBuf>,

    /// The async function is called before the compiler connects to the file
    /// source.
    pub initialize_resources: Option<Box<dyn Fn() + Send + Sync>>,

    /// Runs in `try_saved_state` when the compiler state is initialized from saved state.
    pub update_compiler_state_from_saved_state: UpdateCompilerStateFromSavedState,

    /// Allow incremental build for some schema changes
    pub has_schema_change_incremental_build: bool,

    /// A custom function to extract resolver Dockblock IRs from sources
    pub custom_extract_relay_resolvers: Option<CustomExtractRelayResolvers>,

    /// A function to determine if full file source should be extracted instead of docblock
    pub should_extract_full_source: Option<ShouldExtractFullSource>,

    /// Names of directives that will be automatically copied from the parent fragment to refetchable queries
    pub transferrable_refetchable_query_directives: Vec<DirectiveName>,
}

pub enum FileSourceKind {
    Watchman,
    /// List with changed files in format "file_path,exists".
    /// This can be used to replace watchman queries
    External(PathBuf),
    WalkDir,
}

fn normalize_path_from_config(
    current_dir: PathBuf,
    common_path: PathBuf,
    path_from_config: PathBuf,
) -> PathBuf {
    let mut src = current_dir.join(path_from_config.clone());

    src = canonicalize(src.clone())
        .unwrap_or_else(|err| panic!("Unable to canonicalize file {:?}. Error: {:?}", &src, err));

    src.strip_prefix(common_path.clone())
        .unwrap_or_else(|_| {
            panic!(
                "Expect to be able to strip common_path from {:?} {:?}",
                &src,
                &common_path.clone(),
            );
        })
        .to_path_buf()
}

impl From<SingleProjectConfigFile> for Config {
    fn from(config: SingleProjectConfigFile) -> Self {
        Self::from_struct(
            "/virtual/path".into(),
            ConfigFile::SingleProject(config),
            false,
        )
        .unwrap()
    }
}

impl Config {
    pub fn search(start_dir: &Path) -> Result<Self> {
        Self::load_config(
            start_dir,
            &[
                LoaderSource::PackageJson("relay".to_string()),
                LoaderSource::Json("relay.config.json".to_string()),
                LoaderSource::Js("relay.config.js".to_string()),
            ],
        )
    }

    pub fn load(config_path: PathBuf) -> Result<Self> {
        let loader = if config_path.extension() == Some(OsStr::new("js")) {
            LoaderSource::Js(config_path.display().to_string())
        } else if config_path.extension() == Some(OsStr::new("json")) {
            LoaderSource::Json(config_path.display().to_string())
        } else {
            return Err(Error::ConfigError {
                details: format!(
                    "Invalid file extension. Expected `.js` or `.json`. Provided file \"{}\".",
                    config_path.display()
                ),
            });
        };
        Self::load_config(
            &current_dir().expect("Unable to get current working directory."),
            &[loader],
        )
    }

    fn load_config(start_dir: &Path, loaders_sources: &[LoaderSource]) -> Result<Self> {
        match js_config_loader::load(start_dir, loaders_sources) {
            Ok(Some(config)) => Self::from_struct(config.path, config.value, true),
            Ok(None) => Err(Error::ConfigError {
                details: format!(
                    r#"
 Configuration for Relay compiler not found.

 Please make sure that the configuration file is created in {}.

 You can also pass the path to the configuration file as `relay-compiler ./path-to-config/relay.json`.

 Example file:
 {{
   "src": "./src",
   "schema": "./path-to/schema.graphql",
   "language": "javascript"
 }}
 "#,
                    match loaders_sources.len() {
                        1 => loaders_sources[0].to_string(),
                        2 => format!("{} or {}", loaders_sources[0], loaders_sources[1]),
                        _ => {
                            let mut loaders_str = loaders_sources
                                .iter()
                                .map(|loader| loader.to_string())
                                .collect::<Vec<_>>();
                            let last_option = loaders_str.pop().unwrap();
                            format!("{}, or {}", loaders_str.join(", "), last_option)
                        }
                    }
                ),
            }),
            Err(error) => Err(Error::ConfigError {
                details: format!("Error searching config: {error}"),
            }),
        }
    }

    /// Loads a config file without validation for use in tests.
    pub fn from_string_for_test(config_string: &str) -> Result<Self> {
        let path = PathBuf::from("/virtual/root/virtual_config.json");
        let config_file: ConfigFile =
            serde_json::from_str(config_string).map_err(|err| Error::ConfigError {
                details: format!("Failed to parse config file `{}`: {}", path.display(), err,),
            })?;
        Self::from_struct(path, config_file, false)
    }

    /// `validate_fs` disables all filesystem checks for existence of files
    fn from_struct(
        config_path: PathBuf,
        config_file: ConfigFile,
        validate_fs: bool,
    ) -> Result<Self> {
        let mut hash = Sha1::new();
        serde_json::to_writer(&mut hash, &config_file).unwrap();

        let is_multi_project = match config_file {
            ConfigFile::MultiProject(_) => true,
            ConfigFile::SingleProject(_) => false,
        };

        let config_file = match config_file {
            ConfigFile::MultiProject(config) => *config,
            ConfigFile::SingleProject(config) => {
                config.create_multi_project_config(&config_path)?
            }
        };

        let MultiProjectConfigFile {
            feature_flags: config_file_feature_flags,
            projects,
            ..
        } = config_file;
        let projects = projects
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

                let shard_strip_regex = config_file_project
                    .shard_strip_regex
                    .map(|s| Regex::new(&s))
                    .transpose()
                    .map_err(|error| Error::ConfigFileValidation {
                        config_path: config_path.clone(),
                        validation_errors: vec![ConfigValidationError::InvalidRegex {
                            key: "shardStripRegex",
                            project_name,
                            error,
                        }],
                    })?;

                let test_path_regex = config_file_project
                    .test_path_regex
                    .map(|s| Regex::new(&s))
                    .transpose()
                    .map_err(|error| Error::ConfigFileValidation {
                        config_path: config_path.clone(),
                        validation_errors: vec![ConfigValidationError::InvalidRegex {
                            key: "testDirectoryRegex",
                            project_name,
                            error,
                        }],
                    })?;

                let excludes_extensions_set =
                    config_file_project
                        .excludes_extensions
                        .map(move |extensions| {
                            let mut builder = GlobSetBuilder::new();
                            for ext in extensions {
                                builder.add(Glob::new(&ext).unwrap());
                            }
                            builder.build().unwrap()
                        });

                let project_config = ProjectConfig {
                    name: project_name,
                    base: config_file_project.base,
                    enabled: true,
                    schema_extensions: config_file_project.schema_extensions,
                    extra_artifacts_config: None,
                    extra: config_file_project.extra,
                    excludes_extensions: excludes_extensions_set,
                    output: config_file_project.output,
                    extra_artifacts_output: config_file_project.extra_artifacts_output,
                    shard_output: config_file_project.shard_output,
                    shard_strip_regex,
                    schema_location,
                    schema_name: config_file_project.schema_name,
                    schema_config: config_file_project.schema_config,
                    typegen_config: config_file_project.typegen_config,
                    persist: config_file_project.persist,
                    variable_names_comment: config_file_project.variable_names_comment,
                    test_path_regex,
                    feature_flags: Arc::new(
                        config_file_project
                            .feature_flags
                            .unwrap_or_else(|| config_file_feature_flags.clone()),
                    ),
                    rollout: config_file_project.rollout,
                    js_module_format: config_file_project.js_module_format,
                    relativize_js_module_paths: config_file_project.relativize_js_module_paths,
                    module_import_config: config_file_project.module_import_config,
                    diagnostic_report_config: config_file_project.diagnostic_report_config,
                    resolvers_schema_module: config_file_project.resolvers_schema_module,
                    codegen_command: config_file_project.codegen_command,
                    get_custom_path_for_artifact: None,
                };
                Ok((project_name, project_config))
            })
            .collect::<Result<FnvIndexMap<_, _>>>()?;

        let config_file_dir = config_path.parent().unwrap();

        let root_dir = if let Some(config_root) = config_file.root {
            canonicalize(config_file_dir.join(config_root)).unwrap()
        } else {
            config_file_dir.to_owned()
        };

        let config = Self {
            name: config_file.name,
            artifact_writer: Box::new(ArtifactFileWriter::new(
                match config_file.no_source_control {
                    Some(true) => None,
                    _ => source_control_for_root(&root_dir),
                },
                root_dir.clone(),
            )),
            status_reporter: Box::new(ConsoleStatusReporter::new(
                root_dir.clone(),
                is_multi_project,
            )),
            root_dir,
            sources: config_file.sources,
            excludes: config_file.excludes,
            generated_sources: config_file.generated_sources,
            projects,
            header: config_file.header,
            codegen_command: config_file.codegen_command,
            load_saved_state_file: None,
            generate_extra_artifacts: None,
            generate_virtual_id_file_name: None,
            get_artifacts_file_hash_map: None,
            saved_state_config: config_file.saved_state_config,
            saved_state_loader: None,
            saved_state_version: hex::encode(hash.finalize()),
            create_operation_persister: None,
            compile_everything: false,
            repersist_operations: false,
            post_artifacts_write: None,
            additional_validations: None,
            is_dev_variable_name: config_file.is_dev_variable_name,
            file_source_config: FileSourceKind::Watchman,
            custom_transforms: None,
            custom_override_schema_determinator: None,
            export_persisted_query_ids_to_file: None,
            initialize_resources: None,
            update_compiler_state_from_saved_state: None,
            has_schema_change_incremental_build: false,
            custom_extract_relay_resolvers: None,
            should_extract_full_source: None,
            transferrable_refetchable_query_directives: vec![],
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

    /// Validated internal consistency of the config.
    fn validate_consistency(&self, errors: &mut Vec<ConfigValidationError>) {
        let mut project_names = FnvHashSet::default();
        for (source_dir, project_set) in self.sources.iter() {
            for name in project_set.iter() {
                if self.projects.get(name).is_none() {
                    errors.push(ConfigValidationError::ProjectDefinitionMissing {
                        source_dir: source_dir.clone(),
                        project_name: *name,
                    });
                }

                project_names.insert(*name);
            }
        }

        for (&project_name, project_config) in &self.projects {
            // there should be a source for each project matching the project name
            if !project_names.contains(&project_name) {
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

    /// Compute all root paths that we need to query. All files relevant to the
    /// compiler should be in these directories.
    pub fn get_all_roots(&self) -> Vec<PathBuf> {
        let source_roots = self.get_source_roots();
        let extra_sources_roots = self.get_generated_sources_roots();
        let output_roots = self.get_output_dir_paths();
        let extension_roots = self.get_extension_roots();
        let schema_file_roots = self.get_schema_file_roots();
        let schema_dir_roots = self.get_schema_dir_paths();

        unify_roots(
            source_roots
                .into_iter()
                .chain(extra_sources_roots)
                .chain(output_roots)
                .chain(extension_roots)
                .chain(schema_file_roots)
                .chain(schema_dir_roots)
                .collect(),
        )
    }

    /// Returns all root directories of JS source files for the config.
    pub fn get_source_roots(&self) -> Vec<PathBuf> {
        self.sources.keys().cloned().collect()
    }

    /// Returns all root directories of JS source files for the config.
    pub fn get_generated_sources_roots(&self) -> Vec<PathBuf> {
        self.generated_sources.keys().cloned().collect()
    }

    /// Returns all root directories of GraphQL schema extension files for the
    /// config.
    pub fn get_extension_roots(&self) -> Vec<PathBuf> {
        self.projects
            .values()
            .flat_map(|project_config| project_config.schema_extensions.iter().cloned())
            .collect()
    }

    /// Returns all output and extra artifact output directories for the config.
    pub fn get_output_dir_paths(&self) -> Vec<PathBuf> {
        let output_dirs = self
            .projects
            .values()
            .filter_map(|project_config| project_config.output.clone());

        let extra_artifact_output_dirs = self
            .projects
            .values()
            .filter_map(|project_config| project_config.extra_artifacts_output.clone());

        output_dirs.chain(extra_artifact_output_dirs).collect()
    }

    /// Returns all paths that contain GraphQL schema files for the config.
    pub fn get_schema_file_paths(&self) -> Vec<PathBuf> {
        self.projects
            .values()
            .filter_map(|project_config| match &project_config.schema_location {
                SchemaLocation::File(schema_file) => Some(schema_file.clone()),
                SchemaLocation::Directory(_) => None,
            })
            .collect()
    }

    /// Returns all GraphQL schema directories for the config.
    pub fn get_schema_dir_paths(&self) -> Vec<PathBuf> {
        self.projects
            .values()
            .filter_map(|project_config| match &project_config.schema_location {
                SchemaLocation::File(_) => None,
                SchemaLocation::Directory(schema_dir) => Some(schema_dir.clone()),
            })
            .collect()
    }

    /// Returns root directories that contain GraphQL schema files.
    pub fn get_schema_file_roots(&self) -> impl Iterator<Item = PathBuf> + use<> {
        self.get_schema_file_paths().into_iter().map(|schema_path| {
            schema_path
                .parent()
                .expect("A schema in the project root directory is currently not supported.")
                .to_owned()
        })
    }
}

/// Finds the roots of a set of paths. This filters any paths
/// that are a subdirectory of other paths in the input.
fn unify_roots(mut paths: Vec<PathBuf>) -> Vec<PathBuf> {
    paths.sort();
    let mut roots = Vec::new();
    for path in paths {
        match roots.last() {
            Some(prev) if path.starts_with(prev) => {
                // skip
            }
            _ => {
                roots.push(path);
            }
        }
    }
    roots
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_unify_roots() {
        assert_eq!(unify_roots(vec![]).len(), 0);
        assert_eq!(
            unify_roots(vec!["Apps".into(), "Libraries".into()]),
            &[PathBuf::from("Apps"), PathBuf::from("Libraries")]
        );
        assert_eq!(
            unify_roots(vec!["Apps".into(), "Apps/Foo".into()]),
            &[PathBuf::from("Apps")]
        );
        assert_eq!(
            unify_roots(vec!["Apps/Foo".into(), "Apps".into()]),
            &[PathBuf::from("Apps")]
        );
        assert_eq!(
            unify_roots(vec!["Foo".into(), "Foo2".into()]),
            &[PathBuf::from("Foo"), PathBuf::from("Foo2"),]
        );
    }
}

impl fmt::Debug for Config {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let Config {
            name,
            artifact_writer: _,
            root_dir,
            sources,
            excludes,
            generated_sources,
            compile_everything,
            repersist_operations,
            projects,
            header,
            codegen_command,
            load_saved_state_file,
            generate_extra_artifacts,
            saved_state_config,
            saved_state_loader,
            saved_state_version,
            create_operation_persister,
            post_artifacts_write,
            ..
        } = self;

        fn option_fn_to_string<T>(option: &Option<T>) -> &'static str {
            if option.is_some() { "Some(Fn)" } else { "None" }
        }

        f.debug_struct("Config")
            .field("name", name)
            .field("root_dir", root_dir)
            .field("sources", sources)
            .field("excludes", excludes)
            .field("generated_sources", generated_sources)
            .field("compile_everything", compile_everything)
            .field("repersist_operations", repersist_operations)
            .field("projects", projects)
            .field("header", header)
            .field("codegen_command", codegen_command)
            .field("load_saved_state_file", load_saved_state_file)
            .field("saved_state_config", saved_state_config)
            .field(
                "create_operation_persister",
                &option_fn_to_string(create_operation_persister),
            )
            .field(
                "generate_extra_artifacts",
                &option_fn_to_string(generate_extra_artifacts),
            )
            .field(
                "saved_state_loader",
                &option_fn_to_string(saved_state_loader),
            )
            .field("saved_state_version", saved_state_version)
            .field(
                "post_artifacts_write",
                &option_fn_to_string(post_artifacts_write),
            )
            .finish()
    }
}

fn get_default_excludes() -> Vec<String> {
    vec![
        "**/node_modules/**".to_string(),
        "**/__mocks__/**".to_string(),
        "**/__generated__/**".to_string(),
    ]
}

fn default_true() -> bool {
    true
}

/// Schema of the compiler configuration JSON file.
#[derive(Debug, Serialize, Deserialize, Default, JsonSchema)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct MultiProjectConfigFile {
    /// The user may hard-code the JSON Schema for their version of the config.
    #[serde(rename = "$schema")]
    json_schema: Option<String>,

    /// Optional name for this config, might be used for logging or custom extra
    /// artifact generator code.
    #[serde(default)]
    name: Option<String>,

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
    #[schemars(with = "FnvIndexMap<PathBuf, DeserializableProjectSet>")]
    sources: FnvIndexMap<PathBuf, ProjectSet>,

    /// Glob patterns that should not be part of the sources even if they are
    /// in the source set directories.
    #[serde(default = "get_default_excludes")]
    excludes: Vec<String>,

    /// Similar to sources but not affected by excludes.
    #[serde(default)]
    generated_sources: FnvIndexMap<PathBuf, ProjectSet>,

    /// Configuration of projects to compile.
    projects: FnvIndexMap<ProjectName, ConfigFileProject>,

    /// Enable and disable experimental or legacy behaviors.
    /// WARNING! These are not stable and may change at any time.
    #[serde(default)]
    feature_flags: FeatureFlags,

    /// Watchman saved state config.
    #[schemars(with = "Option<ScmAwareClockDataJsonSchemaDef>")]
    saved_state_config: Option<ScmAwareClockData>,

    /// Then name of the global __DEV__ variable to use in generated artifacts
    is_dev_variable_name: Option<String>,

    /// Opt out of source control checks/integration.
    no_source_control: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, JsonSchema)]
#[serde(deny_unknown_fields, rename_all = "camelCase", default)]
pub struct SingleProjectConfigFile {
    /// The user may hard-code the JSON Schema for their version of the config.
    #[serde(rename = "$schema")]
    pub json_schema: Option<String>,

    #[serde(skip)]
    pub project_name: ProjectName,

    /// Path to schema.graphql
    pub schema: PathBuf,

    /// Root directory of application code
    pub src: PathBuf,

    /// A specific directory to output all artifacts to. When enabling this
    /// the babel plugin needs `artifactDirectory` set as well.
    pub artifact_directory: Option<PathBuf>,

    /// Directories to ignore under src
    /// default: ['**/node_modules/**', '**/__mocks__/**', '**/__generated__/**'],
    #[serde(alias = "exclude")]
    pub excludes: Vec<String>,

    /// List of directories with schema extensions.
    pub schema_extensions: Vec<PathBuf>,

    #[serde(flatten)]
    pub typegen_config: TypegenConfig,

    /// Query Persist Configuration
    /// It contains URL and addition parameters that will be included
    /// with the request (think API_KEY, APP_ID, etc...)
    pub persist_config: Option<PersistConfig>,

    /// We may generate some content in the artifacts that's stripped in production if __DEV__ variable is set
    /// This config option is here to define the name of that special variable
    pub is_dev_variable_name: Option<String>,

    /// Name of the command that runs the relay compiler. This will be added at
    /// the top of generated code to let readers know how to regenerate the file.
    pub codegen_command: Option<String>,

    /// Import/export style to use in generated JavaScript modules.
    pub js_module_format: JsModuleFormat,

    /// Whether to treat all JS module names as relative to './' (true) or not.
    /// default: true
    #[serde(default = "default_true")]
    pub relativize_js_module_paths: bool,

    /// Extra configuration for the GraphQL schema itself.
    pub schema_config: SchemaConfig,

    /// Configuration for @module
    #[serde(default)]
    pub module_import_config: ModuleImportConfig,

    /// Enable and disable experimental or legacy behaviors.
    /// WARNING! These are not stable and may change at any time.
    #[serde(default)]
    pub feature_flags: Option<FeatureFlags>,

    #[serde(default)]
    pub resolvers_schema_module: Option<ResolversSchemaModuleConfig>,

    /// Opt out of source control checks/integration.
    #[serde(default)]
    pub no_source_control: Option<bool>,

    /// A placeholder for allowing extra information in the config file
    #[serde(default)]
    pub extra: serde_json::Value,
}

impl Default for SingleProjectConfigFile {
    fn default() -> Self {
        Self {
            json_schema: None,
            project_name: ProjectName::default(),
            schema: Default::default(),
            src: Default::default(),
            artifact_directory: Default::default(),
            excludes: get_default_excludes(),
            schema_extensions: vec![],
            schema_config: Default::default(),
            typegen_config: Default::default(),
            persist_config: None,
            is_dev_variable_name: None,
            codegen_command: None,
            js_module_format: JsModuleFormat::CommonJS,
            relativize_js_module_paths: true,
            feature_flags: None,
            module_import_config: Default::default(),
            resolvers_schema_module: Default::default(),
            no_source_control: Some(false),
            extra: Default::default(),
        }
    }
}

impl SingleProjectConfigFile {
    fn get_common_root(
        &self,
        root_dir: PathBuf,
    ) -> std::result::Result<PathBuf, ConfigValidationError> {
        let mut paths = vec![];
        if let Some(artifact_directory_path) = self.artifact_directory.clone() {
            paths.push(
                canonicalize(root_dir.join(artifact_directory_path.clone())).map_err(|_| {
                    ConfigValidationError::ArtifactDirectoryNotExistent {
                        path: artifact_directory_path,
                    }
                })?,
            );
        }
        paths.push(canonicalize(root_dir.join(self.src.clone())).map_err(|_| {
            ConfigValidationError::SourceNotExistent {
                source_dir: self.src.clone(),
            }
        })?);
        paths.push(
            canonicalize(root_dir.join(self.schema.clone())).map_err(|_| {
                ConfigValidationError::SchemaFileNotExistent {
                    project_name: self.project_name,
                    schema_file: self.schema.clone(),
                }
            })?,
        );
        for extension_path in self.schema_extensions.iter() {
            paths.push(
                canonicalize(root_dir.join(extension_path.clone())).map_err(|_| {
                    ConfigValidationError::ExtensionPathNotExistent {
                        project_name: self.project_name,
                        extension_path: extension_path.clone(),
                    }
                })?,
            );
        }
        common_path::common_path_all(paths.iter().map(|path| path.as_path()))
            .ok_or(ConfigValidationError::CommonPathNotFound)
    }

    fn create_multi_project_config(self, config_path: &Path) -> Result<MultiProjectConfigFile> {
        let current_dir = std::env::current_dir().unwrap();
        let common_root_dir = self.get_common_root(current_dir.clone()).map_err(|err| {
            Error::ConfigFileValidation {
                config_path: config_path.to_path_buf(),
                validation_errors: vec![err],
            }
        })?;

        let project_config = ConfigFileProject {
            output: self.artifact_directory.map(|dir| {
                normalize_path_from_config(current_dir.clone(), common_root_dir.clone(), dir)
            }),
            schema: Some(normalize_path_from_config(
                current_dir.clone(),
                common_root_dir.clone(),
                self.schema,
            )),
            schema_config: self.schema_config,
            schema_extensions: self
                .schema_extensions
                .iter()
                .map(|dir| {
                    normalize_path_from_config(
                        current_dir.clone(),
                        common_root_dir.clone(),
                        dir.clone(),
                    )
                })
                .collect(),
            persist: self.persist_config,
            typegen_config: self.typegen_config,
            js_module_format: self.js_module_format,
            feature_flags: self.feature_flags,
            module_import_config: self.module_import_config,
            resolvers_schema_module: self.resolvers_schema_module,
            extra: self.extra,
            ..Default::default()
        };

        let mut projects = FnvIndexMap::default();
        projects.insert(self.project_name, project_config);

        let mut sources = FnvIndexMap::default();
        let src = normalize_path_from_config(current_dir, common_root_dir.clone(), self.src);

        sources.insert(src, ProjectSet::of(self.project_name));

        Ok(MultiProjectConfigFile {
            root: Some(common_root_dir),
            projects,
            sources,
            excludes: self.excludes,
            is_dev_variable_name: self.is_dev_variable_name,
            codegen_command: self.codegen_command,
            no_source_control: self.no_source_control,
            ..Default::default()
        })
    }
}

/// Relay's configuration file. Supports a single project config for simple use
/// cases and a multi-project config for cases where multiple projects live in
/// the same repository.
///
/// In general, start with the SingleProjectConfigFile.
#[derive(Serialize, JsonSchema)]
#[serde(untagged)]
#[allow(clippy::large_enum_variant)]
pub enum ConfigFile {
    /// Base case configuration (mostly of OSS) where the project
    /// have single schema, and single source directory
    SingleProject(SingleProjectConfigFile),
    /// Relay can support multiple projects with multiple schemas
    /// and different options (output, typegen, etc...).
    /// This MultiProjectConfigFile is responsible for configuring
    /// these type of projects (complex)
    MultiProject(Box<MultiProjectConfigFile>),
}

impl ConfigFile {
    pub fn json_schema() -> String {
        let settings: SchemaSettings = Default::default();
        let generator = SchemaGenerator::from(settings);
        let schema = generator.into_root_schema_for::<Self>();
        serde_json::to_string_pretty(&schema).unwrap()
    }
}

impl<'de> Deserialize<'de> for ConfigFile {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> std::result::Result<Self, D::Error> {
        let value = Value::deserialize(deserializer)?;
        match MultiProjectConfigFile::deserialize(value.clone()) {
            Ok(config) => Ok(ConfigFile::MultiProject(Box::new(config))),
            Err(multi_project_error) => match SingleProjectConfigFile::deserialize(value) {
                Ok(single_project_config) => Ok(ConfigFile::SingleProject(single_project_config)),
                Err(single_project_error) => {
                    let error_message = format!(
                        r#"The config file cannot be parsed as a single-project config file due to:
 - {single_project_error:?}.

 It also cannot be a multi-project config file due to:
 - {multi_project_error:?}."#
                    );

                    Err(DeError::custom(error_message))
                }
            },
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Default, JsonSchema)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct ConfigFileProject {
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

    /// Some projects may need to exclude files with certain extensions.
    excludes_extensions: Option<Vec<String>>,

    /// If `output` is provided and `shard_output` is `true`, shard the files
    /// by putting them under `{output_dir}/{source_relative_path}`
    #[serde(default)]
    shard_output: bool,

    /// Regex to match and strip parts of the `source_relative_path`
    #[serde(default)]
    shard_strip_regex: Option<String>,

    /// Directory containing *.graphql files with schema extensions.
    #[serde(default)]
    schema_extensions: Vec<PathBuf>,

    /// Path to the schema.graphql or a directory containing a schema broken up
    /// in multiple *.graphql files.
    /// Exactly 1 of these options needs to be defined.
    schema: Option<PathBuf>,
    schema_dir: Option<PathBuf>,

    /// Schema name, if differs from project name.
    /// If schema name is unset, the project name will be used as schema name.
    #[serde(default)]
    schema_name: Option<StringKey>,

    /// If this option is set, the compiler will persist queries using this
    /// config.
    persist: Option<PersistConfig>,

    #[serde(flatten)]
    pub typegen_config: TypegenConfig,

    /// Optional regex to restrict @relay_test_operation to directories matching
    /// this regex. Defaults to no limitations.
    #[serde(default)]
    test_path_regex: Option<String>,

    /// Generates a `// @relayVariables name1 name2` header in generated operation files
    #[serde(default)]
    variable_names_comment: bool,

    /// A placeholder for allowing extra information in the config file
    #[serde(default)]
    extra: serde_json::Value,

    /// Enable and disable experimental or legacy behaviors.
    /// WARNING! These are not stable and may change at any time.
    #[serde(default)]
    pub feature_flags: Option<FeatureFlags>,

    /// A generic rollout state for larger codegen changes. The default is to
    /// pass, otherwise it should be a number between 0 and 100 as a percentage.
    #[serde(default)]
    pub rollout: Rollout,

    /// Import/export style to use in generated JavaScript modules.
    #[serde(default)]
    pub js_module_format: JsModuleFormat,

    /// Whether to treat all JS module names as relative to './' (true) or not.
    /// default: true
    #[serde(default = "default_true")]
    pub relativize_js_module_paths: bool,

    /// Extra configuration for the GraphQL schema itself.
    #[serde(default)]
    pub schema_config: SchemaConfig,

    /// Configuration for the @module GraphQL directive.
    #[serde(default)]
    pub module_import_config: ModuleImportConfig,

    /// Threshold for diagnostics to be critical to the compiler's execution.
    /// All diagnostic with severities at and below this level will cause the
    /// compiler to fatally exit.
    #[serde(default)]
    pub diagnostic_report_config: DiagnosticReportConfig,

    #[serde(default)]
    pub resolvers_schema_module: Option<ResolversSchemaModuleConfig>,

    /// Name of the command that runs the relay compiler. This will be added at
    /// the top of generated code to let readers know how to regenerate the file.
    #[serde(default)]
    pub codegen_command: Option<String>,
}

pub type PersistId = String;

pub type PersistResult<T> = std::result::Result<T, PersistError>;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ArtifactForPersister {
    pub text: String,
    pub relative_path: PathBuf,
    pub override_schema: Option<String>,
}

#[async_trait]
pub trait OperationPersister {
    async fn persist_artifact(&self, artifact: ArtifactForPersister) -> PersistResult<PersistId>;

    fn finalize(&self) -> PersistResult<()> {
        Ok(())
    }
}

// Below are structs that we use as part of our config that are defined in
// crates that are not part of Relay. We are not able to implement `JsonSchema`
// for these structs directly, so we define these shadow structs which match the
// deserialization shape of the original. We can then use `#[serde(with =
// "...")]` to have JsonSchema use these shadow structs to generate the schema.
//
// See [Schemars docs](https://graham.cool/schemars/examples/5-remote_derive/)
// for more context on this pattern.

/// Holds extended clock data that includes source control aware
/// query metadata.
/// <https://facebook.github.io/watchman/docs/scm-query.html>
#[derive(JsonSchema)]
#[serde(remote = "ScmAwareClockData")]
pub struct ScmAwareClockDataJsonSchemaDef {
    pub mergebase: Option<String>,
    #[serde(rename = "mergebase-with")]
    pub mergebase_with: Option<String>,
    #[serde(rename = "saved-state")]
    pub saved_state: Option<SavedStateClockDataJsonSchemaDef>,
}

/// Holds extended clock data that includes source control aware
/// query metadata.
/// <https://facebook.github.io/watchman/docs/scm-query.html>
#[derive(JsonSchema)]
#[serde(remote = "SavedStateClockData")]
pub struct SavedStateClockDataJsonSchemaDef {
    pub storage: Option<String>,
    #[serde(rename = "commit-id")]
    pub commit: Option<String>,
    pub config: Option<Value>,
}
