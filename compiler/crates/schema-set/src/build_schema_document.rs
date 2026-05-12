/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DirectiveName;
use common::Location;
use common::Span;
use graphql_syntax::ConstantArgument;
use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::DefaultValue;
use graphql_syntax::DirectiveDefinition;
use graphql_syntax::EnumTypeDefinition;
use graphql_syntax::EnumTypeExtension;
use graphql_syntax::EnumValueDefinition;
use graphql_syntax::FieldDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::InputObjectTypeDefinition;
use graphql_syntax::InputObjectTypeExtension;
use graphql_syntax::InputValueDefinition;
use graphql_syntax::IntNode;
use graphql_syntax::InterfaceTypeDefinition;
use graphql_syntax::InterfaceTypeExtension;
use graphql_syntax::List;
use graphql_syntax::ListTypeAnnotation;
use graphql_syntax::NamedTypeAnnotation;
use graphql_syntax::NonNullTypeAnnotation;
use graphql_syntax::ObjectTypeDefinition;
use graphql_syntax::ObjectTypeExtension;
use graphql_syntax::OperationType;
use graphql_syntax::OperationTypeDefinition;
use graphql_syntax::ScalarTypeDefinition;
use graphql_syntax::ScalarTypeExtension;
use graphql_syntax::SchemaDefinition;
use graphql_syntax::SchemaDocument;
use graphql_syntax::SchemaExtension;
use graphql_syntax::StringNode;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use graphql_syntax::TypeAnnotation;
use graphql_syntax::UnionTypeDefinition;
use graphql_syntax::UnionTypeExtension;
use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use schema::ArgumentValue;
use schema::DirectiveValue;
use schema::TypeReference;
use schema::TypeSystemDefinition;

use crate::OutputNonNull;
use crate::OutputTypeReference;
use crate::SEMANTIC_NON_NULL;
use crate::SEMANTIC_NON_NULL_LEVELS_ARG;
use crate::SchemaDefinitionItem;
use crate::SchemaSet;
use crate::SetArgument;
use crate::SetArgumentValue;
use crate::SetDirective;
use crate::SetDirectiveValue;
use crate::SetEnum;
use crate::SetField;
use crate::SetInputObject;
use crate::SetInterface;
use crate::SetMemberType;
use crate::SetObject;
use crate::SetScalar;
use crate::SetType;
use crate::SetUnion;
use crate::StringKeyNamed;
use crate::schema_set::SetRootSchema;

pub trait ToSDLDefinition<T> {
    /// Creates a *fully, recursively sorted* SDL definition
    fn to_sdl_definition(&self) -> T;
}

impl ToSDLDefinition<SchemaDocument> for SchemaSet {
    fn to_sdl_definition(&self) -> SchemaDocument {
        let root_schema_definitions = if self.root_schema.is_empty() {
            Vec::new()
        } else {
            vec![self.root_schema.to_type_system_definition()]
        };

        let mut directives = self
            .directives
            .values()
            .map(|d| d.to_sdl_definition())
            .collect::<Vec<_>>();
        directives.sort_by_key(|a| a.name.value);

        let mut sorted_types = self.types.values().collect::<Vec<_>>();
        sorted_types.sort_by_key(|a| a.string_key_name());

        let definitions = directives
            .into_iter()
            .map(TypeSystemDefinition::DirectiveDefinition)
            .chain(root_schema_definitions)
            .chain(
                sorted_types
                    .into_iter()
                    .map(|set_type| set_type.to_type_system_definition()),
            )
            .collect();

        SchemaDocument {
            location: Location::generated(),
            definitions,
        }
    }
}

/// Convert a set entry into a `TypeSystemDefinition`. Implementors use the
/// `self.definition.is_none()` pattern to decide whether to emit a base
/// `*TypeDefinition` (when a top-level `definition` is present, i.e. the
/// entry was originally declared as `type X { ... }` etc., possibly merged
/// with extensions on top) or a `*TypeExtension` (when the entry only ever
/// appeared as `extend X { ... }`). Without this dispatch, an extension-only
/// entry would be printed as a fresh `type X { ... }` and conflict with the
/// base `type X { ... }` from a paired SDL document via
/// `SchemaError::DuplicateType` inside `SDLSchema::build`.
pub trait ToTypeSystemDefinition {
    fn to_type_system_definition(&self) -> TypeSystemDefinition;
}

