/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

pub use super::artifact_content::ArtifactContent;
use super::build_ir::SourceHashes;
use crate::config::Config;
use crate::config::ProjectConfig;
use common::NamedItem;
use common::SourceLocationKey;
use fnv::FnvHashMap;
use graphql_ir::FragmentDefinition;
use graphql_ir::OperationDefinition;
use graphql_text_printer::OperationPrinter;
use intern::string_key::StringKey;
use relay_transforms::ClientEdgeGeneratedQueryMetadataDirective;
use relay_transforms::Programs;
use relay_transforms::RefetchableDerivedFromMetadata;
use relay_transforms::SplitOperationMetadata;
use relay_transforms::CLIENT_EDGE_GENERATED_FRAGMENT_KEY;
use relay_transforms::CLIENT_EDGE_SOURCE_NAME;
use relay_transforms::DIRECTIVE_SPLIT_OPERATION;
use relay_transforms::UPDATABLE_DIRECTIVE;
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
            if let Some(normalization) = operations.normalization {
                // We have a normalization AST... so we'll move forward with that
                if let Some(directive) = normalization.directives.named(*DIRECTIVE_SPLIT_OPERATION)
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
                        Some(Arc::clone(normalization))
                    } else {
                        None
                    };

                    return Artifact {
                        source_definition_names: metadata.parent_documents.into_iter().collect(),
                        path: project_config
                            .path_for_artifact(source_file, normalization.name.item),
                        content: ArtifactContent::SplitOperation {
                            normalization_operation: Arc::clone(normalization),
                            typegen_operation,
                            source_hash,
                        },
                        source_file,
                    }
                } else if let Some(derived_from_metadata) =
                    RefetchableDerivedFromMetadata::find(&normalization.directives)
                {
                    let source_name = derived_from_metadata.0;
                    let source_fragment = programs
                        .source
                        .fragment(source_name)
                        .expect("Expected the source document for the SplitOperation to exist.");
                    let source_hash = source_hashes.get(&source_name).cloned().unwrap();

                    return generate_normalization_artifact(
                        &mut operation_printer,
                        source_name,
                        project_config,
                        &operations,
                        source_hash,
                        source_fragment.name.location.source_location(),
                    )
                } else if let Some(client_edges_directive) =
                    ClientEdgeGeneratedQueryMetadataDirective::find(&normalization.directives)
                {
                    let source_name = client_edges_directive.source_name.item;
                    let source_file = client_edges_directive
                        .source_name
                        .location
                        .source_location();
                    let source_hash = source_hashes.get(&source_name).cloned().unwrap();
                    return generate_normalization_artifact(
                        &mut operation_printer,
                        source_name,
                        project_config,
                        &operations,
                        source_hash,
                        source_file,
                    )
                } else {
                    let source_hash = source_hashes
                        .get(&normalization.name.item)
                        .cloned()
                        .unwrap();
                    return generate_normalization_artifact(
                        &mut operation_printer,
                        normalization.name.item,
                        project_config,
                        &operations,
                        source_hash,
                        normalization.name.location.source_location(),
                    )
                }
            } else if let Some(reader) = operations.reader {
                // We don't have a normalization AST, but we do have a reader.
                // Therefore this must be an updatable query in order to continue.
                if reader
                    .directives
                    .named(*UPDATABLE_DIRECTIVE)
                    .is_some()
                {
                    let source_hash = source_hashes
                        .get(&reader.name.item)
                        .cloned()
                        .unwrap();
                    return generate_updatable_query_artifact(
                        reader.name.item,
                        project_config,
                        &operations,
                        source_hash,
                        reader.name.location.source_location(),
                    )
                }
            }

            panic!("Expected at least one of an @updatable reader AST, or normalization AST to be present");
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
            let source_definition_names = vec![source_name];
            generate_reader_artifact(
                project_config,
                programs,
                reader_fragment,
                source_hash,
                source_definition_names,
            )
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
    let text = operations
        .operation_text
        .map(|operation| operation_printer.print(operation));

    let normalization = operations
        .normalization
        .expect("Operations must have a normalization entry.");

    Artifact {
        source_definition_names: vec![source_definition_name],
        path: project_config.path_for_artifact(source_file, normalization.name.item),
        content: ArtifactContent::Operation {
            normalization_operation: Arc::clone(normalization),
            reader_operation: operations.expect_reader(),
            typegen_operation: operations.expect_typegen(),
            source_hash,
            text,
            id_and_text_hash: None,
        },
        source_file: normalization.name.location.source_location(),
    }
}

