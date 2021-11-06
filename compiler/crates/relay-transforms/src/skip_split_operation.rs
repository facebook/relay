/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::DIRECTIVE_SPLIT_OPERATION;
use common::NamedItem;
use graphql_ir::{FragmentDefinition, OperationDefinition, Program, Transformed, Transformer};

/// A transform that removes field `splitOperations`. Intended for use when e.g.
/// printing queries to send to a GraphQL server.
pub fn skip_split_operation(program: &Program) -> Program {
    let mut transform = SkipSplitOperation {};
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

pub struct SkipSplitOperation;

impl Transformer for SkipSplitOperation {
    const NAME: &'static str = "SkipSplitOperationTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        if operation
            .directives
            .named(*DIRECTIVE_SPLIT_OPERATION)
            .is_some()
        {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }

    fn transform_fragment(&mut self, _: &FragmentDefinition) -> Transformed<FragmentDefinition> {
        Transformed::Keep
    }
}
