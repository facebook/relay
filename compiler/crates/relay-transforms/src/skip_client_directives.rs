/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::{Directive, Program, Transformed, Transformer};
use schema::Schema;

pub fn skip_client_directives(program: &Program) -> Program {
    let mut transform = SkipClientDirectives::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

pub struct SkipClientDirectives<'s> {
    program: &'s Program,
}

impl<'s> SkipClientDirectives<'s> {
    fn new(program: &'s Program) -> Self {
        Self { program }
    }
}

impl<'s> Transformer for SkipClientDirectives<'s> {
    const NAME: &'static str = "SkipClientDirectives";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = true;

    fn transform_directive(&mut self, directive: &Directive) -> Transformed<Directive> {
        if self
            .program
            .schema
            .is_extension_directive(directive.name.item)
        {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }
}
