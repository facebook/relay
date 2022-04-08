/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::errors::ErrorMessagesWithData;
use common::{Diagnostic, DiagnosticsResult, Location, Span, WithLocation};
use graphql_syntax::{
    BooleanNode, ConstantArgument, ConstantDirective, ConstantValue, FieldDefinition, Identifier,
    InterfaceTypeExtension, List, NamedTypeAnnotation, ObjectTypeExtension, SchemaDocument,
    StringNode, Token, TokenKind, TypeAnnotation, TypeSystemDefinition,
};
use intern::string_key::{Intern, StringKey};

use lazy_static::lazy_static;
use schema::{suggestion_list::GraphQLSuggestions, InterfaceID, SDLSchema, Schema};

lazy_static! {
    static ref INT_TYPE: StringKey = "Int".intern();
    static ref RELAY_RESOLVER_DIRECTIVE_NAME: StringKey = "relay_resolver".intern();
    static ref DEPRECATED_RESOLVER_DIRECTIVE_NAME: StringKey = "deprecated".intern();
    static ref FRAGMENT_KEY_ARGUMENT_NAME: StringKey = "fragment_name".intern();
    static ref IMPORT_PATH_ARGUMENT_NAME: StringKey = "import_path".intern();
    static ref LIVE_ARGUMENT_NAME: StringKey = "live".intern();
    static ref DEPRECATED_REASON_ARGUMENT_NAME: StringKey = "reason".intern();
}

#[derive(Debug, PartialEq)]
pub enum DocblockIr {
    RelayResolver(RelayResolverIr),
}

impl DocblockIr {
    pub fn to_sdl_string(&self, schema: &SDLSchema) -> DiagnosticsResult<String> {
        match self {
            DocblockIr::RelayResolver(relay_resolver) => relay_resolver.to_sdl_string(schema),
        }
    }
    pub fn to_graphql_schema_ast(&self, schema: &SDLSchema) -> DiagnosticsResult<SchemaDocument> {
        match self {
            DocblockIr::RelayResolver(relay_resolver) => {
                relay_resolver.to_graphql_schema_ast(schema)
            }
        }
    }
}
#[derive(Debug, PartialEq, Clone, Copy)]
pub struct IrField {
    pub key_location: Location,
    pub value: Option<WithLocation<StringKey>>,
}

#[derive(Debug, PartialEq, Clone, Copy)]
pub struct PopulatedIrField {
    pub key_location: Location,
    pub value: WithLocation<StringKey>,
}

#[derive(Debug, PartialEq)]
pub enum On {
    Type(PopulatedIrField),
    Interface(PopulatedIrField),
}

#[derive(Debug, PartialEq)]
pub struct RelayResolverIr {
    pub field_name: WithLocation<StringKey>,
    pub on: On,
    pub root_fragment: WithLocation<StringKey>,
    pub edge_to: Option<WithLocation<StringKey>>,
    pub description: Option<WithLocation<StringKey>>,
    pub deprecated: Option<IrField>,
    pub live: Option<IrField>,
    pub location: Location,
}

impl RelayResolverIr {
    pub fn to_sdl_string(&self, schema: &SDLSchema) -> DiagnosticsResult<String> {
        Ok(self
            .to_graphql_schema_ast(schema)?
            .definitions
            .iter()
            .map(|definition| format!("{}", definition))
            .collect::<Vec<String>>()
            .join("\n\n"))
    }
    pub fn to_graphql_schema_ast(&self, schema: &SDLSchema) -> DiagnosticsResult<SchemaDocument> {
        Ok(SchemaDocument {
            location: self.location,
            definitions: self.definitions(schema)?,
        })
    }

    fn definitions(&self, schema: &SDLSchema) -> DiagnosticsResult<Vec<TypeSystemDefinition>> {
        match self.on {
            On::Type(PopulatedIrField {
                key_location,
                value,
            }) => {
                if let Some(_type) = schema.get_type(value.item) {
                    if _type.is_object() {
                        return Ok(self.object_definitions(value));
                    } else if _type.is_interface() {
                        return Err(vec![Diagnostic::error_with_data(
                            ErrorMessagesWithData::OnTypeForInterface,
                            key_location,
                        )]);
                    }
                }
                let suggestor = GraphQLSuggestions::new(schema);
                Err(vec![Diagnostic::error_with_data(
                    ErrorMessagesWithData::InvalidOnType {
                        type_name: value.item,
                        suggestions: suggestor.object_type_suggestions(value.item),
                    },
                    value.location,
                )])
            }
            On::Interface(PopulatedIrField {
                key_location,
                value,
            }) => {
                if let Some(_type) = schema.get_type(value.item) {
                    if let Some(interface_type) = _type.get_interface_id() {
                        return Ok(self.interface_definitions(value, interface_type, schema));
                    } else if _type.is_object() {
                        return Err(vec![Diagnostic::error_with_data(
                            ErrorMessagesWithData::OnInterfaceForType,
                            key_location,
                        )]);
                    }
                }
                let suggestor = GraphQLSuggestions::new(schema);
                Err(vec![Diagnostic::error_with_data(
                    ErrorMessagesWithData::InvalidOnInterface {
                        interface_name: value.item,
                        suggestions: suggestor.interface_type_suggestions(value.item),
                    },
                    value.location,
                )])
            }
        }
    }

