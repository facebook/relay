/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use docblock_shared::HAS_OUTPUT_TYPE_ARGUMENT_NAME;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use docblock_shared::RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_syntax::OperationKind;
use intern::string_key::Intern;
use relay_config::ProjectName;
use relay_config::SchemaConfig;
use schema::Field;
use schema::FieldID;
use schema::Interface;
use schema::InterfaceID;
use schema::ObjectID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use crate::RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE;
use crate::SplitOperationMetadata;
use crate::ValidationMessage;
use crate::generate_relay_resolvers_model_fragments::directives_with_artifact_source;
use crate::get_normalization_operation_name;
use crate::match_::RawResponseGenerationMode;
use crate::relay_resolvers::get_bool_argument_is_true;

fn generate_fat_selections_from_type(
    schema: &SDLSchema,
    schema_config: &SchemaConfig,
    type_: Type,
    field: &Field,
) -> DiagnosticsResult<Vec<Selection>> {
    match type_ {
        Type::Object(object_id) => {
            let object = schema.object(object_id);
            if !object.is_extension {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::RelayResolverServerTypeNotSupported {
                        field_name: field.name.item,
                        type_name: schema.get_type_name(type_),
                    },
                    field.name.location,
                )]);
            }

            let mut parent_types = HashSet::from([type_]);
            generate_selections_from_object_fields(
                schema,
                schema_config,
                &object.fields,
                &mut parent_types,
            )
        }
        Type::Enum(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeUnsupported {
                type_kind: "enum".intern(),
                field_name: field.name.item,
                type_name: schema.get_type_name(type_),
            },
            field.name.location,
        )]),
        Type::Scalar(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeUnsupported {
                type_kind: "scalar".intern(),
                field_name: field.name.item,
                type_name: schema.get_type_name(type_),
            },
            field.name.location,
        )]),
        Type::InputObject(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeInvalidInputObjectType {
                field_name: field.name.item,
                type_name: schema.get_type_name(type_),
            },
            field.name.location,
        )]),
        Type::Interface(interface_id) => {
            let interface = schema.interface(interface_id);

            if !interface.is_extension {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::RelayResolverServerTypeNotSupported {
                        field_name: field.name.item,
                        type_name: schema.get_type_name(type_),
                    },
                    field.name.location,
                )]);
            }

            let mut parent_types = HashSet::new();
            parent_types.insert(type_);
            generate_selections_from_interface_fields(
                schema,
                schema_config,
                interface,
                &mut parent_types,
                field,
            )
        }
        Type::Union(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeUnsupported {
                type_kind: "union".intern(),
                field_name: field.name.item,
                type_name: schema.get_type_name(type_),
            },
            field.name.location,
        )]),
    }
}

fn generate_selections_from_object_fields(
    schema: &SDLSchema,
    schema_config: &SchemaConfig,
    field_ids: &[FieldID],
    parent_types: &mut HashSet<Type>,
) -> DiagnosticsResult<Vec<Selection>> {
    let mut errors = vec![];
    let mut selections = vec![];
    for field_id in field_ids {
        if schema
            .field(*field_id)
            .directives
            .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
            .is_some()
        {
            continue;
        }
        match generate_selection_from_field(schema, schema_config, field_id, parent_types) {
            Ok(selection) => selections.push(selection),
            Err(err) => {
                errors.extend(err);
            }
        }
    }
    if errors.is_empty() {
        Ok(selections)
    } else {
        Err(errors)
    }
}

