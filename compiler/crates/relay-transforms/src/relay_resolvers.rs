/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use docblock_shared::FRAGMENT_KEY_ARGUMENT_NAME;
use docblock_shared::GENERATED_FRAGMENT_ARGUMENT_NAME;
use docblock_shared::HAS_OUTPUT_TYPE_ARGUMENT_NAME;
use docblock_shared::IMPORT_NAME_ARGUMENT_NAME;
use docblock_shared::IMPORT_PATH_ARGUMENT_NAME;
use docblock_shared::INJECT_FRAGMENT_DATA_ARGUMENT_NAME;
use docblock_shared::LIVE_ARGUMENT_NAME;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use docblock_shared::RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE;
use docblock_shared::TYPE_CONFIRMED_ARGUMENT_NAME;
use graphql_ir::associated_data_impl;
use graphql_ir::Argument;
use graphql_ir::Directive;
use graphql_ir::Field as IrField;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentSignature;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::VariableName;
use graphql_syntax::BooleanNode;
use graphql_syntax::ConstantValue;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::Lookup;
use relay_config::ProjectName;
use schema::ArgumentValue;
use schema::Field;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use super::ValidationMessage;
use crate::generate_relay_resolvers_operations_for_nested_objects::generate_name_for_nested_object_operation;
use crate::ClientEdgeMetadata;
use crate::FragmentAliasMetadata;
use crate::RequiredMetadataDirective;
use crate::CHILDREN_CAN_BUBBLE_METADATA_KEY;
use crate::CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME;
use crate::REQUIRED_DIRECTIVE_NAME;

