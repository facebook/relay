/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{artifact_content::ArtifactContent, Artifact};
use crate::config::ProjectConfig;
use common::FileKey;
use interner::StringKey;

pub struct GenerateExtraArtifactArgs<'a> {
    pub name: StringKey,
    pub source_file: FileKey,
    pub text: &'a str,
    pub id: &'a Option<String>,
}

pub type GenerateExtraArtifactsFn =
    Box<dyn Fn(GenerateExtraArtifactArgs<'_>) -> Vec<Artifact<'static>>>;

pub fn generate_extra_artifacts(artifacts: &mut Vec<Artifact<'_>>, project_config: &ProjectConfig) {
    if let Some(ref generate_extra_operation_artifacts) =
        project_config.generate_extra_operation_artifacts
    {
        let mut extra_artifacts = Vec::new();
        for artifact in artifacts.iter() {
            if let ArtifactContent::Operation { text, id, .. } = &artifact.content {
                extra_artifacts.extend(generate_extra_operation_artifacts(
                    GenerateExtraArtifactArgs {
                        name: artifact.name,
                        source_file: artifact.source_file,
                        text,
                        id,
                    },
                ));
            }
        }
        artifacts.extend(extra_artifacts);
    }
}
