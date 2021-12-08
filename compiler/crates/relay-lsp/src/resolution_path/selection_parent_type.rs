/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_syntax::OperationKind;
use schema::{SDLSchema, Schema, Type};

use super::{
    FragmentDefinitionPath, InlineFragmentPath, LinkedFieldPath, OperationDefinitionPath,
    SelectionParent,
};

impl<'a> SelectionParent<'a> {
    pub fn find_parent_type(&self, schema: &SDLSchema) -> Option<Type> {
        match self {
            SelectionParent::OperationDefinitionSelection(OperationDefinitionPath {
                inner: operation_definition,
                parent: _,
            }) => match operation_definition.operation_kind() {
                OperationKind::Mutation => schema.mutation_type(),
                OperationKind::Query => schema.query_type(),
                OperationKind::Subscription => schema.subscription_type(),
            },
            SelectionParent::LinkedFieldSelection(LinkedFieldPath {
                inner: field,
                parent: selection_path,
            }) => {
                let parent_type = selection_path.parent.find_parent_type(schema)?;
                let field_id = schema.named_field(parent_type, field.name.value)?;
                let field = schema.field(field_id);
                Some(field.type_.inner())
            }
            SelectionParent::FragmentDefinitionSelection(FragmentDefinitionPath {
                inner: definition,
                parent: _,
            }) => schema.get_type(definition.type_condition.type_.value),
            SelectionParent::InlineFragmentSelection(InlineFragmentPath {
                inner: fragment,
                parent: selection_path,
            }) => match &fragment.type_condition {
                Some(condition) => schema.get_type(condition.type_.value),
                None => selection_path.parent.find_parent_type(schema),
            },
        }
    }

    pub fn find_type_path(&self, schema: &SDLSchema) -> Vec<Type> {
        match self {
            SelectionParent::OperationDefinitionSelection(OperationDefinitionPath {
                inner: operation_definition,
                parent: _,
            }) => match operation_definition.operation_kind() {
                OperationKind::Mutation => schema.mutation_type(),
                OperationKind::Query => schema.query_type(),
                OperationKind::Subscription => schema.subscription_type(),
            }
            .into_iter()
            .collect::<Vec<_>>(),
            SelectionParent::LinkedFieldSelection(LinkedFieldPath {
                inner: linked_field,
                parent: linked_field_selection_path,
            }) => {
                let mut path = linked_field_selection_path.parent.find_type_path(schema);
                if let Some(type_) = path
                    .last()
                    .and_then(|parent_type| {
                        schema.named_field(*parent_type, linked_field.name.value)
                    })
                    .map(|field_id| schema.field(field_id).type_.inner())
                {
                    path.push(type_)
                }
                path
            }
            SelectionParent::FragmentDefinitionSelection(FragmentDefinitionPath {
                inner: fragment_definition,
                parent: _,
            }) => {
                let type_ = fragment_definition.type_condition.type_.value;
                schema.get_type(type_).into_iter().collect::<Vec<_>>()
            }
            SelectionParent::InlineFragmentSelection(InlineFragmentPath {
                inner: inline_fragment,
                parent: inline_fragment_selection_path,
            }) => {
                let mut path = inline_fragment_selection_path.parent.find_type_path(schema);
                if let Some(type_) =
                    inline_fragment
                        .type_condition
                        .as_ref()
                        .and_then(|type_condition| {
                            let type_ = type_condition.type_.value;
                            schema.get_type(type_)
                        })
                {
                    path.push(type_)
                };
                path
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::resolution_path::{
        IdentParent, IdentPath, ResolutionPath, ResolvePosition, ScalarFieldPath,
    };

    use super::*;
    use common::{SourceLocationKey, Span};
    use graphql_syntax::{parse_executable_with_features, ParserFeatures};
    use intern::string_key::{Intern, StringKey};
    use relay_test_schema::get_test_schema;

    fn get_field_parent_type_name(source: &str, sub_str: &str) -> StringKey {
        let schema = get_test_schema();
        let document = parse_executable_with_features(
            source,
            SourceLocationKey::standalone("/test/file"),
            ParserFeatures {
                enable_variable_definitions: true,
            },
        )
        .unwrap();

        let pos = source.find(sub_str).unwrap() as u32;

        // Select the `uri` field
        let position_span = Span {
            start: pos,
            end: pos,
        };

        let resolved = document.resolve((), position_span);

        let selection_type = match resolved {
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent:
                    IdentParent::LinkedFieldName(LinkedFieldPath {
                        inner: _,
                        parent: selection,
                    }),
            }) => selection.parent.find_parent_type(&schema),
            ResolutionPath::Ident(IdentPath {
                inner: _,
                parent:
                    IdentParent::ScalarFieldName(ScalarFieldPath {
                        inner: _,
                        parent: selection,
                    }),
            }) => selection.parent.find_parent_type(&schema),
            _ => None,
        }
        .expect("Expected to get selection type.");

        schema.get_type_name(selection_type)
    }

    #[test]
    fn test_me() {
        let source = r#"
        query Foo {
            me {
                id
                ... {
                    name
                }
                emailAddresses
                screennames {
                    service
                }
                author {
                    author {
                        author {
                            username
                        }
                    }
                }
                ... on Actor {
                    websites
                }
            }
        }"#;
        assert_eq!(get_field_parent_type_name(source, "id"), "User".intern());
        assert_eq!(get_field_parent_type_name(source, "name"), "User".intern());
        assert_eq!(
            get_field_parent_type_name(source, "emailAddresses"),
            "User".intern()
        );
        assert_eq!(
            get_field_parent_type_name(source, "service"),
            "Screenname".intern()
        );
        assert_eq!(get_field_parent_type_name(source, "me"), "Query".intern());
        assert_eq!(
            get_field_parent_type_name(source, "username"),
            "User".intern()
        );
        assert_eq!(
            get_field_parent_type_name(source, "websites"),
            "Actor".intern()
        );
    }

    #[test]
    fn test_fragment_root() {
        let source = r#"
        fragment foo on User {
            id
        }"#;
        assert_eq!(get_field_parent_type_name(source, "id"), "User".intern());
    }
}