/// Transform Relay Resolver fields. This is done in two passes.
///
/// First we locate fields which are backed Relay Resolvers and attach a
/// metadata directive to them, then we convert those fields into either an
/// annotated stub `__id` field, or an annotated fragment spread referencing the
/// resolver's root fragment.
///
/// See the docblock for `relay_resolvers_spread_transform` for more details
/// about the resulting format.
pub fn relay_resolvers(project_name: ProjectName, program: &Program) -> DiagnosticsResult<Program> {
    let transformed_fields_program = relay_resolvers_fields_transform(project_name, program)?;
    relay_resolvers_spread_transform(&transformed_fields_program)
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ResolverNormalizationInfo {
    pub inner_type: Type,
    pub plural: bool,
    pub normalization_operation: WithLocation<OperationDefinitionName>,
    pub weak_object_instance_field: Option<FieldID>,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum ResolverOutputTypeInfo {
    /// Resolver returns an opaque scalar field
    ScalarField,
    Composite(ResolverNormalizationInfo),
    /// Resolver returns one or more edges to items in the store.
    EdgeTo,
    Legacy,
}

impl ResolverOutputTypeInfo {
    pub fn normalization_ast_should_have_is_output_type_true(&self) -> bool {
        match self {
            ResolverOutputTypeInfo::ScalarField => true,
            ResolverOutputTypeInfo::Composite(_) => true,
            ResolverOutputTypeInfo::EdgeTo => false,
            ResolverOutputTypeInfo::Legacy => false,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum FragmentDataInjectionMode {
    Field { name: StringKey, is_required: bool }, // TODO: Add Support for FullData
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
struct RelayResolverFieldMetadata {
    field_parent_type: StringKey,
    import_path: StringKey,
    import_name: Option<StringKey>,
    fragment_name: Option<FragmentDefinitionName>,
    fragment_data_injection_mode: Option<FragmentDataInjectionMode>,
    field_path: StringKey,
    live: bool,
    output_type_info: ResolverOutputTypeInfo,
    type_confirmed: bool,
}
associated_data_impl!(RelayResolverFieldMetadata);

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RelayResolverMetadata {
    pub field_id: FieldID,
    pub import_path: StringKey,
    pub import_name: Option<StringKey>,
    pub field_alias: Option<StringKey>,
    pub field_path: StringKey,
    pub field_arguments: Vec<Argument>,
    pub live: bool,
    pub output_type_info: ResolverOutputTypeInfo,
    /// A tuple with fragment name and field name we need read
    /// of that fragment to pass it to the resolver function.
    pub fragment_data_injection_mode: Option<(
        WithLocation<FragmentDefinitionName>,
        FragmentDataInjectionMode,
    )>,
    pub type_confirmed: bool,
}
associated_data_impl!(RelayResolverMetadata);

impl RelayResolverMetadata {
    pub fn field<'schema>(&self, schema: &'schema SDLSchema) -> &'schema Field {
        schema.field(self.field_id)
    }

    pub fn field_name(&self, schema: &SDLSchema) -> StringKey {
        self.field(schema).name.item
    }

    pub fn field_parent_type_name(&self, schema: &SDLSchema) -> StringKey {
        let parent_type = self
            .field(schema)
            .parent_type
            .expect("Expected parent type");
        match parent_type {
            Type::Interface(interface_id) => schema.interface(interface_id).name.item.0,
            Type::Object(object_id) => schema.object(object_id).name.item.0,
            _ => panic!("Unexpected parent type for resolver."),
        }
    }

    pub fn generate_local_resolver_name(&self, schema: &SDLSchema) -> StringKey {
        resolver_import_alias(self.field_parent_type_name(schema), self.field_name(schema))
    }
    pub fn generate_local_resolver_type_name(&self, schema: &SDLSchema) -> StringKey {
        resolver_type_import_alias(self.field_parent_type_name(schema), self.field_name(schema))
    }
}

/// Convert fields with attached Relay Resolver metadata into the fragment
/// spread of their data dependencies (root fragment). Their
/// `RelayResolverMetadata` IR directive is left attached to this fragment
/// spread.
///
/// For resolvers without a fragment (for example @live resolvers that read from
/// an external source, or resolvers which are simply a function of their
/// arguments) the field is transformed into a `__id` field with the
/// `RelayResolverMetadata` IR directive attached.
fn relay_resolvers_spread_transform(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = RelayResolverSpreadTransform::new(program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct RelayResolverSpreadTransform<'program> {
    program: &'program Program,
    errors: Vec<Diagnostic>,
}

impl<'program> RelayResolverSpreadTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            errors: Default::default(),
        }
    }

    fn transformed_field(&self, field: &impl IrField) -> Option<Selection> {
        RelayResolverFieldMetadata::find(field.directives()).map(|field_metadata| {
            let fragment_definition = field_metadata.fragment_name.map(|fragment_name| {
                self.program
                    .fragment(fragment_name)
                    .expect("Previous validation passes ensured this exists.")
            });

            let (fragment_arguments, field_arguments) =
                field.arguments().iter().cloned().partition(|arg| {
                    if let Some(fragment_definition) = fragment_definition {
                        fragment_definition
                            .variable_definitions
                            .named(VariableName(arg.name.item.0))
                            .is_some()
                    } else {
                        false
                    }
                });

            let resolver_metadata = RelayResolverMetadata {
                import_path: field_metadata.import_path,
                import_name: field_metadata.import_name,
                field_alias: field.alias().map(|field_alias| field_alias.item),
                field_path: field_metadata.field_path,
                field_id: field.definition().item,
                field_arguments,
                live: field_metadata.live,
                output_type_info: field_metadata.output_type_info.clone(),
                fragment_data_injection_mode: field_metadata
                    .fragment_data_injection_mode
                    .as_ref()
                    .map(|injection_mode| {
                        (
                            self.program
                                .fragment(
                                    field_metadata
                                        .fragment_name
                                        .expect("Expected to have a fragment name."),
                                )
                                .expect("Expect to have a fragment node.")
                                .name,
                            *injection_mode,
                        )
                    }),
                type_confirmed: field_metadata.type_confirmed,
            };

            let mut new_directives: Vec<Directive> = vec![resolver_metadata.into()];

            for directive in field.directives() {
                if directive.name.item != RelayResolverFieldMetadata::directive_name() {
                    new_directives.push(directive.clone())
                }
            }
            if let Some(fragment_definition) = fragment_definition {
                Selection::FragmentSpread(Arc::new(FragmentSpread {
                    fragment: fragment_definition.name,
                    arguments: fragment_arguments,
                    signature: Some(FragmentSignature {
                        name: fragment_definition.name,
                        variable_definitions: fragment_definition.variable_definitions.clone(),
                        type_condition: fragment_definition.type_condition,
                    }),
                    directives: new_directives,
                }))
            } else {
                Selection::ScalarField(Arc::new(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(self.program.schema.clientid_field()),
                    arguments: vec![],
                    directives: new_directives,
                }))
            }
        })
    }
}

impl<'program> Transformer for RelayResolverSpreadTransform<'program> {
    const NAME: &'static str = "RelayResolversSpreadTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        match self.transformed_field(field) {
            Some(selection) => Transformed::Replace(selection),
            None => Transformed::Keep,
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        match self.transformed_field(field) {
            Some(selection) => Transformed::Replace(selection),
            None => self.default_transform_linked_field(field),
        }
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &graphql_ir::InlineFragment,
    ) -> Transformed<Selection> {
        match ClientEdgeMetadata::find(fragment) {
            Some(client_edge_metadata) => {
                let backing_id_field = self
                    .transform_selection(&client_edge_metadata.backing_field)
                    .unwrap_or_else(|| client_edge_metadata.backing_field.clone());

                let selections_field = self
                    .default_transform_linked_field(client_edge_metadata.linked_field)
                    .unwrap_or_else(|| {
                        Selection::LinkedField(Arc::new(client_edge_metadata.linked_field.clone()))
                    });

                let selections = vec![backing_id_field, selections_field];

                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    selections,
                    ..fragment.clone()
                })))
            }
            None => self.default_transform_inline_fragment(fragment),
        }
    }
}

