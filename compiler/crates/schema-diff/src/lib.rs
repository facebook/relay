/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

#[cfg(test)]
mod test;

use fnv::{FnvHashMap, FnvHashSet};
use interner::StringKey;
use schema::*;
use std::iter::FromIterator;

#[derive(Eq, PartialEq, PartialOrd, Ord)]
pub enum DefinitionChange {
    EnumAdded(StringKey),
    EnumChanged {
        name: StringKey,
        added: Vec<StringKey>,
        removed: Vec<StringKey>,
    },
    EnumRemoved(StringKey),
    UnionAdded(StringKey),
    UnionChanged {
        name: StringKey,
        added: Vec<StringKey>,
        removed: Vec<StringKey>,
    },
    UnionRemoved(StringKey),
    ScalarAdded(StringKey),
    ScalarRemoved(StringKey),
    InputObjectAdded(StringKey),
    InputObjectChanged {
        name: StringKey,
        added: Vec<TypeChange>,
        removed: Vec<TypeChange>,
    },
    InputObjectRemoved(StringKey),
    InterfaceAdded(StringKey),
    InterfaceChanged {
        name: StringKey,
        added: Vec<TypeChange>,
        removed: Vec<TypeChange>,
        changed: Vec<ArgumentChange>,
    },
    InterfaceRemoved(StringKey),
    ObjectAdded(StringKey),
    ObjectChanged {
        name: StringKey,
        added: Vec<TypeChange>,
        removed: Vec<TypeChange>,
        changed: Vec<ArgumentChange>,
        interfaces_added: Vec<StringKey>,
        interfaces_removed: Vec<StringKey>,
    },
    ObjectRemoved(StringKey),
}

#[derive(Eq, PartialEq, PartialOrd, Ord)]
pub struct ArgumentChange {
    name: StringKey,
    added: Vec<TypeChange>,
    removed: Vec<TypeChange>,
}

#[derive(Eq, PartialEq, PartialOrd, Ord)]
pub struct TypeChange {
    name: StringKey,
    type_: AstType,
}

#[derive(PartialEq, PartialOrd)]
pub enum SchemaChange {
    None,
    GenericChange,
    DefinitionChanges(Vec<DefinitionChange>),
}

fn build_curent_map(current: &[Definition]) -> FnvHashMap<&StringKey, &Definition> {
    let mut current_map = FnvHashMap::default();
    for def in current {
        match def {
            Definition::EnumTypeDefinition { name, .. } => {
                current_map.insert(name, def);
            }
            Definition::UnionTypeDefinition { name, .. } => {
                current_map.insert(name, def);
            }
            Definition::InputObjectTypeDefinition { name, .. } => {
                current_map.insert(name, def);
            }
            Definition::InterfaceTypeDefinition { name, .. } => {
                current_map.insert(name, def);
            }
            Definition::ObjectTypeDefinition { name, .. } => {
                current_map.insert(name, def);
            }
            Definition::ScalarTypeDefinition { name, .. } => {
                current_map.insert(name, def);
            }
            // We skip diffing the following definitions
            Definition::InterfaceTypeExtension { .. } => {}
            Definition::ObjectTypeExtension { .. } => {}
            Definition::SchemaDefinition { .. } => {}
            Definition::DirectiveDefinition { .. } => {}
        }
    }
    current_map
}

