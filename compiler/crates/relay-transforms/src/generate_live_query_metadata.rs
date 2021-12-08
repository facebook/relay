/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::INTERNAL_METADATA_DIRECTIVE;
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantArgument, ConstantValue, Directive, OperationDefinition, Program,
    Transformed, Transformer, ValidationMessage, Value,
};
use graphql_syntax::OperationKind;
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    static ref LIVE_QUERY_DIRECTIVE_NAME: StringKey = "live_query".intern();
    static ref LIVE_METADATA_KEY: StringKey = "live".intern();
    static ref POLLING_INTERVAL_ARG: StringKey = "polling_interval".intern();
    static ref CONFIG_ID_ARG: StringKey = "config_id".intern();
}

pub fn generate_live_query_metadata(program: &Program) -> DiagnosticsResult<Program> {
    let mut transformer = GenerateLiveQueryMetadata::default();
    let next_program = transformer
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transformer.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transformer.errors)
    }
}

#[derive(Default)]
struct GenerateLiveQueryMetadata {
    errors: Vec<Diagnostic>,
}

impl Transformer for GenerateLiveQueryMetadata {
    const NAME: &'static str = "GenerateLiveQueryMetadata";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        match operation.kind {
            OperationKind::Query => {
                let live_query_directive = operation.directives.named(*LIVE_QUERY_DIRECTIVE_NAME);

                if let Some(live_query_directive) = live_query_directive {
                    let polling_interval =
                        live_query_directive.arguments.named(*POLLING_INTERVAL_ARG);
                    let config_id = live_query_directive.arguments.named(*CONFIG_ID_ARG);

                    if polling_interval.is_none() && config_id.is_none() {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::LiveQueryTransformMissingConfig {
                                query_name: operation.name.item,
                            },
                            live_query_directive.name.location,
                        ));
                        return Transformed::Keep;
                    }

                    let mut next_directives = operation.directives.clone();

                    // I'm porting JS logic here. Not sure if the case where
                    // polling_interval and config_id both provided handled correctly
                    if let Some(polling_interval) = polling_interval {
                        let poll_interval_value = match polling_interval.value.item {
                            Value::Constant(ConstantValue::Int(value)) => value,
                            _ => {
                                self.errors.push(Diagnostic::error(
                                    ValidationMessage::LiveQueryTransformInvalidPollingInterval {
                                        query_name: operation.name.item,
                                    },
                                    polling_interval.value.location,
                                ));
                                return Transformed::Keep;
                            }
                        };
                        next_directives.push(Directive {
                            name: WithLocation::new(
                                operation.name.location,
                                *INTERNAL_METADATA_DIRECTIVE,
                            ),
                            arguments: vec![Argument {
                                name: WithLocation::new(
                                    operation.name.location,
                                    *LIVE_METADATA_KEY,
                                ),
                                value: WithLocation::new(
                                    operation.name.location,
                                    Value::Constant(ConstantValue::Object(vec![
                                        ConstantArgument {
                                            name: WithLocation::new(
                                                operation.name.location,
                                                *POLLING_INTERVAL_ARG,
                                            ),
                                            value: WithLocation::new(
                                                operation.name.location,
                                                ConstantValue::Int(poll_interval_value),
                                            ),
                                        },
                                    ])),
                                ),
                            }],
                            data: None,
                        });
                    } else if let Some(config_id) = config_id {
                        let config_id_value = match config_id.value.item.get_string_literal() {
                            Some(value) => value,
                            None => {
                                self.errors.push(Diagnostic::error(
                                    ValidationMessage::LiveQueryTransformInvalidConfigId {
                                        query_name: operation.name.item,
                                    },
                                    config_id.value.location,
                                ));
                                return Transformed::Keep;
                            }
                        };
                        next_directives.push(Directive {
                            name: WithLocation::new(
                                operation.name.location,
                                *INTERNAL_METADATA_DIRECTIVE,
                            ),
                            arguments: vec![Argument {
                                name: WithLocation::new(
                                    operation.name.location,
                                    *LIVE_METADATA_KEY,
                                ),
                                value: WithLocation::new(
                                    operation.name.location,
                                    Value::Constant(ConstantValue::Object(vec![
                                        ConstantArgument {
                                            name: WithLocation::new(
                                                operation.name.location,
                                                *CONFIG_ID_ARG,
                                            ),
                                            value: WithLocation::new(
                                                operation.name.location,
                                                ConstantValue::String(config_id_value),
                                            ),
                                        },
                                    ])),
                                ),
                            }],
                            data: None,
                        });
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
