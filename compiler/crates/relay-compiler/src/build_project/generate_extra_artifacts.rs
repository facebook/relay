/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{Artifact, ProjectConfig};
use schema::SDLSchema;

pub type GenerateExtraArtifactsFn =
    Box<dyn Fn(&ProjectConfig, &SDLSchema, &Artifact) -> Vec<Artifact> + Send + Sync>;

pub fn generate_extra_artifacts(
    schema: &SDLSchema,
    project_config: &ProjectConfig,
    artifacts: &mut Vec<Artifact>,
    generate_extra_artifacts_fn: &GenerateExtraArtifactsFn,
) {
    let mut extra_artifacts = Vec::new();
    for artifact in artifacts.iter() {
        extra_artifacts.extend(generate_extra_artifacts_fn(
            project_config,
            schema,
            artifact,
        ));
    }
    artifacts.extend(extra_artifacts);
}
