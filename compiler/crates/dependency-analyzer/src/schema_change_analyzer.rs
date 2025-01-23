/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use graphql_ir::*;
use rustc_hash::FxHashSet;
use schema::definitions::Type;
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

    fn add_type_changes_from_value(&mut self, value: &Value) {
        match value {
            Value::Variable(variable) => self.add_type_changes(variable.type_.inner()),
            Value::Object(object) => {
                object
                    .iter()
                    .for_each(|argument| self.add_type_changes_from_argument(argument));
            }
            Value::List(list) => {
                list.iter()
                    .for_each(|value| self.add_type_changes_from_value(value));
            }
            Value::Constant(_) => (),
        }
    }

    fn add_type_changes_from_argument(&mut self, argument: &Argument) {
        self.add_type_changes_from_value(&argument.value.item);
    }

    fn add_type_changes(&mut self, type_: Type) {
        match type_ {
            Type::Object(id) => {
                let object_type = self.schema.object(id);
                let key = object_type.name.item.0;
                if self
                    .schema_changes
                    .contains(&IncrementalBuildSchemaChange::Object(key))
                {
                    self.changed_definitions
                        .insert(self.get_name_from_executable());
                }
            }
            Type::Union(id) => {
                let union_name = self.schema.union(id).name.item.0;
                if self
                    .schema_changes
                    .contains(&IncrementalBuildSchemaChange::Union(union_name))
                {
                    self.changed_definitions
                        .insert(self.get_name_from_executable());
                }
            }
            Type::Interface(id) => {
                let interface_name = self.schema.interface(id).name.item.0;
                if self
                    .schema_changes
                    .contains(&IncrementalBuildSchemaChange::Interface(interface_name))
                {
                    self.changed_definitions
                        .insert(self.get_name_from_executable());
                }
            }
            Type::Enum(id) => {
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
            Type::InputObject(_) | Type::Scalar(_) => (),
        }
    }
}

impl Visitor for SchemaChangeDefinitionFinder<'_, '_> {
    const NAME: &'static str = "DependencyAnalyzerSchemaChangeDefinitionFinder";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_linked_field(&mut self, field: &LinkedField) {
        let id = field.definition.item;
        let type_ = self.schema.field(id).type_.inner();
        self.add_type_changes(type_);
        self.default_visit_linked_field(field);
    }

    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        self.add_type_changes(fragment.type_condition);
        self.default_visit_fragment(fragment);
    }

    fn visit_inline_fragment(&mut self, fragment: &InlineFragment) {
        if let Some(type_) = fragment.type_condition {
            self.add_type_changes(type_);
        }
        self.default_visit_inline_fragment(fragment);
    }

    fn visit_argument(&mut self, argument: &Argument) {
        self.add_type_changes_from_argument(argument);
        self.default_visit_argument(argument);
    }

    fn visit_scalar_field(&mut self, field: &ScalarField) {
        let id = field.definition.item;
        let type_ = self.schema.field(id).type_.inner();
        self.add_type_changes(type_);
        self.default_visit_scalar_field(field);
    }
}
