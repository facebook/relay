/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

pub mod artifact_content;
mod artifact_map;
pub mod build_project;
pub mod compiler;
pub mod compiler_state;
pub mod config;
mod docblocks;
pub mod errors;
mod file_source;
mod graphql_asts;
mod operation_persister;
mod red_to_green;
pub mod saved_state;
pub mod status_reporter;

pub use build_project::{
    add_to_mercurial,
    artifact_writer::{
        ArtifactDifferenceWriter, ArtifactFileWriter, ArtifactValidationWriter, ArtifactWriter,
        NoopArtifactWriter,
    },
    build_programs, build_raw_program, build_schema, generate_artifacts,
    generate_extra_artifacts::GenerateExtraArtifactsFn,
    transform_program, validate, validate_program, AdditionalValidations, Artifact,
    ArtifactContent, ArtifactGeneratedTypes, BuildProjectFailure, SourceHashes,
};
pub use config::{
    ConfigFileProject, FileSourceKind, LocalPersistConfig, OperationPersister, PersistConfig,
    ProjectConfig, RemotePersistConfig, SchemaLocation,
};
pub use file_source::{
    source_for_location, FileCategorizer, FileGroup, FileSource, FileSourceResult,
    FileSourceSubscription, FileSourceSubscriptionNextChange, FsSourceReader,
    SourceControlUpdateStatus, SourceReader,
};
pub use graphql_asts::GraphQLAsts;
pub use operation_persister::{LocalPersister, RemotePersister};
