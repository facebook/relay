/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::io;
use std::path::PathBuf;

use common::Diagnostic;
use glob::PatternError;
use persist_query::PersistError;
use relay_config::ProjectName;
use serde::Serialize;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Error, Serialize)]
#[serde(tag = "type")]
pub enum Error {
    #[error("Unable to initialize relay compiler configuration. Error details: \n{details}")]
    ConfigError { details: String },

    #[error(
        "Config `{config_path}` is invalid:{}",
        validation_errors
            .iter()
            .map(|err| format!("\n - {}", err))
            .collect::<Vec<_>>()
            .join("")
    )]
    ConfigFileValidation {
        config_path: PathBuf,
        #[serde(skip_serializing)]
        validation_errors: Vec<ConfigValidationError>,
    },

    #[error(
        "Diagnostics Error:{}",
        errors
            .iter()
            .map(|err| format!("\n - {}", err.print_without_source()))
            .collect::<Vec<_>>()
            .join("")
    )]
    DiagnosticsError { errors: Vec<Diagnostic> },

    #[error(
        "Failed to build:{}",
        errors
            .iter()
            .map(|err| format!("\n - {}", err))
            .collect::<Vec<_>>()
            .join("")
    )]
    BuildProjectsErrors { errors: Vec<BuildProjectError> },

    #[error("Failed to read file `{file}`: {source}")]
    ReadFileError {
        file: PathBuf,
        #[serde(skip_serializing)]
        source: io::Error,
    },

    #[error("Failed to write file `{file}`: {source}")]
    WriteFileError {
        file: PathBuf,
        #[serde(skip_serializing)]
        source: io::Error,
    },

    #[error("Unable to serialize state to file: `{file}`, because of `{source}`.")]
    SerializationError {
        file: PathBuf,
        #[serde(skip_serializing)]
        source: Box<bincode::ErrorKind>,
    },

    #[error("Unable to deserialize state from file: `{file}`, because of `{source}`.")]
    DeserializationError {
        file: PathBuf,
        #[serde(skip_serializing)]
        source: Box<bincode::ErrorKind>,
    },

    #[error("Failed to canonicalize root: `{root}`.")]
    CanonicalizeRoot {
        root: PathBuf,
        #[serde(skip_serializing)]
        source: std::io::Error,
    },

    #[error("Watchman error: {source}")]
    Watchman {
        #[serde(skip_serializing)]
        #[from]
        source: watchman_client::Error,
    },

    #[error("Watchman query returned no results.")]
    EmptyQueryResult,

    #[error("Failed to read file: `{file}`.")]
    FileRead {
        file: PathBuf,
        #[serde(skip_serializing)]
        source: std::io::Error,
    },

    #[error("A thread that the Relay compiler spun up did not shut down gracefully: {error}")]
    JoinError { error: String },

    #[error("Artifacts validation failed: {error}")]
    ArtifactsValidationError { error: String },

    #[error("Error in post artifact writer: {error}")]
    PostArtifactsError {
        #[serde(skip_serializing)]
        error: Box<dyn std::error::Error + Sync + Send>,
    },

    #[error("Compilation cancelled due to new changes")]
    Cancelled,

    #[serde(skip_serializing)]
    #[error("IO error {0}")]
    IOError(std::io::Error),

    #[error("Unable to parse changed files list. {reason}")]
    ExternalSourceParseError { reason: String },

    #[error("JSON parse error in `{file}`: {source}")]
    SerdeError {
        file: PathBuf,
        #[serde(skip_serializing)]
        source: serde_json::Error,
    },

    #[serde(skip_serializing)]
    #[error("glob pattern error: {0}")]
    PatternError(PatternError),

    #[error(
        "Saved state versions mismatch. Saved state: {saved_state_version}, config: {config_version}."
    )]
    SavedStateVersionMismatch {
        saved_state_version: String,
        config_version: String,
    },
}

#[derive(Debug, Error)]
pub enum ConfigValidationError {
    #[error("Root `{root_dir}` is not a directory.")]
    RootNotDirectory { root_dir: PathBuf },

    #[error("Source `{source_dir}` does not exist.")]
    SourceNotExistent { source_dir: PathBuf },

    #[error("Source `{source_dir}` is not a directory.")]
    SourceNotDirectory { source_dir: PathBuf },

    #[error(
        "There is no source for the project `{project_name}`, the `sources` map should contain at least one path mapping to this project name."
    )]
    ProjectSourceMissing { project_name: ProjectName },

    #[error(
        "Source dir `{source_dir}` tries to use project `{project_name}`, but no such project exists."
    )]
    ProjectDefinitionMissing {
        source_dir: PathBuf,
        project_name: ProjectName,
    },

    #[error(
        "The project `{project_name}` defines the base project `{base_project_name}`, but no such project exists."
    )]
    ProjectBaseMissing {
        project_name: ProjectName,
        base_project_name: ProjectName,
    },

    #[error("Project `{project_name}` needs to define exactly one of `schema` or `schema_dir`.")]
    ProjectNeedsSchemaXorSchemaDir { project_name: ProjectName },

    #[error(
        "The `schema` configured for project `{project_name}` does not exist at `{schema_file}`."
    )]
    SchemaFileNotExistent {
        project_name: ProjectName,
        schema_file: PathBuf,
    },

    #[error(
        "The `schema` configured for project `{project_name}` to be `{schema_file}` is not a file."
    )]
    SchemaFileNotFile {
        project_name: ProjectName,
        schema_file: PathBuf,
    },

    #[error(
        "The `schema_dir` configured for project `{project_name}` does not exist at `{schema_dir}`."
    )]
    SchemaDirNotExistent {
        project_name: ProjectName,
        schema_dir: PathBuf,
    },

    #[error(
        "The `schemaExtensions` configured for project `{project_name}` does not exist at `{extension_dir}`."
    )]
    ExtensionDirNotExistent {
        project_name: ProjectName,
        extension_dir: PathBuf,
    },

    #[error(
        "The `schema_dir` configured for project `{project_name}` to be `{schema_dir}` is not a directory."
    )]
    SchemaDirNotDirectory {
        project_name: ProjectName,
        schema_dir: PathBuf,
    },

    #[error("The regex in `{key}` for project `{project_name}` is invalid.\n {error}.")]
    InvalidRegex {
        key: &'static str,
        project_name: ProjectName,
        error: regex::Error,
    },

    #[error("The `artifactDirectory` does not exist at `{path}`.")]
    ArtifactDirectoryNotExistent { path: PathBuf },

    #[error("Unable to find common path for directories in the config file.")]
    CommonPathNotFound,

    #[error("The config option `{name}` is no longer supported. {action}")]
    RemovedConfigField {
        name: &'static str,
        action: &'static str,
    },
}

#[derive(Debug, Error, serde::Serialize)]
#[serde(tag = "type")]
pub enum BuildProjectError {
    #[error(
        "Validation errors: {} error(s) encountered above.",
        errors
            .len()
    )]
    ValidationErrors {
        errors: Vec<Diagnostic>,
        project_name: ProjectName,
    },

    #[error("Persisting operation(s) failed:{0}",
        errors
            .iter()
            .map(|err| format!("\n - {}", err))
            .collect::<Vec<_>>()
            .join("")
    )]
    PersistErrors {
        #[serde(skip_serializing)]
        errors: Vec<PersistError>,
        project_name: ProjectName,
    },

    #[error("Failed to write file `{file}`: {source}")]
    WriteFileError {
        file: PathBuf,
        #[serde(skip_serializing)]
        source: io::Error,
    },
}