/// Identify fields which are backed Relay Resolvers, and attach additional
/// metadata to those fields, such as their resolvers' module locations, root
/// fragments (if any), whether they're @live, etc. This is all derived from the
/// schema, which is itself derived from the Resolver docblock annotations.
///
/// After this transform, future transforms should not need to consult the
/// schema to know whether a field is backed by a Relay Resolver, or what its
/// root fragment dependencies are. They should simply be able to check for the
/// presence of the `RelayResolverFieldMetadata` IR directive on the field.
fn relay_resolvers_fields_transform(
    project_name: ProjectName,
    program: &Program,
) -> DiagnosticsResult<Program> {
    let mut transform = RelayResolverFieldTransform::new(project_name, program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct RelayResolverFieldTransform<'program> {
    project_name: ProjectName,
    program: &'program Program,
    errors: Vec<Diagnostic>,
    path: Vec<&'program str>,
}

impl<'program> RelayResolverFieldTransform<'program> {
    fn new(project_name: ProjectName, program: &'program Program) -> Self {
        Self {
            program,
            errors: Default::default(),
            path: Vec::new(),
            project_name,
        }
    }

    fn extract_resolver_field_directives(
        &mut self,
        field: &impl IrField,
    ) -> Option<Vec<Directive>> {
        let schema_field = self.program.schema.field(field.definition().item);

        get_resolver_info(
            &self.program.schema,
            schema_field,
            field.definition().location,
        )
        .and_then(|info| {
            match info {
                Ok(ResolverInfo {
                    fragment_name,
                    import_path,
                    import_name,
                    live,
                    has_output_type,
                    fragment_data_injection_mode,
                    type_confirmed
                }) => {
                    let mut non_required_directives =
                        field.directives().iter().filter(|directive| {
                            // For now, only @required and @waterfall are allowed on Resolver fields.
                            directive.name.item != RequiredMetadataDirective::directive_name()
                                && directive.name.item != *REQUIRED_DIRECTIVE_NAME
                                && directive.name.item != *CHILDREN_CAN_BUBBLE_METADATA_KEY
                                && directive.name.item != *CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME
                        });
                    if let Some(directive) = non_required_directives.next() {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::RelayResolverUnexpectedDirective,
                            directive.location,
                        ));
                    }

                    let parent_type = schema_field.parent_type.unwrap();
                    let inner_type = schema_field.type_.inner();

                    if let Some(fragment_name) = fragment_name {
                        match self.program.fragment(fragment_name) {
                            Some(fragment_definition) => {
                                if !self.program.schema.are_overlapping_types(
                                    fragment_definition.type_condition,
                                    parent_type,
                                ) {
                                    // This invariant is enforced when we generate docblock IR, but we double check here to
                                    // ensure no later transforms break that invariant, and that manually written test
                                    // schemas gets this right.
                                    panic!("Invalid type condition on `{}`, the fragment backing the Relay Resolver field `{}`.", fragment_name, schema_field.name.item);
                                }
                            }
                            None => {
                                self.errors.push(Diagnostic::error(
                                    ValidationMessage::InvalidRelayResolverFragmentName {
                                        fragment_name,
                                    },
                                    // We don't have locations for directives in schema files.
                                    // So we send them to the field name, rather than the directive value.
                                    schema_field.name.location,
                                ));
                                return None;
                            }
                        }
                    }

                    let output_type_info = if has_output_type {
                        if inner_type.is_composite_type() {
                            let normalization_operation = generate_name_for_nested_object_operation(
                                self.project_name,
                                &self.program.schema,
                                self.program.schema.field(field.definition().item),
                            );

                            let weak_object_instance_field =
                                inner_type.get_object_id().and_then(|id| {
                                    let object = self.program.schema.object(id);
                                    if object
                                        .directives
                                        .named(*RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE)
                                        .is_some()
                                    {
                                        // This is expect to be `__relay_model_instance`
                                        // TODO: Add validation/panic to assert that weak object has only
                                        // one field here, and it's a magic relay instance field.
                                        Some(*object.fields.first().unwrap())
                                    } else {
                                        None
                                    }
                                });

                            ResolverOutputTypeInfo::Composite(
                                ResolverNormalizationInfo {
                                    inner_type,
                                    plural: schema_field.type_.is_list(),
                                    normalization_operation,
                                    weak_object_instance_field,
                                },
                            )
                        } else {
                            ResolverOutputTypeInfo::ScalarField
                        }
                    } else if inner_type.is_composite_type() {
                        ResolverOutputTypeInfo::EdgeTo
                    } else {
                        ResolverOutputTypeInfo::Legacy
                    };

                    let resolver_field_metadata = RelayResolverFieldMetadata {
                        import_path,
                        import_name,
                        field_parent_type: self.program.schema.get_type_name(parent_type),
                        fragment_name,
                        field_path: self.path.join(".").intern(),
                        live,
                        output_type_info,
                        fragment_data_injection_mode,
                        type_confirmed
                    };

                    let mut directives: Vec<Directive> = field.directives().to_vec();

                    directives.push(resolver_field_metadata.into());
                    Some(directives)
                }
                Err(diagnostics) => {
                    for diagnostic in diagnostics {
                        self.errors.push(diagnostic);
                    }
                    None
                }
            }
        })
    }
}

