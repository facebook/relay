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
    // TODO: add other types
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
            _ => {}
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
                        changes.push(DefinitionChange::EnumRemoved(name));
                        changes.push(get_added_definition(def));
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
                        let mut previous_values =
                            FnvHashSet::from_iter(previous_members.into_iter());

                        let mut added: Vec<StringKey> = vec![];
                        for member in members {
                            if !previous_values.remove(member) {
                                added.push(*member);
                            }
                        }
                        let removed: Vec<StringKey> = previous_values.drain().collect();
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
                        changes.push(DefinitionChange::UnionRemoved(name));
                        changes.push(get_added_definition(def));
                    }
                }
            }

            Definition::InputObjectTypeDefinition { name, .. } => {
                // TODO
                current_map.remove(&name);
            }

            Definition::InterfaceTypeDefinition { name, .. } => {
                // TODO
                current_map.remove(&name);
            }

            Definition::ObjectTypeDefinition { name, .. } => {
                // TODO
                current_map.remove(&name);
            }

            Definition::ScalarTypeDefinition { name, .. } => {
                let def = current_map.remove(&name);
                match def {
                    None => {
                        changes.push(DefinitionChange::ScalarRemoved(name));
                    }
                    Some(Definition::ScalarTypeDefinition { .. }) => {}
                    Some(def) => {
                        changes.push(DefinitionChange::ScalarRemoved(name));
                        changes.push(get_added_definition(def));
                    }
                }
            }

            // We skip diffing the following deifinitions
            Definition::InterfaceTypeExtension { .. } => {}
            Definition::ObjectTypeExtension { .. } => {}
            Definition::SchemaDefinition { .. } => {}
            Definition::DirectiveDefinition { .. } => {}
        }
    }

    for (_, definition) in current_map.drain().into_iter() {
        changes.push(get_added_definition(definition));
    }

    if changes.is_empty() {
        // The schema has changed, but we currently don't detect definition type changes, directive
        // definition changes, schema deifinition changes, and we don't parse client extensions.
        // But we can add them later if some of the changes don't require full rebuilds.
        return SchemaChange::GenericChange;
    }

    SchemaChange::DefinitionChanges(changes)
}

fn get_added_definition(def: &Definition) -> DefinitionChange {
    match def {
        Definition::ScalarTypeDefinition { name, .. } => DefinitionChange::ScalarAdded(*name),
        Definition::UnionTypeDefinition { name, .. } => DefinitionChange::UnionAdded(*name),
        Definition::EnumTypeDefinition { name, .. } => DefinitionChange::EnumAdded(*name),
        _ => unimplemented!("TODO: get other added type definitions"),
    }
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