impl ToSDLDefinition<SchemaDefinition> for SetRootSchema {
    fn to_sdl_definition(&self) -> SchemaDefinition {
        let mut root_schema_types = Vec::new();
        if let Some(op_type) = self.query_type {
            root_schema_types.push(OperationTypeDefinition {
                operation: OperationType::Query,
                type_: build_name(op_type),
                span: Span::empty(),
            });
        }
        if let Some(op_type) = self.mutation_type {
            root_schema_types.push(OperationTypeDefinition {
                operation: OperationType::Mutation,
                type_: build_name(op_type),
                span: Span::empty(),
            });
        }
        if let Some(op_type) = self.subscription_type {
            root_schema_types.push(OperationTypeDefinition {
                operation: OperationType::Subscription,
                type_: build_name(op_type),
                span: Span::empty(),
            });
        }

        SchemaDefinition {
            directives: build_directives(&self.directives),
            operation_types: List {
                span: Span::empty(),
                start: build_token(TokenKind::OpenBrace),
                items: root_schema_types,
                end: build_token(TokenKind::CloseBrace),
            },
            description: build_description(&self.definition),
            span: Span::empty(),
        }
    }
}

impl ToTypeSystemDefinition for SetRootSchema {
    fn to_type_system_definition(&self) -> TypeSystemDefinition {
        let root_definition = self.to_sdl_definition();
        if self.definition.is_none() {
            TypeSystemDefinition::SchemaExtension(SchemaExtension {
                directives: root_definition.directives,
                operation_types: if root_definition.operation_types.items.is_empty() {
                    None
                } else {
                    Some(root_definition.operation_types)
                },
                span: root_definition.span,
            })
        } else {
            TypeSystemDefinition::SchemaDefinition(root_definition)
        }
    }
}

impl ToTypeSystemDefinition for SetType {
    fn to_type_system_definition(&self) -> TypeSystemDefinition {
        match self {
            SetType::Scalar(set_scalar) => set_scalar.to_type_system_definition(),
            SetType::Enum(set_enum) => set_enum.to_type_system_definition(),
            SetType::Object(set_object) => set_object.to_type_system_definition(),
            SetType::Interface(set_interface) => set_interface.to_type_system_definition(),
            SetType::Union(set_union) => set_union.to_type_system_definition(),
            SetType::InputObject(set_input_object) => set_input_object.to_type_system_definition(),
        }
    }
}

impl ToSDLDefinition<DirectiveDefinition> for SetDirective {
    fn to_sdl_definition(&self) -> DirectiveDefinition {
        // NOTE: we do NOT sort strictly alphabetically, but instead by the ordering in the SPEC
        // https://spec.graphql.org/draft/#DirectiveLocation
        // That ordering is followed in the DirectiveLocation enum
        let mut locations = self.locations.clone();
        locations.sort();
        DirectiveDefinition {
            name: build_name(self.name.0),
            arguments: build_argument_definitions(&self.arguments),
            repeatable: self.repeatable,
            locations,
            description: build_description(&self.definition),
            span: Span::empty(),
            hack_source: build_hack_source(&self.definition),
        }
    }
}

impl ToSDLDefinition<ScalarTypeDefinition> for SetScalar {
    fn to_sdl_definition(&self) -> ScalarTypeDefinition {
        ScalarTypeDefinition {
            name: build_name(self.name.0),
            directives: build_directives(&self.directives),
            description: build_description(&self.definition),
            span: Span::empty(),
        }
    }
}

impl ToTypeSystemDefinition for SetScalar {
    fn to_type_system_definition(&self) -> TypeSystemDefinition {
        let definition = self.to_sdl_definition();
        if self.definition.is_none() {
            // `*Extension` syntax nodes do not carry a description.
            TypeSystemDefinition::ScalarTypeExtension(ScalarTypeExtension {
                name: definition.name,
                directives: definition.directives,
                span: definition.span,
            })
        } else {
            TypeSystemDefinition::ScalarTypeDefinition(definition)
        }
    }
}

impl ToSDLDefinition<EnumTypeDefinition> for SetEnum {
    fn to_sdl_definition(&self) -> EnumTypeDefinition {
        let items = self
            .values
            .values()
            .map(|value| EnumValueDefinition {
                name: build_name(value.value),
                directives: build_directives(&value.directives),
                description: value.description.map(build_string_node),
                span: Span::empty(),
            })
            .collect::<Vec<_>>();

        let values = if items.is_empty() {
            None
        } else {
            Some(List {
                span: Span::empty(),
                start: build_token(TokenKind::OpenBrace),
                items,
                end: build_token(TokenKind::CloseBrace),
            })
        };

        EnumTypeDefinition {
            name: build_name(self.name.0),
            directives: build_directives(&self.directives),
            values,
            description: build_description(&self.definition),
            span: Span::empty(),
        }
    }
}