impl Transformer for RelayResolverFieldTransform<'_> {
    const NAME: &'static str = "RelayResolversFieldTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        self.path
            .push(field.alias_or_name(&self.program.schema).lookup());

        let transformed =
            self.extract_resolver_field_directives(field)
                .map_or(Transformed::Keep, |directives| {
                    Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
                        directives,
                        ..field.clone()
                    })))
                });

        self.path.pop();
        transformed
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        self.path
            .push(field.alias_or_name(&self.program.schema).lookup());

        let transformed = self.extract_resolver_field_directives(field).map_or_else(
            || self.default_transform_linked_field(field),
            |directives| {
                Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                    directives,
                    ..field.clone()
                })))
            },
        );
        self.path.pop();
        transformed
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &graphql_ir::InlineFragment,
    ) -> Transformed<Selection> {
        let maybe_alias =
            FragmentAliasMetadata::find(&fragment.directives).map(|metadata| metadata.alias.item);

        if let Some(alias) = maybe_alias {
            self.path.push(alias.lookup())
        }

        // Note that Client Edge fields have already been transformed into an inline
        // fragment. This inline fragment is used like a tuple to group together the
        // backing field which defines the relationship (resolver that returns an ID)
        // and the selections hanging off of that.
        let transformed = match ClientEdgeMetadata::find(fragment) {
            Some(client_edge_metadata) => {
                let backing_id_field = self
                    .transform_selection(&client_edge_metadata.backing_field)
                    .unwrap_or_else(|| client_edge_metadata.backing_field.clone());

                let field_name = client_edge_metadata
                    .linked_field
                    .alias_or_name(&self.program.schema);

                self.path.push(field_name.lookup());
                let selections_field = self
                    .default_transform_linked_field(client_edge_metadata.linked_field)
                    .unwrap_or_else(|| {
                        Selection::LinkedField(Arc::new(client_edge_metadata.linked_field.clone()))
                    });
                self.path.pop();

                let selections = vec![backing_id_field, selections_field];

                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    selections,
                    ..fragment.clone()
                })))
            }
            None => self.default_transform_inline_fragment(fragment),
        };

        if maybe_alias.is_some() {
            self.path.pop();
        }

        transformed
    }
}

