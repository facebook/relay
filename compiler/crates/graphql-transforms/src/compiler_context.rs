/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::{ExecutableDefinition, FragmentDefinition, OperationDefinition};
use interner::StringKey;
use schema::Schema;
use std::collections::HashMap;

/// A collection of all documents that are being compiled.
#[derive(Debug)]
pub struct CompilerContext<'s> {
    schema: &'s Schema,
    fragments: HashMap<StringKey, FragmentDefinition>,
    operations: Vec<OperationDefinition>,
}

impl<'s> CompilerContext<'s> {
    pub fn new(schema: &'s Schema) -> Self {
        Self {
            schema,
            fragments: Default::default(),
            operations: Default::default(),
        }
    }

    pub fn schema(&self) -> &Schema {
        &self.schema
    }

    pub fn from_definitions(schema: &'s Schema, definitions: Vec<ExecutableDefinition>) -> Self {
        let mut operations = vec![];
        let mut fragments: HashMap<StringKey, FragmentDefinition> = HashMap::new();
        for definition in definitions {
            match definition {
                ExecutableDefinition::Operation(operation) => {
                    operations.push(operation);
                }
                ExecutableDefinition::Fragment(fragment) => {
                    fragments.insert(fragment.name.item, fragment);
                }
            }
        }
        Self {
            schema,
            fragments,
            operations,
        }
    }

    pub fn insert_fragment(&mut self, fragment: FragmentDefinition) {
        let name = fragment.name.item;
        if let Some(previous) = self.fragments.insert(name, fragment) {
            panic!(
                "Can only insert '{}' once. Had {:?} and trying to insert {:?}.",
                name, previous, self.fragments[&name]
            );
        };
    }

    pub fn fragment(&self, name: StringKey) -> Option<&FragmentDefinition> {
        self.fragments.get(&name)
    }

    pub fn insert_operation(&mut self, operation: OperationDefinition) {
        self.operations.push(operation);
    }

    pub fn operations(&self) -> impl Iterator<Item = &OperationDefinition> {
        self.operations.iter()
    }

    pub fn fragments(&self) -> impl Iterator<Item = &FragmentDefinition> {
        self.fragments.values()
    }

    pub fn document_count(&self) -> usize {
        self.fragments.len() + self.operations.len()
    }
}
