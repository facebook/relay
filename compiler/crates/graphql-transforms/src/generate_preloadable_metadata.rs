/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::INTERNAL_METADATA_DIRECTIVE;
use common::{NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, OperationDefinition, Program, Transformed, Transformer,
    Value,
};
use graphql_syntax::OperationKind;
use interner::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref PRELOADABLE_DIRECTIVE_NAME: StringKey = "preloadable".intern();
    pub static ref PRELOADABLE_METADATA_KEY: StringKey = "relayPreloadable".intern();
}

pub fn generate_preloadable_metadata(program: &Program) -> Program {
    let mut transformer = GeneratePreloadableMetadata::new(program);
    transformer
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct GeneratePreloadableMetadata<'s> {
    pub program: &'s Program,
}

impl<'s> GeneratePreloadableMetadata<'s> {
    fn new(program: &'s Program) -> Self {
        GeneratePreloadableMetadata { program }
    }
}

impl<'s> Transformer for GeneratePreloadableMetadata<'s> {
    const NAME: &'static str = "GeneratePreloadableMetadata";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        match operation.kind {
            OperationKind::Query => {
                if operation
                    .directives
                    .named(*PRELOADABLE_DIRECTIVE_NAME)
                    .is_some()
                {
                    let mut next_directives = Vec::with_capacity(operation.directives.len());
                    for directive in &operation.directives {
                        // replace @preloadable with @metadata
                        if directive.name.item == *PRELOADABLE_DIRECTIVE_NAME {
                            next_directives.push(Directive {
                                name: WithLocation::new(
                                    operation.name.location,
                                    *INTERNAL_METADATA_DIRECTIVE,
                                ),
                                arguments: vec![Argument {
                                    name: WithLocation::new(
                                        operation.name.location,
                                        *PRELOADABLE_METADATA_KEY,
                                    ),
                                    value: WithLocation::new(
                                        operation.name.location,
                                        Value::Constant(ConstantValue::Boolean(true)),
                                    ),
                                }],
                            });
                        } else {
                            next_directives.push(directive.clone());
                        }
                    }

                    Transformed::Replace(OperationDefinition {
                        directives: next_directives,
                        ..operation.clone()
                    })
                } else {
                    Transformed::Keep
                }
            }
            _ => Transformed::Keep,
        }
    }
}
