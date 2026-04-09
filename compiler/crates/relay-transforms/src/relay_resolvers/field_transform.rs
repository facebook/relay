/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use docblock_shared::FRAGMENT_KEY_ARGUMENT_NAME;
use docblock_shared::HAS_OUTPUT_TYPE_ARGUMENT_NAME;
use docblock_shared::IMPORT_NAME_ARGUMENT_NAME;
use docblock_shared::IMPORT_PATH_ARGUMENT_NAME;
use docblock_shared::INJECT_FRAGMENT_DATA_ARGUMENT_NAME;
use docblock_shared::LIVE_ARGUMENT_NAME;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use docblock_shared::RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE;
use docblock_shared::RESOLVER_PROPERTY_LOOKUP_NAME;
use docblock_shared::RETURN_FRAGMENT_ARGUMENT_NAME;
use docblock_shared::TYPE_CONFIRMED_ARGUMENT_NAME;
use graphql_ir::Directive;
use graphql_ir::Field as IrField;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use relay_config::ProjectName;
use schema::Field;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use super::FragmentDataInjectionMode;
use super::RelayResolverFieldMetadata;
use super::ResolverOutputTypeInfo;
use super::ResolverSchemaGenType;
use super::ValidationMessage;
use super::get_argument_value;
use super::get_bool_argument_is_true;
use crate::CHILDREN_CAN_BUBBLE_METADATA_KEY;
use crate::CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME;
use crate::ClientEdgeMetadata;
use crate::FragmentAliasMetadata;
use crate::REQUIRED_DIRECTIVE_NAME;
use crate::RequiredMetadataDirective;
use crate::catch_directive::CATCH_DIRECTIVE_NAME;
use crate::catch_directive::CatchMetadataDirective;
use crate::generate_relay_resolvers_operations_for_nested_objects::generate_name_for_nested_object_operation;

// Type definitions

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ResolverNormalizationInfo {
    pub inner_type: Type,
    pub plural: bool,
    pub normalization_operation: WithLocation<OperationDefinitionName>,
    pub weak_object_instance_field: Option<FieldID>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct ResolverInfo {
    pub fragment_name: Option<FragmentDefinitionName>,
    pub fragment_data_injection_mode: Option<FragmentDataInjectionMode>,
    pub import_path: StringKey,
    pub import_name: Option<StringKey>,
    pub live: bool,
    pub(crate) has_output_type: bool,
    pub type_confirmed: bool,
    pub resolver_type: ResolverSchemaGenType,
    pub(crate) return_fragment: Option<WithLocation<FragmentDefinitionName>>,
}

// Public API

/// Identify fields which are backed Relay Resolvers, and attach additional
/// metadata to those fields, such as their resolvers' module locations, root
/// fragments (if any), whether they're @live, etc. This is all derived from the
/// schema, which is itself derived from the Resolver docblock annotations.
///
/// After this transform, future transforms should not need to consult the
/// schema to know whether a field is backed by a Relay Resolver, or what its
/// root fragment dependencies are. They should simply be able to check for the
/// presence of the `RelayResolverFieldMetadata` IR directive on the field.
pub(super) fn relay_resolvers_fields_transform(
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
                Ok(resolver_info) => {
                    let mut non_required_directives =
                        field.directives().iter().filter(|directive| {
                            // For now, only @required, @waterfall, and @catch are allowed on Resolver fields.
                            directive.name.item != RequiredMetadataDirective::directive_name()
                                && directive.name.item != *REQUIRED_DIRECTIVE_NAME
                                && directive.name.item != *CHILDREN_CAN_BUBBLE_METADATA_KEY
                                && directive.name.item != *CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME
                                && directive.name.item != crate::match_::MATCH_CONSTANTS.match_directive_name
                                && directive.name.item != *CATCH_DIRECTIVE_NAME
                                && directive.name.item != CatchMetadataDirective::directive_name()
                        });
                    if let Some(directive) = non_required_directives.next() {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::RelayResolverUnexpectedDirective,
                            directive.location,
                        ));
                    }

                    let parent_type = schema_field.parent_type.unwrap();
                    let inner_type = schema_field.type_.inner();

                    if let Some(fragment_name) = resolver_info.fragment_name {
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

                    let output_type_info = if resolver_info.has_output_type {
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
                        import_path: resolver_info.import_path,
                        import_name: resolver_info.import_name,
                        field_parent_type: self.program.schema.get_type_name(parent_type),
                        fragment_name: resolver_info.fragment_name,
                        field_path: self.path.join(".").intern(),
                        live: resolver_info.live,
                        output_type_info,
                        fragment_data_injection_mode: resolver_info.fragment_data_injection_mode,
                        type_confirmed: resolver_info.type_confirmed,
                        resolver_type: resolver_info.resolver_type,
                        return_fragment: resolver_info.return_fragment,
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

impl Transformer<'_> for RelayResolverFieldTransform<'_> {
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
                    .transform_selection(client_edge_metadata.backing_field)
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
            let resolver_type =
                match get_argument_value(arguments, *RESOLVER_PROPERTY_LOOKUP_NAME, error_location)
                    .ok()
                {
                    Some(property_name) => ResolverSchemaGenType::PropertyLookup { property_name },
                    None => ResolverSchemaGenType::ResolverModule,
                };

            let return_fragment = arguments
                .named(*RETURN_FRAGMENT_ARGUMENT_NAME)
                .and_then(|arg| {
                    arg.value.get_string_literal().map(|name| WithLocation {
                        // Use the resolver field's location (from schema) for accurate error reporting
                        location: resolver_field.name.location.with_span(arg.value.span()),
                        item: FragmentDefinitionName(name),
                    })
                });

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
                                    "Parent type should be defined for the field `{field_name}`."
                                )
                            }),
                            field_name,
                        )
                        .unwrap_or_else(|| {
                            panic!(
                                "Expect a field `{field_name}` to be defined on the resolvers parent type."
                            )
                        });
                    FragmentDataInjectionMode::Field {
                        name: field_name,
                        is_required: schema.field(injected_field_id).type_.is_non_null(),
                    }
                }),
                type_confirmed,
                resolver_type,
                return_fragment,
            })
        })
}
