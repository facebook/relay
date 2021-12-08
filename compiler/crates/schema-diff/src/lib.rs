/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod check;

pub mod definitions;
use crate::definitions::*;

use common::SourceLocationKey;
use fnv::{FnvHashMap, FnvHashSet};
use graphql_syntax::{
    parse_schema_document, EnumTypeDefinition, FieldDefinition, Identifier,
    InputObjectTypeDefinition, InputValueDefinition, InterfaceTypeDefinition, List,
    ObjectTypeDefinition, ScalarTypeDefinition, TypeSystemDefinition, UnionTypeDefinition,
};
use intern::string_key::StringKey;

fn add_definition(changes: &mut Vec<DefinitionChange>, def: &TypeSystemDefinition) -> bool {
    use DefinitionChange::*;

    match def {
        TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition { name, .. }) => {
            changes.push(ScalarAdded(name.value));
            true
        }
        TypeSystemDefinition::UnionTypeDefinition(UnionTypeDefinition { name, .. }) => {
            changes.push(UnionAdded(name.value));
            true
        }
        TypeSystemDefinition::EnumTypeDefinition(EnumTypeDefinition { name, .. }) => {
            changes.push(EnumAdded(name.value));
            true
        }
        TypeSystemDefinition::InputObjectTypeDefinition(InputObjectTypeDefinition {
            name, ..
        }) => {
            changes.push(InputObjectAdded(name.value));
            true
        }
        TypeSystemDefinition::InterfaceTypeDefinition(InterfaceTypeDefinition { name, .. }) => {
            changes.push(InterfaceAdded(name.value));
            true
        }
        TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition { name, .. }) => {
            changes.push(ObjectAdded(name.value));
            true
        }
        // We currently don't handle changes of unsupported types,
        // If those type changes occur, we should return early for a full rebuild.
        TypeSystemDefinition::InterfaceTypeExtension(..)
        | TypeSystemDefinition::ObjectTypeExtension(..)
        | TypeSystemDefinition::SchemaDefinition(..)
        | TypeSystemDefinition::DirectiveDefinition(..)
        | TypeSystemDefinition::SchemaExtension(..)
        | TypeSystemDefinition::EnumTypeExtension(..)
        | TypeSystemDefinition::UnionTypeExtension(..)
        | TypeSystemDefinition::InputObjectTypeExtension(..)
        | TypeSystemDefinition::ScalarTypeExtension(..) => false,
    }
}

fn build_curent_map(
    current: &[TypeSystemDefinition],
) -> FnvHashMap<&StringKey, &TypeSystemDefinition> {
    let mut current_map = FnvHashMap::default();

    for def in current {
        match def {
            TypeSystemDefinition::EnumTypeDefinition(EnumTypeDefinition { name, .. })
            | TypeSystemDefinition::UnionTypeDefinition(UnionTypeDefinition { name, .. })
            | TypeSystemDefinition::InputObjectTypeDefinition(InputObjectTypeDefinition {
                name,
                ..
            })
            | TypeSystemDefinition::InterfaceTypeDefinition(InterfaceTypeDefinition {
                name, ..
            })
            | TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition { name, .. })
            | TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition { name, .. }) => {
                current_map.insert(&name.value, def);
            }
            // We skip diffing the following definitions
            TypeSystemDefinition::EnumTypeExtension(..)
            | TypeSystemDefinition::UnionTypeExtension(..)
            | TypeSystemDefinition::InputObjectTypeExtension(..)
            | TypeSystemDefinition::InterfaceTypeExtension(..)
            | TypeSystemDefinition::ObjectTypeExtension(..)
            | TypeSystemDefinition::ScalarTypeExtension(..)
            | TypeSystemDefinition::SchemaDefinition(..)
            | TypeSystemDefinition::SchemaExtension(..)
            | TypeSystemDefinition::DirectiveDefinition(..) => {}
        }
    }
    current_map
}

