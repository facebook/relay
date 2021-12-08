/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ir::{ExecutableDefinition, FragmentDefinition, OperationDefinition};
use fnv::FnvHashMap;
use intern::string_key::StringKey;
use schema::SDLSchema;
use std::{collections::HashMap, sync::Arc};

/// A collection of all documents that are being compiled.
#[derive(Debug, Clone)]
pub struct Program {
    pub schema: Arc<SDLSchema>,
    pub fragments: FnvHashMap<StringKey, Arc<FragmentDefinition>>,
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
        for definition in definitions {
            match definition {
                ExecutableDefinition::Operation(operation) => {
                    operations.push(Arc::new(operation));
                }
                ExecutableDefinition::Fragment(fragment) => {
                    fragments.insert(fragment.name.item, Arc::new(fragment));
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

    pub fn fragment(&self, name: StringKey) -> Option<&Arc<FragmentDefinition>> {
        self.fragments.get(&name)
    }

    pub fn fragment_mut(&mut self, name: StringKey) -> Option<&mut Arc<FragmentDefinition>> {
        self.fragments.get_mut(&name)
    }

    /// Searches for an operation by name.
    ///
    /// NOTE: This is a linear search, we currently don't frequently search
    ///       for operations by name, so this might be overall faster than
    ///       using a map internally.
    pub fn operation(&self, name: StringKey) -> Option<&Arc<OperationDefinition>> {
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
        removed_definition_names: Option<&[StringKey]>,
    ) {
        let mut operations: FnvHashMap<StringKey, Arc<OperationDefinition>> = self
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
                self.fragments.remove(removed);
                operations.remove(removed);
            }
        }
        self.operations
            .extend(operations.into_iter().map(|(_, op)| op));
    }
}