fn diff(current: &[Definition], previous: Vec<Definition>) -> SchemaChange {
    let mut changes = vec![];
    let mut current_map = build_curent_map(current);

    for definition in previous {
        match definition {
            Definition::EnumTypeDefinition {
                name,
                values: previous_values,
                ..
            } => {
                let def = current_map.remove(&name);
                match def {
                    Some(Definition::EnumTypeDefinition { values, .. }) => {
                        let mut previous_values = FnvHashSet::from_iter(
                            previous_values.into_iter().map(|value| value.name),
                        );

                        let mut added = vec![];
                        for val in values {
                            if !previous_values.remove(&val.name) {
                                added.push(val.name);
                            }
                        }
                        let removed: Vec<StringKey> = previous_values.drain().collect();
                        if !added.is_empty() || !removed.is_empty() {
                            changes.push(DefinitionChange::EnumChanged {
                                name,
                                added,
                                removed,
                            });
                        }
                    }
                    None => {
                        changes.push(DefinitionChange::EnumRemoved(name));
                    }
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::EnumRemoved(name));
                    }
                }
            }

            Definition::UnionTypeDefinition {
                name,
                members: previous_members,
                ..
            } => {
                let def = current_map.remove(&name);
                match def {
                    Some(Definition::UnionTypeDefinition { members, .. }) => {
                        let (added, removed) = compare_string_keys(members, previous_members);
                        if !added.is_empty() || !removed.is_empty() {
                            changes.push(DefinitionChange::UnionChanged {
                                name,
                                added,
                                removed,
                            });
                        }
                    }
                    None => {
                        changes.push(DefinitionChange::UnionRemoved(name));
                    }
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::UnionRemoved(name));
                    }
                }
            }

            Definition::InputObjectTypeDefinition {
                name,
                fields: previous_fields,
                ..
            } => {
                let def = current_map.remove(&name);
                match def {
                    Some(Definition::InputObjectTypeDefinition { fields, .. }) => {
                        let (added, removed) =
                            compare_input_value_definition(fields, previous_fields);
                        if !added.is_empty() || !removed.is_empty() {
                            changes.push(DefinitionChange::InputObjectChanged {
                                name,
                                added,
                                removed,
                            });
                        }
                    }
                    None => {
                        changes.push(DefinitionChange::InputObjectRemoved(name));
                    }
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::InputObjectRemoved(name));
                    }
                }
            }

            Definition::InterfaceTypeDefinition {
                name,
                fields: previous_fields,
                ..
            } => {
                let def = current_map.remove(&name);
                match def {
                    Some(Definition::InterfaceTypeDefinition { fields, .. }) => {
                        let (added, removed, changed) = compare_fields(fields, previous_fields);
                        if !added.is_empty() || !removed.is_empty() || !changed.is_empty() {
                            changes.push(DefinitionChange::InterfaceChanged {
                                name,
                                added,
                                removed,
                                changed,
                            });
                        }
                    }
                    None => {
                        changes.push(DefinitionChange::InterfaceRemoved(name));
                    }
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::InterfaceRemoved(name));
                    }
                }
            }

            Definition::ObjectTypeDefinition {
                name,
                interfaces: previous_interfaces,
                fields: previous_fields,
                ..
            } => {
                let def = current_map.remove(&name);
                match def {
                    Some(Definition::ObjectTypeDefinition {
                        interfaces, fields, ..
                    }) => {
                        let (added, removed, changed) = compare_fields(fields, previous_fields);
                        let (interfaces_added, interfaces_removed) =
                            compare_string_keys(interfaces, previous_interfaces);
                        if !added.is_empty()
                            || !removed.is_empty()
                            || !changed.is_empty()
                            || !interfaces_added.is_empty()
                            || !interfaces_removed.is_empty()
                        {
                            changes.push(DefinitionChange::ObjectChanged {
                                name,
                                added,
                                removed,
                                changed,
                                interfaces_added,
                                interfaces_removed,
                            });
                        }
                    }
                    None => {
                        changes.push(DefinitionChange::ObjectRemoved(name));
                    }
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::ObjectRemoved(name));
                    }
                }
            }

            Definition::ScalarTypeDefinition { name, .. } => {
                let def = current_map.remove(&name);
                match def {
                    None => {
                        changes.push(DefinitionChange::ScalarRemoved(name));
                    }
                    Some(Definition::ScalarTypeDefinition { .. }) => {}
                    Some(def) => {
                        if !add_definition(&mut changes, def) {
                            return SchemaChange::GenericChange;
                        }
                        changes.push(DefinitionChange::ScalarRemoved(name));
                    }
                }
            }

            // We skip diffing the following definitions
            Definition::InterfaceTypeExtension { .. } => {}
            Definition::ObjectTypeExtension { .. } => {}
            Definition::SchemaDefinition { .. } => {}
            Definition::DirectiveDefinition { .. } => {}
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

