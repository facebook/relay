/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::ProjectName;
use crate::watchman::errors::Error as WatchmanError;
use graphql_syntax::SyntaxErrorWithSource;
use persist_query::PersistError;
use serde_json::error::Error as SerdeError;
use std::io;
use std::path::PathBuf;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Failed to read config file `{config_path}`.")]
    ConfigFileRead {
        config_path: PathBuf,
        source: std::io::Error,
    },

    #[error("Failed to parse config file `{config_path}`: {source}")]
    ConfigFileParse {
        config_path: PathBuf,
        source: serde_json::Error,
    },

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
        validation_errors: Vec<ConfigValidationError>,
    },

    #[error("Watchman error: {source}")]
    WatchmanError {
        #[from]
        source: WatchmanError,
    },

    #[error(
        "Failed parsing GraphQL:{}",
        errors
            .iter()
            .map(|err| format!("\n - {}", err.print()))
            .collect::<Vec<_>>()
            .join("")
    )]
    SyntaxErrors { errors: Vec<SyntaxErrorWithSource> },

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
    ReadFileError { file: PathBuf, source: io::Error },

    #[error("Failed to write file `{file}`: {source}")]
    WriteFileError { file: PathBuf, source: io::Error },

    #[error("Unable to serialize state to file: `{file}`, because of `{source}`.")]
    SerializationError { file: PathBuf, source: SerdeError },

    #[error("Unable to deserialize state from file: `{file}`, because of `{source}`.")]
    DeserializationError { file: PathBuf, source: SerdeError },
}

#[derive(Debug, Error)]
pub enum ConfigValidationError {
    #[error("Root `{root_dir}` is not a directory.")]
    RootNotDirectory { root_dir: PathBuf },

    #[error("Source `{source_dir}` does not exist.")]
    SourceNotExistent { source_dir: PathBuf },

    #[error("Source `{source_dir}` is not a directory.")]
    SourceNotDirectory { source_dir: PathBuf },

    #[error("There is no source for the project `{project_name}`, the `sources` map should contain at least one path mapping to this project name.")]
    ProjectSourceMissing { project_name: ProjectName },

    #[error("The project `{project_name}` defines the base project `{base_project_name}`, but no such project exists.")]
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
        "The `schema_dir` configured for project `{project_name}` to be `{schema_dir}` is not a directory."
    )]
    SchemaDirNotDirectory {
        project_name: ProjectName,
        schema_dir: PathBuf,
    },
}

#[derive(Debug, Error)]
pub enum BuildProjectError {
    #[error(
        "Validation errors:{}",
        errors
            .iter()
            .map(|err| format!("\n - {}", err))
            .collect::<Vec<_>>()
            .join("")
    )]
    ValidationErrors {
        errors: Vec<graphql_ir::ValidationErrorWithSources>,
    },

    #[error("Persisting operation failed: {0}")]
    PersistError(PersistError),

    #[error("Failed to write file `{file}`: {source}")]
    WriteFileError { file: PathBuf, source: io::Error },
}
