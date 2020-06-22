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

#[derive(Debug)]
pub struct GenerateExtraArtifactArgs<'schema, 'artifact> {
    pub schema: &'schema Schema,
    pub project_config: &'artifact ProjectConfig,
    pub normalization_operation: &'artifact OperationDefinition,
    pub name: StringKey,
    pub source_file: SourceLocationKey,
    pub text: &'artifact str,
    pub id: Option<&'artifact String>,
}

pub type GenerateExtraArtifactsFn =
    Box<dyn for<'schema> Fn(GenerateExtraArtifactArgs<'schema, '_>) -> Vec<Artifact<'static>>>;

pub fn generate_extra_artifacts(
    schema: &Schema,
    project_config: &ProjectConfig,
    artifacts: &mut Vec<Artifact<'_>>,
    generate_extra_operation_artifacts: &GenerateExtraArtifactsFn,
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
            extra_artifacts.extend(generate_extra_operation_artifacts(
                GenerateExtraArtifactArgs {
                    schema,
                    project_config,
                    normalization_operation,
                    name: artifact.name,
                    source_file: artifact.source_file,
                    text,
                    id: id_and_text_hash.as_ref().map(|(id, _)| id),
                },
            ));
        }
    }
    artifacts.extend(extra_artifacts);
}