impl ToTypeSystemDefinition for SetEnum {
    fn to_type_system_definition(&self) -> TypeSystemDefinition {
        let definition = self.to_sdl_definition();
        if self.definition.is_none() {
            TypeSystemDefinition::EnumTypeExtension(EnumTypeExtension {
                name: definition.name,
                directives: definition.directives,
                values: definition.values,
                span: definition.span,
            })
        } else {
            TypeSystemDefinition::EnumTypeDefinition(definition)
        }
    }
}

impl ToSDLDefinition<ObjectTypeDefinition> for SetObject {
    fn to_sdl_definition(&self) -> ObjectTypeDefinition {
        ObjectTypeDefinition {
            name: build_name(self.name.0),
            interfaces: build_members(&self.interfaces),
            directives: build_directives(&self.directives),
            fields: build_fields(&self.fields),
            description: build_description(&self.definition),
            span: Span::empty(),
        }
    }
}

impl ToTypeSystemDefinition for SetObject {
    fn to_type_system_definition(&self) -> TypeSystemDefinition {
        let definition = self.to_sdl_definition();
        if self.definition.is_none() {
            TypeSystemDefinition::ObjectTypeExtension(ObjectTypeExtension {
                name: definition.name,
                interfaces: definition.interfaces,
                directives: definition.directives,
                fields: definition.fields,
                span: definition.span,
            })
        } else {
            TypeSystemDefinition::ObjectTypeDefinition(definition)
        }
    }
}

impl ToSDLDefinition<InterfaceTypeDefinition> for SetInterface {
    fn to_sdl_definition(&self) -> InterfaceTypeDefinition {
        InterfaceTypeDefinition {
            name: build_name(self.name.0),
            interfaces: build_members(&self.interfaces),
            directives: build_directives(&self.directives),
            fields: build_fields(&self.fields),
            description: build_description(&self.definition),
            span: Span::empty(),
        }
    }
}

impl ToTypeSystemDefinition for SetInterface {
    fn to_type_system_definition(&self) -> TypeSystemDefinition {
        let definition = self.to_sdl_definition();
        if self.definition.is_none() {
            TypeSystemDefinition::InterfaceTypeExtension(InterfaceTypeExtension {
                name: definition.name,
                interfaces: definition.interfaces,
                directives: definition.directives,
                fields: definition.fields,
                span: definition.span,
            })
        } else {
            TypeSystemDefinition::InterfaceTypeDefinition(definition)
        }
    }
}

impl ToSDLDefinition<UnionTypeDefinition> for SetUnion {
    fn to_sdl_definition(&self) -> UnionTypeDefinition {
        UnionTypeDefinition {
            name: build_name(self.name.0),
            directives: build_directives(&self.directives),
            members: build_members(&self.members),
            description: build_description(&self.definition),
            span: Span::empty(),
        }
    }
}

impl ToTypeSystemDefinition for SetUnion {
    fn to_type_system_definition(&self) -> TypeSystemDefinition {
        let definition = self.to_sdl_definition();
        if self.definition.is_none() {
            TypeSystemDefinition::UnionTypeExtension(UnionTypeExtension {
                name: definition.name,
                directives: definition.directives,
                members: definition.members,
                span: definition.span,
            })
        } else {
            TypeSystemDefinition::UnionTypeDefinition(definition)
        }
    }
}

impl ToSDLDefinition<InputObjectTypeDefinition> for SetInputObject {
    fn to_sdl_definition(&self) -> InputObjectTypeDefinition {
        let fields = if self.fields.is_empty() {
            None
        } else {
            let mut items = self
                .fields
                .values()
                .map(|value| value.to_sdl_definition())
                .collect::<Vec<_>>();
            items.sort_by_key(|a| a.name.value);
            Some(List {
                span: Span::empty(),
                start: build_token(TokenKind::OpenBrace),
                items,
                end: build_token(TokenKind::CloseBrace),
            })
        };
        InputObjectTypeDefinition {
            name: build_name(self.name.0),
            directives: build_directives(&self.directives),
            fields,
            description: build_description(&self.definition),
            span: Span::empty(),
        }
    }
}

impl ToTypeSystemDefinition for SetInputObject {
    fn to_type_system_definition(&self) -> TypeSystemDefinition {
        let definition = self.to_sdl_definition();
        if self.definition.is_none() {
            TypeSystemDefinition::InputObjectTypeExtension(InputObjectTypeExtension {
                name: definition.name,
                directives: definition.directives,
                fields: definition.fields,
                span: definition.span,
            })
        } else {
            TypeSystemDefinition::InputObjectTypeDefinition(definition)
        }
    }
}