fn compare_fields(
    optional_current_fields: &Option<List<FieldDefinition>>,
    optional_previous_fields: Option<List<FieldDefinition>>,
) -> (Vec<TypeChange>, Vec<TypeChange>, Vec<ArgumentChange>) {
    let mut added: Vec<TypeChange> = vec![];
    let mut removed: Vec<TypeChange> = vec![];
    let mut field_changed: Vec<ArgumentChange> = vec![];

    match (optional_current_fields.as_ref(), optional_previous_fields) {
        (Some(current_fields), Some(previous_fields)) => {
            let mut previous_values = previous_fields
                .items
                .into_iter()
                .map(|input| (input.name.value, input))
                .collect::<FnvHashMap<_, _>>();

            for field in &current_fields.items {
                match previous_values.remove(&field.name.value) {
                    None => {
                        added.push(TypeChange {
                            name: field.name.value,
                            type_: Type::from(field.type_.clone()),
                        });
                    }
                    Some(previous_field) => {
                        let previous_field_type = Type::from(previous_field.type_.clone());
                        let field_type = Type::from(field.type_.clone());
                        if previous_field_type != field_type {
                            added.push(TypeChange {
                                name: field.name.value,
                                type_: field_type,
                            });
                            removed.push(TypeChange {
                                name: previous_field.name.value,
                                type_: previous_field_type,
                            });
                        } else {
                            match (field.arguments.as_ref(), previous_field.arguments) {
                                (Some(current_field_arguments), Some(previous_field_arguments)) => {
                                    let (args_added, args_removed) = compare_input_value_definition(
                                        &current_field_arguments.items,
                                        previous_field_arguments.items,
                                    );
                                    if !args_added.is_empty() || !args_removed.is_empty() {
                                        field_changed.push(ArgumentChange {
                                            name: field.name.value,
                                            added: args_added,
                                            removed: args_removed,
                                        });
                                    }
                                }
                                (Some(current_field_arguments), None) => {
                                    let current_field_arguments = current_field_arguments.clone();
                                    let args_added = current_field_arguments
                                        .items
                                        .into_iter()
                                        .map(|InputValueDefinition { name, type_, .. }| {
                                            TypeChange {
                                                name: name.value,
                                                type_: Type::from(type_),
                                            }
                                        })
                                        .collect();
                                    let args_removed = vec![];
                                    field_changed.push(ArgumentChange {
                                        name: field.name.value,
                                        added: args_added,
                                        removed: args_removed,
                                    });
                                }
                                (None, Some(previous_field_arguments)) => {
                                    let args_added = vec![];
                                    let args_removed = previous_field_arguments
                                        .items
                                        .into_iter()
                                        .map(|InputValueDefinition { name, type_, .. }| {
                                            TypeChange {
                                                name: name.value,
                                                type_: Type::from(type_),
                                            }
                                        })
                                        .collect();
                                    field_changed.push(ArgumentChange {
                                        name: field.name.value,
                                        added: args_added,
                                        removed: args_removed,
                                    });
                                }
                                (None, None) => {}
                            }
                        }
                    }
                }
            }
            removed.extend(previous_values.drain().map(|(_, field)| TypeChange {
                name: field.name.value,
                type_: Type::from(field.type_),
            }));
        }
        (None, Some(previous_fields)) => {
            removed.extend(previous_fields.items.into_iter().map(
                |FieldDefinition { name, type_, .. }| TypeChange {
                    name: name.value,
                    type_: Type::from(type_),
                },
            ));
        }
        (Some(current_fields), None) => {
            let current_field_items = current_fields.items.clone();
            added.extend(current_field_items.into_iter().map(
                |FieldDefinition { name, type_, .. }| TypeChange {
                    name: name.value,
                    type_: Type::from(type_),
                },
            ));
        }
        (None, None) => {}
    }

    (added, removed, field_changed)
}

fn compare_input_value_definition(
    current: &[InputValueDefinition],
    previous: Vec<InputValueDefinition>,
) -> (Vec<TypeChange>, Vec<TypeChange>) {
    let mut previous_values = previous
        .into_iter()
        .map(|value_def| (value_def.name.value, value_def.type_))
        .collect::<FnvHashMap<_, _>>();

    let mut added = vec![];
    let mut removed = vec![];

    for field in current {
        let previous_type = previous_values.remove(&field.name.value);
        match previous_type {
            None => {
                added.push(TypeChange {
                    name: field.name.value,
                    type_: Type::from(field.type_.clone()),
                });
            }
            Some(previous_type) => {
                let previous_type = Type::from(previous_type);
                let field_type = Type::from(field.type_.clone());
                if previous_type != field_type {
                    removed.push(TypeChange {
                        name: field.name.value,
                        type_: previous_type,
                    });
                    added.push(TypeChange {
                        name: field.name.value,
                        type_: field_type,
                    });
                }
            }
        }
    }
    removed.extend(previous_values.drain().map(|(name, type_)| TypeChange {
        name,
        type_: Type::from(type_),
    }));

    (added, removed)
}

