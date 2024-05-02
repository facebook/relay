/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::hash_map::Entry;
use std::collections::HashMap;
use std::fmt;

use common::PerfLogEvent;
use graphql_ir::*;
use relay_transforms::get_resolver_fragment_dependency_name;
use rustc_hash::FxHashMap;
use rustc_hash::FxHashSet;
use schema::SDLSchema;
use schema::Schema;
use schema_diff::check;

use crate::schema_change_analyzer;

pub type ExecutableDefinitionNameSet = FxHashSet<ExecutableDefinitionName>;
pub type ExecutableDefinitionNameMap<V> = FxHashMap<ExecutableDefinitionName, V>;
pub type ExecutableDefinitionNameVec = Vec<ExecutableDefinitionName>;

struct Node {
    ir: Option<ExecutableDefinition>,
    parents: ExecutableDefinitionNameVec,
    children: ExecutableDefinitionNameVec,
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
    base_definition_names: ExecutableDefinitionNameSet,
    changed_names: ExecutableDefinitionNameSet,
    schema: &SDLSchema,
    schema_changes: FxHashSet<check::IncrementalBuildSchemaChange>,
    log_event: &impl PerfLogEvent,
) -> Vec<ExecutableDefinition> {
    let timer = log_event.start("get_reachable_ir_time");
    let result = if changed_names.is_empty() && schema_changes.is_empty() {
        vec![]
    } else {
        let mut all_changed_names: ExecutableDefinitionNameSet =
            schema_change_analyzer::get_affected_definitions(schema, &definitions, schema_changes);
        all_changed_names.extend(changed_names);

        // For each executable definition, define a `Node` indicating its parents and children
        // Note: There are situations where a name in `changed_names` may not appear
        // in `definitions`, and thus would be missing from `dependency_graph`. This can arise
        // if you change a file which contains a fragment which is present in the
        // base project, but is not reachable from any of the project's own
        // queries/mutations.
        let dependency_graph = build_dependency_graph(schema, definitions);

        let mut visited = Default::default();
        let mut filtered_definitions = Default::default();

        for key in all_changed_names.into_iter() {
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
    };

    log_event.stop(timer);
    result
}

// Build a dependency graph of that nodes are "doubly linked"
fn build_dependency_graph(
    schema: &SDLSchema,
    definitions: Vec<ExecutableDefinition>,
) -> ExecutableDefinitionNameMap<Node> {
    let mut dependency_graph =
        HashMap::with_capacity_and_hasher(definitions.len(), Default::default());

    for definition in definitions.into_iter() {
        let name = match &definition {
            ExecutableDefinition::Operation(operation) => operation.name.item.into(),
            ExecutableDefinition::Fragment(fragment) => fragment.name.item.into(),
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
    current_node: ExecutableDefinitionName,
    parent_name: ExecutableDefinitionName,
    dependency_graph: &mut ExecutableDefinitionNameMap<Node>,
    children: &mut ExecutableDefinitionNameVec,
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
    dependency_graph: &mut ExecutableDefinitionNameMap<Node>,
    selections: &[Selection],
    parent_name: ExecutableDefinitionName,
    children: &mut ExecutableDefinitionNameVec,
) {
    for selection in selections {
        match selection {
            Selection::FragmentSpread(node) => {
                let current_node = node.fragment.item.into();
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
                ) {
                    update_dependency_graph(
                        fragment_name.into(),
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
                ) {
                    update_dependency_graph(
                        fragment_name.into(),
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
    visited: &mut ExecutableDefinitionNameSet,
    result: &mut ExecutableDefinitionNameMap<ExecutableDefinition>,
    dependency_graph: &ExecutableDefinitionNameMap<Node>,
    base_definition_names: &ExecutableDefinitionNameSet,
    key: ExecutableDefinitionName,
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
    result: &mut ExecutableDefinitionNameMap<ExecutableDefinition>,
    dependency_graph: &ExecutableDefinitionNameMap<Node>,
    key: ExecutableDefinitionName,
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

/// Get fragment references of each definition
pub fn get_ir_definition_references<'a>(
    schema: &SDLSchema,
    definitions: impl IntoIterator<Item = &'a ExecutableDefinition>,
) -> ExecutableDefinitionNameMap<ExecutableDefinitionNameSet> {
    let mut result: ExecutableDefinitionNameMap<ExecutableDefinitionNameSet> = Default::default();
    for definition in definitions {
        let name = definition.name_with_location().item;
        let name = match definition {
            ExecutableDefinition::Operation(_) => OperationDefinitionName(name).into(),
            ExecutableDefinition::Fragment(_) => FragmentDefinitionName(name).into(),
        };
        let mut selections: Vec<_> = match definition {
            ExecutableDefinition::Operation(definition) => &definition.selections,
            ExecutableDefinition::Fragment(definition) => &definition.selections,
        }
        .iter()
        .collect();
        let mut references: ExecutableDefinitionNameSet = Default::default();
        while let Some(selection) = selections.pop() {
            match selection {
                Selection::FragmentSpread(selection) => {
                    references.insert(selection.fragment.item.into());
                }
                Selection::LinkedField(selection) => {
                    if let Some(fragment_name) = get_resolver_fragment_dependency_name(
                        schema.field(selection.definition.item),
                    ) {
                        references.insert(fragment_name.into());
                    }
                    selections.extend(&selection.selections);
                }
                Selection::InlineFragment(selection) => {
                    selections.extend(&selection.selections);
                }
                Selection::Condition(selection) => {
                    selections.extend(&selection.selections);
                }
                Selection::ScalarField(selection) => {
                    if let Some(fragment_name) = get_resolver_fragment_dependency_name(
                        schema.field(selection.definition.item),
                    ) {
                        references.insert(fragment_name.into());
                    }
                }
            }
        }
        result.insert(name, references);
    }
    result
}