impl ToSDLDefinition<ConstantDirective> for DirectiveValue {
    fn to_sdl_definition(&self) -> ConstantDirective {
        ConstantDirective {
            span: Span::empty(),
            name: build_name(self.name.0),
            arguments: build_arguments(&self.arguments),
            at: build_token(TokenKind::At),
        }
    }
}

impl ToSDLDefinition<InputValueDefinition> for SetArgument {
    fn to_sdl_definition(&self) -> InputValueDefinition {
        InputValueDefinition {
            name: build_name(self.name),
            type_: self.type_.to_sdl_definition(),
            span: Span::empty(),
            default_value: self
                .default_value
                .as_ref()
                .map(|constant_value| DefaultValue {
                    span: Span::empty(),
                    equals: build_token(TokenKind::Equals),
                    value: constant_value.clone(),
                }),
            directives: build_directives(&self.directives),
            description: build_description(&self.definition),
        }
    }
}

impl ToSDLDefinition<FieldDefinition> for SetField {
    fn to_sdl_definition(&self) -> FieldDefinition {
        let mut directives = build_directives(&self.directives);
        let (type_, semantic_non_null_directive) =
            output_type_ref_to_semantic_sdl_type(&self.type_);
        if let Some(semantic_non_null) = semantic_non_null_directive {
            directives.push(semantic_non_null);
        }

        FieldDefinition {
            name: build_name(self.name.0),
            type_,
            arguments: build_argument_definitions(&self.arguments),
            directives,
            description: build_description(&self.definition),
            span: Span::empty(),
            hack_source: build_hack_source(&self.definition),
        }
    }
}

impl ToSDLDefinition<TypeAnnotation> for TypeReference<StringKey> {
    fn to_sdl_definition(&self) -> TypeAnnotation {
        match self {
            TypeReference::Named(name) => TypeAnnotation::Named(NamedTypeAnnotation {
                name: build_name(*name),
            }),
            TypeReference::NonNull(inner) => {
                TypeAnnotation::NonNull(Box::new(NonNullTypeAnnotation {
                    span: Span::empty(),
                    type_: inner.to_sdl_definition(),
                    exclamation: build_token(TokenKind::Exclamation),
                }))
            }
            TypeReference::List(inner) => TypeAnnotation::List(Box::new(ListTypeAnnotation {
                span: Span::empty(),
                open: build_token(TokenKind::OpenBracket),
                type_: inner.to_sdl_definition(),
                close: build_token(TokenKind::CloseBracket),
            })),
        }
    }
}

// Because of Semantic NonNull, we can't use the standard ToSDLDefinition for OutputTypeReference:
// we need to keep track of the levels for @semanticNonNull(levels:)
// This returns the type and @semanticNonNull directive, if applicable.
pub(crate) fn output_type_ref_to_semantic_sdl_type(
    this: &OutputTypeReference<StringKey>,
) -> (TypeAnnotation, Option<ConstantDirective>) {
    let (type_annotation, mut semantic_non_null_levels) =
        output_type_ref_to_full_type_with_semantic_non_null_levels(this, 0);
    semantic_non_null_levels.reverse();

    let semantic_non_null = if semantic_non_null_levels.is_empty() {
        None
    } else if let Some(0) = semantic_non_null_levels.last() {
        Some(ConstantDirective {
            span: Span::empty(),
            at: build_token(TokenKind::At),
            name: build_name(SEMANTIC_NON_NULL.0),
            arguments: None,
        })
    } else {
        // There is more than 1 level, OR the one level defined is deeper than 0.
        Some(ConstantDirective {
            span: Span::empty(),
            at: build_token(TokenKind::At),
            name: build_name(SEMANTIC_NON_NULL.0),
            arguments: Some(List {
                span: Span::empty(),
                start: build_token(TokenKind::OpenParen),
                items: vec![ConstantArgument {
                    span: Span::empty(),
                    name: build_name(SEMANTIC_NON_NULL_LEVELS_ARG.0),
                    colon: build_token(TokenKind::Colon),
                    value: ConstantValue::List(List {
                        span: Span::empty(),
                        start: build_token(TokenKind::OpenBracket),
                        items: semantic_non_null_levels
                            .into_iter()
                            .map(|level| {
                                ConstantValue::Int(IntNode {
                                    token: build_token(TokenKind::IntegerLiteral),
                                    value: level,
                                })
                            })
                            .collect(),
                        end: build_token(TokenKind::CloseBracket),
                    }),
                }],
                end: build_token(TokenKind::CloseParen),
            }),
        })
    };

    (type_annotation, semantic_non_null)
}

