/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::InterfaceName;
use common::Location;
use common::Named;
use common::NamedItem;
use common::ObjectName;
use common::Span;
use common::WithLocation;
use graphql_ir::FragmentDefinitionName;
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
use graphql_syntax::NonNullTypeAnnotation;
use graphql_syntax::ObjectTypeDefinition;
use graphql_syntax::ObjectTypeExtension;
use graphql_syntax::ScalarTypeDefinition;
use graphql_syntax::SchemaDocument;
use graphql_syntax::StringNode;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use graphql_syntax::TypeAnnotation;
use graphql_syntax::TypeSystemDefinition;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use relay_config::SchemaConfig;
use relay_schema::CUSTOM_SCALAR_DIRECTIVE_NAME;
use relay_schema::EXPORT_NAME_CUSTOM_SCALAR_ARGUMENT_NAME;
use relay_schema::PATH_CUSTOM_SCALAR_ARGUMENT_NAME;
use schema::suggestion_list::GraphQLSuggestions;
use schema::InterfaceID;
use schema::Object;
use schema::ObjectID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use crate::errors::ErrorMessages;
use crate::errors::ErrorMessagesWithData;

lazy_static! {
    static ref INT_TYPE: StringKey = "Int".intern();
    static ref ID_TYPE: StringKey = "ID".intern();
    static ref RELAY_RESOLVER_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("relay_resolver".intern());
    static ref RELAY_RESOLVER_MODEL_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("__RelayResolverModel".intern());
    static ref OBJECT_DEFINITION_OUTPUT_TYPE_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("RelayOutputType".intern());
    static ref DEPRECATED_RESOLVER_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("deprecated".intern());
    static ref FRAGMENT_KEY_ARGUMENT_NAME: ArgumentName = ArgumentName("fragment_name".intern());
    static ref INJECT_FRAGMENT_DATA_ARGUMENT_NAME: ArgumentName =
        ArgumentName("inject_fragment_data".intern());
    static ref IMPORT_PATH_ARGUMENT_NAME: ArgumentName = ArgumentName("import_path".intern());
    static ref IMPORT_NAME_ARGUMENT_NAME: ArgumentName = ArgumentName("import_name".intern());
    static ref LIVE_ARGUMENT_NAME: ArgumentName = ArgumentName("live".intern());
    static ref DEPRECATED_REASON_ARGUMENT_NAME: ArgumentName = ArgumentName("reason".intern());
    static ref HAS_OUTPUT_TYPE_ARGUMENT_NAME: ArgumentName =
        ArgumentName("has_output_type".intern());
    pub(crate) static ref RESOLVER_VALUE_SCALAR_NAME: StringKey = "RelayResolverValue".intern();
    static ref RESOLVER_MODEL_INSTANCE_FIELD_NAME: StringKey = "__relay_model_instance".intern();
    static ref MODEL_CUSTOM_SCALAR_TYPE_SUFFIX: StringKey = "Model".intern();
    static ref RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE: DirectiveName =
        DirectiveName("__RelayWeakObject".intern());
}

#[derive(Debug, PartialEq)]
pub enum DocblockIr {
    RelayResolver(RelayResolverIr),
    TerseRelayResolver(TerseRelayResolverIr),
    StrongObjectResolver(StrongObjectIr),
    WeakObjectType(WeakObjectIr),
}

/// Wrapper over all schema-related values
#[derive(Copy, Clone, Debug)]
struct SchemaInfo<'a, 'b> {
    schema: &'a SDLSchema,
    config: &'b SchemaConfig,
}

