/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::*;
use interner::Intern;
use lazy_static::lazy_static;

/// Return if the changes are safe to skip full rebuild,
/// doing the same check as our JS implmentation.
impl SchemaChange {
    pub fn is_safe(self: &SchemaChange, schema: &Schema) -> bool {
        match self {
            SchemaChange::None => true,
            SchemaChange::GenericChange => false,
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
                                || !is_field_changes_safe(added, removed, changed)
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
                            if !is_field_changes_safe(added, removed, changed) {
                                return false;
                            }
                        }
                        DefinitionChange::ObjectAdded(name) => {
                            if !is_object_add_safe(*name, schema) {
                                return false;
                            }
                        }
                        // safe changes
                        DefinitionChange::InterfaceAdded(_) => {}
                        DefinitionChange::ScalarAdded(_) => {}
                        DefinitionChange::EnumAdded(_) => {}
                        DefinitionChange::UnionAdded(_) => {}
                        DefinitionChange::InputObjectAdded(_) => {}
                        // unsafe changes
                        _ => {
                            return false;
                        }
                    }
                }
                true
            }
        }
    }
}

lazy_static! {
    static ref ID_FIELD_KEY: StringKey = "id".intern();
    static ref NODE_INTERFACE_KEY: StringKey = "Node".intern();
}

/// If the type has an `id` field and the type implments interfaces
/// other than `Node`, then the change isn't safe:
/// If the object type implements an `Actor` interfaces (for example).
/// We may need to add an inline spread with
///   ... on ThisNewType {
///     id
///   }
/// But we have a special case for `Node`. The `id` field is automatically
/// added to the selection for all types that implements `Node`.
fn is_object_add_safe(name: StringKey, schema: &Schema) -> bool {
    if let Type::Object(id) = schema.get_type(name).unwrap() {
        let object = schema.object(id);
        if object
            .fields
            .iter()
            .any(|id| schema.field(*id).name == *ID_FIELD_KEY)
            && object
                .interfaces
                .iter()
                .any(|id| schema.interface(*id).name != *NODE_INTERFACE_KEY)
        {
            return false;
        }
    } else {
        panic!("Object not found in the schema")
    }
    true
}

fn is_field_changes_safe(
    added: &[TypeChange],
    removed: &[TypeChange],
    changed: &[ArgumentChange],
) -> bool {
    if !removed.is_empty() {
        return false;
    }
    // Addition of non id field is safe
    if added.iter().any(|add| add.name == *ID_FIELD_KEY) {
        return false;
    }

    // Addition of optional field arg is safe
    for change in changed {
        if !change.removed.is_empty() {
            return false;
        }
        for add in &change.added {
            if let AstType::Named(_) = add.type_ {
            } else {
                return false;
            }
        }
    }
    true
}
