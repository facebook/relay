/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use common::ArgumentName;
use common::DirectiveName;
use common::SourceLocationKey;
use graphql_ir::*;
use intern::Lookup;
use intern::string_key::Intern;
use lazy_static::lazy_static;
use relay_transforms::REFETCHABLE_NAME;
use rustc_hash::FxHashSet;
use schema::InputObjectID;
use schema::SDLSchema;
use schema::Schema;
use schema::definitions::Type;
use schema_diff::check::IncrementalBuildSchemaChange;

use crate::ExecutableDefinitionNameSet;

lazy_static! {
    static ref DIRECTIVES_ARG: ArgumentName = ArgumentName("directives".intern());
}

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
    /// Track InputObjects visited by a given definition to avoid infinite
    /// recursion when checking nested types
    visited_input_objects: FxHashSet<InputObjectID>,
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
            visited_input_objects: FxHashSet::default(),
        };
        for def in definitions.iter() {
            finder.current_executable = def;

            // Ensure we reset the visited input objects for each definition since
            // we want to ensure we traverse into each seen input type at least once
            // per definition.
            finder.visited_input_objects.clear();
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
            Type::InputObject(id) => {
                // When an input type is referenced by a definition, not only do
                // we include the generated type for that input type, but we
                // also include the generated type for any input types that are
                // referenced by that input type. So, we want to treat a
                // document as "changed" if any input types/enums that are
                // _reachable_ from the definition have changed.

                // To avoid the risk of infinite recursion, we track visited
                // input types and avoid recursing into a type more than once
                // per definition. This is safe sice the initiatial traversal of
                // the input type will ensure the definition gets added to
                // `changed_definitions` if needed.
                if self.visited_input_objects.insert(id) {
                    let input_object = self.schema.input_object(id);
                    for field in input_object.fields.iter() {
                        self.add_type_changes(field.type_.inner());
                    }
                }
            }
            Type::Scalar(_) => (),
        }
    }

    /// Parse and visit the `directives` argument of @refetchable to track
    /// enum usage in string-encoded directives like "@fetchPolicy(policy: STORE_AND_NETWORK)"
    fn visit_refetchable_directives_arg(&mut self, refetchable_directive: &Directive) {
        let Some(directives_arg) = refetchable_directive
            .arguments
            .iter()
            .find(|arg| arg.name.item == *DIRECTIVES_ARG)
        else {
            return;
        };

        let Value::Constant(ConstantValue::List(items)) = &directives_arg.value.item else {
            return;
        };

        for item in items {
            let ConstantValue::String(directive_string) = item else {
                continue;
            };

            // Parse the directive string to get its name
            let Ok(ast_directive) = graphql_syntax::parse_directive(
                directive_string.lookup(),
                SourceLocationKey::generated(),
                0,
            ) else {
                continue;
            };

            // Look up the directive definition in the schema and check its argument types.
            // We check the schema definition rather than trying to build the IR directive,
            // because building will fail if an enum value was removed from the schema.
            let directive_name = DirectiveName(ast_directive.name.value);
            let Some(directive_def) = self.schema.get_directive(directive_name) else {
                continue;
            };

            // Check if any of the directive's arguments use enum types that have changed
            for arg in directive_def.arguments.iter() {
                self.add_type_changes(arg.type_.inner());
            }
        }
    }
}

impl Visitor for SchemaChangeDefinitionFinder<'_, '_> {
    const NAME: &'static str = "DependencyAnalyzerSchemaChangeDefinitionFinder";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = true;

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

    // Handle @refetchable directive specially to track enum usage in its
    // directives argument, which contains string-encoded directives like
    // "@fetchPolicy(policy: STORE_AND_NETWORK)"
    fn visit_directive(&mut self, directive: &Directive) {
        self.default_visit_directive(directive);

        if directive.name.item == *REFETCHABLE_NAME {
            self.visit_refetchable_directives_arg(directive);
        }
    }
}
