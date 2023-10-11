/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use relay_codegen::QueryID;
use relay_compiler::config::Config;
use relay_compiler::Artifact;
use relay_compiler::ArtifactContent;
use relay_compiler::ProjectConfig;
use relay_transforms::Programs;
use schema::SDLSchema;

#[derive(serde::Serialize)]
struct QueryForMock {
    signature: &'static str,
    id: String,
    operation: String,
}

pub fn generate_persisted_mocks(
    _config: &Config,
    project_config: &ProjectConfig,
    _schema: &SDLSchema,
    _programs: &Programs,
    artifacts: &[Artifact],
) -> Vec<Artifact> {
    let mut extra = vec![];
    if let Some(folder) = &project_config.extra_artifacts_output {
        for artifact in artifacts {
            if let ArtifactContent::Operation {
                text: Some(text),
                id_and_text_hash: Some(QueryID::Persisted { id, .. }),
                normalization_operation,
                ..
            } = &artifact.content
            {
                let name = normalization_operation.name.item;
                let full_path = folder.join(format!("{name}.json"));
                let query = QueryForMock {
                    signature: signedsource::SIGNING_TOKEN,
                    id: id.clone(),
                    operation: text.clone(),
                };
                let str = serde_json::to_string_pretty(&query).unwrap();
                let str = signedsource::sign_file(str.as_str());

                let new_artifact = Artifact {
                    content: ArtifactContent::Generic {
                        content: str.as_bytes().to_vec(),
                    },
                    artifact_source_keys: artifact.artifact_source_keys.clone(),
                    path: full_path,
                    source_file: artifact.source_file,
                };
                extra.push(new_artifact);
            }
        }
    }
    extra
}
