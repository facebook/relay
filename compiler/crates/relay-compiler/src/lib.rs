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
mod graphql_asts;
mod rollout;
pub mod saved_state;
mod watchman;

pub use build_project::{
    add_to_mercurial, apply_transforms,
    artifact_writer::{ArtifactDifferenceWriter, ArtifactFileWriter, ArtifactWriter},
    build_schema, check_project, create_path_for_artifact, generate_artifacts,
    generate_extra_artifacts::{GenerateExtraArtifactArgs, GenerateExtraArtifactsFn},
    validate, Artifact, ArtifactContent, Programs, SourceHashes,
};
pub use config::{OperationPersister, PersistConfig};
pub use graphql_asts::GraphQLAsts;
pub use watchman::{source_for_location, FileSource, FileSourceResult, FileSourceSubscription};
