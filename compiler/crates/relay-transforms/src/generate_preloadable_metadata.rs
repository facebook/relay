/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::INTERNAL_METADATA_DIRECTIVE;
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, OperationDefinition, Program, Transformed, Transformer,
    ValidationMessage, Value,
};
use graphql_syntax::OperationKind;
use interner::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref PRELOADABLE_DIRECTIVE_NAME: StringKey = "preloadable".intern();
    pub static ref PRELOADABLE_METADATA_KEY: StringKey = "relayPreloadable".intern();
}

pub fn generate_preloadable_metadata(program: &Program) -> DiagnosticsResult<Program> {
    let mut transformer = GeneratePreloadableMetadata::new(program);
    let next_program = transformer
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transformer.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transformer.errors)
    }
}

struct GeneratePreloadableMetadata<'s> {
    pub program: &'s Program,
    pub errors: Vec<Diagnostic>,
}

impl<'s> GeneratePreloadableMetadata<'s> {
    fn new(program: &'s Program) -> Self {
        GeneratePreloadableMetadata {
            program,
            errors: vec![],
        }
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
                let preloadable_directives_len = operation
                    .directives
                    .iter()
                    .filter(|directive| directive.name.item == *PRELOADABLE_DIRECTIVE_NAME)
                    .count();

                if preloadable_directives_len == 1 {
                    let mut next_directives = Vec::with_capacity(operation.directives.len());
                    for directive in &operation.directives {
                        // replace @preloadable with @__metadata
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
                } else if preloadable_directives_len == 0 {
                    Transformed::Keep
                } else {
                    let mut locations = operation.directives.iter().filter_map(|directive| {
                        if directive.name.item == *PRELOADABLE_DIRECTIVE_NAME {
                            Some(directive.name.location)
                        } else {
                            None
                        }
                    });
                    let mut error = Diagnostic::error(
                        ValidationMessage::RedundantPreloadableDirective,
                        locations.next().unwrap(),
                    );
                    for related_location in locations {
                        error = error.annotate("related location", related_location);
                    }
                    self.errors.push(error);
                    Transformed::Keep
                }
            }
            _ => Transformed::Keep,
        }
    }
}

/// Check, if the operation is @preloadable
pub fn is_preloadable_operation(operation: &OperationDefinition) -> bool {
    let directive = operation.directives.named(*INTERNAL_METADATA_DIRECTIVE);
    if let Some(directive) = directive {
        directive
            .arguments
            .named(*PRELOADABLE_METADATA_KEY)
            .is_some()
    } else {
        false
    }
}
