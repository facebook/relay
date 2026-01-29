/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::sync::Arc;

use intern::BuildIdHasher;
use schema::SDLSchema;

use crate::ExecutableDefinitionName;
use crate::ir::ExecutableDefinition;
use crate::ir::FragmentDefinition;
use crate::ir::FragmentDefinitionName;
use crate::ir::FragmentDefinitionNameMap;
use crate::ir::OperationDefinition;
use crate::ir::OperationDefinitionName;

/// A collection of all documents that are being compiled.
#[derive(Debug, Clone)]
pub struct Program {
    pub schema: Arc<SDLSchema>,
    pub fragments: FragmentDefinitionNameMap<Arc<FragmentDefinition>>,
    pub operations: Vec<Arc<OperationDefinition>>,
}

impl Program {
    pub fn new(schema: Arc<SDLSchema>) -> Self {
        Self {
            schema,
            fragments: Default::default(),
            operations: Default::default(),
        }
    }

    pub fn from_definitions(
        schema: Arc<SDLSchema>,
        definitions: Vec<ExecutableDefinition>,
    ) -> Self {
        let mut operations = Vec::new();
        let mut fragments = HashMap::default();
        let mut seen_operation_loc = HashMap::new();
        for definition in definitions {
            match definition {
                ExecutableDefinition::Operation(operation) => {
                    let loc = operation.name.location;
                    let name = operation.name.item;
                    if let Some(another) = seen_operation_loc.insert(name, loc) {
                        panic!(
                            "\nDuplicate operation definitions named {name}: \nfirst one: {loc:?}\nsecond one: {another:?}\n"
                        );
                    }
                    operations.push(Arc::new(operation)); // Keep the order the operations same as inputs.
                }
                ExecutableDefinition::Fragment(fragment) => {
                    let loc = fragment.name.location;
                    let name = fragment.name.item;
                    if let Some(another) = fragments.insert(name, Arc::new(fragment)) {
                        panic!(
                            "\nDuplicate fragment definitions named {}: \nfirst one: {:?}\nsecond one: {:?}\n",
                            name, loc, &another.name.location
                        );
                    }
                }
            }
        }
        Self {
            schema,
            fragments,
            operations,
        }
    }

    pub fn insert_fragment(&mut self, fragment: Arc<FragmentDefinition>) {
        let name = fragment.name.item;
        if let Some(previous) = self.fragments.insert(name, fragment) {
            panic!(
                "Can only insert '{}' once. Had {:?} and trying to insert {:?}.",
                name, previous, self.fragments[&name]
            );
        };
    }

    pub fn fragment(&self, name: FragmentDefinitionName) -> Option<&Arc<FragmentDefinition>> {
        self.fragments.get(&name)
    }

    pub fn fragment_mut(
        &mut self,
        name: FragmentDefinitionName,
    ) -> Option<&mut Arc<FragmentDefinition>> {
        self.fragments.get_mut(&name)
    }

    /// Searches for an operation by name.
    ///
    /// NOTE: This is a linear search, we currently don't frequently search
    ///       for operations by name, so this might be overall faster than
    ///       using a map internally.
    pub fn operation(&self, name: OperationDefinitionName) -> Option<&Arc<OperationDefinition>> {
        self.operations()
            .find(|operation| operation.name.item == name)
    }

    pub fn insert_operation(&mut self, operation: Arc<OperationDefinition>) {
        self.operations.push(operation);
    }

    pub fn operations(&self) -> impl Iterator<Item = &Arc<OperationDefinition>> {
        self.operations.iter()
    }

    pub fn fragments(&self) -> impl Iterator<Item = &Arc<FragmentDefinition>> {
        self.fragments.values()
    }

    pub fn document_count(&self) -> usize {
        self.fragments.len() + self.operations.len()
    }

    pub fn merge_program(
        &mut self,
        other_program: &Self,
        removed_definition_names: Option<Vec<ExecutableDefinitionName>>,
    ) {
        let mut operations: HashMap<
            OperationDefinitionName,
            Arc<OperationDefinition>,
            BuildIdHasher<u32>,
        > = self
            .operations
            .drain(..)
            .map(|op| (op.name.item, op))
            .collect();
        for fragment in other_program.fragments() {
            self.fragments
                .insert(fragment.name.item, Arc::clone(fragment));
        }
        for operation in other_program.operations() {
            operations.insert(operation.name.item, Arc::clone(operation));
        }
        if let Some(removed_definition_names) = removed_definition_names {
            for removed in removed_definition_names {
                match removed {
                    ExecutableDefinitionName::OperationDefinitionName(name) => {
                        operations.remove(&name);
                    }
                    ExecutableDefinitionName::FragmentDefinitionName(name) => {
                        self.fragments.remove(&name);
                    }
                };
            }
        }
        self.operations.extend(operations.into_values());
    }
}
