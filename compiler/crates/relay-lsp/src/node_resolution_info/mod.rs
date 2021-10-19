/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::{collections::HashMap, path::PathBuf};

use crate::{
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    utils::extract_executable_document_from_text,
};
use common::Span;
use graphql_syntax::{
    Argument, Directive, ExecutableDefinition, ExecutableDocument, FragmentDefinition,
    FragmentSpread, GraphQLSource, InlineFragment, LinkedField, List, OperationDefinition,
    ScalarField, Selection, TypeCondition,
};
use interner::StringKey;
use lsp_types::{TextDocumentPositionParams, Url};
use relay_compiler::FileCategorizer;

mod type_path;
pub use type_path::{TypePath, TypePathItem};

#[derive(Debug, Clone, PartialEq)]
pub enum NodeKind {
    OperationDefinition(OperationDefinition),
    FragmentDefinition(FragmentDefinition),
    FieldName,
    FieldArgument(StringKey, StringKey),
    FragmentSpread(StringKey),
    InlineFragment,
    Variable(String),
    Directive(StringKey, Option<StringKey>),
    TypeCondition(StringKey),
}

#[derive(Debug)]
pub struct NodeResolutionInfo {
    /// The type of the leaf node on which the information request was made
    pub kind: NodeKind,
    /// A list of type metadata that we can use to resolve the leaf
    /// type the request is being made against
    pub type_path: TypePath,
    /// The project the request belongs to
    pub project_name: StringKey,
}

impl NodeResolutionInfo {
    fn new(project_name: StringKey, kind: NodeKind) -> Self {
        Self {
            kind,
            type_path: Default::default(),
            project_name,
        }
    }
}

fn build_node_resolution_for_directive(
    directives: &[Directive],
    position_span: Span,
    project_name: StringKey,
) -> Option<NodeResolutionInfo> {
    let directive = directives
        .iter()
        .find(|directive| directive.span.contains(position_span))?;

    let arg_name_opt = if let Some(args) = &directive.arguments {
        args.items
            .iter()
            .find(|arg| arg.span.contains(position_span))
            .map(|arg| arg.name.value)
    } else {
        None
    };

    Some(NodeResolutionInfo {
        kind: NodeKind::Directive(directive.name.value, arg_name_opt),
        type_path: Default::default(),
        project_name,
    })
}

fn type_condition_at_position(
    type_condition: &TypeCondition,
    position_span: Span,
) -> Option<NodeKind> {
    if !type_condition.span.contains(position_span) {
        return None;
    }

    Some(NodeKind::TypeCondition(type_condition.type_.value))
}

fn create_node_resolution_info(
    document: ExecutableDocument,
    position_span: Span,
    project_name: StringKey,
) -> LSPRuntimeResult<NodeResolutionInfo> {
    let definition = document
        .definitions
        .iter()
        .find(|definition| definition.location().contains(position_span))
        .ok_or(LSPRuntimeError::ExpectedError)?;

    match definition {
        ExecutableDefinition::Operation(operation) => {
            if operation.location.contains(position_span) {
                let mut node_resolution_info = NodeResolutionInfo::new(
                    project_name,
                    NodeKind::OperationDefinition(operation.clone()),
                );
                let OperationDefinition {
                    selections,
                    variable_definitions,
                    ..
                } = operation;

                if let Some(variable_definitions) = variable_definitions {
                    if let Some(variable) = variable_definitions
                        .items
                        .iter()
                        .find(|var| var.span.contains(position_span))
                    {
                        node_resolution_info.kind = NodeKind::Variable(variable.type_.to_string());
                        return Ok(node_resolution_info);
                    }
                }

                let (_, kind) = operation.operation.clone().ok_or_else(|| {
                    LSPRuntimeError::UnexpectedError(
                        "Expected operation to exist, but it did not".to_string(),
                    )
                })?;
                node_resolution_info
                    .type_path
                    .add_type(TypePathItem::Operation(kind));

                build_node_resolution_info_from_selections(
                    selections,
                    position_span,
                    &mut node_resolution_info,
                );
                Ok(node_resolution_info)
            } else {
                Err(LSPRuntimeError::UnexpectedError(format!(
                    "Expected operation named {:?} to contain position {:?}, but it did not. Operation span {:?}",
                    operation.name, operation.location, position_span
                )))
            }
        }
        ExecutableDefinition::Fragment(fragment) => {
            if fragment.location.contains(position_span) {
                let mut node_resolution_info = NodeResolutionInfo::new(
                    project_name,
                    NodeKind::FragmentDefinition(fragment.clone()),
                );
                if let Some(node_resolution_info) = build_node_resolution_for_directive(
                    &fragment.directives,
                    position_span,
                    project_name,
                ) {
                    return Ok(node_resolution_info);
                }

                if let Some(node_kind) =
                    type_condition_at_position(&fragment.type_condition, position_span)
                {
                    node_resolution_info.kind = node_kind;
                    return Ok(node_resolution_info);
                }

                let type_name = fragment.type_condition.type_.value;
                node_resolution_info
                    .type_path
                    .add_type(TypePathItem::FragmentDefinition { type_name });
                build_node_resolution_info_from_selections(
                    &fragment.selections,
                    position_span,
                    &mut node_resolution_info,
                );
                Ok(node_resolution_info)
            } else {
                Err(LSPRuntimeError::UnexpectedError(format!(
                    "Expected fragment named {:?} to contain position {:?}, but it did not. Operation span {:?}",
                    fragment.name, fragment.location, position_span
                )))
            }
        }
    }
}

