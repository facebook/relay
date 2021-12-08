/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

pub use super::artifact_content::ArtifactContent;
use super::build_ir::SourceHashes;
use crate::config::{Config, ProjectConfig};
use common::{NamedItem, SourceLocationKey};
use fnv::FnvHashMap;
use graphql_ir::{FragmentDefinition, OperationDefinition};
use graphql_text_printer::OperationPrinter;
use intern::string_key::StringKey;
use relay_transforms::{
    Programs, RefetchableDerivedFromMetadata, SplitOperationMetadata,
    CLIENT_EDGE_GENERATED_FRAGMENT_KEY, CLIENT_EDGE_QUERY_METADATA_KEY, CLIENT_EDGE_SOURCE_NAME,
    DIRECTIVE_SPLIT_OPERATION,
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
    _config: &Config,
    project_config: &ProjectConfig,
    programs: &Programs,
    source_hashes: Arc<SourceHashes>,
) -> Vec<Artifact> {
    let mut operation_printer = OperationPrinter::new(&programs.operation_text);
    return group_operations(programs)
        .into_iter()
        .map(|(_, operations)| -> Artifact {
            if let Some(directive) = operations
                .normalization
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
                    Some(Arc::clone(operations.normalization))
                } else {
                    None
                };

                Artifact {
                    source_definition_names: metadata.parent_documents.into_iter().collect(),
                    path: path_for_artifact(
                        project_config,
                        source_file,
                        operations.normalization.name.item,
                    ),
                    content: ArtifactContent::SplitOperation {
                        normalization_operation: Arc::clone(operations.normalization),
                        typegen_operation,
                        source_hash,
                    },
                    source_file,
                }
            } else if let Some(derived_from_metadata) =
                RefetchableDerivedFromMetadata::find(&operations.normalization.directives)
            {
                let source_name = derived_from_metadata.0;
                let source_fragment = programs
                    .source
                    .fragment(source_name)
                    .expect("Expected the source document for the SplitOperation to exist.");
                let source_hash = source_hashes.get(&source_name).cloned().unwrap();

                generate_normalization_artifact(
                    &mut operation_printer,
                    source_name,
                    project_config,
                    &operations,
                    source_hash,
                    source_fragment.name.location.source_location(),
                )
            } else if let Some(client_edges_directive) = operations
                .normalization
                .directives
                .named(*CLIENT_EDGE_QUERY_METADATA_KEY)
            {
                let source_name = client_edges_directive
                    .arguments
                    .named(*CLIENT_EDGE_SOURCE_NAME)
                    .expect("Client edges should have a source argument")
                    .value
                    .item
                    .expect_string_literal();

                let source_file = programs
                    .source
                    .fragment(source_name)
                    .map(|fragment| fragment.name.location.source_location())
                    .or_else(|| {
                        programs
                            .source
                            .operation(source_name)
                            .map(|operation| operation.name.location.source_location())
                    })
                    .unwrap();
                let source_hash = source_hashes.get(&source_name).cloned().unwrap();
                generate_normalization_artifact(
                    &mut operation_printer,
                    source_name,
                    project_config,
                    &operations,
                    source_hash,
                    source_file,
                )
            } else {
                let source_hash = source_hashes
                    .get(&operations.normalization.name.item)
                    .cloned()
                    .unwrap();
                generate_normalization_artifact(
                    &mut operation_printer,
                    operations.normalization.name.item,
                    project_config,
                    &operations,
                    source_hash,
                    operations.normalization.name.location.source_location(),
                )
            }
        })
        .chain(programs.reader.fragments().map(|reader_fragment| {
            let source_name = if let Some(client_edges_directive) = reader_fragment
                .directives
                .named(*CLIENT_EDGE_GENERATED_FRAGMENT_KEY)
            {
                client_edges_directive
                    .arguments
                    .named(*CLIENT_EDGE_SOURCE_NAME)
                    .expect("Client edges should have a source argument")
                    .value
                    .item
                    .expect_string_literal()
            } else {
                reader_fragment.name.item
            };

            let source_hash = source_hashes.get(&source_name).cloned().unwrap();
            generate_reader_artifact(project_config, programs, reader_fragment, source_hash)
        }))
        .collect();
}

fn generate_normalization_artifact(
    operation_printer: &mut OperationPrinter<'_>,
    source_definition_name: StringKey,
    project_config: &ProjectConfig,
    operations: &OperationGroup<'_>,
    source_hash: String,
    source_file: SourceLocationKey,
) -> Artifact {
    let text = operation_printer.print(operations.expect_operation_text());
    Artifact {
        source_definition_names: vec![source_definition_name],
        path: path_for_artifact(
            project_config,
            source_file,
            operations.normalization.name.item,
        ),
        content: ArtifactContent::Operation {
            normalization_operation: Arc::clone(operations.normalization),
            reader_operation: operations.expect_reader(),
            typegen_operation: operations.expect_typegen(),
            source_hash,
            text,
            id_and_text_hash: None,
        },
        source_file: operations.normalization.name.location.source_location(),
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

/// Operation with the same name from different `Program`s.
struct OperationGroup<'a> {
    normalization: &'a Arc<OperationDefinition>,
    operation_text: Option<&'a OperationDefinition>,
    reader: Option<&'a Arc<OperationDefinition>>,
    typegen: Option<&'a Arc<OperationDefinition>>,
}

impl<'a> OperationGroup<'a> {
    fn expect_operation_text(&self) -> &OperationDefinition {
        self.operation_text.unwrap_or_else(|| {
            panic!(
                "Expected to have a operation_text operation for `{}`",
                self.normalization.name.item
            )
        })
    }

    fn expect_reader(&self) -> Arc<OperationDefinition> {
        Arc::clone(self.reader.unwrap_or_else(|| {
            panic!(
                "Expected to have a reader operation for `{}`",
                self.normalization.name.item
            )
        }))
    }

    fn expect_typegen(&self) -> Arc<OperationDefinition> {
        Arc::clone(self.typegen.unwrap_or_else(|| {
            panic!(
                "Expected to have a typegen operation for `{}`",
                self.normalization.name.item
            )
        }))
    }
}

/// Groups operations from the given programs by name for efficient access.
/// `Programs::operation(name)` does a linear search, so it's more efficient to
/// group in a batch.
fn group_operations(programs: &Programs) -> FnvHashMap<StringKey, OperationGroup<'_>> {
    let mut grouped_operations: FnvHashMap<StringKey, OperationGroup<'_>> = programs
        .normalization
        .operations
        .iter()
        .map(|normalization_operation| {
            (
                normalization_operation.name.item,
                OperationGroup {
                    normalization: normalization_operation,
                    operation_text: None,
                    reader: None,
                    typegen: None,
                },
            )
        })
        .collect();
    for operation in programs.operation_text.operations() {
        grouped_operations
            .get_mut(&operation.name.item)
            .unwrap()
            .operation_text = Some(operation);
    }
    for operation in programs.reader.operations() {
        grouped_operations
            .get_mut(&operation.name.item)
            .unwrap()
            .reader = Some(operation);
    }
    for operation in programs.typegen.operations() {
        grouped_operations
            .get_mut(&operation.name.item)
            .unwrap()
            .typegen = Some(operation);
    }
    grouped_operations
}
