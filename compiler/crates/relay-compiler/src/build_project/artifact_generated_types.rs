/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::NamedItem;
use graphql_ir::FragmentDefinition;
use graphql_ir::OperationDefinition;
use graphql_syntax::OperationKind;
use relay_config::TypegenLanguage;
use relay_transforms::INLINE_DIRECTIVE_NAME;
use relay_transforms::RefetchableMetadata;
use relay_transforms::UPDATABLE_DIRECTIVE;
use relay_typegen::has_raw_response_type_directive;

/// Specifies the imported and exported generated types of an
/// artifact.
pub struct ArtifactGeneratedTypes {
    pub imported_types: &'static str,
    pub ast_type: &'static str,
    pub exported_type: Option<String>,
}

impl ArtifactGeneratedTypes {
    pub fn from_operation(
        operation: &OperationDefinition,
        skip_types: bool,
        is_client_only: bool,
        language: TypegenLanguage,
    ) -> Self {
        if skip_types || language == TypegenLanguage::TypeScript {
            Self {
                imported_types: "ConcreteRequest",
                ast_type: "ConcreteRequest",
                exported_type: None,
            }
        } else {
            let (kind, imported_types) = match operation.kind {
                OperationKind::Query => {
                    if is_client_only {
                        ("ClientQuery", "ClientRequest, ClientQuery")
                    } else {
                        ("Query", "ConcreteRequest, Query")
                    }
                }
                OperationKind::Mutation => {
                    if is_client_only {
                        ("Mutation", "ClientRequest, Mutation")
                    } else {
                        ("Mutation", "ConcreteRequest, Mutation")
                    }
                }
                OperationKind::Subscription => (
                    "GraphQLSubscription",
                    "ConcreteRequest, GraphQLSubscription",
                ),
            };
            let exported_type = if has_raw_response_type_directive(operation) {
                format!(
                    "{kind}<\n  {name}$variables,\n  {name}$data,\n  {name}$rawResponse,\n>",
                    kind = kind,
                    name = operation.name.item.0
                )
            } else {
                format!(
                    "{kind}<\n  {name}$variables,\n  {name}$data,\n>",
                    kind = kind,
                    name = operation.name.item.0
                )
            };
            Self {
                imported_types,
                ast_type: if is_client_only {
                    "ClientRequest"
                } else {
                    "ConcreteRequest"
                },
                exported_type: Some(exported_type),
            }
        }
    }

    pub fn from_updatable_query(
        typegen_operation: &OperationDefinition,
        skip_types: bool,
        language: TypegenLanguage,
    ) -> Self {
        if skip_types || language == TypegenLanguage::TypeScript {
            Self {
                imported_types: "ConcreteUpdatableQuery",
                ast_type: "ConcreteUpdatableQuery",
                exported_type: None,
            }
        } else {
            let exported_type = format!(
                "UpdatableQuery<\n  {name}$variables,\n  {name}$data,\n>",
                name = typegen_operation.name.item.0,
            );
            Self {
                imported_types: "UpdatableQuery, ConcreteUpdatableQuery",
                ast_type: "ConcreteUpdatableQuery",
                exported_type: Some(exported_type),
            }
        }
    }

    pub fn from_fragment(
        fragment: &FragmentDefinition,
        skip_types: bool,
        language: TypegenLanguage,
    ) -> Self {
        let is_inline_data_fragment = fragment.directives.named(*INLINE_DIRECTIVE_NAME).is_some();
        let is_updatable_fragment = fragment.directives.named(*UPDATABLE_DIRECTIVE).is_some();

        if skip_types || language == TypegenLanguage::TypeScript {
            if is_inline_data_fragment {
                Self {
                    imported_types: "ReaderInlineDataFragment",
                    ast_type: "ReaderInlineDataFragment",
                    exported_type: None,
                }
            } else {
                Self {
                    imported_types: "ReaderFragment",
                    ast_type: "ReaderFragment",
                    exported_type: None,
                }
            }
        } else if is_inline_data_fragment {
            Self {
                imported_types: "InlineFragment, ReaderInlineDataFragment",
                ast_type: "ReaderInlineDataFragment",
                exported_type: Some(format!(
                    "InlineFragment<\n  {name}$fragmentType,\n  {name}$data,\n>",
                    name = fragment.name.item
                )),
            }
        } else if let Some(refetchable_metadata) = RefetchableMetadata::find(&fragment.directives) {
            if refetchable_metadata.is_prefetchable_pagination {
                Self {
                    imported_types: "ReaderFragment, PrefetchableRefetchableFragment",
                    ast_type: "ReaderFragment",
                    exported_type: Some(format!(
                        "PrefetchableRefetchableFragment<\n  {name}$fragmentType,\n  {name}$data,\n  {name}__edges$data,\n  {refetchable_name}$variables,\n>",
                        name = fragment.name.item,
                        refetchable_name = refetchable_metadata.operation_name
                    )),
                }
            } else {
                Self {
                    imported_types: "ReaderFragment, RefetchableFragment",
                    ast_type: "ReaderFragment",
                    exported_type: Some(format!(
                        "RefetchableFragment<\n  {name}$fragmentType,\n  {name}$data,\n  {refetchable_name}$variables,\n>",
                        name = fragment.name.item,
                        refetchable_name = refetchable_metadata.operation_name
                    )),
                }
            }
        } else if is_updatable_fragment {
            Self {
                imported_types: "UpdatableFragment, ReaderFragment",
                ast_type: "ReaderFragment",
                exported_type: Some(format!(
                    "UpdatableFragment<\n  {name}$fragmentType,\n  {name}$data,\n>",
                    name = fragment.name.item
                )),
            }
        } else {
            Self {
                imported_types: "Fragment, ReaderFragment",
                ast_type: "ReaderFragment",
                exported_type: Some(format!(
                    "Fragment<\n  {name}$fragmentType,\n  {name}$data,\n>",
                    name = fragment.name.item
                )),
            }
        }
    }
}
