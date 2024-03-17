/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use graphql_ir::*;
use rustc_hash::FxHashSet;
use schema::SDLSchema;
use schema::Schema;
use schema_diff::check::IncrementalBuildSchemaChange;

use crate::ExecutableDefinitionNameSet;

pub fn get_affected_definitions(
    schema: &SDLSchema,
    definitions: &[ExecutableDefinition],
    schema_changes: FxHashSet<IncrementalBuildSchemaChange>,
) -> ExecutableDefinitionNameSet {
    SchemaChangeDefinitionFinder::get_definitions(schema, definitions, schema_changes)
}

struct SchemaChangeDefinitionFinder<'a, 'b> {
    changed_definitions: ExecutableDefinitionNameSet,
    current_executable: &'a ExecutableDefinition,
    schema: &'b SDLSchema,
    schema_changes: FxHashSet<IncrementalBuildSchemaChange>,
}

impl SchemaChangeDefinitionFinder<'_, '_> {
    fn get_definitions(
        schema: &SDLSchema,
        definitions: &[ExecutableDefinition],
        schema_changes: FxHashSet<IncrementalBuildSchemaChange>,
    ) -> ExecutableDefinitionNameSet {
        if definitions.is_empty() || schema_changes.is_empty() {
            return HashSet::default();
        }

        let mut finder = SchemaChangeDefinitionFinder {
            changed_definitions: HashSet::default(),
            current_executable: &definitions[0],
            schema,
            schema_changes,
        };
        for def in definitions.iter() {
            finder.current_executable = def;
            match def {
                ExecutableDefinition::Operation(operation) => finder.visit_operation(operation),
                ExecutableDefinition::Fragment(fragment) => finder.visit_fragment(fragment),
            };
        }
        finder.changed_definitions
    }

    fn get_name_from_executable(&self) -> ExecutableDefinitionName {
        match self.current_executable {
            ExecutableDefinition::Operation(node) => {
                ExecutableDefinitionName::OperationDefinitionName(node.name.item)
            }
            ExecutableDefinition::Fragment(node) => {
                ExecutableDefinitionName::FragmentDefinitionName(node.name.item)
            }
        }
    }
}

impl Visitor for SchemaChangeDefinitionFinder<'_, '_> {
    const NAME: &'static str = "DependencyAnalyzerSchemaChangeDefinitionFinder";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_scalar_field(&mut self, field: &ScalarField) {
        let id = field.definition.item;
        let type_ = self.schema.field(id).type_.inner();
        match type_ {
            schema::definitions::Type::Enum(id) => {
                let enum_type = self.schema.enum_(id);
                let key = enum_type.name.item.0;
                if self
                    .schema_changes
                    .contains(&IncrementalBuildSchemaChange::Enum(key))
                {
                    self.changed_definitions
                        .insert(self.get_name_from_executable());
                }
            }
            // We only care about enum fields at the moment. As more changes can be handled,
            // they should be added here
            _ => (),
        }
    }
}
