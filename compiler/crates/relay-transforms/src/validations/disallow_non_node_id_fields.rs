/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::ScalarName;
use graphql_ir::Program;
use graphql_ir::ValidationMessage;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use relay_config::NonNodeIdFieldsConfig;
use relay_config::SchemaConfig;
use schema::Field;
use schema::Interface;
use schema::Object;
use schema::Schema;
use schema::Type;

lazy_static! {
    static ref DEFAULT_CONFIG: NonNodeIdFieldsConfig = NonNodeIdFieldsConfig::default();
    static ref NON_STRING_SCALARS: [ScalarName; 3] = [
        ScalarName("Int".intern()),
        ScalarName("Float".intern()),
        ScalarName("Boolean".intern())
    ];
}

pub fn disallow_non_node_id_fields(
    program: &Program,
    schema_config: &SchemaConfig,
) -> DiagnosticsResult<()> {
    validate_all_id_fields(
        program,
        build_type_allowlist(schema_config),
        schema_config.node_interface_id_field,
    )
}

/// Creates a set of allowed types to bypass validation (empty if none are specified)
fn build_type_allowlist(schema_config: &SchemaConfig) -> &HashMap<StringKey, StringKey> {
    &schema_config
        .non_node_id_fields
        .as_ref()
        .unwrap_or(&DEFAULT_CONFIG)
        .allowed_id_types
}

/// Types (e.g. scalars, enums, objects) that fields can be selected from
#[derive(Debug)]
enum FieldSelectableType<'a> {
    Interface(&'a Interface),
    Object(&'a Object),
}

impl<'a> FieldSelectableType<'a> {
    fn name(&'a self) -> StringKey {
        match *self {
            Self::Interface(i) => i.name.item.0,
            Self::Object(o) => o.name.item.0,
        }
    }
}

/// Creates a FieldSelectableType from some schema Type
fn field_selectable_type_from_type(
    program: &Program,
    type_: Type,
) -> Option<FieldSelectableType<'_>> {
    match type_ {
        Type::Interface(id) => Some(FieldSelectableType::Interface(program.schema.interface(id))),
        Type::Object(id) => Some(FieldSelectableType::Object(program.schema.object(id))),
        _ => None,
    }
}

/// Checks that all `id` fields in the schema have types found in `allowed_types`,
/// or nullable versions of those types.
fn validate_all_id_fields(
    program: &Program,
    allowed_id_types: &HashMap<StringKey, StringKey>,
    node_interface_id_field: StringKey,
) -> DiagnosticsResult<()> {
    // Checks if the field is `Node.id`
    let is_named_id_field = |f: &&Field| -> bool { f.name.item == node_interface_id_field };

    // Checks if the type of `id_field` is `ID`, which follows the definition in the `Node` interface
    let is_allowed_node_id_type =
        |parent_type: &'_ FieldSelectableType<'_>, id_field: &Field| -> bool {
            let field_type = &id_field.type_;
            let field_type_name = &program.schema.get_type_name(field_type.inner());
            let parent_type_name = &parent_type.name();

            allowed_id_types.get_key_value(parent_type_name)
                == Some((parent_type_name, field_type_name))
                || (!field_type.is_list() && program.schema.is_id(field_type.inner()))
        };

    // Checks if the type of `id_field` is legal in Relay's runtime (i.e. can only be String-like types)
    let is_runtime_legal_id_type = |id_field: &Field| -> bool {
        let field_type = id_field.type_.inner();
        let is_custom_scalar = || {
            id_field
                .type_
                .inner()
                .get_scalar_id()
                .is_some_and(|scalar_id| {
                    !NON_STRING_SCALARS.contains(&program.schema.scalar(scalar_id).name.item)
                })
        };

        program.schema.is_id(field_type)
            || program.schema.is_string(field_type)
            || field_type.is_enum()
            || is_custom_scalar()
    };

    let errors: Vec<Diagnostic> = program
        .schema
        .fields()
        .filter(is_named_id_field)
        .filter_map(|field| {
            field.parent_type.and_then(|parent_type| {
                field_selectable_type_from_type(program, parent_type)
                    .map(|allowed_parent_type| (allowed_parent_type, field))
            })
        })
        .filter_map(|(parent_type, id_field)| {
            if !is_runtime_legal_id_type(id_field) {
                Some(Diagnostic::error(
                    ValidationMessage::InvalidIdFieldType {
                        parent_type_name: parent_type.name(),
                        id_field_name: node_interface_id_field,
                        id_type_string: program.schema.get_type_string(&id_field.type_),
                    },
                    id_field.name.location,
                ))
            } else if !is_allowed_node_id_type(&parent_type, id_field) {
                Some(Diagnostic::error(
                    ValidationMessage::DisallowNonNodeIdFieldType {
                        parent_type_name: parent_type.name(),
                        id_field_name: node_interface_id_field,
                        id_type_string: program.schema.get_type_string(&id_field.type_),
                    },
                    id_field.name.location,
                ))
            } else {
                None
            }
        })
        .collect();

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}