fn compare_fields(
    current_fields: &[FieldDefinition],
    previous_fields: Vec<FieldDefinition>,
) -> (Vec<TypeChange>, Vec<TypeChange>, Vec<ArgumentChange>) {
    let mut previous_values =
        FnvHashMap::from_iter(previous_fields.into_iter().map(|input| (input.name, input)));

    let mut added = vec![];
    let mut removed: Vec<TypeChange> = vec![];
    let mut field_changed = vec![];
    for field in current_fields {
        match previous_values.remove(&field.name) {
            None => {
                added.push(TypeChange {
                    name: field.name,
                    type_: field.type_.clone(),
                });
            }
            Some(previous_field) => {
                if previous_field.type_ != field.type_ {
                    added.push(TypeChange {
                        name: field.name,
                        type_: field.type_.clone(),
                    });
                    removed.push(TypeChange {
                        name: previous_field.name,
                        type_: previous_field.type_,
                    })
                } else {
                    let (added, removed) =
                        compare_input_value_definition(&field.arguments, previous_field.arguments);
                    if !added.is_empty() || !removed.is_empty() {
                        field_changed.push(ArgumentChange {
                            name: field.name,
                            added,
                            removed,
                        })
                    }
                }
            }
        }
    }
    removed.extend(previous_values.drain().map(|(_, field)| TypeChange {
        name: field.name,
        type_: field.type_,
    }));
    (added, removed, field_changed)
}

fn compare_string_keys(
    current: &[StringKey],
    previous: Vec<StringKey>,
) -> (Vec<StringKey>, Vec<StringKey>) {
    let mut previous_values = FnvHashSet::from_iter(previous.into_iter());
    let mut added: Vec<StringKey> = vec![];
    for key in current {
        if !previous_values.remove(key) {
            added.push(*key);
        }
    }
    let removed: Vec<StringKey> = previous_values.drain().collect();
    (added, removed)
}

fn compare_input_value_definition(
    current: &[InputValueDefinition],
    previous: Vec<InputValueDefinition>,
) -> (Vec<TypeChange>, Vec<TypeChange>) {
    let mut previous_values = FnvHashMap::from_iter(
        previous
            .into_iter()
            .map(|value_def| (value_def.name, value_def.type_)),
    );

    let mut added = vec![];
    let mut removed = vec![];

    for field in current {
        let previous_type = previous_values.remove(&field.name);
        match previous_type {
            None => {
                added.push(TypeChange {
                    name: field.name,
                    type_: field.type_.clone(),
                });
            }
            Some(previous_type) => {
                if previous_type != field.type_ {
                    removed.push(TypeChange {
                        name: field.name,
                        type_: previous_type,
                    });
                    added.push(TypeChange {
                        name: field.name,
                        type_: field.type_.clone(),
                    });
                }
            }
        }
    }
    removed.extend(
        previous_values
            .drain()
            .map(|(name, type_)| TypeChange { name, type_ }),
    );
    (added, removed)
}

fn add_definition(changes: &mut Vec<DefinitionChange>, def: &Definition) -> bool {
    match def {
        Definition::ScalarTypeDefinition { name, .. } => {
            changes.push(DefinitionChange::ScalarAdded(*name))
        }
        Definition::UnionTypeDefinition { name, .. } => {
            changes.push(DefinitionChange::UnionAdded(*name))
        }
        Definition::EnumTypeDefinition { name, .. } => {
            changes.push(DefinitionChange::EnumAdded(*name))
        }
        Definition::InputObjectTypeDefinition { name, .. } => {
            changes.push(DefinitionChange::InputObjectAdded(*name))
        }
        Definition::InterfaceTypeDefinition { name, .. } => {
            changes.push(DefinitionChange::InterfaceAdded(*name))
        }
        Definition::ObjectTypeDefinition { name, .. } => {
            changes.push(DefinitionChange::ObjectAdded(*name))
        }
        // We currently don't handle changes of unsupported types,
        // If those type changes occur, we should return early for a full rebuild.
        Definition::InterfaceTypeExtension { .. } => {
            return false;
        }
        Definition::ObjectTypeExtension { .. } => {
            return false;
        }
        Definition::SchemaDefinition { .. } => {
            return false;
        }
        Definition::DirectiveDefinition { .. } => {
            return false;
        }
    };
    true
}

pub fn detect_changes(
    current_definitions: &[Definition],
    current_text: &str,
    previous_text: &str,
) -> SchemaChange {
    if current_text == previous_text {
        return SchemaChange::None;
    }
    let previous_definitions =
        parse_definitions(previous_text).expect("Failed to parse previous schema");
    diff(current_definitions, previous_definitions)
}
