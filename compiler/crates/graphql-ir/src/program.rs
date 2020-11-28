/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ir::{ExecutableDefinition, FragmentDefinition, OperationDefinition};
use indexmap::IndexMap;
use interner::StringKey;
use rayon::{iter::ParallelIterator, prelude::*};
use schema::Schema;
use std::sync::Arc;

/// A collection of all documents that are being compiled.
#[derive(Debug, Clone)]
pub struct Program {
    pub schema: Arc<Schema>,
    fragments: IndexMap<StringKey, Arc<FragmentDefinition>>,
    operations: Vec<Arc<OperationDefinition>>,
}

impl Program {
    pub fn new(schema: Arc<Schema>) -> Self {
        Self {
            schema,
            fragments: Default::default(),
            operations: Default::default(),
        }
    }

    pub fn from_definitions(schema: Arc<Schema>, definitions: Vec<ExecutableDefinition>) -> Self {
        let mut operations = Vec::new();
        let mut fragments = IndexMap::new();
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

    pub fn par_operations(&self) -> impl ParallelIterator<Item = &Arc<OperationDefinition>> {
        self.operations.par_iter()
    }

    pub fn fragments(&self) -> impl Iterator<Item = &Arc<FragmentDefinition>> {
        self.fragments.values()
    }

    pub fn par_fragments(&self) -> impl ParallelIterator<Item = &Arc<FragmentDefinition>> {
        self.fragments.par_values()
    }

    pub fn document_count(&self) -> usize {
        self.fragments.len() + self.operations.len()
    }
}
