/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::hash_map::Entry;
use std::collections::HashMap;
use std::fmt;

use graphql_ir::*;
use intern::string_key::StringKey;
use intern::string_key::StringKeyMap;
use intern::string_key::StringKeySet;
use relay_transforms::get_resolver_fragment_dependency_name;
use schema::SDLSchema;
use schema::Schema;

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
/// New implicit dependencies are detected by walking the changed documents,
/// whereas preexisting implicit dependencies must be passed in as
/// `implicit_dependencies`.
pub fn get_reachable_ir(
    definitions: Vec<ExecutableDefinition>,
    base_definition_names: StringKeySet,
    changed_names: StringKeySet,
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
    let dependency_graph = build_dependency_graph(schema, definitions);

    let mut visited = Default::default();
    let mut filtered_definitions = Default::default();

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

// Build a dependency graph of that nodes are "doubly linked"
fn build_dependency_graph(
    schema: &SDLSchema,
    definitions: Vec<ExecutableDefinition>,
) -> StringKeyMap<Node> {
    let mut dependency_graph: StringKeyMap<Node> =
        HashMap::with_capacity_and_hasher(definitions.len(), Default::default());

    for definition in definitions.into_iter() {
        let name = match &definition {
            ExecutableDefinition::Operation(operation) => operation.name.item.0,
            ExecutableDefinition::Fragment(fragment) => fragment.name.item.0,
        };

        // Visit the selections of the IR to build it's `children`
        let mut children = vec![];
        let selections = match &definition {
            ExecutableDefinition::Operation(operation) => &operation.selections,
            ExecutableDefinition::Fragment(fragment) => &fragment.selections,
        };
        visit_selections(
            schema,
            &mut dependency_graph,
            selections,
            name,
            &mut children,
        );

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

fn update_dependency_graph(
    current_node: StringKey,
    parent_name: StringKey,
    dependency_graph: &mut StringKeyMap<Node>,
    children: &mut Vec<StringKey>,
) {
    match dependency_graph.get_mut(&current_node) {
        None => {
            dependency_graph.insert(
                current_node,
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
    children.push(current_node);
}

// Visit the selections of current IR, set the `children` for the node representing the IR,
// and the `parents` for nodes representing the children IR
fn visit_selections(
    schema: &SDLSchema,
    dependency_graph: &mut StringKeyMap<Node>,
    selections: &[Selection],
    parent_name: StringKey,
    children: &mut Vec<StringKey>,
) {
    for selection in selections {
        match selection {
            Selection::FragmentSpread(node) => {
                let current_node = node.fragment.item.0;
                update_dependency_graph(current_node, parent_name, dependency_graph, children);
            }
            Selection::InlineFragment(node) => {
                visit_selections(
                    schema,
                    dependency_graph,
                    &node.selections,
                    parent_name,
                    children,
                );
            }
            Selection::LinkedField(linked_field) => {
                if let Some(fragment_name) = get_resolver_fragment_dependency_name(
                    schema.field(linked_field.definition.item),
                    schema,
                ) {
                    update_dependency_graph(
                        fragment_name.0,
                        parent_name,
                        dependency_graph,
                        children,
                    );
                }
                visit_selections(
                    schema,
                    dependency_graph,
                    &linked_field.selections,
                    parent_name,
                    children,
                );
            }
            Selection::ScalarField(scalar_field) => {
                if let Some(fragment_name) = get_resolver_fragment_dependency_name(
                    schema.field(scalar_field.definition.item),
                    schema,
                ) {
                    update_dependency_graph(
                        fragment_name.0,
                        parent_name,
                        dependency_graph,
                        children,
                    );
                }
            }
            Selection::Condition(node) => {
                visit_selections(
                    schema,
                    dependency_graph,
                    &node.selections,
                    parent_name,
                    children,
                );
            }
        }
    }
}

// From `key` of changed definition, recursively traverse up the dependency tree, and add all related nodes (ancestors
// of changed definitions which are not from base definitions, and all of their descendants) into the `result`
fn add_related_nodes(
    visited: &mut StringKeySet,
    result: &mut StringKeyMap<ExecutableDefinition>,
    dependency_graph: &StringKeyMap<Node>,
    base_definition_names: &StringKeySet,
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
    result: &mut StringKeyMap<ExecutableDefinition>,
    dependency_graph: &StringKeyMap<Node>,
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
