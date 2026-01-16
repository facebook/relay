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
use graphql_syntax::EnumValueDefinition;
use graphql_syntax::FieldDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::InputObjectTypeDefinition;
use graphql_syntax::InputValueDefinition;
use graphql_syntax::IntNode;
use graphql_syntax::InterfaceTypeDefinition;
use graphql_syntax::List;
use graphql_syntax::ListTypeAnnotation;
use graphql_syntax::NamedTypeAnnotation;
use graphql_syntax::NonNullTypeAnnotation;
use graphql_syntax::ObjectTypeDefinition;
use graphql_syntax::OperationType;
use graphql_syntax::OperationTypeDefinition;
use graphql_syntax::ScalarTypeDefinition;
use graphql_syntax::SchemaDefinition;
use graphql_syntax::SchemaDocument;
use graphql_syntax::StringNode;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use graphql_syntax::TypeAnnotation;
use graphql_syntax::UnionTypeDefinition;
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
use crate::SetDirective;
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
        let root_schema_definition: Option<SchemaDefinition> = self.root_schema.to_sdl_definition();
        let root_schema_definitions = root_schema_definition.map_or(Vec::new(), |d| vec![d]);

        let mut directives = self
            .directives
            .values()
            .map(|d| d.to_sdl_definition())
            .collect::<Vec<_>>();
        directives.sort_by(|a, b| a.name.value.cmp(&b.name.value));

        let mut sorted_types = self.types.values().collect::<Vec<_>>();
        sorted_types.sort_by_key(|a| a.string_key_name());

        let definitions = directives
            .into_iter()
            .map(TypeSystemDefinition::DirectiveDefinition)
            .chain(
                root_schema_definitions
                    .into_iter()
                    .map(TypeSystemDefinition::SchemaDefinition),
            )
            .chain(
                sorted_types
                    .into_iter()
                    .map(|set_type| set_type.to_sdl_definition()),
            )
            .collect();

        SchemaDocument {
            location: Location::generated(),
            definitions,
        }
    }
}

impl ToSDLDefinition<Option<SchemaDefinition>> for SetRootSchema {
    fn to_sdl_definition(&self) -> Option<SchemaDefinition> {
        if self.is_empty() {
            return None;
        }

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

        Some(SchemaDefinition {
            directives: build_directives(&self.directives),
            operation_types: List {
                span: Span::empty(),
                start: build_token(TokenKind::OpenBrace),
                items: root_schema_types,
                end: build_token(TokenKind::CloseBrace),
            },
            description: build_description(&self.definition),
            span: Span::empty(),
        })
    }
}

impl ToSDLDefinition<DirectiveDefinition> for SetDirective {
    fn to_sdl_definition(&self) -> DirectiveDefinition {
        DirectiveDefinition {
            name: build_name(self.name.0),
            arguments: build_argument_definitions(&self.arguments),
            repeatable: self.repeatable,
            locations: self.locations.clone(),
            description: build_description(&self.definition),
            span: Span::empty(),
            hack_source: build_hack_source(&self.definition),
        }
    }
}

impl ToSDLDefinition<TypeSystemDefinition> for SetType {
    fn to_sdl_definition(&self) -> TypeSystemDefinition {
        match self {
            SetType::Scalar(set_scalar) => {
                TypeSystemDefinition::ScalarTypeDefinition(set_scalar.to_sdl_definition())
            }
            SetType::Enum(set_enum) => {
                TypeSystemDefinition::EnumTypeDefinition(set_enum.to_sdl_definition())
            }
            SetType::Object(set_object) => {
                TypeSystemDefinition::ObjectTypeDefinition(set_object.to_sdl_definition())
            }
            SetType::Interface(set_interface) => {
                TypeSystemDefinition::InterfaceTypeDefinition(set_interface.to_sdl_definition())
            }
            SetType::Union(set_union) => {
                TypeSystemDefinition::UnionTypeDefinition(set_union.to_sdl_definition())
            }
            SetType::InputObject(set_input_object) => {
                TypeSystemDefinition::InputObjectTypeDefinition(
                    set_input_object.to_sdl_definition(),
                )
            }
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
            items.sort_by(|a, b| a.name.value.cmp(&b.name.value));
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
    items.sort_by(|a, b| a.name.cmp(&b.name));
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
    arguments_vec.sort_by(|a, b| a.name.cmp(&b.name));

    Some(List {
        span: Span::empty(),
        start: build_token(TokenKind::OpenParen),
        items: arguments_vec,
        end: build_token(TokenKind::CloseParen),
    })
}

/// NOTE: we do NOT preserve the original order, instead sorting by directive name
fn build_directives(directives: &[DirectiveValue]) -> Vec<ConstantDirective> {
    let mut built: Vec<ConstantDirective> = directives
        .iter()
        .map(|directive| directive.to_sdl_definition())
        .collect();
    built.sort_by(|a, b| a.name.cmp(&b.name));
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
    items.sort_by(|a, b| a.name.value.cmp(&b.name.value));

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
