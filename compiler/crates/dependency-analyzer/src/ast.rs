/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::{FnvHashMap, FnvHashSet};
use graphql_syntax::*;
use interner::StringKey;

pub struct ReachableAst {
    /// The definitions that need to be compiled, includes the project
    /// definitions plus the fragment definitions in the base definitions
    /// reachable from the project definitions.
    pub definitions: Vec<ExecutableDefinition>,
    /// The fragment names added from the base definitions.
    pub base_fragment_names: FnvHashSet<StringKey>,
}

pub fn get_reachable_ast(
    project_definitions: Vec<ExecutableDefinition>,
    base_definitions: Vec<ExecutableDefinition>,
) -> Result<ReachableAst, String> {
    if base_definitions.is_empty() {
        return Ok(ReachableAst {
            definitions: project_definitions,
            base_fragment_names: FnvHashSet::default(),
        });
    }

    let mut reachable_base_asts = FnvHashSet::default();
    let mut base_definitions_map = FnvHashMap::default();

    // Preprocess all base fragment definitions
    // Skipping operations because project definitions can't reference base operations
    for base_definition in base_definitions {
        match &base_definition {
            ExecutableDefinition::Fragment(fragment) => {
                let name = fragment.name.value;
                if base_definitions_map.insert(name, base_definition).is_some() {
                    return Err(format!("duplicate definition of {:?}", name));
                }
            }
            ExecutableDefinition::Operation(_) => {}
        }
    }

    let mut result = project_definitions.clone();

    // Find references from project definitions -> base definitions
    for definition in project_definitions {
        let selections = match definition {
            ExecutableDefinition::Operation(definition) => definition.selections,
            ExecutableDefinition::Fragment(definition) => definition.selections,
        };
        visit_selections(
            &base_definitions_map,
            &mut reachable_base_asts,
            &selections,
            false,
        )?
    }

    for key in &reachable_base_asts {
        let value = base_definitions_map.remove(key).unwrap();
        result.push(value);
    }

    Ok(ReachableAst {
        definitions: result,
        base_fragment_names: reachable_base_asts,
    })
}

fn visit_selections(
    base_definitions_map: &FnvHashMap<StringKey, ExecutableDefinition>,
    reachable_base_asts: &mut FnvHashSet<StringKey>,
    selections: &List<Selection>,
    is_base: bool,
) -> Result<(), String> {
    for selection in &selections.items {
        match selection {
            graphql_syntax::Selection::FragmentSpread(selection) => {
                if is_base || base_definitions_map.contains_key(&selection.name.value) {
                    traverse_base_ast_definition(
                        base_definitions_map,
                        reachable_base_asts,
                        selection.name.value,
                    )?
                }
            }
            graphql_syntax::Selection::LinkedField(selection) => visit_selections(
                base_definitions_map,
                reachable_base_asts,
                &selection.selections,
                is_base,
            )?,
            graphql_syntax::Selection::InlineFragment(selection) => visit_selections(
                base_definitions_map,
                reachable_base_asts,
                &selection.selections,
                is_base,
            )?,
            _ => {}
        }
    }
    Ok(())
}

fn traverse_base_ast_definition(
    base_definitions_map: &FnvHashMap<StringKey, ExecutableDefinition>,
    reachable_base_asts: &mut FnvHashSet<StringKey>,
    key: StringKey,
) -> Result<(), String> {
    if reachable_base_asts.contains(&key) {
        return Ok(());
    }
    let definition = base_definitions_map.get(&key);
    match definition {
        None => {
            return Err(format!("Missing fragment definition: {}", key));
        }
        Some(definition) => {
            reachable_base_asts.insert(key);
            let selections = match definition {
                ExecutableDefinition::Operation(definition) => &definition.selections,
                ExecutableDefinition::Fragment(definition) => &definition.selections,
            };
            visit_selections(base_definitions_map, reachable_base_asts, selections, true)?
        }
    }
    Ok(())
}
