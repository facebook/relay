/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use crate::errors::ErrorMessages;
use crate::errors::ErrorMessagesWithData;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::Named;
use common::Span;
use common::WithLocation;
use graphql_syntax::BooleanNode;
use graphql_syntax::ConstantArgument;
use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::FieldDefinition;
use graphql_syntax::FieldDefinitionStub;
use graphql_syntax::Identifier;
use graphql_syntax::InputValueDefinition;
use graphql_syntax::InterfaceTypeExtension;
use graphql_syntax::List;
use graphql_syntax::NamedTypeAnnotation;
use graphql_syntax::ObjectTypeExtension;
use graphql_syntax::SchemaDocument;
use graphql_syntax::StringNode;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use graphql_syntax::TypeAnnotation;
use graphql_syntax::TypeSystemDefinition;
use intern::string_key::Intern;
use intern::string_key::StringKey;

use lazy_static::lazy_static;
use schema::suggestion_list::GraphQLSuggestions;
use schema::InterfaceID;
use schema::ObjectID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

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
pub struct Argument {
    pub name: Identifier,
    pub type_: TypeAnnotation,
    pub default_value: Option<ConstantValue>,
}

impl Named for Argument {
    fn name(&self) -> StringKey {
        self.name.value
    }
}

#[derive(Debug, PartialEq)]
pub struct RelayResolverIr {
    pub field: FieldDefinitionStub,
    pub on: On,
    pub root_fragment: Option<WithLocation<StringKey>>,
    pub edge_to: Option<WithLocation<TypeAnnotation>>,
    pub description: Option<WithLocation<StringKey>>,
    pub deprecated: Option<IrField>,
    pub live: Option<IrField>,
    pub location: Location,
    pub fragment_arguments: Option<Vec<Argument>>,
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
        if let Some(edge_to_with_location) = &self.edge_to {
            if let TypeAnnotation::List(edge_to_type) = &edge_to_with_location.item {
                if let Some(false) = schema
                    .get_type(edge_to_type.type_.inner().name.value)
                    .map(|t| schema.is_extension_type(t))
                {
                    return Err(vec![Diagnostic::error(
                        ErrorMessages::ClientEdgeToPluralServerType,
                        edge_to_with_location.location,
                    )]);
                }
            }
        }
        match self.on {
            On::Type(PopulatedIrField {
                key_location,
                value,
            }) => {
                if let Some(_type) = schema.get_type(value.item) {
                    match _type {
                        Type::Object(object_id) => {
                            self.validate_singular_implementation(
                                schema,
                                &schema.object(object_id).interfaces,
                            )?;
                            return Ok(self.object_definitions(value));
                        }
                        Type::Interface(_) => {
                            return Err(vec![Diagnostic::error_with_data(
                                ErrorMessagesWithData::OnTypeForInterface,
                                key_location,
                            )]);
                        }
                        _ => {}
                    }
                }
                let suggester = GraphQLSuggestions::new(schema);
                Err(vec![Diagnostic::error_with_data(
                    ErrorMessagesWithData::InvalidOnType {
                        type_name: value.item,
                        suggestions: suggester.object_type_suggestions(value.item),
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
                        self.validate_singular_implementation(
                            schema,
                            &schema.interface(interface_type).interfaces,
                        )?;
                        return Ok(self.interface_definitions(value, interface_type, schema));
                    } else if _type.is_object() {
                        return Err(vec![Diagnostic::error_with_data(
                            ErrorMessagesWithData::OnInterfaceForType,
                            key_location,
                        )]);
                    }
                }
                let suggester = GraphQLSuggestions::new(schema);
                Err(vec![Diagnostic::error_with_data(
                    ErrorMessagesWithData::InvalidOnInterface {
                        interface_name: value.item,
                        suggestions: suggester.interface_type_suggestions(value.item),
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
        self.interface_definitions_impl(
            interface_name,
            interface_id,
            schema,
            &mut HashSet::default(),
            &mut HashSet::default(),
        )
    }

    fn interface_definitions_impl(
        &self,
        interface_name: WithLocation<StringKey>,
        interface_id: InterfaceID,
        schema: &SDLSchema,
        seen_objects: &mut HashSet<ObjectID>,
        seen_interfaces: &mut HashSet<InterfaceID>,
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
            if !seen_objects.contains(object_id) {
                seen_objects.insert(*object_id);
                definitions.extend(self.object_definitions(WithLocation::new(
                    interface_name.location,
                    schema.object(*object_id).name.item,
                )))
            }
        }

        // Thirdly we recursively extend every interface which implements
        // this interface, and therefore every object/interface which
        // implements that interface.
        for existing_interface in schema
            .interfaces()
            .filter(|i| i.interfaces.contains(&interface_id))
        {
            let interface_id = match schema
                .get_type(existing_interface.name.item)
                .expect("Expect to find type for interface.")
            {
                schema::Type::Interface(interface_id) => interface_id,
                _ => panic!("Expected interface to have an interface type"),
            };
            if !seen_interfaces.contains(&interface_id) {
                seen_interfaces.insert(interface_id);
                definitions.extend(
                    self.interface_definitions_impl(
                        WithLocation::new(interface_name.location, existing_interface.name.item),
                        schema
                            .get_type(existing_interface.name.item)
                            .unwrap()
                            .get_interface_id()
                            .unwrap(),
                        schema,
                        seen_objects,
                        seen_interfaces,
                    ),
                )
            }
        }
        definitions
    }

    // When defining a resolver on an object or interface, we must be sure that this
    // field is not defined on any parent interface because this could lead to a case where
    // someone tries to read the field in an fragment on that interface. In order to support
    // that, our runtime would need to dynamically figure out which resolver it
    // should read from, or if it should even read from a resolver at all.
    //
    // Until we decide to support that behavior we'll make it a compiler error.
    fn validate_singular_implementation(
        &self,
        schema: &SDLSchema,
        interfaces: &[InterfaceID],
    ) -> DiagnosticsResult<()> {
        for interface_id in interfaces {
            let interface = schema.interface(*interface_id);
            for field_id in &interface.fields {
                let field = schema.field(*field_id);
                if field.name() == self.field.name.value {
                    return Err(vec![Diagnostic::error(
                        ErrorMessages::ResolverImplementingInterfaceField {
                            field_name: self.field.name.value,
                            interface_name: interface.name(),
                        },
                        self.location.with_span(self.field.name.span),
                    )]);
                }
            }
        }
        Ok(())
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
        let edge_to = self.edge_to.as_ref().map_or_else(
            || {
                // Resolvers return arbitrary JavaScript values. However, we
                // need some GraphQL type to use in the schema. As a placeholder
                // we arbitrarily use Int. In the future we may want to use a custom
                // scalar here.
                TypeAnnotation::Named(NamedTypeAnnotation {
                    name: string_key_as_identifier(*INT_TYPE),
                })
            },
            |annotation| annotation.item.clone(),
        );

        let args = match (self.fragment_arguments(), self.field.arguments.as_ref()) {
            (None, None) => None,
            (None, Some(b)) => Some(b.clone()),
            (Some(a), None) => Some(a),
            (Some(a), Some(b)) => Some(List::generated(
                a.items
                    .into_iter()
                    .chain(b.clone().items.into_iter())
                    .collect::<Vec<_>>(),
            )),
        };

        List::generated(vec![FieldDefinition {
            name: self.field.name.clone(),
            type_: edge_to,
            arguments: args,
            directives: self.directives(),
            description: self.description.map(as_string_node),
        }])
    }

    fn fragment_arguments(&self) -> Option<List<InputValueDefinition>> {
        self.fragment_arguments.as_ref().map(|args| {
            List::generated(
                args.iter()
                    .map(|arg| InputValueDefinition {
                        name: arg.name.clone(),
                        type_: arg.type_.clone(),
                        default_value: arg.default_value.clone(),
                        directives: vec![],
                    })
                    .collect::<Vec<_>>(),
            )
        })
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
        let mut arguments = vec![string_argument(
            *IMPORT_PATH_ARGUMENT_NAME,
            WithLocation::new(self.location, import_path),
        )];

        if let Some(root_fragment) = self.root_fragment {
            arguments.push(string_argument(*FRAGMENT_KEY_ARGUMENT_NAME, root_fragment));
        }

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
