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
use docblock_shared::MAY_WATERFALL_ARGUMENT_NAME;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
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
use relay_schema::definitions::weak_object_instance_field;
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
    /// The resolver declared `@mayWaterfall`: it may return a pointer to a
    /// different server object, so consumers must acknowledge with `@waterfall`.
    pub(crate) may_waterfall: bool,
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
    id_field_name: StringKey,
) -> DiagnosticsResult<Program> {
    let mut transform = RelayResolverFieldTransform::new(project_name, program, id_field_name);
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
    /// The project's `node_interface_id_field` (`id` by default). Used to detect a
    /// non-Node server VALUE return type (a server object with no such field) for
    /// the read-in-place shadow arm.
    id_field_name: StringKey,
}

impl<'program> RelayResolverFieldTransform<'program> {
    fn new(
        project_name: ProjectName,
        program: &'program Program,
        id_field_name: StringKey,
    ) -> Self {
        Self {
            program,
            errors: Default::default(),
            path: Vec::new(),
            project_name,
            id_field_name,
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

                    // The single model-instance field of an `@weak` return
                    // object, if the resolver's return type is a concrete `@weak`
                    // model. A weak value has no DataID and no separate record to
                    // refetch, so it must be read INLINE off
                    // `<Type>____relay_model_instance` rather than via a pointer.
                    let weak_object_instance_field =
                        weak_object_instance_field(self.program.schema.as_ref(), inner_type);

                    // Shadow resolvers (those declaring a `@returnFragment`) must
                    // NEVER be treated as `@outputType` values. Doing so would
                    // emit a `$normalization` split operation and
                    // `isOutputType: true`, re-normalizing the returned value into
                    // a second set of records. Instead the resolver returns a
                    // pointer (DataID) and the consumer reads its selections off
                    // the already-normalized record via the client-edge reader
                    // selections. So `return_fragment.is_some()` dominates
                    // `has_output_type` and forces the `EdgeTo` path below.
                    //
                    // EXCEPTION: a `@returnFragment` resolver whose return type is
                    // a concrete `@weak` model has no pointer to return (no
                    // DataID) — it must reach the inline `Composite`/WeakModel arm
                    // just like a non-shadow weak `@outputType` resolver does. So
                    // the `EdgeTo` suppression applies only to NON-weak returns.
                    let has_output_type =
                        resolver_info.has_output_type && resolver_info.return_fragment.is_none();

                    // A shadow (`@returnFragment`) resolver whose return type is a
                    // non-Node SERVER VALUE type (no `id`, not a Node, not `@weak`)
                    // is read INLINE in place off the transplanted
                    // `client:<parentid>:<field>` record via its injected `__id`.
                    // Like the `@weak` arm it has no DataID pointer to
                    // return and no separate record to refetch, so it must reach
                    // the inline `Composite` arm rather than `EdgeTo`. `build_ast`
                    // detects the same server-value classification to emit a
                    // read-in-place `normalizationInfo` (no `normalizationNode`),
                    // so no second normalization (double-store) occurs.
                    let is_shadow_server_value_return =
                        relay_schema::definitions::is_server_weak_shadow_return(
                            self.program.schema.as_ref(),
                            inner_type,
                            self.id_field_name,
                            resolver_info.return_fragment.is_some(),
                        );

                    // A shadow (`@returnFragment`) resolver whose return type is an
                    // INTERFACE/UNION with at least one `@weak` or non-Node
                    // server-VALUE implementor. An abstract type has no
                    // object id, so weak/value-ness is per-implementor — detected
                    // here at the interface level. Like the concrete weak/value arms
                    // it must reach the inline `Composite` arm (NOT `EdgeTo`) so
                    // `build_ast` emits the backing-field `normalizationInfo` the
                    // runtime needs to take the inline branch for the weak/value
                    // members; strong Node implementors keep the pointer +
                    // `@waterfall` refetch arm via the per-implementor dispatch in
                    // `client_edges` / the reader. Weak-detection must NOT fire on
                    // the interface return type itself (it has no instance field), so
                    // `weak_object_instance_field` stays `None` here and `build_ast`
                    // derives the per-implementor kind from the interface members.
                    let is_shadow_abstract_inline_return =
                        relay_schema::definitions::abstract_shadow_return_has_inline_implementor(
                            self.program.schema.as_ref(),
                            inner_type,
                            self.id_field_name,
                            resolver_info.return_fragment.is_some(),
                        );

                    let output_type_info = if weak_object_instance_field.is_some() {
                        // Concrete `@weak` return: route to the inline arm,
                        // carrying the model-instance field so `build_ast` emits
                        // `normalizationInfo.kind: "WeakModel"` and the reader
                        // reads the value inline (no pointer, no refetch). This
                        // covers both `@outputType` weak resolvers and shadow
                        // (`@returnFragment`) weak resolvers.
                        let normalization_operation = generate_name_for_nested_object_operation(
                            self.project_name,
                            &self.program.schema,
                            self.program.schema.field(field.definition().item),
                        );
                        ResolverOutputTypeInfo::Composite(ResolverNormalizationInfo {
                            inner_type,
                            plural: schema_field.type_.is_list(),
                            normalization_operation,
                            weak_object_instance_field,
                        })
                    } else if is_shadow_server_value_return {
                        // Server VALUE return read in place: route to the inline
                        // `Composite` arm (NOT `EdgeTo`). `weak_object_instance_field`
                        // is `None` (it is not a `@weak` model); `build_ast`
                        // recognizes the server-value classification and emits a
                        // `ServerWeak` `normalizationInfo` so the runtime reads the
                        // transplanted record in place with NO second normalization.
                        let normalization_operation = generate_name_for_nested_object_operation(
                            self.project_name,
                            &self.program.schema,
                            self.program.schema.field(field.definition().item),
                        );
                        ResolverOutputTypeInfo::Composite(ResolverNormalizationInfo {
                            inner_type,
                            plural: schema_field.type_.is_list(),
                            normalization_operation,
                            weak_object_instance_field: None,
                        })
                    } else if is_shadow_abstract_inline_return {
                        // Interface/union shadow return with a weak/value implementor:
                        // route to the inline `Composite` arm. `inner_type` is the
                        // abstract type (no object id), so `weak_object_instance_field`
                        // stays `None`; `build_ast` derives the per-implementor
                        // `normalizationInfo.kind` (WeakModel / ServerWeak) from the
                        // interface members via `abstract_shadow_return_inline_kind`.
                        let normalization_operation = generate_name_for_nested_object_operation(
                            self.project_name,
                            &self.program.schema,
                            self.program.schema.field(field.definition().item),
                        );
                        ResolverOutputTypeInfo::Composite(ResolverNormalizationInfo {
                            inner_type,
                            plural: schema_field.type_.is_list(),
                            normalization_operation,
                            weak_object_instance_field: None,
                        })
                    } else if has_output_type {
                        if inner_type.is_composite_type() {
                            let normalization_operation = generate_name_for_nested_object_operation(
                                self.project_name,
                                &self.program.schema,
                                self.program.schema.field(field.definition().item),
                            );

                            ResolverOutputTypeInfo::Composite(ResolverNormalizationInfo {
                                inner_type,
                                plural: schema_field.type_.is_list(),
                                normalization_operation,
                                weak_object_instance_field: None,
                            })
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
            let may_waterfall = get_bool_argument_is_true(arguments, *MAY_WATERFALL_ARGUMENT_NAME);
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
                may_waterfall,
            })
        })
}
