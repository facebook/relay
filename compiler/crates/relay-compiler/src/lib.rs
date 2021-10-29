/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod artifact_map;
mod build_project;
pub mod compiler;
pub mod compiler_state;
pub mod config;
pub mod errors;
mod file_source;
mod graphql_asts;
mod red_to_green;
mod remote_persister;
pub mod saved_state;
pub mod status_reporter;

pub use build_project::{
    add_to_mercurial,
    artifact_writer::{
        ArtifactDifferenceWriter, ArtifactFileWriter, ArtifactWriter, NoopArtifactWriter,
    },
    build_programs, build_raw_program, build_schema, create_path_for_artifact, generate_artifacts,
    generate_extra_artifacts::GenerateExtraArtifactsFn,
    transform_program, validate, validate_program, AdditionalValidations, Artifact,
    ArtifactContent, BuildProjectFailure, SourceHashes,
};
pub use config::{FileSourceKind, OperationPersister, PersistConfig};
pub use file_source::{
    source_for_location, FileCategorizer, FileGroup, FileSource, FileSourceResult,
    FileSourceSubscription, FileSourceSubscriptionNextChange, FsSourceReader,
    SourceControlUpdateStatus, SourceReader,
};
pub use graphql_asts::GraphQLAsts;
pub use remote_persister::RemotePersister;