fn generate_updatable_query_artifact(
    source_definition_name: StringKey,
    project_config: &ProjectConfig,
    operations: &OperationGroup<'_>,
    source_hash: String,
    source_file: SourceLocationKey,
) -> Artifact {
    let reader = operations
        .reader
        .expect("Updatable operations must have a reader entry.");

    Artifact {
        source_definition_names: vec![source_definition_name],
        path: project_config.path_for_artifact(source_file, reader.name.item),
        content: ArtifactContent::UpdatableQuery {
            reader_operation: operations.expect_reader(),
            typegen_operation: operations.expect_typegen(),
            source_hash,
        },
        source_file: reader.name.location.source_location(),
    }
}

fn generate_reader_artifact(
    project_config: &ProjectConfig,
    programs: &Programs,
    reader_fragment: &Arc<FragmentDefinition>,
    source_hash: String,
    source_definition_names: Vec<StringKey>,
) -> Artifact {
    let name = reader_fragment.name.item;
    let typegen_fragment = programs
        .typegen
        .fragment(name)
        .expect("a type fragment should be generated for this fragment");
    Artifact {
        source_definition_names,
        path: project_config
            .path_for_artifact(reader_fragment.name.location.source_location(), name),
        content: ArtifactContent::Fragment {
            reader_fragment: Arc::clone(reader_fragment),
            typegen_fragment: Arc::clone(typegen_fragment),
            source_hash,
        },
        source_file: reader_fragment.name.location.source_location(),
    }
}

/// Operation with the same name from different `Program`s.
struct OperationGroup<'a> {
    normalization: Option<&'a Arc<OperationDefinition>>,
    operation_text: Option<&'a OperationDefinition>,
    reader: Option<&'a Arc<OperationDefinition>>,
    typegen: Option<&'a Arc<OperationDefinition>>,
}

impl<'a> OperationGroup<'a> {
    fn new() -> Self {
        OperationGroup {
            normalization: None,
            operation_text: None,
            reader: None,
            typegen: None,
        }
    }

    fn expect_reader(&self) -> Arc<OperationDefinition> {
        let normal_name = self
            .normalization
            .map_or("MISSING_ENTRY", |n| n.name.item.lookup());

        Arc::clone(
            self.reader.unwrap_or_else(|| {
                panic!("Expected to have a reader operation for `{}`", normal_name)
            }),
        )
    }

    fn expect_typegen(&self) -> Arc<OperationDefinition> {
        let normal_name = self
            .normalization
            .map_or("MISSING_ENTRY", |n| n.name.item.lookup());

        Arc::clone(self.typegen.unwrap_or_else(|| {
            panic!("Expected to have a typegen operation for `{}`", normal_name)
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
                    normalization: Some(normalization_operation),
                    operation_text: None,
                    reader: None,
                    typegen: None,
                },
            )
        })
        .collect();

    for operation in programs.operation_text.operations() {
        grouped_operations
            .entry(operation.name.item)
            .or_insert_with(OperationGroup::new)
            .operation_text = Some(operation);
    }
    for operation in programs.reader.operations() {
        grouped_operations
            .entry(operation.name.item)
            .or_insert_with(OperationGroup::new)
            .reader = Some(operation);
    }
    for operation in programs.typegen.operations() {
        grouped_operations
            .entry(operation.name.item)
            .or_insert_with(OperationGroup::new)
            .typegen = Some(operation);
    }

    grouped_operations
}