/// If position_span falls into one of the field arguments,
/// we need to display resolution info for this field
fn build_node_resolution_info_for_argument(
    field_name: StringKey,
    arguments: &Option<List<Argument>>,
    position_span: Span,
    node_resolution_info: &mut NodeResolutionInfo,
) -> Option<()> {
    if let Some(arguments) = &arguments {
        let argument = arguments
            .items
            .iter()
            .find(|item| item.span.contains(position_span))?;

        node_resolution_info.kind = NodeKind::FieldArgument(field_name, argument.name.value);

        Some(())
    } else {
        None
    }
}

fn build_node_resolution_info_from_selections(
    selections: &List<Selection>,
    position_span: Span,
    node_resolution_info: &mut NodeResolutionInfo,
) {
    if let Some(item) = selections
        .items
        .iter()
        .find(|item| item.span().contains(position_span))
    {
        if let Some(directive_resolution_info) = build_node_resolution_for_directive(
            item.directives(),
            position_span,
            node_resolution_info.project_name,
        ) {
            node_resolution_info.kind = directive_resolution_info.kind;
            return;
        }

        match item {
            Selection::LinkedField(node) => {
                node_resolution_info.kind = NodeKind::FieldName;
                let LinkedField {
                    name, selections, ..
                } = node;
                if build_node_resolution_info_for_argument(
                    name.value,
                    &node.arguments,
                    position_span,
                    node_resolution_info,
                )
                .is_none()
                {
                    node_resolution_info
                        .type_path
                        .add_type(TypePathItem::LinkedField { name: name.value });
                    build_node_resolution_info_from_selections(
                        selections,
                        position_span,
                        node_resolution_info,
                    );
                }
            }
            Selection::FragmentSpread(spread) => {
                let FragmentSpread { name, .. } = spread;
                if name.span.contains(position_span) {
                    node_resolution_info.kind = NodeKind::FragmentSpread(name.value);
                }
            }
            Selection::InlineFragment(node) => {
                let InlineFragment {
                    selections,
                    type_condition,
                    ..
                } = node;

                node_resolution_info.kind = NodeKind::InlineFragment;
                if let Some(type_condition) = type_condition {
                    let type_name = type_condition.type_.value;
                    node_resolution_info
                        .type_path
                        .add_type(TypePathItem::InlineFragment { type_name });

                    if let Some(node_kind) =
                        type_condition_at_position(&type_condition, position_span)
                    {
                        node_resolution_info.kind = node_kind;
                    } else {
                        build_node_resolution_info_from_selections(
                            selections,
                            position_span,
                            node_resolution_info,
                        )
                    }
                }
            }
            Selection::ScalarField(node) => {
                let ScalarField { name, .. } = node;

                if build_node_resolution_info_for_argument(
                    name.value,
                    &node.arguments,
                    position_span,
                    node_resolution_info,
                )
                .is_none()
                {
                    node_resolution_info.kind = NodeKind::FieldName;
                    node_resolution_info
                        .type_path
                        .add_type(TypePathItem::ScalarField { name: name.value });
                }
            }
        }
    }
}

