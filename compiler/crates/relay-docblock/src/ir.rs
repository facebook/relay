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
use docblock_shared::FRAGMENT_KEY_ARGUMENT_NAME;
use docblock_shared::GENERATED_FRAGMENT_ARGUMENT_NAME;
use docblock_shared::HAS_OUTPUT_TYPE_ARGUMENT_NAME;
use docblock_shared::IMPORT_NAME_ARGUMENT_NAME;
use docblock_shared::IMPORT_PATH_ARGUMENT_NAME;
use docblock_shared::INJECT_FRAGMENT_DATA_ARGUMENT_NAME;
use docblock_shared::LIVE_ARGUMENT_NAME;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use docblock_shared::RELAY_RESOLVER_MODEL_DIRECTIVE_NAME;
use docblock_shared::RELAY_RESOLVER_MODEL_GENERATED_ID_FIELD_DIRECTIVE_NAME;
use docblock_shared::RELAY_RESOLVER_MODEL_INSTANCE_FIELD;
use docblock_shared::RELAY_RESOLVER_SOURCE_HASH;
use docblock_shared::RELAY_RESOLVER_SOURCE_HASH_VALUE;
use docblock_shared::RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE;
use docblock_shared::RESOLVER_PROPERTY_LOOKUP_NAME;
use docblock_shared::RESOLVER_VALUE_SCALAR_NAME;
use docblock_shared::RETURN_FRAGMENT_ARGUMENT_NAME;
use docblock_shared::ResolverSourceHash;
use docblock_shared::TYPE_CONFIRMED_ARGUMENT_NAME;
use graphql_ir::FragmentDefinitionName;
use graphql_syntax::BooleanNode;
use graphql_syntax::ConstantArgument;
use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::DefaultValue;
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
use relay_config::ProjectName;
use relay_config::SchemaConfig;
use relay_schema::CUSTOM_SCALAR_DIRECTIVE_NAME;
use relay_schema::EXPORT_NAME_CUSTOM_SCALAR_ARGUMENT_NAME;
use relay_schema::PATH_CUSTOM_SCALAR_ARGUMENT_NAME;
use schema::InterfaceID;
use schema::Object;
use schema::ObjectID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use schema::suggestion_list::GraphQLSuggestions;

use crate::errors::ErrorMessagesWithData;
use crate::errors::SchemaValidationErrorMessages;

lazy_static! {
    static ref INT_TYPE: StringKey = "Int".intern();
    static ref ID_TYPE: StringKey = "ID".intern();
    static ref OBJECT_DEFINITION_OUTPUT_TYPE_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("RelayOutputType".intern());
    static ref DEPRECATED_RESOLVER_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("deprecated".intern());
    static ref DEPRECATED_REASON_ARGUMENT_NAME: ArgumentName = ArgumentName("reason".intern());
    static ref MODEL_CUSTOM_SCALAR_TYPE_SUFFIX: StringKey = "Model".intern();
}

#[derive(Debug, Clone, PartialEq)]
pub enum ResolverTypeDocblockIr {
    StrongObjectResolver(StrongObjectIr),
    WeakObjectType(WeakObjectIr),
}

