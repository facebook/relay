/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Span;
use graphql_syntax::ConstantDirective;
use graphql_syntax::FieldDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::InterfaceTypeExtension;
use graphql_syntax::List;
use graphql_syntax::ObjectTypeDefinition;
use graphql_syntax::ObjectTypeExtension;
use graphql_syntax::ScalarTypeDefinition;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use relay_transforms::RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE;
use schema::TypeSystemDefinition;

/// Mark schema definitions as base schema extension (add special directive to the type/field)
/// This directive is used by other stages of Relay to know if artifacts for these types have
/// already been generated.
pub fn mark_extension_as_base(definition: TypeSystemDefinition) -> TypeSystemDefinition {
    match definition {
        TypeSystemDefinition::ObjectTypeDefinition(def) => {
            TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
                directives: merge_directives(
                    &def.directives,
                    &[belongs_to_base_schema_directive()],
                ),
                ..def
            })
        }
        TypeSystemDefinition::ScalarTypeDefinition(def) => {
            TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition {
                directives: merge_directives(
                    &def.directives,
                    &[belongs_to_base_schema_directive()],
                ),
                ..def
            })
        }
        TypeSystemDefinition::ObjectTypeExtension(def) => {
            TypeSystemDefinition::ObjectTypeExtension(ObjectTypeExtension {
                fields: mark_fields_as_base(def.fields),
                ..def
            })
        }
        TypeSystemDefinition::InterfaceTypeExtension(def) => {
            TypeSystemDefinition::InterfaceTypeExtension(InterfaceTypeExtension {
                fields: mark_fields_as_base(def.fields),
                ..def
            })
        }
        _ => panic!(
            "Expected docblocks to only expose object and scalar definitions, and object and interface extensions."
        ),
    }
}

/// Mark fields as base schema extension fields
fn mark_fields_as_base(fields: Option<List<FieldDefinition>>) -> Option<List<FieldDefinition>> {
    fields.map(|list| List {
        items: list
            .items
            .iter()
            .map(|item| FieldDefinition {
                directives: merge_directives(
                    &item.directives,
                    &[belongs_to_base_schema_directive()],
                ),
                ..item.clone()
            })
            .collect(),
        ..list
    })
}

/// Merge two lists of directives
fn merge_directives(a: &[ConstantDirective], b: &[ConstantDirective]) -> Vec<ConstantDirective> {
    if a.is_empty() {
        b.to_vec()
    } else if b.is_empty() {
        a.to_vec()
    } else {
        let mut directives = a.to_vec();
        directives.extend(b.iter().cloned());
        directives
    }
}

/// Create special directive to mark types/fields as belonging to base schema
fn belongs_to_base_schema_directive() -> ConstantDirective {
    ConstantDirective {
        name: Identifier {
            value: RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE.0,
            span: Span::empty(),
            token: Token {
                span: Span::empty(),
                kind: TokenKind::Empty,
            },
        },
        arguments: None,
        span: Span::empty(),
        at: Token {
            span: Span::empty(),
            kind: TokenKind::Empty,
        },
    }
}