impl DocblockIr {
    pub fn to_sdl_string(
        &self,
        schema: &SDLSchema,
        schema_config: &SchemaConfig,
    ) -> DiagnosticsResult<String> {
        Ok(self
            .to_graphql_schema_ast(schema, schema_config)?
            .definitions
            .iter()
            .map(|definition| format!("{}", definition))
            .collect::<Vec<String>>()
            .join("\n\n"))
    }
    pub fn to_graphql_schema_ast(
        &self,
        schema: &SDLSchema,
        schema_config: &SchemaConfig,
    ) -> DiagnosticsResult<SchemaDocument> {
        let schema_info = SchemaInfo {
            schema,
            config: schema_config,
        };

        match self {
            DocblockIr::RelayResolver(relay_resolver) => {
                relay_resolver.to_graphql_schema_ast(schema_info)
            }
            DocblockIr::TerseRelayResolver(relay_resolver) => {
                relay_resolver.to_graphql_schema_ast(schema_info)
            }
            DocblockIr::StrongObjectResolver(strong_object) => {
                strong_object.to_graphql_schema_ast(schema_info)
            }
            DocblockIr::WeakObjectType(weak_object) => {
                weak_object.to_graphql_schema_ast(schema_info)
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
    type Name = StringKey;
    fn name(&self) -> StringKey {
        self.name.value
    }
}

#[derive(Debug, PartialEq, Clone)]
pub enum OutputType {
    Pending(WithLocation<TypeAnnotation>),
    EdgeTo(WithLocation<TypeAnnotation>),
    Output(WithLocation<TypeAnnotation>),
}

impl OutputType {
    pub fn inner(&self) -> &WithLocation<TypeAnnotation> {
        match self {
            Self::Pending(inner) => inner,
            Self::EdgeTo(inner) => inner,
            Self::Output(inner) => inner,
        }
    }
}

pub enum FragmentDataInjectionMode {
    /// For `id` and `__relay_model_instance ` resolvers we want to read just one field
    /// of that fragment and pass it to the resolver
    Field(StringKey),
    // TODO: Add `FullData` mode for this
}

pub struct RootFragment {
    fragment: WithLocation<FragmentDefinitionName>,
    // For Model resolvers we need to inject `id` , `__relay_model_instance ` fragment data
    // the resolver function
    inject_fragment_data: Option<FragmentDataInjectionMode>,
}

trait ResolverIr {
    fn definitions(
        &self,
        schema_info: SchemaInfo<'_, '_>,
    ) -> DiagnosticsResult<Vec<TypeSystemDefinition>>;
    fn location(&self) -> Location;
    fn root_fragment(
        &self,
        object: Option<&Object>,
        schema_info: SchemaInfo<'_, '_>,
    ) -> Option<RootFragment>;
    fn output_type(&self) -> Option<OutputType>;
    fn deprecated(&self) -> Option<IrField>;
    fn live(&self) -> Option<IrField>;
    fn named_import(&self) -> Option<StringKey>;

    fn to_graphql_schema_ast(
        &self,
        schema_info: SchemaInfo<'_, '_>,
    ) -> DiagnosticsResult<SchemaDocument> {
        Ok(SchemaDocument {
            location: self.location(),
            definitions: self.definitions(schema_info)?,
        })
    }

    fn directives(
        &self,
        object: Option<&Object>,
        schema_info: SchemaInfo<'_, '_>,
    ) -> Vec<ConstantDirective> {
        let location = self.location();
        let span = location.span();
        let mut directives = vec![self.directive(object, schema_info)];

        if let Some(deprecated) = self.deprecated() {
            directives.push(ConstantDirective {
                span: span.clone(),
                at: dummy_token(span),
                name: string_key_as_identifier(DEPRECATED_RESOLVER_DIRECTIVE_NAME.0),
                arguments: deprecated.value.map(|value| {
                    List::generated(vec![string_argument(
                        DEPRECATED_REASON_ARGUMENT_NAME.0,
                        value,
                    )])
                }),
            })
        }

        directives
    }

    fn directive(
        &self,
        object: Option<&Object>,
        schema_info: SchemaInfo<'_, '_>,
    ) -> ConstantDirective {
        let location = self.location();
        let span = location.span();
        let import_path = self.location().source_location().path().intern();
        let mut arguments = vec![string_argument(
            IMPORT_PATH_ARGUMENT_NAME.0,
            WithLocation::new(self.location(), import_path),
        )];

        if let Some(root_fragment) = self.root_fragment(object, schema_info) {
            arguments.push(string_argument(
                FRAGMENT_KEY_ARGUMENT_NAME.0,
                root_fragment.fragment.map(|x| x.0),
            ));

            if let Some(inject_fragment_data) = root_fragment.inject_fragment_data {
                match inject_fragment_data {
                    FragmentDataInjectionMode::Field(field_name) => {
                        arguments.push(string_argument(
                            INJECT_FRAGMENT_DATA_ARGUMENT_NAME.0,
                            WithLocation::new(root_fragment.fragment.location, field_name),
                        ));
                    }
                }
            }
        }

        if let Some(live_field) = self.live() {
            arguments.push(true_argument(LIVE_ARGUMENT_NAME.0, live_field.key_location))
        }

        let schema = schema_info.schema;

        if let Some(output_type) = self.output_type() {
            match output_type {
                OutputType::Pending(type_) => {
                    let schema_type = schema.get_type(type_.item.inner().name.value);
                    let fields = match schema_type {
                        Some(Type::Object(id)) => {
                            let object = schema.object(id);
                            Some(&object.fields)
                        }
                        Some(Type::Interface(id)) => {
                            let interface = schema.interface(id);
                            Some(&interface.fields)
                        }
                        _ => None,
                    };
                    let is_edge_to = fields.map_or(false, |fields| {
                        fields.iter().any(|id| {
                            schema.field(*id).name.item
                                == schema_info.config.node_interface_id_field
                        })
                    });

                    if !is_edge_to {
                        // If terse resolver does not return strong object (edge)
                        // it should be `@outputType` resolver
                        arguments.push(true_argument(
                            HAS_OUTPUT_TYPE_ARGUMENT_NAME.0,
                            type_.location,
                        ))
                    }
                }
                OutputType::EdgeTo(_) => {}
                OutputType::Output(type_) => arguments.push(true_argument(
                    HAS_OUTPUT_TYPE_ARGUMENT_NAME.0,
                    type_.location,
                )),
            }
        }
        if let Some(name) = self.named_import() {
            arguments.push(string_argument(
                IMPORT_NAME_ARGUMENT_NAME.0,
                WithLocation::new(self.location(), name),
            ));
        }

        ConstantDirective {
            span: span.clone(),
            at: dummy_token(span),
            name: string_key_as_identifier(RELAY_RESOLVER_DIRECTIVE_NAME.0),
            arguments: Some(List::generated(arguments)),
        }
    }
}

trait ResolverTypeDefinitionIr: ResolverIr {
    fn field_name(&self) -> &Identifier;
    fn field_arguments(&self) -> Option<&List<InputValueDefinition>>;
    fn description(&self) -> Option<StringNode>;
    fn fragment_arguments(&self) -> Option<&Vec<Argument>>;

    /// Build recursive object/interface extensions to add this field to all
    /// types that will need it.
    fn interface_definitions(
        &self,
        interface_name: WithLocation<InterfaceName>,
        interface_id: InterfaceID,
        schema_info: SchemaInfo<'_, '_>,
    ) -> Vec<TypeSystemDefinition> {
        self.interface_definitions_impl(
            interface_name,
            interface_id,
            schema_info,
            &mut HashSet::default(),
            &mut HashSet::default(),
        )
    }

    fn interface_definitions_impl(
        &self,
        interface_name: WithLocation<InterfaceName>,
        interface_id: InterfaceID,
        schema_info: SchemaInfo<'_, '_>,
        seen_objects: &mut HashSet<ObjectID>,
        seen_interfaces: &mut HashSet<InterfaceID>,
    ) -> Vec<TypeSystemDefinition> {
        let fields = self.fields(None, schema_info);
        let schema = schema_info.schema;

        // First we extend the interface itself...
        let mut definitions = vec![TypeSystemDefinition::InterfaceTypeExtension(
            InterfaceTypeExtension {
                name: as_identifier(interface_name.map(|x| x.0)),
                interfaces: Vec::new(),
                directives: vec![],
                fields: Some(fields),
            },
        )];

        // Secondly we extend every object which implements this interface
        for object_id in &schema.interface(interface_id).implementing_objects {
            if !seen_objects.contains(object_id) {
                seen_objects.insert(*object_id);
                definitions.extend(self.object_definitions(schema.object(*object_id), schema_info));
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
                .get_type(existing_interface.name.item.0)
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
                            .get_type(existing_interface.name.item.0)
                            .unwrap()
                            .get_interface_id()
                            .unwrap(),
                        schema_info,
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
        schema_info: SchemaInfo<'_, '_>,
        interfaces: &[InterfaceID],
    ) -> DiagnosticsResult<()> {
        let schema = schema_info.schema;

        for interface_id in interfaces {
            let interface = schema.interface(*interface_id);
            for field_id in &interface.fields {
                let field = schema.field(*field_id);
                if field.name() == self.field_name().value {
                    return Err(vec![Diagnostic::error(
                        ErrorMessages::ResolverImplementingInterfaceField {
                            field_name: self.field_name().value,
                            interface_name: interface.name(),
                        },
                        self.location().with_span(self.field_name().span),
                    )]);
                }
            }
        }
        Ok(())
    }

    fn object_definitions(
        &self,
        object: &Object,
        schema_info: SchemaInfo<'_, '_>,
    ) -> Vec<TypeSystemDefinition> {
        vec![TypeSystemDefinition::ObjectTypeExtension(
            ObjectTypeExtension {
                name: obj_as_identifier(object.name),
                interfaces: vec![],
                directives: vec![],
                fields: Some(self.fields(Some(object), schema_info)),
            },
        )]
    }

    fn fields(
        &self,
        object: Option<&Object>,
        schema_info: SchemaInfo<'_, '_>,
    ) -> List<FieldDefinition> {
        let edge_to = self.output_type().as_ref().map_or_else(
            || {
                // Resolvers return arbitrary JavaScript values. However, we
                // need some GraphQL type to use in the schema. We use
                // `RelayResolverValue` (defined in the relay-extensions.graphql
                // file) for this purpose.
                TypeAnnotation::Named(NamedTypeAnnotation {
                    name: string_key_as_identifier(*RESOLVER_VALUE_SCALAR_NAME),
                })
            },
            |output_type| output_type.inner().item.clone(),
        );

        let args = match (self.fragment_argument_definitions(), self.field_arguments()) {
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
            name: self.field_name().clone(),
            type_: edge_to,
            arguments: args,
            directives: self.directives(object, schema_info),
            description: self.description(),
        }])
    }

    fn fragment_argument_definitions(&self) -> Option<List<InputValueDefinition>> {
        self.fragment_arguments().as_ref().map(|args| {
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
}

#[derive(Debug, PartialEq)]
pub struct TerseRelayResolverIr {
    pub field: FieldDefinition,
    pub type_: WithLocation<StringKey>,
    pub root_fragment: Option<WithLocation<FragmentDefinitionName>>,
    pub deprecated: Option<IrField>,
    pub live: Option<IrField>,
    pub location: Location,
    pub fragment_arguments: Option<Vec<Argument>>,
    pub named_import: Option<StringKey>,
}

impl ResolverIr for TerseRelayResolverIr {
    fn definitions(
        &self,
        schema_info: SchemaInfo<'_, '_>,
    ) -> DiagnosticsResult<Vec<TypeSystemDefinition>> {
        let schema = schema_info.schema;

        if let Some(type_) = schema.get_type(self.type_.item) {
            match type_ {
                Type::Object(object_id) => {
                    let object = schema.object(object_id);
                    return Ok(self.object_definitions(object, schema_info));
                }
                Type::Interface(interface_id) => {
                    let interface = schema.interface(interface_id);
                    return Ok(self.interface_definitions(
                        interface.name,
                        interface_id,
                        schema_info,
                    ));
                }
                _ => panic!("Terser syntax is only supported on non-input objects or interfaces."),
            }
        }

        let suggester = GraphQLSuggestions::new(schema);
        Err(vec![Diagnostic::error_with_data(
            ErrorMessagesWithData::TypeNotFound {
                type_name: self.type_.item,
                suggestions: suggester.object_type_suggestions(self.type_.item),
            },
            self.type_.location,
        )])
    }

    fn location(&self) -> Location {
        self.location
    }

    fn root_fragment(
        &self,
        object: Option<&Object>,
        _: SchemaInfo<'_, '_>,
    ) -> Option<RootFragment> {
        get_root_fragment_for_object(object).or_else(|| {
            self.root_fragment.map(|fragment| RootFragment {
                fragment,
                inject_fragment_data: None,
            })
        })
    }

    fn output_type(&self) -> Option<OutputType> {
        Some(OutputType::Pending(WithLocation::new(
            self.location,
            self.field.type_.clone(),
        )))
    }

    fn deprecated(&self) -> Option<IrField> {
        self.deprecated
    }

    fn live(&self) -> Option<IrField> {
        self.live
    }

    fn named_import(&self) -> Option<StringKey> {
        self.named_import
    }
}

impl ResolverTypeDefinitionIr for TerseRelayResolverIr {
    fn field_name(&self) -> &Identifier {
        &self.field.name
    }

    fn field_arguments(&self) -> Option<&List<InputValueDefinition>> {
        self.field.arguments.as_ref()
    }

    fn description(&self) -> Option<StringNode> {
        self.field.description.clone()
    }

    fn fragment_arguments(&self) -> Option<&Vec<Argument>> {
        self.fragment_arguments.as_ref()
    }
}

#[derive(Debug, PartialEq)]
pub struct RelayResolverIr {
    pub field: FieldDefinitionStub,
    pub on: On,
    pub root_fragment: Option<WithLocation<FragmentDefinitionName>>,
    pub output_type: Option<OutputType>,
    pub description: Option<WithLocation<StringKey>>,
    pub deprecated: Option<IrField>,
    pub live: Option<IrField>,
    pub location: Location,
    pub fragment_arguments: Option<Vec<Argument>>,
    pub named_import: Option<StringKey>,
}

impl ResolverIr for RelayResolverIr {
    fn definitions(
        &self,
        schema_info: SchemaInfo<'_, '_>,
    ) -> DiagnosticsResult<Vec<TypeSystemDefinition>> {
        let schema = schema_info.schema;

        if let Some(OutputType::EdgeTo(edge_to_with_location)) = &self.output_type {
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
                if let Some(type_) = schema.get_type(value.item) {
                    match type_ {
                        Type::Object(object_id) => {
                            let object = schema.object(object_id);
                            self.validate_singular_implementation(schema_info, &object.interfaces)?;
                            return Ok(self.object_definitions(object, schema_info));
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
                            schema_info,
                            &schema.interface(interface_type).interfaces,
                        )?;
                        return Ok(self.interface_definitions(
                            value.map(InterfaceName),
                            interface_type,
                            schema_info,
                        ));
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

    fn location(&self) -> Location {
        self.location
    }

    fn root_fragment(
        &self,
        object: Option<&Object>,
        _: SchemaInfo<'_, '_>,
    ) -> Option<RootFragment> {
        get_root_fragment_for_object(object).or_else(|| {
            self.root_fragment.map(|fragment| RootFragment {
                fragment,
                inject_fragment_data: None,
            })
        })
    }

    fn output_type(&self) -> Option<OutputType> {
        self.output_type.as_ref().cloned()
    }

    fn deprecated(&self) -> Option<IrField> {
        self.deprecated
    }

    fn live(&self) -> Option<IrField> {
        self.live
    }

    fn named_import(&self) -> Option<StringKey> {
        self.named_import
    }
}

impl ResolverTypeDefinitionIr for RelayResolverIr {
    fn field_name(&self) -> &Identifier {
        &self.field.name
    }

    fn field_arguments(&self) -> Option<&List<InputValueDefinition>> {
        self.field.arguments.as_ref()
    }

    fn description(&self) -> Option<StringNode> {
        self.description.map(as_string_node)
    }

    fn fragment_arguments(&self) -> Option<&Vec<Argument>> {
        self.fragment_arguments.as_ref()
    }
}

/// Relay Resolver ID representing a "model" of a strong object
#[derive(Debug, PartialEq)]
pub struct StrongObjectIr {
    pub type_: PopulatedIrField,
    pub root_fragment: WithLocation<FragmentDefinitionName>,
    pub description: Option<WithLocation<StringKey>>,
    pub deprecated: Option<IrField>,
    pub live: Option<IrField>,
    pub location: Location,
    pub named_import: Option<StringKey>,
}

impl ResolverIr for StrongObjectIr {
    fn definitions(
        &self,
        schema_info: SchemaInfo<'_, '_>,
    ) -> DiagnosticsResult<Vec<TypeSystemDefinition>> {
        let span = Span::empty();

        let fields = vec![
            FieldDefinition {
                name: string_key_as_identifier(schema_info.config.node_interface_id_field),
                type_: TypeAnnotation::NonNull(Box::new(NonNullTypeAnnotation {
                    span,
                    type_: TypeAnnotation::Named(NamedTypeAnnotation {
                        name: string_key_as_identifier(*ID_TYPE),
                    }),
                    exclamation: dummy_token(&span),
                })),
                arguments: None,
                directives: vec![],
                description: None,
            },
            generate_model_instance_field(
                schema_info,
                *INT_TYPE,
                None,
                self.directives(None, schema_info),
                self.location().clone(),
            ),
        ];
        let type_ = TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
            name: as_identifier(self.type_.value),
            interfaces: vec![],
            directives: vec![ConstantDirective {
                span: span.clone(),
                at: dummy_token(&span),
                name: string_key_as_identifier(RELAY_RESOLVER_MODEL_DIRECTIVE_NAME.0),
                arguments: None,
            }],
            fields: Some(List::generated(fields)),
        });

        Ok(vec![type_])
    }

    fn location(&self) -> Location {
        self.location
    }

    // For Model resolver we always inject the `id` fragment
    fn root_fragment(
        &self,
        _: Option<&Object>,
        schema_info: SchemaInfo<'_, '_>,
    ) -> Option<RootFragment> {
        Some(RootFragment {
            fragment: self.root_fragment,
            inject_fragment_data: Some(FragmentDataInjectionMode::Field(
                schema_info.config.node_interface_id_field,
            )),
        })
    }

    fn output_type(&self) -> Option<OutputType> {
        None
    }

    fn deprecated(&self) -> Option<IrField> {
        self.deprecated
    }

    fn live(&self) -> Option<IrField> {
        self.live
    }

    fn named_import(&self) -> Option<StringKey> {
        self.named_import
    }
}

/// Relay Resolver docblock representing a "model" type for a weak object
#[derive(Debug, PartialEq)]
pub struct WeakObjectIr {
    pub type_name: PopulatedIrField,
    pub description: Option<WithLocation<StringKey>>,
    pub deprecated: Option<IrField>,
    pub location: Location,
}

impl WeakObjectIr {
    // Generate the named GraphQL type (with an __relay_model_instance field).
    fn type_definition(&self, schema_info: SchemaInfo<'_, '_>) -> TypeSystemDefinition {
        let span = self.type_name.value.location.span();

        let mut directives = vec![
            ConstantDirective {
                span: span.clone(),
                at: dummy_token(span),
                name: string_key_as_identifier(RELAY_RESOLVER_MODEL_DIRECTIVE_NAME.0),
                arguments: None,
            },
            ConstantDirective {
                span: span.clone(),
                at: dummy_token(span),
                name: string_key_as_identifier(OBJECT_DEFINITION_OUTPUT_TYPE_DIRECTIVE_NAME.0),
                arguments: None,
            },
            ConstantDirective {
                span: span.clone(),
                at: dummy_token(span),
                name: string_key_as_identifier(RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE.0),
                arguments: None,
            },
        ];
        if let Some(deprecated) = self.deprecated {
            directives.push(ConstantDirective {
                span: span.clone(),
                at: dummy_token(span),
                name: string_key_as_identifier(DEPRECATED_RESOLVER_DIRECTIVE_NAME.0),
                arguments: deprecated.value.map(|value| {
                    List::generated(vec![string_argument(
                        DEPRECATED_REASON_ARGUMENT_NAME.0,
                        value,
                    )])
                }),
            })
        }
        TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
            name: as_identifier(self.type_name.value),
            interfaces: vec![],
            directives,
            fields: Some(List::generated(vec![generate_model_instance_field(
                schema_info,
                self.model_type_name(),
                self.description.map(as_string_node),
                vec![],
                self.location().clone(),
            )])),
        })
    }

    // Generate a custom scalar definition based on the exported type.
    fn instance_scalar_type_definition(&self) -> TypeSystemDefinition {
        let span = self.type_name.value.location.span();
        TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition {
            name: Identifier {
                span: *span,
                token: dummy_token(span),
                value: self.model_type_name(),
            },
            directives: vec![ConstantDirective {
                span: *span,
                at: dummy_token(span),
                name: as_identifier(WithLocation::generated(*CUSTOM_SCALAR_DIRECTIVE_NAME)),
                arguments: Some(List::generated(vec![
                    ConstantArgument {
                        span: *span,
                        name: as_identifier(WithLocation::generated(
                            *PATH_CUSTOM_SCALAR_ARGUMENT_NAME,
                        )),
                        colon: dummy_token(span),
                        value: ConstantValue::String(StringNode {
                            token: dummy_token(span),
                            value: self.location.source_location().path().intern(),
                        }),
                    },
                    ConstantArgument {
                        span: *span,
                        name: as_identifier(WithLocation::generated(
                            *EXPORT_NAME_CUSTOM_SCALAR_ARGUMENT_NAME,
                        )),
                        colon: dummy_token(span),
                        value: ConstantValue::String(StringNode {
                            token: dummy_token(span),
                            value: self.type_name.value.item,
                        }),
                    },
                ])),
            }],
        })
    }

    // Derive a typename for the custom scalar that will be used as this type's
    // `__relay_model_instance` model.
    fn model_type_name(&self) -> StringKey {
        // TODO: Ensure this type does not already exist?
        format!(
            "{}{}",
            self.type_name.value.item, *MODEL_CUSTOM_SCALAR_TYPE_SUFFIX
        )
        .intern()
    }
}

impl ResolverIr for WeakObjectIr {
    fn definitions(
        &self,
        schema_info: SchemaInfo<'_, '_>,
    ) -> DiagnosticsResult<Vec<TypeSystemDefinition>> {
        Ok(vec![
            self.instance_scalar_type_definition(),
            self.type_definition(schema_info),
        ])
    }

    fn location(&self) -> Location {
        self.location
    }

    fn root_fragment(
        &self,
        _: Option<&Object>,
        _schema_info: SchemaInfo<'_, '_>,
    ) -> Option<RootFragment> {
        None
    }

    fn output_type(&self) -> Option<OutputType> {
        None
    }

    fn deprecated(&self) -> Option<IrField> {
        self.deprecated
    }

    fn live(&self) -> Option<IrField> {
        None
    }

    fn named_import(&self) -> Option<StringKey> {
        None
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

fn obj_as_identifier(value: WithLocation<ObjectName>) -> Identifier {
    let span = value.location.span();
    Identifier {
        span: span.clone(),
        token: dummy_token(span),
        value: value.item.0,
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

fn get_root_fragment_for_object(object: Option<&Object>) -> Option<RootFragment> {
    if object?
        .directives
        .named(*RELAY_RESOLVER_MODEL_DIRECTIVE_NAME)
        .is_some()
    {
        Some(RootFragment {
            fragment: WithLocation::generated(FragmentDefinitionName(
                format!(
                    "{}__{}",
                    object.unwrap().name.item,
                    *RESOLVER_MODEL_INSTANCE_FIELD_NAME
                )
                .intern(),
            )),
            inject_fragment_data: Some(FragmentDataInjectionMode::Field(
                *RESOLVER_MODEL_INSTANCE_FIELD_NAME,
            )),
        })
    } else {
        None
    }
}

/// Generate the internal field for weak and strong model types
fn generate_model_instance_field(
    schema_info: SchemaInfo<'_, '_>,
    type_name: StringKey,
    description: Option<StringNode>,
    mut directives: Vec<ConstantDirective>,
    location: Location,
) -> FieldDefinition {
    let span = location.span().clone();
    directives.push(ConstantDirective {
        span,
        at: dummy_token(&span),
        name: string_key_as_identifier(schema_info.config.unselectable_directive_name.0),
        arguments: Some(List::generated(vec![string_argument(
            DEPRECATED_REASON_ARGUMENT_NAME.0,
            WithLocation::new(
                location,
                "This field is intended only for Relay's internal use".intern(),
            ),
        )])),
    });

    FieldDefinition {
        name: string_key_as_identifier(*RESOLVER_MODEL_INSTANCE_FIELD_NAME),
        type_: TypeAnnotation::Named(NamedTypeAnnotation {
            name: string_key_as_identifier(type_name),
        }),
        arguments: None,
        directives,
        description,
    }
}