// Note the inner vec comes out reversed!
fn output_type_ref_to_full_type_with_semantic_non_null_levels(
    this: &OutputTypeReference<StringKey>,
    level: i64,
) -> (TypeAnnotation, Vec<i64>) {
    match this {
        OutputTypeReference::Named(name) => (
            TypeAnnotation::Named(NamedTypeAnnotation {
                name: build_name(*name),
            }),
            Default::default(),
        ),
        OutputTypeReference::NonNull(OutputNonNull::KillsParent(inner)) => {
            let (inner_type, inner_semantic_levels) =
                output_type_ref_to_full_type_with_semantic_non_null_levels(inner, level);
            (
                TypeAnnotation::NonNull(Box::new(NonNullTypeAnnotation {
                    span: Span::empty(),
                    type_: inner_type,
                    exclamation: build_token(TokenKind::Exclamation),
                })),
                inner_semantic_levels,
            )
        }
        OutputTypeReference::NonNull(OutputNonNull::Semantic(inner)) => {
            let (inner_type, mut inner_semantic_levels) =
                output_type_ref_to_full_type_with_semantic_non_null_levels(inner, level);
            inner_semantic_levels.push(level);
            (inner_type, inner_semantic_levels)
        }
        OutputTypeReference::List(inner) => {
            let (inner_type, inner_semantic_levels) =
                output_type_ref_to_full_type_with_semantic_non_null_levels(inner, level + 1);
            (
                TypeAnnotation::List(Box::new(ListTypeAnnotation {
                    span: Span::empty(),
                    open: build_token(TokenKind::OpenBracket),
                    type_: inner_type,
                    close: build_token(TokenKind::CloseBracket),
                })),
                inner_semantic_levels,
            )
        }
    }
}

impl ToSDLDefinition<Identifier> for DirectiveName {
    fn to_sdl_definition(&self) -> Identifier {
        Identifier {
            span: Span::empty(),
            token: build_token(TokenKind::Identifier),
            value: self.0.clone(),
        }
    }
}

impl ToSDLDefinition<ConstantArgument> for SetArgumentValue {
    fn to_sdl_definition(&self) -> ConstantArgument {
        self.to_argument_value().to_sdl_definition()
    }
}

impl ToSDLDefinition<ConstantArgument> for ArgumentValue {
    fn to_sdl_definition(&self) -> ConstantArgument {
        ConstantArgument {
            span: Span::empty(),
            name: build_name(self.name.0),
            colon: build_token(TokenKind::Colon),
            value: self.value.clone(),
        }
    }
}

fn build_name(name: StringKey) -> Identifier {
    Identifier {
        span: Span::empty(),
        token: build_token(TokenKind::Identifier),
        value: name,
    }
}

/// NOTE: we do NOT preserve the original order, instead sorting by argument name
fn build_argument_definitions(
    arguments: &StringKeyIndexMap<SetArgument>,
) -> Option<List<InputValueDefinition>> {
    if arguments.is_empty() {
        return None;
    }
    let mut items: Vec<InputValueDefinition> = arguments
        .values()
        .map(|arg| arg.to_sdl_definition())
        .collect();
    items.sort_by_key(|a| a.name);
    Some(List {
        span: Span::empty(),
        start: build_token(TokenKind::OpenParen),
        items,
        end: build_token(TokenKind::CloseParen),
    })
}

/// NOTE: we do NOT preserve the original order, instead sorting by argument name
fn build_arguments(arguments: &[ArgumentValue]) -> Option<List<ConstantArgument>> {
    if arguments.is_empty() {
        return None;
    }

    let mut arguments_vec: Vec<ConstantArgument> = arguments
        .iter()
        .map(|arg| arg.to_sdl_definition())
        .collect();
    arguments_vec.sort_by_key(|a| a.name);

    Some(List {
        span: Span::empty(),
        start: build_token(TokenKind::OpenParen),
        items: arguments_vec,
        end: build_token(TokenKind::CloseParen),
    })
}

/// NOTE: we do NOT preserve the original order, instead sorting by directive name
fn build_directives(directives: &[SetDirectiveValue]) -> Vec<ConstantDirective> {
    let mut built: Vec<ConstantDirective> = directives
        .iter()
        .map(|directive| directive.to_directive_value().to_sdl_definition())
        .collect();
    built.sort_by_key(|a| a.name);
    built
}

fn build_description(definition_item: &Option<SchemaDefinitionItem>) -> Option<StringNode> {
    definition_item
        .as_ref()
        .and_then(|d| d.description)
        .map(|value| StringNode {
            token: build_token(TokenKind::BlockStringLiteral),
            value,
        })
}

/// NOTE: we do NOT preserve the original order, instead sorting by member name
fn build_members(members: &StringKeyIndexMap<SetMemberType>) -> Vec<Identifier> {
    let mut built: Vec<Identifier> = members
        .values()
        .map(|member| build_name(member.name))
        .collect();
    built.sort();
    built
}

