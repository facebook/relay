/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Transformed;
use graphql_ir::Transformer;

use crate::UPDATABLE_DIRECTIVE;

pub fn skip_updatable_queries(program: &Program) -> Program {
    let mut transform = SkipUpdatableQueries::new(program);
    let transformed = transform.transform_program(program);

    transformed.replace_or_else(|| program.clone())
}

#[allow(dead_code)]
struct SkipUpdatableQueries<'s> {
    program: &'s Program,
}

impl<'s> SkipUpdatableQueries<'s> {
    fn new(program: &'s Program) -> Self {
        Self { program }
    }
}

impl Transformer<'_> for SkipUpdatableQueries<'_> {
    const NAME: &'static str = "SkipUpdatableQueriesTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = true;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        if operation
            .directives
            .iter()
            .any(|directive| directive.name.item == *UPDATABLE_DIRECTIVE)
        {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }
}
