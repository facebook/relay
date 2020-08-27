/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{artifact_content::ArtifactContent, Artifact, ProjectConfig};
use common::SourceLocationKey;
use graphql_ir::OperationDefinition;
use interner::StringKey;
use schema::Schema;
use std::sync::Arc;

#[derive(Debug)]
pub struct GenerateExtraArtifactArgs<'schema, 'artifact> {
    pub id: Option<&'artifact String>,
    pub name: StringKey,
    pub normalization_operation: Arc<OperationDefinition>,
    pub project_config: &'artifact ProjectConfig,
    pub schema: &'schema Schema,
    pub source_file: SourceLocationKey,
    pub text: &'artifact str,
}

pub type GenerateExtraArtifactsFn =
    Box<dyn for<'schema> Fn(GenerateExtraArtifactArgs<'schema, '_>) -> Vec<Artifact> + Send + Sync>;

pub fn generate_extra_artifacts(
    schema: &Schema,
    project_config: &ProjectConfig,
    artifacts: &mut Vec<Artifact>,
    generate_extra_operation_artifacts_fn: &GenerateExtraArtifactsFn,
) {
    let mut extra_artifacts = Vec::new();
    for artifact in artifacts.iter() {
        if let ArtifactContent::Operation {
            text,
            normalization_operation,
            id_and_text_hash,
            ..
        } = &artifact.content
        {
            extra_artifacts.extend(generate_extra_operation_artifacts_fn(
                GenerateExtraArtifactArgs {
                    id: id_and_text_hash.as_ref().map(|(id, _)| id),
                    /// NOTE: Currently only normalization files contain multiple source definition
                    /// names, and we don't generate extra artifacts for normalization files.
                    name: artifact.source_definition_names[0],
                    normalization_operation: Arc::clone(normalization_operation),
                    project_config,
                    schema,
                    source_file: artifact.source_file,
                    text,
                },
            ));
        }
    }
    artifacts.extend(extra_artifacts);
}