fn build_fields(fields: &StringKeyMap<SetField>) -> Option<List<FieldDefinition>> {
    if fields.is_empty() {
        return None;
    }

    let mut items: Vec<FieldDefinition> = fields
        .values()
        .map(|field| field.to_sdl_definition())
        .collect();
    items.sort_by_key(|a| a.name.value);

    Some(List {
        span: Span::empty(),
        start: build_token(TokenKind::OpenBrace),
        items,
        end: build_token(TokenKind::CloseBrace),
    })
}

fn build_hack_source(definition_item: &Option<SchemaDefinitionItem>) -> Option<StringNode> {
    definition_item
        .as_ref()
        .and_then(|d| d.hack_source)
        .map(|value| StringNode {
            token: build_token(TokenKind::StringLiteral),
            value,
        })
}

fn build_token(kind: TokenKind) -> Token {
    Token {
        span: Span::empty(),
        kind,
    }
}

fn build_string_node(value: StringKey) -> StringNode {
    StringNode {
        token: build_token(TokenKind::BlockStringLiteral),
        value,
    }
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;
    use indoc::indoc;

    use super::*;

    fn set_from_str(sdl: &str) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
    }

    fn schema_sdl(sdl: &str) -> String {
        format!("{}", set_from_str(sdl).to_sdl_definition())
    }

    #[test]
    fn test_directive_locations_sorted_alphabetically() {
        let schema = set_from_str("directive @x on SUBSCRIPTION | QUERY | FIELD | MUTATION");
        let sdl = format!("{}", schema.to_sdl_definition());
        assert!(
            sdl.contains("directive @x on QUERY | MUTATION | SUBSCRIPTION | FIELD"),
            "Expected directive locations to be sorted by location, got: {}",
            sdl,
        );
    }

    // --- Scalar ---

    #[test]
    fn test_scalar_simple() {
        let sdl = schema_sdl("scalar URL");
        assert!(sdl.contains("scalar URL"), "Got: {}", sdl);
    }

    #[test]
    fn test_scalar_with_directive() {
        let sdl = schema_sdl("scalar JSON @deprecated");
        assert!(sdl.contains("scalar JSON @deprecated"), "Got: {}", sdl,);
    }

    // --- Enum ---

    #[test]
    fn test_enum_with_values() {
        let sdl = schema_sdl(indoc! {r#"
            enum Color {
              RED
              GREEN
              BLUE
            }
        "#});
        assert!(sdl.contains("enum Color"), "Got: {}", sdl);
        assert!(sdl.contains("RED"), "Got: {}", sdl);
        assert!(sdl.contains("GREEN"), "Got: {}", sdl);
        assert!(sdl.contains("BLUE"), "Got: {}", sdl);
    }

    #[test]
    fn test_enum_empty() {
        let sdl = schema_sdl("enum EmptyEnum");
        assert!(sdl.contains("enum EmptyEnum"), "Got: {}", sdl);
        // No braces when values are empty
        assert!(!sdl.contains('{'), "Got: {}", sdl);
    }

    #[test]
    fn test_enum_with_directive() {
        let sdl = schema_sdl(indoc! {r#"
            enum Status @deprecated {
              ACTIVE
              INACTIVE
            }
        "#});
        assert!(sdl.contains("@deprecated"), "Got: {}", sdl);
    }

    // --- Object ---

    #[test]
    fn test_object_with_fields() {
        let sdl = schema_sdl(indoc! {r#"
            type User {
              id: ID!
              name: String
            }
        "#});
        assert!(sdl.contains("type User"), "Got: {}", sdl);
        assert!(sdl.contains("id: ID!"), "Got: {}", sdl);
        assert!(sdl.contains("name: String"), "Got: {}", sdl);
    }

    #[test]
    fn test_object_with_interfaces() {
        let sdl = schema_sdl(indoc! {r#"
            interface Node {
              id: ID!
            }
            type User implements Node {
              id: ID!
            }
        "#});
        assert!(sdl.contains("type User implements Node"), "Got: {}", sdl);
    }

    #[test]
    fn test_object_with_directive() {
        let sdl = schema_sdl(indoc! {r#"
            type Foo @deprecated {
              bar: String
            }
        "#});
        assert!(sdl.contains("@deprecated"), "Got: {}", sdl);
    }

    #[test]
    fn test_object_fields_sorted_alphabetically() {
        let sdl = schema_sdl(indoc! {r#"
            type Foo {
              zebra: String
              apple: Int
              mango: Boolean
            }
        "#});
        // Fields should be sorted alphabetically
        let apple_pos = sdl.find("apple").expect("apple not found");
        let mango_pos = sdl.find("mango").expect("mango not found");
        let zebra_pos = sdl.find("zebra").expect("zebra not found");
        assert!(
            apple_pos < mango_pos && mango_pos < zebra_pos,
            "Fields should be sorted: {}",
            sdl,
        );
    }

    // --- Interface ---

    #[test]
    fn test_interface_with_fields() {
        let sdl = schema_sdl(indoc! {r#"
            interface Node {
              id: ID!
            }
        "#});
        assert!(sdl.contains("interface Node"), "Got: {}", sdl);
        assert!(sdl.contains("id: ID!"), "Got: {}", sdl);
    }

    #[test]
    fn test_interface_implementing_interface() {
        let sdl = schema_sdl(indoc! {r#"
            interface Base {
              id: ID!
            }
            interface Child implements Base {
              id: ID!
              name: String
            }
        "#});
        assert!(
            sdl.contains("interface Child implements Base"),
            "Got: {}",
            sdl,
        );
    }

    // --- Union ---

    #[test]
    fn test_union_with_members() {
        let sdl = schema_sdl(indoc! {r#"
            type Dog {
              name: String
            }
            type Cat {
              name: String
            }
            union Animal = Cat | Dog
        "#});
        assert!(sdl.contains("union Animal = Cat | Dog"), "Got: {}", sdl,);
    }

    // --- InputObject ---

    #[test]
    fn test_input_object_with_fields() {
        let sdl = schema_sdl(indoc! {r#"
            input CreateUserInput {
              name: String!
              email: String
            }
        "#});
        assert!(sdl.contains("input CreateUserInput"), "Got: {}", sdl);
        assert!(sdl.contains("name: String!"), "Got: {}", sdl);
        assert!(sdl.contains("email: String"), "Got: {}", sdl);
    }

    #[test]
    fn test_input_object_fields_sorted() {
        let sdl = schema_sdl(indoc! {r#"
            input SearchInput {
              query: String
              limit: Int
              offset: Int
            }
        "#});
        let limit_pos = sdl.find("limit").expect("limit not found");
        let offset_pos = sdl.find("offset").expect("offset not found");
        let query_pos = sdl.find("query").expect("query not found");
        assert!(
            limit_pos < offset_pos && offset_pos < query_pos,
            "Input fields should be sorted: {}",
            sdl,
        );
    }

    // --- Field with arguments ---

    #[test]
    fn test_field_with_arguments() {
        let sdl = schema_sdl(indoc! {r#"
            type Query {
              user(id: ID!): String
            }
        "#});
        assert!(sdl.contains("user(id: ID!)"), "Got: {}", sdl);
    }

    // --- Argument with default value ---

    #[test]
    fn test_argument_with_default_value() {
        let sdl = schema_sdl(indoc! {r#"
            type Query {
              users(limit: Int = 10): String
            }
        "#});
        assert!(sdl.contains("limit: Int = 10"), "Got: {}", sdl);
    }

    // --- output_type_ref_to_semantic_sdl_type ---

    #[test]
    fn test_output_type_ref_named_no_semantic() {
        use intern::string_key::Intern;
        let type_ref = OutputTypeReference::Named("String".intern());
        let (annotation, directive) = output_type_ref_to_semantic_sdl_type(&type_ref);
        assert!(
            matches!(annotation, TypeAnnotation::Named(_)),
            "Expected Named annotation"
        );
        assert!(directive.is_none(), "No @semanticNonNull for Named type");
    }

    #[test]
    fn test_output_type_ref_kills_parent_non_null() {
        use intern::string_key::Intern;
        let type_ref = OutputTypeReference::NonNull(OutputNonNull::KillsParent(Box::new(
            OutputTypeReference::Named("String".intern()),
        )));
        let (annotation, directive) = output_type_ref_to_semantic_sdl_type(&type_ref);
        assert!(
            matches!(annotation, TypeAnnotation::NonNull(_)),
            "Expected NonNull annotation"
        );
        assert!(
            directive.is_none(),
            "KillsParent NonNull should not produce @semanticNonNull"
        );
    }

    #[test]
    fn test_output_type_ref_semantic_non_null() {
        use intern::string_key::Intern;
        let type_ref = OutputTypeReference::NonNull(OutputNonNull::Semantic(Box::new(
            OutputTypeReference::Named("String".intern()),
        )));
        let (annotation, directive) = output_type_ref_to_semantic_sdl_type(&type_ref);
        // Semantic non-null strips the non-null from the type annotation
        assert!(
            matches!(annotation, TypeAnnotation::Named(_)),
            "Expected Named annotation (semantic non-null strips nullability)"
        );
        assert!(
            directive.is_some(),
            "Semantic NonNull should produce @semanticNonNull directive"
        );
        let dir = directive.unwrap();
        assert_eq!(dir.name.value, SEMANTIC_NON_NULL.0);
    }

    // --- SchemaSet round-trip ---

    #[test]
    fn test_round_trip_schema() {
        let input = indoc! {r#"
            directive @deprecated on FIELD_DEFINITION

            scalar URL

            enum Status {
              ACTIVE
              INACTIVE
            }

            type Query {
              user(id: ID!): User
            }

            type User {
              id: ID!
              name: String
              status: Status
            }

            input CreateUserInput {
              name: String!
            }
        "#};

        let set = set_from_str(input);
        let sdl_doc: SchemaDocument = set.to_sdl_definition();
        let output = format!("{}", sdl_doc);

        // Re-parse the output
        let reparsed = parse_schema_document(&output, SourceLocationKey::generated());
        assert!(
            reparsed.is_ok(),
            "Round-tripped SDL should be parseable, got error: {:?}",
            reparsed.err()
        );
    }

    // --- Directives sorted ---

    #[test]
    fn test_types_and_directives_sorted_in_output() {
        let sdl = schema_sdl(indoc! {r#"
            directive @z on OBJECT
            directive @a on FIELD_DEFINITION
            type Zebra { z: String }
            type Apple { a: String }
        "#});
        let a_dir_pos = sdl.find("@a").expect("@a not found");
        let z_dir_pos = sdl.find("@z").expect("@z not found");
        // Directives should be sorted a before z
        assert!(
            a_dir_pos < z_dir_pos,
            "Directives should be sorted: {}",
            sdl
        );

        let apple_pos = sdl.find("type Apple").expect("type Apple not found");
        let zebra_pos = sdl.find("type Zebra").expect("type Zebra not found");
        // Types should be sorted alphabetically
        assert!(apple_pos < zebra_pos, "Types should be sorted: {}", sdl);
    }

    // --- Extension round-tripping ---

    /// An entry that only ever appears as `extend interface Foo { ... }` (with
    /// no base `interface Foo { ... }` anywhere in the SchemaSet) must be
    /// printed back out as an extension. Otherwise downstream consumers that
    /// pair this output with a base SDL document containing the original
    /// `interface Foo { ... }` will hit `SchemaError::DuplicateType("Foo")`
    /// when they call `SDLSchema::build`.
    #[test]
    fn test_extension_only_type_round_trips_as_extension() {
        let extension_sdl = "extend interface Foo { extension: String }";
        let extension_doc =
            parse_schema_document(extension_sdl, SourceLocationKey::generated()).unwrap();
        let set = SchemaSet::from_schema_documents_with_extensions(&[], &[extension_doc]).unwrap();

        let printed = format!("{}", set.to_sdl_definition());

        assert!(
            printed.contains("extend interface Foo"),
            "Expected output to contain `extend interface Foo`, got:\n{}",
            printed,
        );
        assert!(
            !printed
                .split('\n')
                .any(|line| line.starts_with("interface Foo")),
            "Output should not contain a bare `interface Foo` definition (only \
             `extend interface Foo`), got:\n{}",
            printed,
        );
    }

    /// When a type has BOTH a base definition and one or more extensions in
    /// the same SchemaSet, the merged result still has a top-level definition
    /// and must be printed as a single `interface Foo { ... }` (not a
    /// definition + an extension). This is the historical behaviour and the
    /// extension-side fix above must not regress it.
    #[test]
    fn test_base_plus_extension_round_trips_as_single_definition() {
        let base_doc = parse_schema_document(
            "interface Foo { base: String }",
            SourceLocationKey::generated(),
        )
        .unwrap();
        let ext_doc = parse_schema_document(
            "extend interface Foo { extension: String }",
            SourceLocationKey::generated(),
        )
        .unwrap();
        let set =
            SchemaSet::from_schema_documents_with_extensions(&[base_doc], &[ext_doc]).unwrap();

        let printed = format!("{}", set.to_sdl_definition());

        assert!(
            printed.contains("interface Foo {"),
            "Expected output to contain `interface Foo {{`, got:\n{}",
            printed,
        );
        assert!(
            !printed.contains("extend interface Foo"),
            "Output should not contain `extend interface Foo` once a base \
             definition is present, got:\n{}",
            printed,
        );
        assert!(
            printed.contains("base: String") && printed.contains("extension: String"),
            "Both base and extension fields should be present, got:\n{}",
            printed,
        );
    }
}
