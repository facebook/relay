/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::root_variables::InferVariablesVisitor;
use graphql_ir::{FragmentDefinition, OperationDefinition, Program, Transformed, Transformer};

pub fn skip_unused_variables(program: &Program) -> Program {
    let mut transform = SkipUnusedVariables::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

pub struct SkipUnusedVariables<'s> {
    visitor: InferVariablesVisitor<'s>,
}

impl<'s> SkipUnusedVariables<'s> {
    fn new(program: &'s Program) -> Self {
        Self {
            visitor: InferVariablesVisitor::new(program),
        }
    }
}

/// Refines the argument definitions for operations to remove unused arguments
/// due to statically pruned conditional branches (e.g. because of overriding
/// a variable used in `@include()` to be false).
impl<'s> Transformer for SkipUnusedVariables<'s> {
    const NAME: &'static str = "SkipUnusedVariablesTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        let variables = self.visitor.infer_operation_variables(operation);
        let has_unused_variable = operation
            .variable_definitions
            .iter()
            .any(|var| !variables.contains_key(&var.name.item));
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
