/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::sync::Arc;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::reexport::StringKey;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_syntax::OperationKind;
use intern::string_key::Intern;
use lazy_static::lazy_static;
use schema::Field;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use crate::get_normalization_operation_name;
use crate::relay_resolvers::get_bool_argument_is_true;
use crate::relay_resolvers::RELAY_RESOLVER_DIRECTIVE_NAME;
use crate::SplitOperationMetadata;
use crate::ValidationMessage;

lazy_static! {
    pub static ref IS_OUTPUT_TYPE_ARGUMENT_NAME: ArgumentName =
        ArgumentName("is_output_type".intern());
}

fn generate_fat_selections_from_type(
    schema: &SDLSchema,
    type_: Type,
    field_name: WithLocation<StringKey>,
) -> DiagnosticsResult<Vec<Selection>> {
    let mut parent_types = HashSet::new();
    parent_types.insert(type_);

    match type_ {
        Type::Object(object_id) => {
            if !schema.object(object_id).is_extension {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::RelayResolverServerTypeNotSupported {
                        field_name: field_name.item,
                        type_name: schema.get_type_name(type_),
                    },
                    field_name.location,
                )]);
            }

            generate_selections_from_fields(
                schema,
                &schema.object(object_id).fields,
                &mut parent_types,
            )
        }
        Type::Enum(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeUnsupported {
                type_kind: "enum".intern(),
                field_name: field_name.item,
                type_name: schema.get_type_name(type_),
            },
            field_name.location,
        )]),
        Type::Scalar(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeUnsupported {
                type_kind: "scalar".intern(),
                field_name: field_name.item,
                type_name: schema.get_type_name(type_),
            },
            field_name.location,
        )]),
        Type::InputObject(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeInvalidInputObjectType {
                field_name: field_name.item,
                type_name: schema.get_type_name(type_),
            },
            field_name.location,
        )]),
        Type::Interface(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeUnsupported {
                type_kind: "interface".intern(),
                field_name: field_name.item,
                type_name: schema.get_type_name(type_),
            },
            field_name.location,
        )]),
        Type::Union(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeUnsupported {
                type_kind: "union".intern(),
                field_name: field_name.item,
                type_name: schema.get_type_name(type_),
            },
            field_name.location,
        )]),
    }
}

fn generate_selections_from_fields(
    schema: &SDLSchema,
    field_ids: &[FieldID],
    parent_types: &mut HashSet<Type>,
) -> DiagnosticsResult<Vec<Selection>> {
    let mut errors = vec![];
    let mut selections = vec![];
    for field_id in field_ids {
        match generate_selection_from_field(schema, field_id, parent_types) {
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
    field_id: &FieldID,
    parent_types: &mut HashSet<Type>,
) -> DiagnosticsResult<Selection> {
    let field = schema.field(*field_id);
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
            if !schema.object(object_id).is_extension {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::RelayResolverServerTypeNotSupported {
                        field_name: field.name.item,
                        type_name: schema.get_type_name(type_),
                    },
                    field.name.location,
                )]);
            }

            if parent_types.contains(&type_) {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::RelayResolverTypeRecursionDetected {
                        type_name: schema.get_type_name(type_),
                    },
                    field.name.location,
                )]);
            }

            parent_types.insert(type_);
            let selections = generate_selections_from_fields(
                schema,
                &schema.object(object_id).fields,
                parent_types,
            )?;
            parent_types.remove(&type_);

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
        Type::Interface(_) => Err(vec![Diagnostic::error(
            ValidationMessage::RelayResolverOutputTypeUnsupported {
                type_kind: "interface".intern(),
                field_name: field.name.item,
                type_name: schema.get_type_name(type_),
            },
            field.name.location,
        )]),
    }
}

pub(crate) fn generate_name_for_nested_object_operation(
    schema: &SDLSchema,
    field: &Field,
) -> WithLocation<OperationDefinitionName> {
    let parent_type = field
        .parent_type
        .unwrap_or_else(|| panic!("Expected parent type for field {:?}.", field));

    let normalization_name = get_normalization_operation_name(
        format!("{}__{}", schema.get_type_name(parent_type), field.name.item).intern(),
    )
    .intern();

    field
        .name
        .map(|_| OperationDefinitionName(normalization_name))
}

pub fn generate_relay_resolvers_operations_for_nested_objects(
    program: &Program,
) -> DiagnosticsResult<Program> {
    let mut operations = vec![];
    let mut errors = vec![];
    for field in program.schema.get_fields() {
        if !field.is_extension {
            continue;
        }

        if let Some(directive) = field.directives.named(*RELAY_RESOLVER_DIRECTIVE_NAME) {
            let is_output_type =
                get_bool_argument_is_true(&directive.arguments, *IS_OUTPUT_TYPE_ARGUMENT_NAME);
            if !is_output_type {
                continue;
            }

            let selections = match generate_fat_selections_from_type(
                &program.schema,
                field.type_.inner(),
                field.name,
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

            let operation_name = generate_name_for_nested_object_operation(&program.schema, field);
            let directives = vec![
                SplitOperationMetadata {
                    location: field.name.location,
                    parent_documents: Default::default(),
                    derived_from: None,
                    raw_response_type: true,
                }
                .to_directive(),
            ];

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