    /// Build recursive object/interface extensions to add this field to all
    /// types that will need it.
    fn interface_definitions(
        &self,
        interface_name: WithLocation<StringKey>,
        interface_id: InterfaceID,
        schema: &SDLSchema,
    ) -> Vec<TypeSystemDefinition> {
        let fields = self.fields();

        // First we extend the interface itself...
        let mut definitions = vec![TypeSystemDefinition::InterfaceTypeExtension(
            InterfaceTypeExtension {
                name: as_identifier(interface_name),
                interfaces: Vec::new(),
                directives: vec![],
                fields: Some(fields.clone()),
            },
        )];

        // Secondly we extend every object which implements this interface
        for object_id in &schema.interface(interface_id).implementing_objects {
            definitions.extend(self.object_definitions(WithLocation::new(
                interface_name.location,
                schema.object(*object_id).name.item,
            )))
        }

        // Thirdly we recursively extend every interface which implements
        // this interface, and therefore every object/interface which
        // implements that interface.
        for existing_interface in schema
            .interfaces()
            .filter(|i| i.interfaces.contains(&interface_id))
        {
            definitions.extend(
                self.interface_definitions(
                    WithLocation::new(interface_name.location, existing_interface.name.item),
                    schema
                        .get_type(existing_interface.name.item)
                        .unwrap()
                        .get_interface_id()
                        .unwrap(),
                    schema,
                ),
            )
        }
        definitions
    }

    fn object_definitions(&self, on_type: WithLocation<StringKey>) -> Vec<TypeSystemDefinition> {
        vec![TypeSystemDefinition::ObjectTypeExtension(
            ObjectTypeExtension {
                name: as_identifier(on_type),
                interfaces: Vec::new(),
                directives: vec![],
                fields: Some(self.fields()),
            },
        )]
    }

    fn fields(&self) -> List<FieldDefinition> {
        let edge_to = self
            .edge_to
            .map_or_else(|| string_key_as_identifier(*INT_TYPE), as_identifier);

        List::generated(vec![FieldDefinition {
            name: as_identifier(self.field_name),
            type_: TypeAnnotation::Named(NamedTypeAnnotation { name: edge_to }),
            arguments: None,
            directives: self.directives(),
            description: self.description.map(as_string_node),
        }])
    }

    fn directives(&self) -> Vec<ConstantDirective> {
        let span = self.location.span();
        let mut directives = vec![self.directive()];

        if let Some(deprecated) = self.deprecated {
            directives.push(ConstantDirective {
                span: span.clone(),
                at: dummy_token(span),
                name: string_key_as_identifier(*DEPRECATED_RESOLVER_DIRECTIVE_NAME),
                arguments: deprecated.value.map(|value| {
                    List::generated(vec![string_argument(
                        *DEPRECATED_REASON_ARGUMENT_NAME,
                        value,
                    )])
                }),
            })
        }

        directives
    }

    fn directive(&self) -> ConstantDirective {
        let span = self.location.span();
        let import_path = self.location.source_location().path().intern();
        let mut arguments = vec![
            string_argument(*FRAGMENT_KEY_ARGUMENT_NAME, self.root_fragment),
            string_argument(
                *IMPORT_PATH_ARGUMENT_NAME,
                WithLocation::new(self.location, import_path),
            ),
        ];
        if let Some(live_field) = self.live {
            arguments.push(true_argument(*LIVE_ARGUMENT_NAME, live_field.key_location))
        }
        ConstantDirective {
            span: span.clone(),
            at: dummy_token(span),
            name: string_key_as_identifier(*RELAY_RESOLVER_DIRECTIVE_NAME),
            arguments: Some(List::generated(arguments)),
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

fn true_argument(name: StringKey, location: Location) -> ConstantArgument {
    let span = location.span();
    ConstantArgument {
        span: span.clone(),
        name: string_key_as_identifier(name),
        colon: dummy_token(span),
        value: ConstantValue::Boolean(BooleanNode {
            token: dummy_token(span),
            value: true,
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