fn generate_selection_from_field(
    schema: &SDLSchema,
    schema_config: &SchemaConfig,
    field_id: &FieldID,
    parent_types: &mut HashSet<Type>,
) -> DiagnosticsResult<Selection> {
    let field = schema.field(*field_id);
    if field.name.item == schema_config.node_interface_id_field {
        return Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverIDFieldNotSupported {
                id_name: field.name.item,
            },
            field.name.location,
        )]);
    }

    if !field.arguments.is_empty() {
        return Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverArgumentsNotSupported,
            field.name.location,
        )]);
    }

    let type_ = field.type_.inner();
    match type_ {
        Type::Enum(_) => Ok(Selection::ScalarField(Arc::new(ScalarField {
            alias: None,
            definition: WithLocation::generated(*field_id),
            arguments: vec![],
            directives: vec![],
        }))),
        Type::Scalar(_) => Ok(Selection::ScalarField(Arc::new(ScalarField {
            alias: None,
            definition: WithLocation::generated(*field_id),
            arguments: vec![],
            directives: vec![],
        }))),
        Type::Object(object_id) => {
            let selections = generate_selections_from_object(
                object_id,
                parent_types,
                schema,
                schema_config,
                field,
            )?;
            Ok(Selection::LinkedField(Arc::new(LinkedField {
                alias: None,
                definition: WithLocation::generated(*field_id),
                arguments: vec![],
                directives: vec![],
                selections,
            })))
        }
        Type::InputObject(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeInvalidInputObjectType {
                field_name: field.name.item,
                type_name: schema.get_type_name(type_),
            },
            field.name.location,
        )]),
        Type::Union(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeUnsupported {
                type_kind: "union".intern(),
                field_name: field.name.item,
                type_name: schema.get_type_name(type_),
            },
            field.name.location,
        )]),
        Type::Interface(interface_id) => {
            let selections = generate_inline_fragments_from_interface(
                interface_id,
                parent_types,
                schema,
                schema_config,
                field,
            )?;

            Ok(Selection::LinkedField(Arc::new(LinkedField {
                alias: None,
                definition: WithLocation::generated(*field_id),
                arguments: vec![],
                directives: vec![],
                selections: selections
                    .into_iter()
                    .map(|inline_fragment| Selection::InlineFragment(Arc::new(inline_fragment)))
                    .collect::<Vec<_>>(),
            })))
        }
    }
}

fn generate_selections_from_object(
    object_id: ObjectID,
    parent_types: &mut HashSet<Type>,
    schema: &SDLSchema,
    schema_config: &SchemaConfig,
    field: &Field,
) -> Result<Vec<Selection>, Vec<Diagnostic>> {
    let object = schema.object(object_id);

    if !object.is_extension {
        return Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverServerTypeNotSupported {
                field_name: field.name.item,
                type_name: object.name.item.0,
            },
            field.name.location,
        )]);
    }

    let type_ = Type::Object(object_id);
    if parent_types.contains(&type_) {
        return Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverTypeRecursionDetected {
                type_name: object.name.item.0,
            },
            field.name.location,
        )]);
    }
    let selections = with_additional_parent_type(parent_types, type_, |parent_types| {
        generate_selections_from_object_fields(schema, schema_config, &object.fields, parent_types)
    })?;

    Ok(selections)
}

/// Unlike generate_selections_from_object, this returns a vector of inline fragments,
/// because an interface is transformed into a series of inline fragments, each of which
/// refines the interface to a distinct concrete type. All concrete types are accounted for.
fn generate_inline_fragments_from_interface(
    interface_id: InterfaceID,
    parent_types: &mut HashSet<Type>,
    schema: &SDLSchema,
    schema_config: &SchemaConfig,
    field: &Field,
) -> Result<Vec<InlineFragment>, Vec<Diagnostic>> {
    let interface = schema.interface(interface_id);

    if !interface.is_extension {
        return Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverServerTypeNotSupported {
                field_name: field.name.item,
                type_name: interface.name.item.0,
            },
            field.name.location,
        )]);
    }

    let type_ = Type::Interface(interface_id);
    if parent_types.contains(&type_) {
        return Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverTypeRecursionDetected {
                type_name: interface.name.item.0,
            },
            field.name.location,
        )]);
    }

    let selections = with_additional_parent_type(
        parent_types,
        type_,
        |parent_types: &mut HashSet<Type>| {
            let implementing_objects = interface.recursively_implementing_objects(schema);
            if implementing_objects.is_empty() {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::RelayResolverClientInterfaceMustBeImplemented {
                        interface_name: interface.name.item,
                    },
                    interface.name.location,
                )]);
            }

            let typename_field = schema.typename_field();
            let implementing_objects =
                get_implementing_objects_sorted(schema, implementing_objects);

            implementing_objects.into_iter()
                .map(|(object_id, object)| {
                    if !object.is_extension {
                        return Err(vec![Diagnostic::error(
                            ValidationMessage::RelayResolverClientInterfaceImplementingTypeMustBeClientTypes {
                                interface_name: interface.name.item,
                                object_name: object.name.item,
                            },
                            interface.name.location,
                        )]);
                    }

                    let mut selections = generate_selections_from_object(object_id, parent_types, schema, schema_config, field)?;
                    // The returned InlineFragment contains "fat" selections, i.e. selects every field
                    // defined on every concrete implementation. These InlineFragments are top-level selections
                    // on newly created "split" operations, and the $normalization type of these newly-created operations
                    // becomes the return type of user-defined resolver functions.
                    //
                    // For client types, all fields must be returned, since there is now way to fetch missing
                    // fields from the server. Hence, we create "fat" selections here.
                    //
                    // Note also that the fat selection on an interface must also include the __typename field,
                    // but that is not included in the return value of `generate_selections_from_object`. We
                    // add it here manually.
                    selections.push(Selection::ScalarField(Arc::new(ScalarField {
                        alias: None,
                        definition: WithLocation::generated(typename_field),
                        arguments: vec![],
                        directives: vec![],
                    })));

                    Ok(InlineFragment {
                        type_condition: Some(Type::Object(object_id)),
                        directives: vec![],
                        selections,
                        spread_location: Location::generated(),
                    })
                })
                .collect::<DiagnosticsResult<Vec<_>>>()
        },
    )?;

    Ok(selections)
}

