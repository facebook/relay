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
mod watchman;

pub use build_project::{
    apply_transforms, build_schema, check_project, create_path_for_artifact,
    generate_extra_artifacts::{GenerateExtraArtifactArgs, GenerateExtraArtifactsFn},
    validate, Artifact, ArtifactContent, Programs,
};
pub use graphql_asts::GraphQLAsts;
pub use watchman::{FileSource, FileSourceResult, FileSourceSubscription};
