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
pub mod file_source;
mod graphql_asts;
mod operation_persister;
mod red_to_green;
pub mod status_reporter;
mod utils;

pub use artifact_map::ArtifactSourceKey;
pub use build_project::artifact_writer::ArtifactDifferenceShardedWriter;
pub use build_project::artifact_writer::ArtifactDifferenceWriter;
pub use build_project::artifact_writer::ArtifactFileWriter;
pub use build_project::artifact_writer::ArtifactValidationWriter;
pub use build_project::artifact_writer::ArtifactWriter;
pub use build_project::artifact_writer::NoopArtifactWriter;
pub use build_project::build_programs;
pub use build_project::build_raw_program;
pub use build_project::build_schema;
pub use build_project::find_duplicates;
pub use build_project::generate_artifacts;
pub use build_project::generate_extra_artifacts::GenerateExtraArtifactsFn;
pub use build_project::get_artifacts_file_hash_map::GetArtifactsFileHashMapFn;
pub use build_project::source_control_for_root;
pub use build_project::transform_program;
pub use build_project::validate;
pub use build_project::validate_program;
pub use build_project::AdditionalValidations;
pub use build_project::Artifact;
pub use build_project::ArtifactContent;
pub use build_project::ArtifactGeneratedTypes;
pub use build_project::BuildProjectFailure;
pub use build_project::SourceHashes;
pub use config::ConfigFile;
pub use config::ConfigFileProject;
pub use config::FileSourceKind;
pub use config::LocalPersistConfig;
pub use config::OperationPersister;
pub use config::PersistConfig;
pub use config::ProjectConfig;
pub use config::RemotePersistConfig;
pub use config::SchemaLocation;
pub use file_source::source_for_location;
pub use file_source::ExternalFileSourceResult;
pub use file_source::File;
pub use file_source::FileCategorizer;
pub use file_source::FileGroup;
pub use file_source::FileSource;
pub use file_source::FileSourceResult;
pub use file_source::FileSourceSubscription;
pub use file_source::FileSourceSubscriptionNextChange;
pub use file_source::FsSourceReader;
pub use file_source::SourceControlUpdateStatus;
pub use file_source::SourceReader;
pub use graphql_asts::GraphQLAsts;
pub use operation_persister::LocalPersister;
pub use operation_persister::RemotePersister;
pub use relay_config::ProjectName;
pub use utils::get_parser_features;