fn generate_selections_from_interface_fields(
    schema: &SDLSchema,
    schema_config: &SchemaConfig,
    interface: &Interface,
    parent_types: &mut HashSet<Type>,
    field: &Field,
) -> DiagnosticsResult<Vec<Selection>> {
    let implementing_objects = interface.recursively_implementing_objects(schema);
    if implementing_objects.is_empty() {
        return Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverClientInterfaceMustBeImplemented {
                interface_name: interface.name.item,
            },
            interface.name.location,
        )]);
    }

    let implementing_objects = get_implementing_objects_sorted(schema, implementing_objects);
    let typename_field = schema.typename_field();

    implementing_objects
        .iter()
        .map(|(object_id, object)| {
            if !object.is_extension {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::RelayResolverClientInterfaceImplementingTypeMustBeClientTypes {
                        interface_name: interface.name.item,
                        object_name: object.name.item,
                    },
                    interface.name.location,
                )]);
            }

            let mut selections = generate_selections_from_object(*object_id, parent_types, schema, schema_config, field)?;
            // The returned InlineFragment contains "fat" selections, i.e. selects every field
            // defined on every concrete implementation. These InlineFragments are top-level selections
            // on newly created "split" operations, and the $normalization type of these newly-created operations
            // becomes the return type of user-defined resolver functions.
            //
            // For client types, all fields must be returned, since there is now way to fetch missing
            // fields from the server. Hence, we create "fat" selections here.
            //
            // Note also that the fat selection on an interface must also include the __typename field,
            // but that is not included in the return value of `generate_selections_from_object`. We
            // add it here manually.
            selections.push(Selection::ScalarField(Arc::new(ScalarField {
                alias: None,
                definition: WithLocation::generated(typename_field),
                arguments: vec![],
                directives: vec![],
            })));

            Ok(Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: Some(Type::Object(*object_id)),
                directives: vec![],
                selections,
                spread_location: Location::generated(),
            })))
        })
        .collect::<DiagnosticsResult<Vec<_>>>()
}

pub(crate) fn generate_name_for_nested_object_operation(
    project_name: ProjectName,
    schema: &SDLSchema,
    field: &Field,
) -> WithLocation<OperationDefinitionName> {
    let parent_type = field
        .parent_type
        .unwrap_or_else(|| panic!("Expected parent type for field {field:?}."));

    let name = project_name
        .generate_name_for_object_and_field(schema.get_type_name(parent_type), field.name.item);

    let normalization_name = get_normalization_operation_name(name.intern()).intern();

    field
        .name
        .map(|_| OperationDefinitionName(normalization_name))
}

