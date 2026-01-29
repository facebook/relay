/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlag;
use common::FeatureFlags;
use common::NamedItem;
use docblock_shared::HAS_OUTPUT_TYPE_ARGUMENT_NAME;
use docblock_shared::KEY_RESOLVER_ID_FIELD;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use docblock_shared::RELAY_RESOLVER_MODEL_DIRECTIVE_NAME;
use docblock_shared::RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE;
use errors::try_all;
use errors::try3;
use schema::Object;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use schema::TypeReference;

use crate::errors::SchemaValidationErrorMessages;

pub fn validate_resolver_schema(
    schema: &SDLSchema,
    feature_flags: &FeatureFlags,
) -> DiagnosticsResult<()> {
    try3(
        validate_strong_resolver_types(schema),
        validate_output_type_resolver_types(schema, &feature_flags.allow_output_type_resolvers),
        validate_mutation_resolvers(schema, feature_flags.enable_relay_resolver_mutations),
    )?;

    Ok(())
}

fn validate_strong_resolver_types(schema: &SDLSchema) -> DiagnosticsResult<()> {
    try_all(
        schema
            .objects()
            .filter(|obj| object_is_strong_model_type(obj))
            .map(|strong_model_object| {
                validate_strong_object_implements_client_interface_with_id_field(
                    strong_model_object,
                    schema,
                )
            }),
    )?;
    Ok(())
}

fn validate_output_type_resolver_types(
    schema: &SDLSchema,
    allow_output_type_resolvers: &FeatureFlag,
) -> DiagnosticsResult<()> {
    try_all(schema.fields().map(|field| -> DiagnosticsResult<()> {
        if let Some(resolver_directive) = field.directives.named(*RELAY_RESOLVER_DIRECTIVE_NAME) {
            if resolver_directive
                .arguments
                .named(*HAS_OUTPUT_TYPE_ARGUMENT_NAME)
                .is_some()
            {
                if let Some(obj_id) = field.type_.inner().get_object_id() {
                    if schema
                        .object(obj_id)
                        .directives
                        .named(*RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE)
                        .is_none()
                    {
                        if !allow_output_type_resolvers.is_enabled_for(field.name.item) {
                            return DiagnosticsResult::Err(vec![Diagnostic::error(
                                SchemaValidationErrorMessages::ClientEdgeToClientWeakType,
                                field.name.location,
                            )]);
                        }
                    }
                }
            }
        };

        Ok(())
    }))?;

    Ok(())
}

fn object_is_strong_model_type(object: &Object) -> bool {
    if !object.is_extension {
        return false;
    }

    object
        .directives
        .named(*RELAY_RESOLVER_MODEL_DIRECTIVE_NAME)
        .is_some()
        && object
            .directives
            .named(*RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE)
            .is_none()
}

fn validate_mutation_resolvers(
    schema: &SDLSchema,
    mutation_resolvers_enabled: bool,
) -> DiagnosticsResult<()> {
    if let Some(mutation_type) = schema.mutation_type() {
        let mutation = match mutation_type {
            Type::Object(object_id) => schema.object(object_id),
            _ => {
                // Someone else will report this error
                return Ok(());
            }
        };

        try_all(
            mutation
                .fields
                .iter()
                .map(|field_id| -> DiagnosticsResult<()> {
                    let field = schema.field(*field_id);
                    if field
                        .directives
                        .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
                        .is_none()
                    {
                        return Ok(());
                    }

                    if !mutation_resolvers_enabled {
                        return DiagnosticsResult::Err(vec![Diagnostic::error(
                            SchemaValidationErrorMessages::DisallowedMutationResolvers {
                                mutation_type_name: mutation.name.item.0,
                            },
                            field.name.location,
                        )]);
                    }
                    let field_type = &field.type_;
                    if !is_valid_mutation_resolver_return_type(field_type) {
                        return DiagnosticsResult::Err(vec![Diagnostic::error(
                            SchemaValidationErrorMessages::MutationResolverNonScalarReturn {
                                resolver_field_name: field.name.item,
                                actual_return_type: schema.get_type_name(field_type.inner()),
                            },
                            field.name.location,
                        )]);
                    }
                    Ok(())
                }),
        )?;
    };

    Ok(())
}

fn is_valid_mutation_resolver_return_type(type_: &TypeReference<Type>) -> bool {
    match type_ {
        TypeReference::Named(named_type) => named_type.is_scalar() || named_type.is_enum(),
        TypeReference::List(_) => false,
        TypeReference::NonNull(non_null_type) => {
            // note: this should be unreachable since we already disallow relay resolvers to return non-nullable types
            // - implement this anyway in case that changes in the future
            is_valid_mutation_resolver_return_type(non_null_type.as_ref())
        }
    }
}

/// Validate that each interface that the strong object implements is client
/// defined and contains an id: ID! field.
fn validate_strong_object_implements_client_interface_with_id_field(
    object: &Object,
    schema: &SDLSchema,
) -> DiagnosticsResult<()> {
    let location = object.name.location;
    let mut errors = vec![];

    let id_type = schema
        .field(schema.clientid_field())
        .type_
        .inner()
        .get_scalar_id()
        .expect("Expected __id field to be a scalar");
    let non_null_id_type =
        TypeReference::NonNull(Box::new(TypeReference::Named(Type::Scalar(id_type))));

    for interface in &object.interfaces {
        let interface = schema.interface(*interface);

        if !interface.is_extension {
            errors.push(
                Diagnostic::error(
                    SchemaValidationErrorMessages::UnexpectedServerInterface {
                        interface_name: interface.name.item,
                    },
                    location,
                )
                .annotate_if_location_exists("Defined here", interface.name.location),
            );
        } else {
            let found_id_field = interface.fields.iter().find_map(|field_id| {
                let field = schema.field(*field_id);
                if field.name.item == *KEY_RESOLVER_ID_FIELD {
                    Some(field)
                } else {
                    None
                }
            });
            match found_id_field {
                Some(id_field) => {
                    if id_field.type_ != non_null_id_type {
                        let mut invalid_type_string = String::new();
                        schema
                            .write_type_string(&mut invalid_type_string, &id_field.type_)
                            .expect("Failed to write type to string.");

                        errors.push(
                            Diagnostic::error(
                                SchemaValidationErrorMessages::InterfaceWithWrongIdField {
                                    interface_name: interface.name.item,
                                    invalid_type_string,
                                },
                                id_field.name.location,
                            )
                            .annotate("required because the interface is implemented by a Relay Resolver type here", object.name.location),
                        )
                    }
                }
                None => errors.push(
                    Diagnostic::error(
                        SchemaValidationErrorMessages::InterfaceWithNoIdField {
                            interface_name: interface.name.item,
                        },
                        interface.name.location,
                    )
                            .annotate("required because the interface is implemented by a Relay Resolver type here", object.name.location),
                ),
            };
        }
    }
    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}
