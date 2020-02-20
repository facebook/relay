/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::{FnvHashMap, FnvHashSet};

use graphql_ir::*;
use interner::StringKey;
use std::collections::hash_map::Entry;
use std::fmt;

struct Node {
    ir: Option<ExecutableDefinition>,
    parents: Vec<StringKey>,
    children: Vec<StringKey>,
}

impl fmt::Debug for Node {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!(
            "parents: {:?} / children: {:?}",
            self.parents, self.children
        ))
    }
}

pub fn get_reachable_ir(
    definitions: Vec<ExecutableDefinition>,
    base_definitions: FnvHashSet<StringKey>,
    changed_names: Vec<StringKey>,
) -> Vec<ExecutableDefinition> {
    if changed_names.is_empty() {
        return vec![];
    }

    let mut trees = build_dependency_trees(definitions);

    let mut visited = FnvHashSet::default();
    let mut filtered_definitions = FnvHashMap::default();

    for key in changed_names.into_iter() {
        if trees.contains_key(&key) {
            add_related_nodes(
                &mut visited,
                &mut filtered_definitions,
                &mut trees,
                &base_definitions,
                key,
            );
        }
    }

    filtered_definitions
        .drain()
        .map(|(_, definition)| definition)
        .collect()
}

// Build a set of dependency trees that nodes are "doubly linked"
fn build_dependency_trees(definitions: Vec<ExecutableDefinition>) -> FnvHashMap<StringKey, Node> {
    let mut trees = FnvHashMap::with_capacity_and_hasher(definitions.len(), Default::default());

    for definition in definitions.into_iter() {
        let name = match &definition {
            ExecutableDefinition::Operation(operation) => operation.name.item,
            ExecutableDefinition::Fragment(fragment) => fragment.name.item,
        };

        // Visit the selections of the IR to build it's `children`
        let mut children = vec![];
        let selections = match &definition {
            ExecutableDefinition::Operation(operation) => &operation.selections,
            ExecutableDefinition::Fragment(fragment) => &fragment.selections,
        };
        visit_selections(&mut trees, &selections, name, &mut children);

        // Insert or update the representation of the IR in the dependency tree
        match trees.entry(name) {
            // Add a new node for current IR to the dependency tree
            Entry::Vacant(entry) => {
                entry.insert(Node {
                    ir: Some(definition),
                    parents: vec![],
                    children,
                });
            }

            // The node is already created when visiting selections of the IR, but it's `ir` and `children` haven't been set
            Entry::Occupied(mut entry) => {
                let node = entry.get_mut();
                if let Some(def) = &node.ir {
                    panic!(
                        "Duplicate definition: had {:?} and found another {:?}.",
                        def, node.ir
                    );
                }
                node.ir = Some(definition);
                node.children = children;
            }
        }
    }
    trees
}

// Visit the selections of current IR, set the `children` for the node representing the IR,
// and the `parents` for nodes representing the children IR
fn visit_selections(
    trees: &mut FnvHashMap<StringKey, Node>,
    selections: &[Selection],
    parent_name: StringKey,
    children: &mut Vec<StringKey>,
) {
    for selection in selections {
        match selection {
            Selection::FragmentSpread(node) => {
                let key = node.fragment.item;
                match trees.get_mut(&key) {
                    None => {
                        trees.insert(
                            key,
                            Node {
                                ir: None,
                                parents: vec![parent_name],
                                children: vec![],
                            },
                        );
                    }
                    Some(node) => {
                        node.parents.push(parent_name);
                    }
                }
                children.push(key);
            }
            Selection::LinkedField(node) => {
                visit_selections(trees, &node.selections, parent_name, children);
            }
            Selection::InlineFragment(node) => {
                visit_selections(trees, &node.selections, parent_name, children);
            }
            Selection::ScalarField(_) => {}
            Selection::Condition(node) => {
                visit_selections(trees, &node.selections, parent_name, children);
            }
        }
    }
}

// From `key` of changed definition, recusively traverse up the depenency tree, and add all related nodes (ancestors
// of changned definitions which are not from base definitions, and all of their desendants) into the `result`
fn add_related_nodes(
    visited: &mut FnvHashSet<StringKey>,
    result: &mut FnvHashMap<StringKey, ExecutableDefinition>,
    trees: &mut FnvHashMap<StringKey, Node>,
    base_definitions: &FnvHashSet<StringKey>,
    key: StringKey,
) {
    if !visited.insert(key) {
        return;
    }

    let parents = match trees.get(&key) {
        None => {
            panic!("Fragment {:?} not found in IR.", key);
        }
        Some(node) => node.parents.clone(),
    };
    for parent in parents.into_iter() {
        add_related_nodes(visited, result, trees, base_definitions, parent);
    }
    if !base_definitions.contains(&key) {
        add_descendants(visited, result, trees, key);
    }
}

// Recursively add all descendants of current node into the `result`
fn add_descendants(
    visited: &mut FnvHashSet<StringKey>,
    result: &mut FnvHashMap<StringKey, ExecutableDefinition>,
    trees: &mut FnvHashMap<StringKey, Node>,
    key: StringKey,
) {
    if result.contains_key(&key) {
        return;
    }
    visited.insert(key);
    match trees.remove(&key) {
        Some(Node {
            ir: Some(def),
            children,
            ..
        }) => {
            result.insert(key, def);
            for child in children {
                add_descendants(visited, result, trees, child);
            }
        }
        _ => {
            panic!("Fragment {:?} not found in IR.", key);
        }
    }
}