pub fn generate_relay_resolvers_operations_for_nested_objects(
    project_name: ProjectName,
    program: &Program,
    schema_config: &SchemaConfig,
) -> DiagnosticsResult<Program> {
    let mut operations = vec![];
    let mut errors = vec![];
    for field in program.schema.get_fields() {
        if !field.is_extension {
            continue;
        }

        if let Some(directive) = field.directives.named(*RELAY_RESOLVER_DIRECTIVE_NAME) {
            // For resolvers that belong to the base schema, we don't need to generate fragments.
            // These fragments should be generated during compilcation of the base project.
            if field
                .directives
                .named(*RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE)
                .is_some()
            {
                continue;
            }

            let has_output_type =
                get_bool_argument_is_true(&directive.arguments, *HAS_OUTPUT_TYPE_ARGUMENT_NAME);
            if !has_output_type {
                continue;
            }

            let inner_field_type = field.type_.inner();

            // Allow scalar/enums as @outputType
            if inner_field_type.is_scalar() || inner_field_type.is_enum() {
                continue;
            }

            let is_model = inner_field_type
                .get_object_id()
                .and_then(|object_id| {
                    let object = program.schema.object(object_id);
                    object
                        .directives
                        .named(*RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE)
                })
                .is_some();

            if is_model {
                continue;
            }

            let selections = match generate_fat_selections_from_type(
                &program.schema,
                schema_config,
                inner_field_type,
                field,
            ) {
                Ok(selections) => selections,
                Err(err) => {
                    errors.extend(err);
                    vec![]
                }
            };

            if !errors.is_empty() {
                continue;
            }

            let operation_name =
                generate_name_for_nested_object_operation(project_name, &program.schema, field);

            let mut directives = directives_with_artifact_source(field);
            directives.push(
                SplitOperationMetadata {
                    location: field.name.location,
                    parent_documents: Default::default(),
                    derived_from: None,
                    raw_response_type_generation_mode: Some(
                        RawResponseGenerationMode::AllFieldsRequired,
                    ),
                }
                .into(),
            );
            let operation = OperationDefinition {
                name: operation_name,
                type_: field.type_.inner(),
                variable_definitions: vec![],
                directives,
                selections,
                kind: OperationKind::Query,
            };

            operations.push(Arc::new(operation))
        }
    }

    if errors.is_empty() {
        if operations.is_empty() {
            Ok(program.clone())
        } else {
            let mut next_program = program.clone();

            for operation in operations {
                next_program.insert_operation(operation)
            }

            Ok(next_program)
        }
    } else {
        Err(errors)
    }
}

/// A wrapper function that allows us to avoid the pattern
///
/// parent_types.insert(t);
/// // do some work
/// parent_types.remove(t);
///
/// If there is an early return in the do some work section (e.g. a return or a ?),
/// then we may never remove `t` from `parent_types`, which may cause logic errors.
fn with_additional_parent_type<T>(
    parent_types: &mut HashSet<Type>,
    additional_parent_type: Type,
    f: impl FnOnce(&mut HashSet<Type>) -> T,
) -> T {
    let len = parent_types.len();
    assert!(
        !parent_types.contains(&additional_parent_type),
        "parent_types already contains {additional_parent_type:?}"
    );

    parent_types.insert(additional_parent_type);
    let t = f(parent_types);

    let successfully_removed = parent_types.remove(&additional_parent_type);
    assert!(
        successfully_removed,
        "parent_types unexpectedly did not contain {additional_parent_type:?}"
    );
    assert!(
        parent_types.len() == len,
        "parent_types changed length unexpectedly"
    );

    t
}

fn get_implementing_objects_sorted(
    schema: &SDLSchema,
    implementing_objects: HashSet<ObjectID>,
) -> Vec<(ObjectID, &schema::Object)> {
    let mut implementing_objects: Vec<_> = implementing_objects
        .into_iter()
        .map(|object_id| (object_id, schema.object(object_id)))
        .collect();

    // The inline fragments below were being generated in what appears to be a random order
    // that changed after a rebase. Sort the objects to guarantee a consistent ordering
    // and stable artifacts.
    implementing_objects.sort_by(|(_, first_object), (_, second_object)| {
        first_object.name.item.cmp(&second_object.name.item)
    });

    implementing_objects
}