/// Return a `NodeResolutionInfo` for this request if the request occurred
/// within a GraphQL document.
pub fn get_node_resolution_info(
    text_document_position: TextDocumentPositionParams,
    graphql_source_cache: &HashMap<Url, Vec<GraphQLSource>>,
    file_categorizer: &FileCategorizer,
    root_dir: &PathBuf,
) -> LSPRuntimeResult<NodeResolutionInfo> {
    let (document, position_span, project_name) = extract_executable_document_from_text(
        text_document_position,
        graphql_source_cache,
        file_categorizer,
        root_dir,
        // For hovering, offset the index by 1
        // ```
        //  field
        //  ^ hover on f
        // ^ position returned by the client
        // ```
        // so the returned cursor is on the char `f`
        1,
    )?;

    create_node_resolution_info(document, position_span, project_name)
}

#[cfg(test)]
mod test {
    use super::create_node_resolution_info;
    use super::{NodeKind, NodeResolutionInfo};
    use common::{SourceLocationKey, Span};
    use graphql_syntax::parse_executable;
    use interner::Intern;
    use relay_test_schema::get_test_schema;
    use schema::Schema;

    fn parse_and_get_node_info(source: &str, pos: u32) -> NodeResolutionInfo {
        let document =
            parse_executable(source, SourceLocationKey::standalone("/test/file")).unwrap();

        // Select the `uri` field
        let position_span = Span {
            start: pos,
            end: pos,
        };

        create_node_resolution_info(document, position_span, "test_project".intern()).unwrap()
    }

    #[test]
    fn create_node_resolution_info_test() {
        let node_resolution_info = parse_and_get_node_info(
            r#"
            fragment User_data on User {
                name
                profile_picture {
                    uri
                }
            }
        "#,
            // Select the `uri` field
            117,
        );

        // assert_eq!(format!("{:?}", node_resolution_info), "".to_string());
        assert_eq!(node_resolution_info.kind, NodeKind::FieldName);
        assert_eq!(node_resolution_info.project_name.lookup(), "test_project");
        let schema = get_test_schema();
        let type_ref = node_resolution_info
            .type_path
            .resolve_current_type_reference(&schema)
            .unwrap();
        assert_eq!(schema.get_type_string(&type_ref), "String".to_string());
    }

    #[test]
    fn create_node_resolution_info_test_position_outside() {
        let document = parse_executable(
            r#"
            fragment User_data on User {
                name
            }
        "#,
            SourceLocationKey::standalone("/test/file"),
        )
        .unwrap();
        // Position is outside of the document
        let position_span = Span { start: 86, end: 87 };
        let result = create_node_resolution_info(document, position_span, "test_project".intern());
        assert!(result.is_err());
    }

    #[test]
    fn create_node_resolution_info_fragment_def_name() {
        let node_resolution_info = parse_and_get_node_info(
            r#"
            fragment User_data on User {
                name
            }
        "#,
            // Select the `User_data` fragment name
            26,
        );

        match node_resolution_info.kind {
            NodeKind::FragmentDefinition(fragment) => {
                assert_eq!(fragment.name.value, "User_data".intern())
            }
            node_kind => panic!("Unexpected node node_resolution_info.kind {:?}", node_kind),
        }
    }

    #[test]
    fn create_node_resolution_info_fragment_def_type_condition() {
        let node_resolution_info = parse_and_get_node_info(
            r#"
            fragment User_data on User {
                name
            }
        "#,
            // Select the `User` type in fragment declaration
            35,
        );

        assert_eq!(
            node_resolution_info.kind,
            NodeKind::TypeCondition("User".intern())
        );
    }

    #[test]
    fn create_node_resolution_info_inline_fragment_type_condition() {
        let node_resolution_info = parse_and_get_node_info(
            r#"
            fragment User_data on User {
                name
                ... on User {
                    id
                }
            }
        "#,
            // Select the `User` type in fragment declaration
            84,
        );

        assert_eq!(
            node_resolution_info.kind,
            NodeKind::TypeCondition("User".intern())
        );
    }
}