#[derive(Debug)]
pub struct ResolverInfo {
    fragment_name: Option<FragmentDefinitionName>,
    fragment_data_injection_mode: Option<FragmentDataInjectionMode>,
    pub import_path: StringKey,
    pub import_name: Option<StringKey>,
    live: bool,
    has_output_type: bool,
    type_confirmed: bool,
}

pub fn get_resolver_info(
    schema: &SDLSchema,
    resolver_field: &Field,
    error_location: Location,
) -> Option<DiagnosticsResult<ResolverInfo>> {
    if !resolver_field.is_extension {
        return None;
    }
    resolver_field
        .directives
        .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
        .map(|directive| {
            let arguments = &directive.arguments;
            let fragment_name =
                get_argument_value(arguments, *FRAGMENT_KEY_ARGUMENT_NAME, error_location)
                    .ok()
                    .map(FragmentDefinitionName);
            let import_path =
                get_argument_value(arguments, *IMPORT_PATH_ARGUMENT_NAME, error_location)?;
            let live = get_bool_argument_is_true(arguments, *LIVE_ARGUMENT_NAME);
            let has_output_type =
                get_bool_argument_is_true(arguments, *HAS_OUTPUT_TYPE_ARGUMENT_NAME);
            let import_name =
                get_argument_value(arguments, *IMPORT_NAME_ARGUMENT_NAME, error_location).ok();
            let inject_fragment_data = get_argument_value(
                arguments,
                *INJECT_FRAGMENT_DATA_ARGUMENT_NAME,
                error_location,
            )
            .ok();
            let type_confirmed =
                get_bool_argument_is_true(arguments, *TYPE_CONFIRMED_ARGUMENT_NAME);

            Ok(ResolverInfo {
                fragment_name,
                import_path,
                import_name,
                live,
                has_output_type,
                fragment_data_injection_mode: inject_fragment_data.map(|field_name| {
                    let injected_field_id = schema
                        .named_field(
                            resolver_field.parent_type.unwrap_or_else(|| {
                                panic!(
                                    "Parent type should be defined for the field `{}`.",
                                    field_name
                                )
                            }),
                            field_name,
                        )
                        .unwrap_or_else(|| {
                            panic!(
                                "Expect a field `{}` to be defined on the resolvers parent type.",
                                field_name
                            )
                        });
                    FragmentDataInjectionMode::Field {
                        name: field_name,
                        is_required: schema.field(injected_field_id).type_.is_non_null(),
                    }
                }),
                type_confirmed,
            })
        })
}

