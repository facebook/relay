/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Location, Span, WithLocation};
use graphql_syntax::{
    ConstantArgument, ConstantDirective, ConstantValue, FieldDefinition, Identifier, List,
    NamedTypeAnnotation, ObjectTypeExtension, SchemaDocument, StringNode, Token, TokenKind,
    TypeAnnotation, TypeSystemDefinition,
};
use intern::string_key::{Intern, StringKey};

use lazy_static::lazy_static;

lazy_static! {
    static ref INT_TYPE: StringKey = "Int".intern();
    static ref RELAY_RESOLVER_DIRECTIVE_NAME: StringKey = "relay_resolver".intern();
    static ref FRAGMENT_KEY_ARGUMENT_NAME: StringKey = "fragment_name".intern();
    static ref IMPORT_PATH_AGUMENT_NAME: StringKey = "import_path".intern();
}

#[derive(Debug, PartialEq)]
pub enum DocblockIr {
    RelayResolver(RelayResolverIr),
}

impl DocblockIr {
    pub fn to_sdl_string(&self) -> String {
        match self {
            DocblockIr::RelayResolver(relay_resolver) => relay_resolver.to_sdl_string(),
        }
    }
}

#[derive(Debug, PartialEq)]
pub struct RelayResolverIr {
    pub field_name: WithLocation<StringKey>,
    pub on_type: WithLocation<StringKey>,
    pub root_fragment: WithLocation<StringKey>,
    pub edge_to: Option<WithLocation<StringKey>>,
    pub description: Option<WithLocation<StringKey>>,
    pub location: Location,
}

impl RelayResolverIr {
    pub fn to_sdl_string(&self) -> String {
        self.to_graphql_schema_ast()
            .definitions
            .iter()
            .map(|definition| format!("{}", definition))
            .collect::<Vec<String>>()
            .join("\n\n")
    }
    pub fn to_graphql_schema_ast(&self) -> SchemaDocument {
        let edge_to = self
            .edge_to
            .map_or_else(|| string_key_as_identifier(*INT_TYPE), as_identifier);
        SchemaDocument {
            location: self.location,
            definitions: vec![TypeSystemDefinition::ObjectTypeExtension(
                ObjectTypeExtension {
                    name: as_identifier(self.on_type),
                    interfaces: Vec::new(),
                    directives: vec![],
                    fields: Some(List::generated(vec![FieldDefinition {
                        name: as_identifier(self.field_name),
                        type_: TypeAnnotation::Named(NamedTypeAnnotation { name: edge_to }),
                        arguments: None,
                        directives: vec![self.directive()],
                        description: self.description.map(as_string_node),
                    }])),
                },
            )],
        }
    }

    fn directive(&self) -> ConstantDirective {
        let span = self.location.span();
        let import_path = self.location.source_location().path().intern();
        ConstantDirective {
            span: span.clone(),
            at: dummy_token(span),
            name: string_key_as_identifier(*RELAY_RESOLVER_DIRECTIVE_NAME),
            arguments: Some(List::generated(vec![
                string_argument(*FRAGMENT_KEY_ARGUMENT_NAME, self.root_fragment),
                string_argument(
                    *IMPORT_PATH_AGUMENT_NAME,
                    WithLocation::new(self.location, import_path),
                ),
            ])),
        }
    }
}

fn string_argument(name: StringKey, value: WithLocation<StringKey>) -> ConstantArgument {
    let span = value.location.span();
    ConstantArgument {
        span: span.clone(),
        name: string_key_as_identifier(name),
        colon: dummy_token(span),
        value: ConstantValue::String(StringNode {
            token: dummy_token(span),
            value: value.item,
        }),
    }
}

fn string_key_as_identifier(value: StringKey) -> Identifier {
    Identifier {
        span: Span::empty(),
        token: dummy_token(&Span::empty()),
        value,
    }
}

fn as_identifier(value: WithLocation<StringKey>) -> Identifier {
    let span = value.location.span();
    Identifier {
        span: span.clone(),
        token: dummy_token(span),
        value: value.item,
    }
}

fn as_string_node(value: WithLocation<StringKey>) -> StringNode {
    StringNode {
        token: dummy_token(value.location.span()),
        value: value.item,
    }
}

fn dummy_token(span: &Span) -> Token {
    Token {
        span: span.clone(),
        kind: TokenKind::Empty,
    }
}
