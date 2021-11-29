/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::INTERNAL_METADATA_DIRECTIVE;
use common::{Diagnostic, DiagnosticsResult, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, OperationDefinition, Program, Selection, Transformed,
    Transformer, ValidationMessage, Value,
};
use graphql_syntax::OperationKind;
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::Schema;

lazy_static! {
    static ref SUBSCRITION_NAME_METADATA_KEY: StringKey = "subscriptionName".intern();
}

pub fn generate_subscription_name_metadata(program: &Program) -> DiagnosticsResult<Program> {
    let mut transformer = GenerateSubscriptionNameMetadata::new(program);
    let next_program = transformer
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transformer.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transformer.errors)
    }
}

struct GenerateSubscriptionNameMetadata<'s> {
    pub program: &'s Program,
    pub errors: Vec<Diagnostic>,
}

impl<'s> GenerateSubscriptionNameMetadata<'s> {
    fn new(program: &'s Program) -> Self {
        GenerateSubscriptionNameMetadata {
            program,
            errors: vec![],
        }
    }
}

impl<'s> Transformer for GenerateSubscriptionNameMetadata<'s> {
    const NAME: &'static str = "GenerateSubscriptionNameMetadata";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        match operation.kind {
            OperationKind::Subscription => {
                // We already validate that the subscription contains exactly one selection
                // during IR construction, so we can just grab it here.
                match &operation.selections[0] {
                    Selection::LinkedField(linked_field) => {
                        let mut directives = operation.directives.clone();
                        let subscription_name = self
                            .program
                            .schema
                            .field(linked_field.definition.item)
                            .name
                            .item;
                        directives.push(Directive {
                            name: WithLocation::new(
                                operation.name.location,
                                *INTERNAL_METADATA_DIRECTIVE,
                            ),
                            arguments: vec![Argument {
                                name: WithLocation::new(
                                    operation.name.location,
                                    *SUBSCRITION_NAME_METADATA_KEY,
                                ),
                                value: WithLocation::new(
                                    operation.name.location,
                                    Value::Constant(ConstantValue::String(subscription_name)),
                                ),
                            }],
                            data: None,
                        });

                        Transformed::Replace(OperationDefinition {
                            directives,
                            ..operation.clone()
                        })
                    }
                    _ => {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::GenerateSubscriptionNameSimpleSelection {
                                subscription_name: operation.name.item,
                            },
                            operation.name.location,
                        ));

                        Transformed::Keep
                    }
                }
            }
            _ => Transformed::Keep,
        }
    }
}
