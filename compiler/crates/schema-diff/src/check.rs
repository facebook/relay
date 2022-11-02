/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::InterfaceName;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use relay_config::SchemaConfig;
use schema::SDLSchema;
use schema::Schema;

use crate::definitions::ArgumentChange;
use crate::definitions::DefinitionChange;
use crate::definitions::SchemaChange;
use crate::definitions::Type;
use crate::definitions::TypeChange;

/// Return if the changes are safe to skip full rebuild.
impl SchemaChange {
    pub fn is_safe(self: &SchemaChange, schema: &SDLSchema, schema_config: &SchemaConfig) -> bool {
        match self {
            SchemaChange::None => true,
            SchemaChange::GenericChange => false,
            SchemaChange::InvalidSchema => false,
            SchemaChange::DefinitionChanges(changes) => {
                for change in changes {
                    match change {
                        DefinitionChange::ObjectChanged {
                            changed,
                            added,
                            removed,
                            interfaces_added,
                            interfaces_removed,
                            ..
                        } => {
                            if !interfaces_added.is_empty()
                                || !interfaces_removed.is_empty()
                                || !is_field_changes_safe(
                                    added,
                                    removed,
                                    changed,
                                    schema_config.node_interface_id_field,
                                )
                            {
                                return false;
                            }
                        }
                        DefinitionChange::InterfaceChanged {
                            changed,
                            added,
                            removed,
                            ..
                        } => {
                            if !is_field_changes_safe(
                                added,
                                removed,
                                changed,
                                schema_config.node_interface_id_field,
                            ) {
                                return false;
                            }
                        }
                        DefinitionChange::ObjectAdded(name) => {
                            if !is_object_add_safe(*name, schema, schema_config) {
                                return false;
                            }
                        }
                        // safe changes
                        DefinitionChange::InterfaceAdded(_)
                        | DefinitionChange::EnumAdded(_)
                        | DefinitionChange::ScalarAdded(_)
                        | DefinitionChange::UnionAdded(_)
                        | DefinitionChange::InputObjectAdded(_) => {}

                        // unsafe changes
                        DefinitionChange::EnumChanged { .. }
                        | DefinitionChange::EnumRemoved(_)
                        | DefinitionChange::UnionChanged { .. }
                        | DefinitionChange::UnionRemoved(_)
                        | DefinitionChange::ScalarRemoved(_)
                        | DefinitionChange::InputObjectChanged { .. }
                        | DefinitionChange::InputObjectRemoved(_)
                        | DefinitionChange::InterfaceRemoved(_)
                        | DefinitionChange::ObjectRemoved(_) => return false,
                    }
                }
                true
            }
        }
    }
}

lazy_static! {
    static ref JS_FIELD_KEY: StringKey = "js".intern();
    static ref NODE_INTERFACE_KEY: InterfaceName = InterfaceName("Node".intern());
}

/// If the type has an `id` field and the type implements interfaces
/// other than `Node`, then the change isn't safe:
/// If the object type implements an `Actor` interfaces (for example).
/// We may need to add an inline spread with
///   ... on ThisNewType {
///     id
///   }
/// But we have a special case for `Node`. The `id` field is automatically
/// added to the selection for all types that implements `Node`.
fn is_object_add_safe(name: StringKey, schema: &SDLSchema, schema_config: &SchemaConfig) -> bool {
    let id_name = schema_config.node_interface_id_field;

    if let Some(schema::Type::Object(id)) = schema.get_type(name) {
        let object = schema.object(id);
        if object
            .fields
            .iter()
            .any(|id| schema.field(*id).name.item == id_name)
            && object
                .interfaces
                .iter()
                .any(|id| schema.interface(*id).name.item != *NODE_INTERFACE_KEY)
        {
            return false;
        }
    } else {
        panic!(
            "The object '{}' was not found in the schema during schema change detection.",
            name
        );
    }
    true
}

fn is_field_changes_safe(
    added: &[TypeChange],
    removed: &[TypeChange],
    changed: &[ArgumentChange],
    id_name: StringKey,
) -> bool {
    if !removed.is_empty() {
        return false;
    }

    // Special fields might change the compile output:
    // - `id` added to an object makes the compiler select that field
    // - `js` field added to a type might change 3D code generation
    if added
        .iter()
        .any(|add| add.name == id_name || add.name == *JS_FIELD_KEY)
    {
        return false;
    }

    // Addition of optional field arg is safe
    for change in changed {
        if !change.removed.is_empty() {
            return false;
        }
        for add in &change.added {
            if let Type::NonNull(_) = add.type_ {
                return false;
            }
        }
    }
    true
}