impl ResolverTypeDocblockIr {
    pub fn to_graphql_schema_ast(&self, schema_config: &SchemaConfig) -> SchemaDocument {
        let definitions = match self {
            ResolverTypeDocblockIr::StrongObjectResolver(strong_object_resolver) => {
                vec![strong_object_resolver.type_definition(schema_config)]
            }
            ResolverTypeDocblockIr::WeakObjectType(weak_object) => vec![
                weak_object.instance_scalar_type_definition(),
                weak_object.type_definition(schema_config),
            ],
        };
        SchemaDocument {
            location: self.location(),
            definitions,
        }
    }
    pub fn location(&self) -> Location {
        match self {
            Self::StrongObjectResolver(strong_object) => strong_object.location(),
            Self::WeakObjectType(weak_object) => weak_object.location(),
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum ResolverFieldDocblockIr {
    LegacyVerboseResolver(LegacyVerboseResolverIr),
    TerseRelayResolver(TerseRelayResolverIr),
}

impl ResolverFieldDocblockIr {
    pub fn to_graphql_schema_ast(
        self,
        project_name: ProjectName,
        schema: &SDLSchema,
        schema_config: &SchemaConfig,
    ) -> DiagnosticsResult<SchemaDocument> {
        let project_config = ResolverProjectConfig {
            project_name,
            schema,
            schema_config,
        };

        let schema_doc = match self {
            ResolverFieldDocblockIr::LegacyVerboseResolver(relay_resolver) => {
                relay_resolver.to_graphql_schema_ast(project_config)
            }
            ResolverFieldDocblockIr::TerseRelayResolver(relay_resolver) => {
                relay_resolver.to_graphql_schema_ast(project_config)
            }
        }?;
        Ok(schema_doc)
    }
    pub fn location(&self) -> Location {
        match self {
            Self::LegacyVerboseResolver(strong_object) => strong_object.location(),
            Self::TerseRelayResolver(weak_object) => weak_object.location(),
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum DocblockIr {
    Type(ResolverTypeDocblockIr),
    Field(ResolverFieldDocblockIr),
}

impl DocblockIr {
    pub(crate) fn get_variant_name(&self) -> &'static str {
        match self {
            Self::Field(ResolverFieldDocblockIr::LegacyVerboseResolver(_)) => {
                "legacy resolver declaration"
            }
            Self::Field(ResolverFieldDocblockIr::TerseRelayResolver(_)) => {
                "terse resolver declaration"
            }
            Self::Type(ResolverTypeDocblockIr::StrongObjectResolver(_)) => {
                "strong object type declaration"
            }
            Self::Type(ResolverTypeDocblockIr::WeakObjectType(_)) => "weak object type declaration",
        }
    }
}

/// Wrapper over all schema-related values
#[derive(Copy, Clone, Debug)]
struct ResolverProjectConfig<'a, 'b> {
    project_name: ProjectName,
    schema: &'a SDLSchema,
    schema_config: &'b SchemaConfig,
}

impl DocblockIr {
    pub fn to_sdl_string(
        self,
        project_name: ProjectName,
        schema: &SDLSchema,
        schema_config: &SchemaConfig,
    ) -> DiagnosticsResult<String> {
        Ok(self
            .to_graphql_schema_ast(project_name, schema, schema_config)?
            .definitions
            .iter()
            .map(|definition| format!("{}", definition))
            .collect::<Vec<String>>()
            .join("\n\n"))
    }

    pub fn location(&self) -> Location {
        match self {
            Self::Field(field) => field.location(),
            Self::Type(type_) => type_.location(),
        }
    }

    pub fn to_graphql_schema_ast(
        self,
        project_name: ProjectName,
        schema: &SDLSchema,
        schema_config: &SchemaConfig,
    ) -> DiagnosticsResult<SchemaDocument> {
        match self {
            DocblockIr::Type(type_) => Ok(type_.to_graphql_schema_ast(schema_config)),
            DocblockIr::Field(field) => {
                field.to_graphql_schema_ast(project_name, schema, schema_config)
            }
        }
    }
}

#[derive(Debug, PartialEq, Clone, Copy)]
pub enum IrField {
    PopulatedIrField(PopulatedIrField),
    UnpopulatedIrField(UnpopulatedIrField),
}

impl IrField {
    pub fn key_location(&self) -> Location {
        match self {
            IrField::PopulatedIrField(field) => field.key_location,
            IrField::UnpopulatedIrField(field) => field.key_location,
        }
    }

    pub(crate) fn value(&self) -> Option<WithLocation<StringKey>> {
        match self {
            IrField::PopulatedIrField(field) => Some(field.value),
            IrField::UnpopulatedIrField(_) => None,
        }
    }

    pub(crate) fn new(key_location: Location, value: Option<WithLocation<StringKey>>) -> IrField {
        match value {
            Some(value) => IrField::PopulatedIrField(PopulatedIrField {
                key_location,
                value,
            }),
            None => IrField::UnpopulatedIrField(UnpopulatedIrField { key_location }),
        }
    }
}

#[derive(Debug, PartialEq, Clone, Copy)]
pub struct PopulatedIrField {
    pub key_location: Location,
    pub value: WithLocation<StringKey>,
}

impl TryFrom<IrField> for PopulatedIrField {
    type Error = ();

    fn try_from(ir_field: IrField) -> Result<Self, Self::Error> {
        match ir_field {
            IrField::PopulatedIrField(field) => Ok(field),
            IrField::UnpopulatedIrField(_) => Err(()),
        }
    }
}

#[derive(Debug, PartialEq, Clone, Copy)]
pub struct UnpopulatedIrField {
    pub key_location: Location,
}

impl TryFrom<IrField> for UnpopulatedIrField {
    type Error = ();

    fn try_from(ir_field: IrField) -> Result<Self, Self::Error> {
        match ir_field {
            IrField::PopulatedIrField(_) => Err(()),
            IrField::UnpopulatedIrField(field) => Ok(field),
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum On {
    Type(PopulatedIrField),
    Interface(PopulatedIrField),
}

impl On {
    pub fn type_name(&self) -> StringKey {
        match self {
            On::Type(field) => field.value.item,
            On::Interface(field) => field.value.item,
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
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
    /// For `id` and `__relay_model_instance` resolvers, we want to read just one field
    /// off of that fragment and pass it to the resolver
    Field(StringKey),
    // TODO: Add `FullData` mode for this
}

pub struct RootFragment {
    fragment: WithLocation<FragmentDefinitionName>,
    generated: bool,
    // For Model resolvers, we need to pass the `id` or `__relay_model_instance` field
    // from the fragment data to the resolver function
    inject_fragment_data: Option<FragmentDataInjectionMode>,
}

trait ResolverIr: Sized {
    /// Validate the ResolverIr against the schema and return the TypeSystemDefinition's
    /// that need to be added to the schema.
    fn field_definitions(
        self,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> DiagnosticsResult<Vec<TypeSystemDefinition>>;
    fn location(&self) -> Location;

    fn root_fragment_name(&self) -> Option<WithLocation<FragmentDefinitionName>>;
    fn id_fragment(&self, schema_config: &SchemaConfig) -> Option<RootFragment>;
    fn root_fragment(
        &self,
        object: Option<&Object>,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> Option<RootFragment>;

    fn output_type(&self) -> Option<OutputType>;
    fn deprecated(&self) -> Option<IrField>;
    fn live(&self) -> Option<UnpopulatedIrField>;
    fn named_import(&self) -> Option<StringKey>;
    fn source_hash(&self) -> ResolverSourceHash;
    fn semantic_non_null(&self) -> Option<ConstantDirective>;
    fn type_confirmed(&self) -> bool;
    fn property_lookup_name(&self) -> Option<WithLocation<StringKey>>;
    fn return_fragment(&self) -> Option<WithLocation<FragmentDefinitionName>>;

    fn to_graphql_schema_ast(
        self,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> DiagnosticsResult<SchemaDocument> {
        Ok(SchemaDocument {
            location: self.location(),
            definitions: self.field_definitions(project_config)?,
        })
    }

    fn field_directives(
        &self,
        object: Option<&Object>,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> Vec<ConstantDirective> {
        let mut directives: Vec<ConstantDirective> = vec![
            self.field_relay_resolver_directive(object, project_config),
            resolver_source_hash_directive(self.source_hash()),
        ];

        if let Some(deprecated) = self.deprecated() {
            let span = deprecated.key_location().span();
            directives.push(ConstantDirective {
                span,
                at: dummy_token(span),
                name: string_key_as_identifier(DEPRECATED_RESOLVER_DIRECTIVE_NAME.0),
                arguments: deprecated.value().map(|value| {
                    List::generated(vec![string_argument(
                        DEPRECATED_REASON_ARGUMENT_NAME.0,
                        value,
                    )])
                }),
            })
        }

        if let Some(semantic_non_null) = self.semantic_non_null() {
            directives.push(semantic_non_null)
        }

        directives
    }

    fn type_directives(&self, schema_config: &SchemaConfig) -> Vec<ConstantDirective> {
        vec![
            self.type_relay_resolver_directive(schema_config),
            resolver_source_hash_directive(self.source_hash()),
        ]
    }

    fn type_relay_resolver_directive(&self, schema_config: &SchemaConfig) -> ConstantDirective {
        let location = self.location();
        let span = location.span();
        let import_path = self.location().source_location().path().intern();
        let mut arguments = vec![string_argument(
            IMPORT_PATH_ARGUMENT_NAME.0,
            WithLocation::new(self.location(), import_path),
        )];

        if let Some(live_field) = self.live() {
            arguments.push(true_argument(LIVE_ARGUMENT_NAME.0, live_field.key_location))
        }

        if let Some(root_fragment) = self.id_fragment(schema_config) {
            arguments.push(string_argument(
                FRAGMENT_KEY_ARGUMENT_NAME.0,
                root_fragment.fragment.map(|x| x.0),
            ));

            if root_fragment.generated {
                arguments.push(true_argument(
                    GENERATED_FRAGMENT_ARGUMENT_NAME.0,
                    Location::generated(),
                ))
            }

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

        if let Some(name) = self.named_import() {
            arguments.push(string_argument(
                IMPORT_NAME_ARGUMENT_NAME.0,
                WithLocation::new(self.location(), name),
            ));
        }
        arguments.sort();
        ConstantDirective {
            span,
            at: dummy_token(span),
            name: string_key_as_identifier(RELAY_RESOLVER_DIRECTIVE_NAME.0),
            arguments: Some(List::generated(arguments)),
        }
    }

    fn field_relay_resolver_directive(
        &self,
        object: Option<&Object>,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> ConstantDirective {
        let mut arguments = vec![];

        if let Some(root_fragment) = self.root_fragment(object, project_config) {
            arguments.push(string_argument(
                FRAGMENT_KEY_ARGUMENT_NAME.0,
                root_fragment.fragment.map(|x| x.0),
            ));

            if self.type_confirmed() {
                arguments.push(true_argument(
                    TYPE_CONFIRMED_ARGUMENT_NAME.0,
                    Location::generated(),
                ));
            }

            if root_fragment.generated {
                arguments.push(true_argument(
                    GENERATED_FRAGMENT_ARGUMENT_NAME.0,
                    Location::generated(),
                ))
            }

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
        let property_lookup = self.property_lookup_name();
        if let Some(property_lookup) = property_lookup {
            arguments.push(string_argument(
                RESOLVER_PROPERTY_LOOKUP_NAME.0,
                property_lookup,
            ));
        }
        if let Some(return_fragment) = self.return_fragment() {
            arguments.push(string_argument(
                RETURN_FRAGMENT_ARGUMENT_NAME.0,
                return_fragment.map(|x| x.0),
            ));
        }
        let schema = project_config.schema;

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
                    let mut is_edge_to_strong_object = fields.is_some_and(|fields| {
                        fields.iter().any(|id| {
                            schema.field(*id).name.item
                                == project_config.schema_config.node_interface_id_field
                        })
                    });
                    if let Some(Type::Union(id)) = schema_type {
                        let union = schema.union(id);
                        is_edge_to_strong_object = union.members.iter().all(|id| {
                            schema.object(*id).fields.iter().any(|id| {
                                schema.field(*id).name.item
                                    == project_config.schema_config.node_interface_id_field
                            })
                        });
                    }

                    if !is_edge_to_strong_object {
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

        let mut directive = self.type_relay_resolver_directive(project_config.schema_config);

        match directive.arguments {
            Some(ref mut args) => {
                args.items.extend(arguments);
                args.items.sort();
            }
            None => {
                arguments.sort();
                directive.arguments = Some(List::generated(arguments));
            }
        }
        directive
    }
}

trait ResolverTypeDefinitionIr: ResolverIr {
    fn field_name(&self) -> &Identifier;
    fn field_arguments(&self) -> Option<&List<InputValueDefinition>>;
    fn description(&self) -> Option<StringNode>;
    fn hack_source(&self) -> Option<StringNode>;
    fn fragment_arguments(&self) -> Option<&Vec<Argument>>;

    /// Build recursive object/interface extensions to add this field to all
    /// types that will need it.
    fn interface_definitions(
        &self,
        interface_name: WithLocation<InterfaceName>,
        interface_id: InterfaceID,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> Vec<TypeSystemDefinition> {
        self.interface_definitions_impl(
            interface_name,
            interface_id,
            project_config,
            &mut HashSet::default(),
            &mut HashSet::default(),
        )
    }

    fn interface_definitions_impl(
        &self,
        interface_name: WithLocation<InterfaceName>,
        interface_id: InterfaceID,
        project_config: ResolverProjectConfig<'_, '_>,
        seen_objects: &mut HashSet<ObjectID>,
        seen_interfaces: &mut HashSet<InterfaceID>,
    ) -> Vec<TypeSystemDefinition> {
        let fields = self.fields(None, project_config);
        let schema = project_config.schema;

        // First we extend the interface itself...
        let mut definitions = vec![TypeSystemDefinition::InterfaceTypeExtension(
            InterfaceTypeExtension {
                name: as_identifier(interface_name.map(|x| x.0)),
                interfaces: Vec::new(),
                directives: vec![],
                fields: Some(fields),
                span: Span::empty(),
            },
        )];

        // Secondly we extend every object which implements this interface
        for object_id in &schema.interface(interface_id).implementing_objects {
            if !seen_objects.contains(object_id) {
                seen_objects.insert(*object_id);
                let object = schema.object(*object_id);
                if self.should_extend_interface_field_to_object(project_config, object) {
                    definitions.extend(self.object_definitions(object, project_config));
                }
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
                        project_config,
                        seen_objects,
                        seen_interfaces,
                    ),
                )
            }
        }
        definitions
    }

    // To support model resolver fields defined directly on an interface, without @rootFragment:
    // e.g. @RelayResolver InterfaceName.fieldName(model) { .. }
    //
    // Objects defined on server or in client schema extensions don't have a
    // corresponding model to pass to such resolver fields. Skip extending the object with these
    // resolver fields if a field of the same name is already implemented on the object.
    //
    // Schema validation should ensure the existing field is compatible with the interface definition.
    fn should_extend_interface_field_to_object(
        &self,
        project_config: ResolverProjectConfig<'_, '_>,
        object: &Object,
    ) -> bool {
        // Check @rootFragment on the interface resolver field
        if self.root_fragment_name().is_some() {
            return true;
        }
        object
            .named_field(self.field_name().value, project_config.schema)
            .is_none()
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
        project_config: ResolverProjectConfig<'_, '_>,
        interfaces: &[InterfaceID],
    ) -> DiagnosticsResult<()> {
        let schema = project_config.schema;

        for interface_id in interfaces {
            let interface = schema.interface(*interface_id);
            for field_id in &interface.fields {
                let field = schema.field(*field_id);
                if field.name() == self.field_name().value {
                    return Err(vec![Diagnostic::error(
                        SchemaValidationErrorMessages::ResolverImplementingInterfaceField {
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
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> Vec<TypeSystemDefinition> {
        vec![TypeSystemDefinition::ObjectTypeExtension(
            ObjectTypeExtension {
                name: obj_as_identifier(object.name),
                interfaces: vec![],
                directives: vec![],
                fields: Some(self.fields(Some(object), project_config)),
                span: Span::empty(),
            },
        )]
    }

    fn fields(
        &self,
        object: Option<&Object>,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> List<FieldDefinition> {
        let edge_to = self.output_type().as_ref().map_or_else(
            || {
                // Resolvers return arbitrary JavaScript values. However, we
                // need some GraphQL type to use in the schema. We use
                // `RelayResolverValue` (defined in the relay-extensions.graphql
                // file) for this purpose.
                TypeAnnotation::Named(NamedTypeAnnotation {
                    name: string_key_as_identifier(RESOLVER_VALUE_SCALAR_NAME.0),
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
                    .chain(b.clone().items)
                    .collect::<Vec<_>>(),
            )),
        };

        List::generated(vec![FieldDefinition {
            name: self.field_name().clone(),
            type_: edge_to,
            arguments: args,
            directives: self.field_directives(object, project_config),
            description: self.description(),
            hack_source: self.hack_source(),
            span: Span::empty(),
        }])
    }

    fn fragment_argument_definitions(&self) -> Option<List<InputValueDefinition>> {
        let span = Span::empty();
        self.fragment_arguments().as_ref().map(|args| {
            List::generated(
                args.iter()
                    .map(|arg| InputValueDefinition {
                        name: arg.name.clone(),
                        type_: arg.type_.clone(),
                        default_value: arg.default_value.as_ref().map(|default_value| {
                            DefaultValue {
                                value: default_value.clone(),
                                equals: dummy_token(span),
                                span,
                            }
                        }),
                        directives: vec![],
                        description: None,
                        span,
                    })
                    .collect::<Vec<_>>(),
            )
        })
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct TerseRelayResolverIr {
    pub field: FieldDefinition,
    pub type_: WithLocation<StringKey>,
    pub root_fragment: Option<WithLocation<FragmentDefinitionName>>,
    pub return_fragment: Option<WithLocation<FragmentDefinitionName>>,
    pub deprecated: Option<IrField>,
    pub semantic_non_null: Option<ConstantDirective>,
    pub live: Option<UnpopulatedIrField>,
    pub location: Location,
    pub fragment_arguments: Option<Vec<Argument>>,
    pub source_hash: ResolverSourceHash,
    /// Indicates that the extraction method used has already validated that the
    /// implementaiton matches the GraphQL types.
    pub type_confirmed: bool,
    pub property_lookup_name: Option<WithLocation<StringKey>>,
}

impl ResolverIr for TerseRelayResolverIr {
    fn field_definitions(
        self,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> DiagnosticsResult<Vec<TypeSystemDefinition>> {
        let schema = project_config.schema;

        let name = self
            .field_name()
            .name_with_location(self.location.source_location());
        if name.item == project_config.schema_config.node_interface_id_field {
            return Err(vec![Diagnostic::error(
                SchemaValidationErrorMessages::ResolversCantImplementId {
                    id_field_name: name.item,
                },
                name.location,
            )]);
        }

        if let Some(type_) = schema.get_type(self.type_.item) {
            match type_ {
                Type::Object(object_id) => {
                    let object = schema.object(object_id);
                    return Ok(self.object_definitions(object, project_config));
                }
                Type::Interface(interface_id) => {
                    let interface = schema.interface(interface_id);
                    return Ok(self.interface_definitions(
                        interface.name,
                        interface_id,
                        project_config,
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

    fn root_fragment_name(&self) -> Option<WithLocation<FragmentDefinitionName>> {
        self.root_fragment
    }

    fn id_fragment(&self, _schema_config: &SchemaConfig) -> Option<RootFragment> {
        None
    }

    fn root_fragment(
        &self,
        object: Option<&Object>,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> Option<RootFragment> {
        self.root_fragment
            .map(|fragment| RootFragment {
                fragment,
                generated: false,
                inject_fragment_data: None,
            })
            .or_else(|| get_root_fragment_for_object(project_config.project_name, object))
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

    fn semantic_non_null(&self) -> Option<ConstantDirective> {
        self.semantic_non_null.clone()
    }

    fn live(&self) -> Option<UnpopulatedIrField> {
        self.live
    }

    fn named_import(&self) -> Option<StringKey> {
        Some(self.field.name.value)
    }

    fn source_hash(&self) -> ResolverSourceHash {
        self.source_hash
    }

    fn type_confirmed(&self) -> bool {
        self.type_confirmed
    }

    fn property_lookup_name(&self) -> Option<WithLocation<StringKey>> {
        self.property_lookup_name
    }

    fn return_fragment(&self) -> Option<WithLocation<FragmentDefinitionName>> {
        self.return_fragment
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

    fn hack_source(&self) -> Option<StringNode> {
        self.field.hack_source.clone()
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct LegacyVerboseResolverIr {
    pub field: FieldDefinitionStub,
    pub on: On,
    pub root_fragment: Option<WithLocation<FragmentDefinitionName>>,
    pub return_fragment: Option<WithLocation<FragmentDefinitionName>>,
    pub output_type: Option<OutputType>,
    pub description: Option<WithLocation<StringKey>>,
    pub hack_source: Option<WithLocation<StringKey>>,
    pub deprecated: Option<IrField>,
    pub semantic_non_null: Option<ConstantDirective>,
    pub live: Option<UnpopulatedIrField>,
    pub location: Location,
    pub fragment_arguments: Option<Vec<Argument>>,
    pub source_hash: ResolverSourceHash,
}

impl ResolverIr for LegacyVerboseResolverIr {
    fn field_definitions(
        self,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> DiagnosticsResult<Vec<TypeSystemDefinition>> {
        let schema = project_config.schema;

        let name = self
            .field_name()
            .name_with_location(self.location.source_location());
        if name.item == project_config.schema_config.node_interface_id_field {
            return Err(vec![Diagnostic::error(
                SchemaValidationErrorMessages::ResolversCantImplementId {
                    id_field_name: name.item,
                },
                name.location,
            )]);
        }

        if let Some(OutputType::EdgeTo(edge_to_with_location)) = &self.output_type {
            if let TypeAnnotation::List(edge_to_type) = &edge_to_with_location.item {
                if let Some(false) = schema
                    .get_type(edge_to_type.type_.inner().name.value)
                    .map(|t| schema.is_extension_type(t))
                {
                    return Err(vec![Diagnostic::error(
                        SchemaValidationErrorMessages::ClientEdgeToPluralServerType,
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
                            self.validate_singular_implementation(
                                project_config,
                                &object.interfaces,
                            )?;
                            return Ok(self.object_definitions(object, project_config));
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
                            project_config,
                            &schema.interface(interface_type).interfaces,
                        )?;
                        return Ok(self.interface_definitions(
                            value.map(InterfaceName),
                            interface_type,
                            project_config,
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

    fn id_fragment(&self, _schema_config: &SchemaConfig) -> Option<RootFragment> {
        None
    }

    fn root_fragment_name(&self) -> Option<WithLocation<FragmentDefinitionName>> {
        self.root_fragment
    }

    fn root_fragment(
        &self,
        object: Option<&Object>,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> Option<RootFragment> {
        self.root_fragment
            .map(|fragment| RootFragment {
                fragment,
                generated: false,
                inject_fragment_data: None,
            })
            .or_else(|| get_root_fragment_for_object(project_config.project_name, object))
    }

    fn output_type(&self) -> Option<OutputType> {
        self.output_type.as_ref().cloned()
    }

    fn deprecated(&self) -> Option<IrField> {
        self.deprecated
    }

    fn live(&self) -> Option<UnpopulatedIrField> {
        self.live
    }

    fn semantic_non_null(&self) -> Option<ConstantDirective> {
        self.semantic_non_null.clone()
    }

    fn named_import(&self) -> Option<StringKey> {
        Some(self.field.name.value)
    }

    fn source_hash(&self) -> ResolverSourceHash {
        self.source_hash
    }

    fn type_confirmed(&self) -> bool {
        false
    }

    fn property_lookup_name(&self) -> Option<WithLocation<StringKey>> {
        None
    }

    fn return_fragment(&self) -> Option<WithLocation<FragmentDefinitionName>> {
        self.return_fragment
    }
}

impl ResolverTypeDefinitionIr for LegacyVerboseResolverIr {
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

    fn hack_source(&self) -> Option<StringNode> {
        self.hack_source.map(as_string_node)
    }
}

/// Relay Resolver ID representing a "model" of a strong object
#[derive(Debug, Clone, PartialEq)]
pub struct StrongObjectIr {
    pub type_name: Identifier,
    /// T146185439 The location of everything past @RelayResolver. Note that we use
    /// this incorrectly to refer to the location of the type_name field. It is not!
    /// It is the location of a longer string, e.g. "Foo implements Bar".
    pub rhs_location: Location,
    pub root_fragment: WithLocation<FragmentDefinitionName>,
    pub description: Option<WithLocation<StringKey>>,
    pub deprecated: Option<IrField>,
    pub live: Option<UnpopulatedIrField>,
    pub semantic_non_null: Option<UnpopulatedIrField>,
    pub location: Location,
    /// The interfaces which the newly-created object implements
    pub implements_interfaces: Vec<Identifier>,
    pub source_hash: ResolverSourceHash,
    pub type_confirmed: bool,
}

impl StrongObjectIr {
    pub fn type_definition(&self, schema_config: &SchemaConfig) -> TypeSystemDefinition {
        let span = Span::empty();

        let fields = vec![
            FieldDefinition {
                name: string_key_as_identifier(schema_config.node_interface_id_field),
                type_: TypeAnnotation::NonNull(Box::new(NonNullTypeAnnotation {
                    span,
                    type_: TypeAnnotation::Named(NamedTypeAnnotation {
                        name: string_key_as_identifier(*ID_TYPE),
                    }),
                    exclamation: dummy_token(span),
                })),
                arguments: None,
                directives: vec![ConstantDirective {
                    span,
                    at: dummy_token(span),
                    name: string_key_as_identifier(
                        RELAY_RESOLVER_MODEL_GENERATED_ID_FIELD_DIRECTIVE_NAME.0,
                    ),
                    arguments: None,
                }],
                description: None,
                hack_source: None,
                span,
            },
            generate_model_instance_field(
                schema_config.unselectable_directive_name,
                RESOLVER_VALUE_SCALAR_NAME.0,
                self.description.map(as_string_node),
                None,
                self.type_directives(schema_config),
                self.location(),
            ),
        ];
        TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
            name: self.type_name,
            interfaces: self.implements_interfaces.clone(),
            directives: vec![ConstantDirective {
                span,
                at: dummy_token(span),
                name: string_key_as_identifier(RELAY_RESOLVER_MODEL_DIRECTIVE_NAME.0),
                arguments: None,
            }],
            fields: Some(List::generated(fields)),
            span,
            description: self.description.map(as_string_node),
        })
    }
}

impl ResolverIr for StrongObjectIr {
    fn field_definitions(
        self,
        _project_config: ResolverProjectConfig<'_, '_>,
    ) -> DiagnosticsResult<Vec<TypeSystemDefinition>> {
        Ok(vec![])
    }

    fn location(&self) -> Location {
        self.location
    }

    fn root_fragment_name(&self) -> Option<WithLocation<FragmentDefinitionName>> {
        Some(self.root_fragment)
    }

    fn id_fragment(&self, schema_config: &SchemaConfig) -> Option<RootFragment> {
        Some(RootFragment {
            fragment: self.root_fragment,
            generated: true,
            inject_fragment_data: Some(FragmentDataInjectionMode::Field(
                schema_config.node_interface_id_field,
            )),
        })
    }

    // For Model resolver we always inject the `id` fragment
    fn root_fragment(
        &self,
        _: Option<&Object>,
        _project_config: ResolverProjectConfig<'_, '_>,
    ) -> Option<RootFragment> {
        None
    }

    fn output_type(&self) -> Option<OutputType> {
        None
    }

    fn deprecated(&self) -> Option<IrField> {
        self.deprecated
    }

    fn live(&self) -> Option<UnpopulatedIrField> {
        self.live
    }

    fn semantic_non_null(&self) -> Option<ConstantDirective> {
        None
    }

    fn named_import(&self) -> Option<StringKey> {
        Some(self.type_name.value)
    }

    fn source_hash(&self) -> ResolverSourceHash {
        self.source_hash
    }
    fn type_confirmed(&self) -> bool {
        self.type_confirmed
    }

    fn property_lookup_name(&self) -> Option<WithLocation<StringKey>> {
        None
    }

    fn return_fragment(&self) -> Option<WithLocation<FragmentDefinitionName>> {
        None
    }
}

/// Relay Resolver docblock representing a "model" type for a weak object
#[derive(Debug, Clone, PartialEq)]
pub struct WeakObjectIr {
    pub type_name: Identifier,
    /// T146185439 The location of everything past @RelayResolver. Note that we use
    /// this incorrectly to refer to the location of the type_name field. It is not!
    /// It is the location of a longer string, e.g. "Foo implements Bar".
    pub rhs_location: Location,
    pub description: Option<WithLocation<StringKey>>,
    pub hack_source: Option<WithLocation<StringKey>>,
    pub deprecated: Option<IrField>,
    pub location: Location,
    /// The interfaces which the newly-created object implements
    pub implements_interfaces: Vec<Identifier>,
    pub source_hash: ResolverSourceHash,
    pub type_confirmed: bool,
}

impl WeakObjectIr {
    // Generate the named GraphQL type (with an __relay_model_instance field).
    pub fn type_definition(&self, schema_config: &SchemaConfig) -> TypeSystemDefinition {
        let span = self.rhs_location.span();

        let mut directives = vec![
            ConstantDirective {
                span,
                at: dummy_token(span),
                name: string_key_as_identifier(RELAY_RESOLVER_MODEL_DIRECTIVE_NAME.0),
                arguments: None,
            },
            ConstantDirective {
                span,
                at: dummy_token(span),
                name: string_key_as_identifier(OBJECT_DEFINITION_OUTPUT_TYPE_DIRECTIVE_NAME.0),
                arguments: None,
            },
            ConstantDirective {
                span,
                at: dummy_token(span),
                name: string_key_as_identifier(RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE.0),
                arguments: None,
            },
        ];
        if let Some(deprecated) = self.deprecated {
            directives.push(ConstantDirective {
                span,
                at: dummy_token(span),
                name: string_key_as_identifier(DEPRECATED_RESOLVER_DIRECTIVE_NAME.0),
                arguments: deprecated.value().map(|value| {
                    List::generated(vec![string_argument(
                        DEPRECATED_REASON_ARGUMENT_NAME.0,
                        value,
                    )])
                }),
            })
        }
        let type_name = self.model_type_name();
        let source_hash = self.source_hash();
        let location = self.location();
        TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
            name: self.type_name,
            interfaces: self.implements_interfaces.clone(),
            directives,
            fields: Some(List::generated(vec![generate_model_instance_field(
                schema_config.unselectable_directive_name,
                type_name,
                self.description.map(as_string_node),
                self.hack_source.map(as_string_node),
                vec![resolver_source_hash_directive(source_hash)],
                location,
            )])),
            span,
            description: self.description.map(as_string_node),
        })
    }

    // Generate a custom scalar definition based on the exported type.
    pub fn instance_scalar_type_definition(&self) -> TypeSystemDefinition {
        let span = self.rhs_location.span();
        TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition {
            name: Identifier {
                span,
                token: dummy_token(span),
                value: self.model_type_name(),
            },
            directives: vec![ConstantDirective {
                span,
                at: dummy_token(span),
                name: as_identifier(WithLocation::generated(*CUSTOM_SCALAR_DIRECTIVE_NAME)),
                arguments: Some(List::generated(vec![
                    ConstantArgument {
                        span,
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
                        span,
                        name: as_identifier(WithLocation::generated(
                            *EXPORT_NAME_CUSTOM_SCALAR_ARGUMENT_NAME,
                        )),
                        colon: dummy_token(span),
                        value: ConstantValue::String(StringNode {
                            token: dummy_token(span),
                            value: self.type_name.value,
                        }),
                    },
                ])),
            }],
            span,
            description: None,
        })
    }

    // Derive a typename for the custom scalar that will be used as this type's
    // `__relay_model_instance` model.
    fn model_type_name(&self) -> StringKey {
        // TODO: Ensure this type does not already exist?
        format!(
            "{}{}",
            self.type_name.value, *MODEL_CUSTOM_SCALAR_TYPE_SUFFIX
        )
        .intern()
    }
}

impl ResolverIr for WeakObjectIr {
    fn field_definitions(
        self,
        project_config: ResolverProjectConfig<'_, '_>,
    ) -> DiagnosticsResult<Vec<TypeSystemDefinition>> {
        Ok(vec![
            self.instance_scalar_type_definition(),
            self.type_definition(project_config.schema_config),
        ])
    }

    fn location(&self) -> Location {
        self.location
    }

    fn root_fragment_name(&self) -> Option<WithLocation<FragmentDefinitionName>> {
        None
    }

    fn id_fragment(&self, _schema_config: &SchemaConfig) -> Option<RootFragment> {
        None
    }

    fn root_fragment(
        &self,
        _: Option<&Object>,
        _project_config: ResolverProjectConfig<'_, '_>,
    ) -> Option<RootFragment> {
        None
    }

    fn output_type(&self) -> Option<OutputType> {
        None
    }

    fn deprecated(&self) -> Option<IrField> {
        self.deprecated
    }

    fn live(&self) -> Option<UnpopulatedIrField> {
        None
    }

    fn semantic_non_null(&self) -> Option<ConstantDirective> {
        None
    }

    fn named_import(&self) -> Option<StringKey> {
        None
    }

    fn source_hash(&self) -> ResolverSourceHash {
        self.source_hash
    }

    fn type_confirmed(&self) -> bool {
        self.type_confirmed
    }

    fn property_lookup_name(&self) -> Option<WithLocation<StringKey>> {
        None
    }

    fn return_fragment(&self) -> Option<WithLocation<FragmentDefinitionName>> {
        None
    }
}

fn string_argument(name: StringKey, value: WithLocation<StringKey>) -> ConstantArgument {
    let span = value.location.span();
    ConstantArgument {
        span,
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
        span,
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
        token: dummy_token(Span::empty()),
        value,
    }
}

fn as_identifier(value: WithLocation<StringKey>) -> Identifier {
    let span = value.location.span();
    Identifier {
        span,
        token: dummy_token(span),
        value: value.item,
    }
}

fn obj_as_identifier(value: WithLocation<ObjectName>) -> Identifier {
    let span = value.location.span();
    Identifier {
        span,
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

fn dummy_token(span: Span) -> Token {
    Token {
        span,
        kind: TokenKind::Empty,
    }
}

fn get_root_fragment_for_object(
    project_name: ProjectName,
    object: Option<&Object>,
) -> Option<RootFragment> {
    if object?
        .directives
        .named(*RELAY_RESOLVER_MODEL_DIRECTIVE_NAME)
        .is_some()
    {
        Some(RootFragment {
            fragment: WithLocation::generated(FragmentDefinitionName(
                project_name
                    .generate_name_for_object_and_field(
                        object.unwrap().name.item.0,
                        *RELAY_RESOLVER_MODEL_INSTANCE_FIELD,
                    )
                    .intern(),
            )),
            generated: true,
            inject_fragment_data: Some(FragmentDataInjectionMode::Field(
                *RELAY_RESOLVER_MODEL_INSTANCE_FIELD,
            )),
        })
    } else {
        None
    }
}

/// Generate the internal field for weak and strong model types
fn generate_model_instance_field(
    unselectable_directive_name: DirectiveName,
    type_name: StringKey,
    description: Option<StringNode>,
    hack_source: Option<StringNode>,
    mut directives: Vec<ConstantDirective>,
    location: Location,
) -> FieldDefinition {
    let span = location.span();
    directives.push(ConstantDirective {
        span,
        at: dummy_token(span),
        name: string_key_as_identifier(unselectable_directive_name.0),
        arguments: Some(List::generated(vec![string_argument(
            DEPRECATED_REASON_ARGUMENT_NAME.0,
            WithLocation::new(
                location,
                "This field is intended only for Relay's internal use".intern(),
            ),
        )])),
    });

    FieldDefinition {
        name: string_key_as_identifier(*RELAY_RESOLVER_MODEL_INSTANCE_FIELD),
        type_: TypeAnnotation::NonNull(Box::new(NonNullTypeAnnotation {
            span,
            type_: TypeAnnotation::Named(NamedTypeAnnotation {
                name: string_key_as_identifier(type_name),
            }),
            exclamation: dummy_token(span),
        })),
        arguments: None,
        directives,
        description,
        hack_source,
        span,
    }
}

fn resolver_source_hash_directive(source_hash: ResolverSourceHash) -> ConstantDirective {
    let span = Span::empty();
    ConstantDirective {
        span,
        at: dummy_token(span),
        name: string_key_as_identifier(RELAY_RESOLVER_SOURCE_HASH.0),
        arguments: Some(List::generated(vec![string_argument(
            RELAY_RESOLVER_SOURCE_HASH_VALUE.0,
            WithLocation::generated(source_hash.value()),
        )])),
    }
}
