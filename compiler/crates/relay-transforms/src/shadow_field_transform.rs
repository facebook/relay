/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Shadow Field Transform
//!
//! This module provides functionality for transforming operations with shadow fields.
//! Shadow fields are fields that conditionally switch between two different fields
//! based on a variable value.
//!
//! For schema extension functionality, see the `shadow_field_schema` module.
//!
//! # Usage Example
//!
//! The transform can be applied to a program to handle operations and fragments
//! that use shadow fields:
//!
//! ```rust,ignore
//! let transformed_program = shadow_field_transform(&program);
//! ```
//!
//! To extend the schema with shadow fields, use the `extend_schema_with_shadow_fields`
//! function from the `shadow_field_schema` module.

use core::panic;
use std::collections::HashSet;
use std::sync::Arc;

use common::ArgumentName;
use common::DirectiveName;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Condition;
use graphql_ir::ConditionValue;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Variable;
use graphql_ir::VariableDefinition;
use graphql_ir::VariableName;
use graphql_ir::associated_data_impl;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use schema;
use schema::Schema;
use schema::Type;
use schema::TypeReference;

lazy_static! {
    /// Directive name for shadow field metadata
    static ref SHADOW_FIELD_DIRECTIVE: DirectiveName = DirectiveName("__shadowField".intern());

    /// Argument names for shadow field directive
    static ref VARIABLE_NAME_ARG: ArgumentName = ArgumentName("variableName".intern());
    static ref TRUE_FIELD_ARG: ArgumentName = ArgumentName("trueField".intern());
    static ref FALSE_FIELD_ARG: ArgumentName = ArgumentName("falseField".intern());
}

/// Metadata attached to inline fragments that represent shadow fields.
/// This allows later compiler passes to identify shadow field inline fragments
/// and access the original field name.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ShadowFieldMetadata {
    pub original_field_name: StringKey,
}
associated_data_impl!(ShadowFieldMetadata);

/// Transform to handle shadow field operations.
/// This transform converts shadow fields into conditional inline fragments
/// that switch between two fields based on a variable value.
pub fn shadow_field_transform(program: &Program) -> Program {
    let mut transform = ShadowFieldTransform::new(program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    // Post-process: add variables to operations that need them
    add_variables_to_operations(next_program, &transform.variables_to_add)
}

fn add_variables_to_operations(
    program: Program,
    variables_to_add: &HashSet<VariableName>,
) -> Program {
    if variables_to_add.is_empty() {
        return program;
    }

    // Collect updated operations
    let mut updated_operations = Vec::new();

    for operation in program.operations() {
        let mut new_op = (**operation).clone();

        for var_name in variables_to_add {
            // Check if variable already exists
            let already_exists = new_op
                .variable_definitions
                .iter()
                .any(|var_def| var_def.name.item == *var_name);

            if !already_exists {
                let boolean_type =
                    TypeReference::NonNull(Box::new(TypeReference::Named(Type::Scalar(
                        program
                            .schema
                            .get_type("Boolean".intern())
                            .unwrap()
                            .get_scalar_id()
                            .unwrap(),
                    ))));

                new_op.variable_definitions.push(VariableDefinition {
                    name: WithLocation::generated(*var_name),
                    type_: boolean_type,
                    default_value: None,
                    directives: vec![],
                });
            }
        }

        updated_operations.push(new_op);
    }

    // Collect all fragments (unchanged)
    let fragments: Vec<_> = program.fragments().map(|f| (**f).clone()).collect();

    // Rebuild the program with updated operations and original fragments
    let mut definitions = Vec::new();
    for op in updated_operations {
        definitions.push(graphql_ir::ExecutableDefinition::Operation(op));
    }
    for frag in fragments {
        definitions.push(graphql_ir::ExecutableDefinition::Fragment(frag));
    }

    Program::from_definitions(program.schema.clone(), definitions)
}

/// Recursively retype all selections to match the given parent type.
/// This is needed when we clone selections from a shadow field to its true/false variants,
/// as the field definitions need to point to the correct type.
fn retype_selections(
    schema: &Arc<impl Schema>,
    parent_type_ref: TypeReference<Type>,
    selections: Vec<Selection>,
) -> Vec<Selection> {
    selections
        .into_iter()
        .map(|selection| match selection {
            Selection::ScalarField(field) => {
                // Look up the field on the new parent type
                let parent_type = parent_type_ref.inner();
                let field_id =
                    schema.named_field(parent_type, schema.field(field.definition.item).name.item);

                if let Some(field_id) = field_id {
                    Selection::ScalarField(Arc::new(ScalarField {
                        definition: WithLocation::new(field.definition.location, field_id),
                        ..(*field).clone()
                    }))
                } else {
                    // Field not found on new type, keep as is
                    Selection::ScalarField(field)
                }
            }
            Selection::LinkedField(field) => {
                // Look up the field on the new parent type
                let parent_type = parent_type_ref.inner();
                let field_id =
                    schema.named_field(parent_type, schema.field(field.definition.item).name.item);

                if let Some(field_id) = field_id {
                    // Get the type of this field so we can recursively retype its selections
                    let new_field_type = schema.field(field_id).type_.clone();
                    let retyped_selections =
                        retype_selections(schema, new_field_type, field.selections.clone());

                    Selection::LinkedField(Arc::new(LinkedField {
                        definition: WithLocation::new(field.definition.location, field_id),
                        selections: retyped_selections,
                        ..(*field).clone()
                    }))
                } else {
                    // Field not found on new type, keep as is
                    Selection::LinkedField(field)
                }
            }
            Selection::InlineFragment(fragment) => {
                // Recursively retype selections within the inline fragment
                let retyped_selections =
                    retype_selections(schema, parent_type_ref.clone(), fragment.selections.clone());
                Selection::InlineFragment(Arc::new(InlineFragment {
                    selections: retyped_selections,
                    ..(*fragment).clone()
                }))
            }
            Selection::FragmentSpread(_) => {
                // Fragment spreads don't need retyping
                selection
            }
            Selection::Condition(condition) => {
                // Recursively retype selections within the condition
                let retyped_selections = retype_selections(
                    schema,
                    parent_type_ref.clone(),
                    condition.selections.clone(),
                );
                Selection::Condition(Arc::new(Condition {
                    selections: retyped_selections,
                    ..(*condition).clone()
                }))
            }
        })
        .collect()
}

struct ShadowFieldTransform<'program> {
    program: &'program Program,
    /// Variables that need to be added
    variables_to_add: HashSet<VariableName>,
}

