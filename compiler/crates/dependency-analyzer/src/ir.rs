/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::{FnvHashMap, FnvHashSet};

use graphql_ir::*;
use intern::string_key::StringKey;
use relay_transforms::{DependencyMap, ResolverFieldFinder};
use schema::SDLSchema;
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

/// Find the set of executable definitions that are potentially impacted by the
/// set of changed documents declared in `changed_names`. This is achieved by
/// building a dependency graph where edges are either explicit fragment spreads,
/// or "implicit dependencies" such as those created by Relay Resolvers.
///
/// New implicit dependencies are detected by walking the chaged documents,
/// whereas preexisting implicit dependencies must be passed in as
/// `implicit_dependencies`.
pub fn get_reachable_ir(
    definitions: Vec<ExecutableDefinition>,
    base_definition_names: FnvHashSet<StringKey>,
    changed_names: FnvHashSet<StringKey>,
    implicit_dependencies: &DependencyMap,
    schema: &SDLSchema,
) -> Vec<ExecutableDefinition> {
    if changed_names.is_empty() {
        return vec![];
    }

    // For each executable definition, define a `Node` indicating its parents and children
    // Note: There are situations where a name in `changed_names` may not appear
    // in `definitions`, and thus would be missing from `dependency_graph`. This can arise
    // if you change a file which contains a fragment which is present in the
    // base project, but is not reachable from any of the project's own
    // queries/mutations.
    let mut dependency_graph = build_dependency_graph(definitions);

    // Note: Keys found in `resolver_dependencies` should theoretically replace
    // those found in `implicit_dependencies`, however that would require either
    // getting a mutable copy of `implicit_dependencies` or copying it. For
    // simplicity we just add both sets. This means we may mark a few extra
    // definitions as reachable (false positives), but it's an edge case and
    // the cost is minimal.
    let resolver_dependencies =
        find_resolver_dependencies(&changed_names, &dependency_graph, schema);

    add_dependencies_to_graph(&mut dependency_graph, implicit_dependencies);
    add_dependencies_to_graph(&mut dependency_graph, &resolver_dependencies);

    let mut visited = FnvHashSet::default();
    let mut filtered_definitions = FnvHashMap::default();

    for key in changed_names.into_iter() {
        if dependency_graph.contains_key(&key) {
            add_related_nodes(
                &mut visited,
                &mut filtered_definitions,
                &dependency_graph,
                &base_definition_names,
                key,
            );
        }
    }

    filtered_definitions
        .drain()
        .map(|(_, definition)| definition)
        .collect()
}

fn find_resolver_dependencies(
    reachable_names: &FnvHashSet<StringKey>,
    dependency_graph: &FnvHashMap<StringKey, Node>,
    schema: &SDLSchema,
) -> DependencyMap {
    let mut dependencies = Default::default();
    let mut finder = ResolverFieldFinder::new(&mut dependencies, schema);
    for name in reachable_names {
        if let Some(node) = dependency_graph.get(name) {
            let def = match node.ir.as_ref() {
                Some(definition) => definition,
                None => panic!("Could not find defintion for {}.", name),
            };

            match def {
                ExecutableDefinition::Fragment(fragment) => finder.visit_fragment(fragment),
                ExecutableDefinition::Operation(operation) => finder.visit_operation(operation),
            }
        }
    }
    dependencies
}

fn add_dependencies_to_graph(
    dependency_graph: &mut FnvHashMap<StringKey, Node>,
    dependencies: &DependencyMap,
) {
    for (parent, children) in dependencies.iter() {
        if let Some(node) = dependency_graph.get_mut(parent) {
            node.children.extend(children.iter());
        };
        for child in children.iter() {
            if let Some(node) = dependency_graph.get_mut(child) {
                node.parents.push(*parent);
            };
        }
    }
}

// Build a dependency graph of that nodes are "doubly linked"
fn build_dependency_graph(definitions: Vec<ExecutableDefinition>) -> FnvHashMap<StringKey, Node> {
    let mut dependency_graph =
        FnvHashMap::with_capacity_and_hasher(definitions.len(), Default::default());

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
        visit_selections(&mut dependency_graph, selections, name, &mut children);

        // Insert or update the representation of the IR in the dependency tree
        match dependency_graph.entry(name) {
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
    dependency_graph
}

// Visit the selections of current IR, set the `children` for the node representing the IR,
// and the `parents` for nodes representing the children IR
fn visit_selections(
    dependency_graph: &mut FnvHashMap<StringKey, Node>,
    selections: &[Selection],
    parent_name: StringKey,
    children: &mut Vec<StringKey>,
) {
    for selection in selections {
        match selection {
            Selection::FragmentSpread(node) => {
                let key = node.fragment.item;
                match dependency_graph.get_mut(&key) {
                    None => {
                        dependency_graph.insert(
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
                visit_selections(dependency_graph, &node.selections, parent_name, children);
            }
            Selection::InlineFragment(node) => {
                visit_selections(dependency_graph, &node.selections, parent_name, children);
            }
            Selection::ScalarField(_) => {}
            Selection::Condition(node) => {
                visit_selections(dependency_graph, &node.selections, parent_name, children);
            }
        }
    }
}

// From `key` of changed definition, recusively traverse up the depenency tree, and add all related nodes (ancestors
// of changned definitions which are not from base definitions, and all of their desendants) into the `result`
fn add_related_nodes(
    visited: &mut FnvHashSet<StringKey>,
    result: &mut FnvHashMap<StringKey, ExecutableDefinition>,
    dependency_graph: &FnvHashMap<StringKey, Node>,
    base_definition_names: &FnvHashSet<StringKey>,
    key: StringKey,
) {
    if !visited.insert(key) {
        return;
    }

    let parents = match dependency_graph.get(&key) {
        None => {
            panic!("Fragment {:?} not found in IR.", key);
        }
        Some(node) => &node.parents,
    };
    if parents.is_empty() {
        if !base_definition_names.contains(&key) {
            add_descendants(result, dependency_graph, key);
        }
    } else {
        for parent in parents {
            add_related_nodes(
                visited,
                result,
                dependency_graph,
                base_definition_names,
                *parent,
            );
        }
    }
}

// Recursively add all descendants of current node into the `result`
fn add_descendants(
    result: &mut FnvHashMap<StringKey, ExecutableDefinition>,
    dependency_graph: &FnvHashMap<StringKey, Node>,
    key: StringKey,
) {
    if result.contains_key(&key) {
        return;
    }
    match dependency_graph.get(&key) {
        Some(Node {
            ir: Some(def),
            children,
            ..
        }) => {
            result.insert(key, def.clone());
            for child in children {
                add_descendants(result, dependency_graph, *child);
            }
        }
        _ => {
            panic!("Fragment {:?} not found in IR.", key);
        }
    }
}
