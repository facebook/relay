/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::ConstantArgument;
use graphql_ir::ConstantValue;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Value;
use graphql_syntax::OperationKind;
use intern::string_key::Intern;
use lazy_static::lazy_static;
use thiserror::Error;

use crate::create_metadata_directive;

lazy_static! {
    static ref LIVE_QUERY_DIRECTIVE_NAME: DirectiveName = DirectiveName("live_query".intern());
    static ref LIVE_METADATA_KEY: ArgumentName = ArgumentName("live".intern());
    static ref POLLING_INTERVAL_ARG: ArgumentName = ArgumentName("polling_interval".intern());
    static ref CONFIG_ID_ARG: ArgumentName = ArgumentName("config_id".intern());
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
                        next_directives.push(create_metadata_directive(
                            *LIVE_METADATA_KEY,
                            ConstantValue::Object(vec![ConstantArgument {
                                name: WithLocation::generated(*POLLING_INTERVAL_ARG),
                                value: WithLocation::generated(ConstantValue::Int(
                                    poll_interval_value,
                                )),
                            }]),
                        ));
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
                        next_directives.push(create_metadata_directive(
                            *LIVE_METADATA_KEY,
                            ConstantValue::Object(vec![ConstantArgument {
                                name: WithLocation::generated(*CONFIG_ID_ARG),
                                value: WithLocation::generated(ConstantValue::String(
                                    config_id_value,
                                )),
                            }]),
                        ));
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

#[derive(Error, Debug)]
enum ValidationMessage {
    #[error(
        "Live query expects 'polling_interval' or 'config_id' as an argument to @live_query to for root field {query_name}"
    )]
    LiveQueryTransformMissingConfig { query_name: OperationDefinitionName },

    #[error(
        "Expected the 'polling_interval' argument to @live_query to be a literal number for root field {query_name}"
    )]
    LiveQueryTransformInvalidPollingInterval { query_name: OperationDefinitionName },

    #[error(
        "Expected the 'config_id' argument to @live_query to be a literal string for root field {query_name}"
    )]
    LiveQueryTransformInvalidConfigId { query_name: OperationDefinitionName },
}