impl<'program> ShadowFieldTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            variables_to_add: HashSet::new(),
        }
    }
}

impl<'program> Transformer<'program> for ShadowFieldTransform<'program> {
    const NAME: &'static str = "ShadowFieldTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        // Check if this field has the @__shadowField directive on its schema definition
        let schema_field = self.program.schema.field(field.definition.item);
        let shadow_field_directive = schema_field.directives.named(*SHADOW_FIELD_DIRECTIVE);

        if let Some(directive) = shadow_field_directive {
            // Extract directive arguments
            let variable_name_arg = directive
                .arguments
                .iter()
                .find(|arg| arg.name == *VARIABLE_NAME_ARG)
                .and_then(|arg| arg.get_string_literal());

            let true_field_arg = directive
                .arguments
                .iter()
                .find(|arg| arg.name == *TRUE_FIELD_ARG)
                .and_then(|arg| arg.get_string_literal());

            let false_field_arg = directive
                .arguments
                .iter()
                .find(|arg| arg.name == *FALSE_FIELD_ARG)
                .and_then(|arg| arg.get_string_literal());

            let Some(variable_name) = variable_name_arg else {
                panic!("Missing variable name in shadow field directive");
            };
            let Some(true_field_name) = true_field_arg else {
                panic!("Missing true field name in shadow field directive");
            };
            let Some(false_field_name) = false_field_arg else {
                panic!("Missing false field name in shadow field directive");
            };

            // Get the schema to look up field definitions
            let schema = &self.program.schema;
            let parent_type = schema.field(field.definition.item).parent_type;
            let Some(parent_type) = parent_type else {
                panic!("Field has no parent type");
            };

            // Find the true and false field definitions
            let true_field_id = schema.named_field(parent_type, true_field_name);
            let false_field_id = schema.named_field(parent_type, false_field_name);

            let Some(true_field_id) = true_field_id else {
                panic!(
                    "True field '{}' not found on type '{:?}'",
                    true_field_name, parent_type
                );
            };
            let Some(false_field_id) = false_field_id else {
                panic!(
                    "False field '{}' not found on type '{:?}'",
                    false_field_name, parent_type
                );
            };

            // Create the variable reference for the condition
            let variable = Variable {
                name: WithLocation::generated(VariableName(variable_name)),
                type_: TypeReference::Named(Type::Scalar(
                    schema
                        .get_type("Boolean".intern())
                        .unwrap()
                        .get_scalar_id()
                        .unwrap(),
                )),
            };

            // Track this variable so we can add it to operations
            self.variables_to_add.insert(VariableName(variable_name));

            // Create the true field (shown when variable is true)
            let true_field_selection = Selection::ScalarField(Arc::new(ScalarField {
                alias: field.alias,
                definition: WithLocation::generated(true_field_id),
                arguments: field.arguments.clone(),
                directives: vec![], // Remove shadow field directive
            }));

            // Create the false field (shown when variable is false)
            let false_field_selection = Selection::ScalarField(Arc::new(ScalarField {
                alias: field.alias,
                definition: WithLocation::generated(false_field_id),
                arguments: field.arguments.clone(),
                directives: vec![], // Remove shadow field directive
            }));

            // Wrap in conditions
            // True field with @include(if: $variable)
            let true_condition = Selection::Condition(Arc::new(Condition {
                selections: vec![true_field_selection],
                value: ConditionValue::Variable(variable.clone()),
                passing_value: true, // @include
                location: field.definition.location,
            }));

            // False field with @skip(if: $variable)
            let false_condition = Selection::Condition(Arc::new(Condition {
                selections: vec![false_field_selection],
                value: ConditionValue::Variable(variable),
                passing_value: false, // @skip
                location: field.definition.location,
            }));

            // Get the original field name (or alias if present)
            let original_field_name = if let Some(alias) = field.alias {
                alias.item
            } else {
                schema.field(field.definition.item).name.item
            };

            // Create a directive with associated data to mark this as a shadow field
            let metadata_directive = ShadowFieldMetadata {
                original_field_name,
            }
            .into();

            // Wrap both conditions in an inline fragment with metadata
            let inline_fragment = InlineFragment {
                type_condition: Some(parent_type),
                directives: vec![metadata_directive],
                selections: vec![true_condition, false_condition],
                spread_location: field.definition.location,
            };

            return Transformed::Replace(Selection::InlineFragment(Arc::new(inline_fragment)));
        } // End of if let Some(directive)

        // If no directive, keep the field as is
        Transformed::Keep
    }

    fn transform_linked_field(&mut self, field: &'program LinkedField) -> Transformed<Selection> {
        // Check if this field has the @__shadowField directive on its schema definition
        let schema_field = self.program.schema.field(field.definition.item);
        let shadow_field_directive = schema_field.directives.named(*SHADOW_FIELD_DIRECTIVE);

        if let Some(directive) = shadow_field_directive {
            // Extract directive arguments
            let variable_name_arg = directive
                .arguments
                .iter()
                .find(|arg| arg.name == *VARIABLE_NAME_ARG)
                .and_then(|arg| arg.get_string_literal());

            let true_field_arg = directive
                .arguments
                .iter()
                .find(|arg| arg.name == *TRUE_FIELD_ARG)
                .and_then(|arg| arg.get_string_literal());

            let false_field_arg = directive
                .arguments
                .iter()
                .find(|arg| arg.name == *FALSE_FIELD_ARG)
                .and_then(|arg| arg.get_string_literal());

            let Some(variable_name) = variable_name_arg else {
                panic!("Missing variable name in shadow field directive");
            };
            let Some(true_field_name) = true_field_arg else {
                panic!("Missing true field name in shadow field directive");
            };
            let Some(false_field_name) = false_field_arg else {
                panic!("Missing false field name in shadow field directive");
            };

            // Get the schema to look up field definitions
            let schema = &self.program.schema;
            let parent_type = schema.field(field.definition.item).parent_type;
            let Some(parent_type) = parent_type else {
                return Transformed::Keep;
            };

            // Find the true and false field definitions
            let true_field_id = schema.named_field(parent_type, true_field_name);
            let false_field_id = schema.named_field(parent_type, false_field_name);

            let Some(true_field_id) = true_field_id else {
                panic!(
                    "True field '{}' not found on type '{:?}'",
                    true_field_name, parent_type
                )
            };
            let Some(false_field_id) = false_field_id else {
                panic!(
                    "False field '{}' not found on type '{:?}'",
                    false_field_name, parent_type
                )
            };

            // Create the variable reference for the condition
            let variable = Variable {
                name: WithLocation::generated(VariableName(variable_name)),
                type_: TypeReference::Named(Type::Scalar(
                    schema
                        .get_type("Boolean".intern())
                        .unwrap()
                        .get_scalar_id()
                        .unwrap(),
                )),
            };

            // Track this variable so we can add it to operations
            self.variables_to_add.insert(VariableName(variable_name));

            // Get the type of the true and false fields so we can retype the selections
            let true_field_type = schema.field(true_field_id).type_.clone();
            let false_field_type = schema.field(false_field_id).type_.clone();

            // Retype selections to match the true/false field types
            let true_selections =
                retype_selections(&schema, true_field_type, field.selections.clone());
            let false_selections =
                retype_selections(&schema, false_field_type, field.selections.clone());

            // Create the true field (shown when variable is true) with retyped selections
            let true_field_selection = Selection::LinkedField(Arc::new(LinkedField {
                alias: field.alias,
                definition: WithLocation::generated(true_field_id),
                arguments: field.arguments.clone(),
                directives: vec![], // Remove shadow field directive
                selections: true_selections,
            }));

            // Create the false field (shown when variable is false) with retyped selections
            let false_field_selection = Selection::LinkedField(Arc::new(LinkedField {
                alias: field.alias,
                definition: WithLocation::generated(false_field_id),
                arguments: field.arguments.clone(),
                directives: vec![], // Remove shadow field directive
                selections: false_selections,
            }));

            // Wrap in conditions
            // True field with @include(if: $variable)
            let true_condition = Selection::Condition(Arc::new(Condition {
                selections: vec![true_field_selection],
                value: ConditionValue::Variable(variable.clone()),
                passing_value: true, // @include
                location: field.definition.location,
            }));

            // False field with @skip(if: $variable)
            let false_condition = Selection::Condition(Arc::new(Condition {
                selections: vec![false_field_selection],
                value: ConditionValue::Variable(variable),
                passing_value: false, // @skip
                location: field.definition.location,
            }));

            // Get the original field name (or alias if present)
            let original_field_name = if let Some(alias) = field.alias {
                alias.item
            } else {
                schema.field(field.definition.item).name.item
            };

            // Create a directive with associated data to mark this as a shadow field
            let metadata_directive = ShadowFieldMetadata {
                original_field_name,
            }
            .into();

            // Wrap both conditions in an inline fragment with metadata
            let inline_fragment = InlineFragment {
                type_condition: None,
                directives: vec![metadata_directive],
                selections: vec![true_condition, false_condition],
                spread_location: field.definition.location,
            };

            return Transformed::Replace(Selection::InlineFragment(Arc::new(inline_fragment)));
        } // End of if let Some(directive)

        // If no shadow field directive, transform children normally
        let selections = self.transform_selections(&field.selections);
        let arguments = self.transform_arguments(&field.arguments);
        let directives = self.transform_directives(&field.directives);

        if selections.should_keep() && arguments.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }

        Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
            arguments: arguments.replace_or_else(|| field.arguments.clone()),
            directives: directives.replace_or_else(|| field.directives.clone()),
            selections: selections.replace_or_else(|| field.selections.clone()),
            ..field.clone()
        })))
    }
}

#[cfg(test)]
mod tests {
    use fixture_tests::Fixture;
    use graphql_test_helpers::apply_transform_for_test;

    use super::*;

    pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
        apply_transform_for_test(fixture, |program| Ok(shadow_field_transform(program)))
    }

    #[test]
    fn test_shadow_field_transform() {
        let input = r#"
fragment TestFragment on User {
  id
  name
}
"#;
        let fixture = Fixture {
            file_name: "test.graphql",
            content: input,
        };

        // Since the stub doesn't change anything, result should be the same
        let result = transform_fixture(&fixture);
        assert!(result.is_ok());
    }
}
