/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::root_variables::InferVariablesVisitor;
use common::{Diagnostic, DiagnosticsResult};
use graphql_ir::{
    FragmentDefinition, OperationDefinition, Program, Transformed, Transformer, ValidationMessage,
};
use schema::Schema;

/// Transform that validates/updates operation variable definitions:
/// - Removes unused variable definitions. Variables can become dynamically unused due to
///   fragment-local variables, so it's convenient to automatically remove unused variables
///   rather than erroring.
/// - Reports errors if operation variables are defined with an incompatible type to how they
///   are used. For example, a `Boolean` type may not flow into a `Boolean!` argument.
///
/// NOTE: It would likely make sense to generalize this further, with options to control
/// what actions the transform should take for the following situations:
/// - Incompatible variable types: whether to fix (update type), error, or ignore
/// - Unused variables: whether to fix (remove), error, or ignore
/// - Missing variables: whether to fix (add variable), error, or ignore
pub fn validate_operation_variables(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = ValidateOperationVariables::new(program);
    let program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());
    if !transform.errors.is_empty() {
        Err(transform.errors)
    } else {
        Ok(program)
    }
}

pub struct ValidateOperationVariables<'s> {
    errors: Vec<Diagnostic>,
    program: &'s Program,
    visitor: InferVariablesVisitor<'s>,
}

impl<'s> ValidateOperationVariables<'s> {
    fn new(program: &'s Program) -> Self {
        Self {
            errors: Default::default(),
            program,
            visitor: InferVariablesVisitor::new(program),
        }
    }
}

/// Refines the argument definitions for operations to remove unused arguments
/// due to statically pruned conditional branches (e.g. because of overriding
/// a variable used in `@include()` to be false).
impl<'s> Transformer for ValidateOperationVariables<'s> {
    const NAME: &'static str = "ValidateOperationVariables";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        let (variables, errors) = self.visitor.infer_operation_variables(operation);
        self.errors.extend(errors);
        let schema = &self.program.schema;
        let mut has_unused_variable = false;
        for definition in &operation.variable_definitions {
            if definition.type_.is_non_null() && definition.has_non_null_default_value() {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::NonNullableVariableHasDefaultValue {
                        variable_name: definition.name.item,
                    },
                    definition
                        .default_value
                        .as_ref()
                        .map(|default_value| default_value.location)
                        .unwrap_or(definition.name.location),
                ));
                continue;
            }

            if let Some(variable_usage) = variables.get(&definition.name.item) {
                // The effective type of the variable when taking into account its default value:
                // if there is a non-null default then the value's type is non-null.
                let non_null_type = definition.type_.non_null();
                let effective_type = if definition.has_non_null_default_value() {
                    &non_null_type
                } else {
                    &definition.type_
                };
                if !schema.is_type_subtype_of(effective_type, &variable_usage.type_) {
                    self.errors.push(
                        Diagnostic::error(
                            ValidationMessage::InvalidVariableUsage {
                                defined_type: schema.get_type_string(&definition.type_),
                                used_type: schema.get_type_string(&variable_usage.type_),
                            },
                            definition.name.location,
                        )
                        .annotate(
                            format!(
                                "Variable is used as '{}'",
                                schema.get_type_string(&variable_usage.type_)
                            ),
                            variable_usage.name.location,
                        ),
                    );
                }
            } else {
                has_unused_variable = true;
            }
        }

        if has_unused_variable {
            let next_variables = operation
                .variable_definitions
                .iter()
                .filter(|var| variables.contains_key(&var.name.item))
                .cloned()
                .collect();
            Transformed::Replace(OperationDefinition {
                variable_definitions: next_variables,
                ..operation.clone()
            })
        } else {
            Transformed::Keep
        }
    }

    fn transform_fragment(&mut self, _: &FragmentDefinition) -> Transformed<FragmentDefinition> {
        Transformed::Keep
    }
}
