/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use relay_transforms::is_operation_preloadable;
use schema::SDLSchema;

use super::Artifact;
use super::Config;
use super::Programs;
use super::ProjectConfig;
use super::generate_preloadable_query_parameters_artifact;
use crate::ArtifactContent;

pub type GenerateExtraArtifactsFn = Box<
    dyn Fn(&Config, &ProjectConfig, &SDLSchema, &Programs, &[Artifact]) -> Vec<Artifact>
        + Send
        + Sync,
>;

pub fn default_generate_extra_artifacts_fn(
    _config: &Config,
    project_config: &ProjectConfig,
    _schema: &SDLSchema,
    _program: &Programs,
    artifacts: &[Artifact],
) -> Vec<Artifact> {
    artifacts
        .iter()
        .filter_map(|artifact| match &artifact.content {
            ArtifactContent::Operation {
                normalization_operation,
                id_and_text_hash,
                ..
            } => {
                if !is_operation_preloadable(normalization_operation) {
                    return None;
                }

                Some(generate_preloadable_query_parameters_artifact(
                    project_config,
                    normalization_operation,
                    id_and_text_hash,
                    artifact.artifact_source_keys.clone(),
                    artifact.source_file,
                ))
            }
            _ => None,
        })
        .collect()
}