pub(crate) fn get_argument_value(
    arguments: &[ArgumentValue],
    argument_name: ArgumentName,
    error_location: Location,
) -> DiagnosticsResult<StringKey> {
    match arguments.named(argument_name) {
        Some(argument) => {
            match argument.value.get_string_literal() {
                Some(import_path) => Ok(import_path),
                None => {
                    // This is a validation error, but ideally it would be done when we validate the client schema.
                    Err(vec![Diagnostic::error(
                        ValidationMessage::InvalidRelayResolverKeyArg { key: argument_name },
                        error_location,
                    )])
                }
            }
        }
        None => {
            // Should we expect schema validation to catch this for required fields?
            Err(vec![Diagnostic::error(
                ValidationMessage::MissingRelayResolverKeyArg { key: argument_name },
                error_location,
            )])
        }
    }
}

pub(crate) fn get_bool_argument_is_true(
    arguments: &[ArgumentValue],
    argument_name: ArgumentName,
) -> bool {
    match arguments.named(argument_name) {
        Some(ArgumentValue {
            value: ConstantValue::Boolean(BooleanNode { value, .. }),
            ..
        }) => *value,
        None => false,
        // These schema extensions are generated by our compiler. If they are malformed, it indicates a bug in
        // relay-docblock.
        _ => panic!(
            "Expected the `live` argument in a @relay_resolver schema directive to be either omitted or a static boolean."
        ),
    }
}

// If the field is a resolver, return its user defined fragment name. Does not
// return generated fragment names.
pub fn get_resolver_fragment_dependency_name(field: &Field) -> Option<FragmentDefinitionName> {
    if !field.is_extension {
        return None;
    }

    field
        .directives
        .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
        .filter(|resolver_directive| {
            let generated = resolver_directive
                .arguments
                .named(*GENERATED_FRAGMENT_ARGUMENT_NAME)
                .and_then(|arg| arg.value.get_bool_literal())
                .unwrap_or(false);
            !generated
        })
        .and_then(|resolver_directive| {
            resolver_directive
                .arguments
                .named(*FRAGMENT_KEY_ARGUMENT_NAME)
        })
        .and_then(|arg| arg.value.get_string_literal().map(FragmentDefinitionName))
}

fn to_camel_case(non_camelized_string: String) -> String {
    let mut camelized_string = String::with_capacity(non_camelized_string.len());
    let mut last_character_was_not_alphanumeric = false;
    for (i, ch) in non_camelized_string.chars().enumerate() {
        if !ch.is_alphanumeric() {
            last_character_was_not_alphanumeric = true;
        } else if last_character_was_not_alphanumeric {
            camelized_string.push(ch.to_ascii_uppercase());
            last_character_was_not_alphanumeric = false;
        } else {
            camelized_string.push(if i == 0 { ch.to_ascii_lowercase() } else { ch });
            last_character_was_not_alphanumeric = false;
        }
    }
    camelized_string
}

pub fn resolver_import_alias(parent_type_name: StringKey, field_name: StringKey) -> StringKey {
    to_camel_case(format!("{}_{}_resolver", parent_type_name, field_name,)).intern()
}
pub fn resolver_type_import_alias(parent_type_name: StringKey, field_name: StringKey) -> StringKey {
    to_camel_case(format!("{}_{}_resolver_type", parent_type_name, field_name,)).intern()
}
