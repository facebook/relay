/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::apply_transforms::Programs;
pub use super::artifact_content::ArtifactContent;
use super::build_ir::SourceHashes;
use crate::config::ProjectConfig;
use crate::errors::BuildProjectError;
use common::{NamedItem, SourceLocationKey};
use graphql_ir::{FragmentDefinition, OperationDefinition};
use graphql_text_printer::print_full_operation;
use interner::StringKey;
use relay_transforms::{
    RefetchableDerivedFromMetadata, SplitOperationMetadata, DIRECTIVE_SPLIT_OPERATION,
};
use relay_typegen::TypegenLanguage;
use std::path::PathBuf;
use std::sync::Arc;

/// Represents a generated output artifact.
pub struct Artifact {
    pub source_definition_names: Vec<StringKey>,
    pub path: PathBuf,
    pub content: ArtifactContent,
    /// The source file responsible for generating this file.
    /// For example: `my_project/Component.react.js`
    pub source_file: SourceLocationKey,
}

pub fn generate_artifacts(
    project_config: &ProjectConfig,
    programs: &Programs,
    source_hashes: Arc<SourceHashes>,
) -> Result<Vec<Artifact>, BuildProjectError> {
    let mut artifacts = Vec::new();
    for normalization_operation in programs.normalization.operations() {
        if let Some(directive) = normalization_operation
            .directives
            .named(*DIRECTIVE_SPLIT_OPERATION)
        {
            // Generate normalization file for SplitOperation
            let metadata = SplitOperationMetadata::from(directive);
            let source_fragment = programs
                .source
                .fragment(metadata.derived_from)
                .expect("Expected the source document for the SplitOperation to exist.");
            let source_hash = source_hashes.get(&metadata.derived_from).cloned().unwrap();
            let source_file = source_fragment.name.location.source_location();
            let typegen_operation = if metadata.raw_response_type {
                programs
                    .normalization
                    .operation(normalization_operation.name.item)
                    .map(Arc::clone)
            } else {
                None
            };

            artifacts.push(Artifact {
                source_definition_names: metadata.parent_sources.into_iter().collect(),
                path: path_for_artifact(
                    project_config,
                    source_file,
                    normalization_operation.name.item,
                ),
                content: ArtifactContent::SplitOperation {
                    normalization_operation: Arc::clone(normalization_operation),
                    typegen_operation,
                    source_hash,
                },
                source_file,
            });
        } else if let Some(source_name) =
            RefetchableDerivedFromMetadata::from_directives(&normalization_operation.directives)
        {
            let source_fragment = programs
                .source
                .fragment(source_name)
                .expect("Expected the source document for the SplitOperation to exist.");
            let source_hash = source_hashes.get(&source_name).cloned().unwrap();

            artifacts.push(generate_normalization_artifact(
                source_name,
                project_config,
                programs,
                normalization_operation,
                source_hash,
                source_fragment.name.location.source_location(),
            ));
        } else {
            let source_hash = source_hashes
                .get(&normalization_operation.name.item)
                .cloned()
                .unwrap();
            artifacts.push(generate_normalization_artifact(
                normalization_operation.name.item,
                project_config,
                programs,
                normalization_operation,
                source_hash,
                normalization_operation.name.location.source_location(),
            ));
        }
    }

    for reader_fragment in programs.reader.fragments() {
        let source_hash = source_hashes
            .get(&reader_fragment.name.item)
            .cloned()
            .unwrap();
        artifacts.push(generate_reader_artifact(
            project_config,
            programs,
            reader_fragment,
            source_hash,
        ));
    }

    Ok(artifacts)
}

fn generate_normalization_artifact(
    source_definition_name: StringKey,
    project_config: &ProjectConfig,
    programs: &Programs,
    normalization_operation: &Arc<OperationDefinition>,
    source_hash: String,
    source_file: SourceLocationKey,
) -> Artifact {
    let name = normalization_operation.name.item;
    let print_operation = programs
        .operation_text
        .operation(name)
        .expect("a query text operation should be generated for this operation");
    let text = print_full_operation(&programs.operation_text, print_operation);
    let reader_operation = programs
        .reader
        .operation(name)
        .expect("a reader fragment should be generated for this operation");
    let typegen_operation = programs
        .typegen
        .operation(name)
        .expect("a type fragment should be generated for this operation");

    Artifact {
        source_definition_names: vec![source_definition_name],
        path: path_for_artifact(project_config, source_file, name),
        content: ArtifactContent::Operation {
            normalization_operation: Arc::clone(normalization_operation),
            reader_operation: Arc::clone(reader_operation),
            typegen_operation: Arc::clone(typegen_operation),
            source_hash,
            text,
            id_and_text_hash: None,
        },
        source_file: normalization_operation.name.location.source_location(),
    }
}

fn generate_reader_artifact(
    project_config: &ProjectConfig,
    programs: &Programs,
    reader_fragment: &Arc<FragmentDefinition>,
    source_hash: String,
) -> Artifact {
    let name = reader_fragment.name.item;
    let typegen_fragment = programs
        .typegen
        .fragment(name)
        .expect("a type fragment should be generated for this fragment");
    Artifact {
        source_definition_names: vec![name],
        path: path_for_artifact(
            project_config,
            reader_fragment.name.location.source_location(),
            name,
        ),
        content: ArtifactContent::Fragment {
            reader_fragment: Arc::clone(reader_fragment),
            typegen_fragment: Arc::clone(typegen_fragment),
            source_hash,
        },
        source_file: reader_fragment.name.location.source_location(),
    }
}

/// This function will create a correct path for artifact based on the project configuration
pub fn create_path_for_artifact(
    project_config: &ProjectConfig,
    source_file: SourceLocationKey,
    artifact_file_name: String,
) -> PathBuf {
    if let Some(output) = &project_config.output {
        // If an output directory is specified, output into that directory.
        if project_config.shard_output {
            if let Some(ref regex) = project_config.shard_strip_regex {
                let full_source_path = regex.replace_all(source_file.path(), "");
                let mut output = output.join(full_source_path.to_string());
                output.pop();
                output
            } else {
                output.join(source_file.get_dir())
            }
            .join(artifact_file_name)
        } else {
            output.join(artifact_file_name)
        }
    } else {
        // Otherwise, output into a file relative to the source.
        source_file
            .get_dir()
            .join("__generated__")
            .join(artifact_file_name)
    }
}

fn path_for_artifact(
    project_config: &ProjectConfig,
    source_file: SourceLocationKey,
    definition_name: StringKey,
) -> PathBuf {
    let filename = if let Some(filename_for_artifact) = &project_config.filename_for_artifact {
        filename_for_artifact(source_file, definition_name)
    } else {
        match &project_config.typegen_config.language {
            TypegenLanguage::Flow => format!("{}.graphql.js", definition_name),
            TypegenLanguage::TypeScript => format!("{}.graphql.ts", definition_name),
        }
    };
    create_path_for_artifact(project_config, source_file, filename)
}