fn compare_string_keys(
    current: &[Identifier],
    previous: Vec<Identifier>,
) -> (Vec<StringKey>, Vec<StringKey>) {
    let mut previous_values = previous
        .into_iter()
        .map(|ident| ident.value)
        .collect::<FnvHashSet<_>>();
    let mut added: Vec<StringKey> = vec![];
    for key in current {
        if !previous_values.remove(&key.value) {
            added.push(key.value);
        }
    }
    let removed: Vec<StringKey> = previous_values.drain().collect();
    (added, removed)
}

fn diff(current: Vec<TypeSystemDefinition>, previous: Vec<TypeSystemDefinition>) -> SchemaChange {
    let mut changes = vec![];
    let mut current_map = build_curent_map(&current);

    for definition in previous {
        match definition {
            TypeSystemDefinition::EnumTypeDefinition(EnumTypeDefinition {
                name,
                values: previous_values,
                ..
            }) => {
                let def = current_map.remove(&name.value);
                match def {
                    Some(TypeSystemDefinition::EnumTypeDefinition(EnumTypeDefinition {
                        values: Some(values),
                        ..
                    })) => {
                        let mut previous_values = previous_values
                            .into_iter()
                            .flat_map(|list| list.items.into_iter().map(|value| value.name.value))
                            .collect::<FnvHashSet<_>>();

                        let mut added = vec![];
                        for val in &values.items {
                            if !previous_values.remove(&val.name.value) {
                                added.push(val.name.value);
                            }
                        }
                        let removed: Vec<StringKey> = previous_values.drain().collect();
                        if !added.is_empty() || !removed.is_empty() {
                            changes.push(DefinitionChange::EnumChanged {
                                name: name.value,
                                added,
                                removed,
                            });
                        }
                    }
                    None => {
                        changes.push(DefinitionChange::EnumRemoved(name.value));
                    }
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::EnumRemoved(name.value));
                    }
                }
            }

            TypeSystemDefinition::UnionTypeDefinition(UnionTypeDefinition {
                name,
                members: previous_members,
                ..
            }) => {
                let def = current_map.remove(&name.value);
                match def {
                    Some(TypeSystemDefinition::UnionTypeDefinition(UnionTypeDefinition {
                        members,
                        ..
                    })) => {
                        let (added, removed) = compare_string_keys(members, previous_members);
                        if !added.is_empty() || !removed.is_empty() {
                            changes.push(DefinitionChange::UnionChanged {
                                name: name.value,
                                added,
                                removed,
                            });
                        }
                    }
                    None => {
                        changes.push(DefinitionChange::UnionRemoved(name.value));
                    }
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::UnionRemoved(name.value));
                    }
                }
            }

            TypeSystemDefinition::InputObjectTypeDefinition(InputObjectTypeDefinition {
                name,
                fields: previous_fields,
                ..
            }) => {
                let def = current_map.remove(&name.value);
                match def {
                    Some(TypeSystemDefinition::InputObjectTypeDefinition(
                        InputObjectTypeDefinition {
                            fields: Some(fields),
                            ..
                        },
                    )) => {
                        let (added, removed) = compare_input_value_definition(
                            &fields.items,
                            previous_fields
                                .into_iter()
                                .flat_map(|list| list.items)
                                .collect(),
                        );
                        if !added.is_empty() || !removed.is_empty() {
                            changes.push(DefinitionChange::InputObjectChanged {
                                name: name.value,
                                added,
                                removed,
                            });
                        }
                    }
                    None
                    | Some(TypeSystemDefinition::InputObjectTypeDefinition(
                        InputObjectTypeDefinition { fields: None, .. },
                    )) => {
                        changes.push(DefinitionChange::InputObjectRemoved(name.value));
                    }
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::InputObjectRemoved(name.value));
                    }
                }
            }

            TypeSystemDefinition::InterfaceTypeDefinition(InterfaceTypeDefinition {
                name,
                fields: optional_previous_fields,
                ..
            }) => {
                let def = current_map.remove(&name.value);
                match def {
                    Some(TypeSystemDefinition::InterfaceTypeDefinition(
                        InterfaceTypeDefinition {
                            fields: optional_current_fields,
                            ..
                        },
                    )) => {
                        let (added, removed, changed) =
                            compare_fields(optional_current_fields, optional_previous_fields);
                        if !added.is_empty() || !removed.is_empty() || !changed.is_empty() {
                            changes.push(DefinitionChange::InterfaceChanged {
                                name: name.value,
                                added,
                                removed,
                                changed,
                            });
                        }
                    }
                    None => {
                        changes.push(DefinitionChange::InterfaceRemoved(name.value));
                    }
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::InterfaceRemoved(name.value));
                    }
                }
            }

            TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
                name,
                interfaces: previous_interfaces,
                fields: optional_previous_fields,
                ..
            }) => {
                let def = current_map.remove(&name.value);
                match def {
                    Some(TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
                        interfaces: current_interfaces,
                        fields: optional_current_fields,
                        ..
                    })) => {
                        let (added, removed, changed) =
                            compare_fields(optional_current_fields, optional_previous_fields);
                        let (interfaces_added, interfaces_removed) =
                            compare_string_keys(current_interfaces, previous_interfaces);
                        if !added.is_empty()
                            || !removed.is_empty()
                            || !changed.is_empty()
                            || !interfaces_added.is_empty()
                            || !interfaces_removed.is_empty()
                        {
                            changes.push(DefinitionChange::ObjectChanged {
                                name: name.value,
                                added,
                                removed,
                                changed,
                                interfaces_added,
                                interfaces_removed,
                            });
                        }
                    }
                    None => {
                        changes.push(DefinitionChange::ObjectRemoved(name.value));
                    }
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::ObjectRemoved(name.value));
                    }
                }
            }

            TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition { name, .. }) => {
                let def = current_map.remove(&name.value);
                match def {
                    None => {
                        changes.push(DefinitionChange::ScalarRemoved(name.value));
                    }
                    Some(TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition {
                        ..
                    })) => {}
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::ScalarRemoved(name.value));
                    }
                }
            }

            // We skip diffing the following definitions
            TypeSystemDefinition::InterfaceTypeExtension(..)
            | TypeSystemDefinition::ObjectTypeExtension(..)
            | TypeSystemDefinition::SchemaDefinition(..)
            | TypeSystemDefinition::DirectiveDefinition(..)
            | TypeSystemDefinition::SchemaExtension(_)
            | TypeSystemDefinition::EnumTypeExtension(_)
            | TypeSystemDefinition::UnionTypeExtension(_)
            | TypeSystemDefinition::InputObjectTypeExtension(_)
            | TypeSystemDefinition::ScalarTypeExtension(_) => {}
        }
    }

    for (_, definition) in current_map.drain().into_iter() {
        add_definition(&mut changes, definition);
    }

    if changes.is_empty() {
        // The schema has changed, but we currently don't detect directive definition changes,
        // schema deifinition changes, and we don't parse client extensions.
        // But we can add them later if some of the changes don't require full rebuilds.
        return SchemaChange::GenericChange;
    }

    SchemaChange::DefinitionChanges(changes)
}

pub fn detect_changes(current_text: &[&str], previous_text: &[&str]) -> SchemaChange {
    if current_text == previous_text {
        return SchemaChange::None;
    }

    match (
        parse_schema_document(&current_text.join("\n"), SourceLocationKey::Generated),
        parse_schema_document(&previous_text.join("\n"), SourceLocationKey::Generated),
    ) {
        (Ok(current_schema), Ok(previous_schema)) => {
            diff(current_schema.definitions, previous_schema.definitions)
        }
        (_, _) => SchemaChange::InvalidSchema,
    }
}
