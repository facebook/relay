/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::str::FromStr;

use ::intern::string_key::StringKey;
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
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Value;
use graphql_syntax::OperationKind;
use intern::string_key::Intern;
use itertools::Itertools;
use lazy_static::lazy_static;
use thiserror::Error;

use crate::create_metadata_directive;

lazy_static! {
    static ref LIVE_QUERY_DIRECTIVE_NAME: DirectiveName = DirectiveName("live_query".intern());
    static ref LIVE_DIRECTIVE_NAME: DirectiveName = DirectiveName("live".intern());
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

impl Transformer<'_> for GenerateLiveQueryMetadata {
    const NAME: &'static str = "GenerateLiveQueryMetadata";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        match operation.kind {
            OperationKind::Query => {
                let mut next_directives = operation.directives.clone();
                let live_query_directive = operation.directives.named(*LIVE_QUERY_DIRECTIVE_NAME);
                if let Some(live_query_directive) = live_query_directive {
                    let polling_interval =
                        live_query_directive.arguments.named(*POLLING_INTERVAL_ARG);
                    let config_id = live_query_directive.arguments.named(*CONFIG_ID_ARG);

                    if polling_interval.is_none() && config_id.is_none() {
                        self.errors.push(Diagnostic::error(
                            LiveQueryTransformValidationMessage::MissingConfig {
                                query_name: operation.name.item,
                            },
                            live_query_directive.location,
                        ));
                        return Transformed::Keep;
                    }

                    if polling_interval.is_some() && config_id.is_some() {
                        self.errors.push(Diagnostic::error(
                            LiveQueryTransformValidationMessage::InvalidConfig {
                                query_name: operation.name.item,
                            },
                            live_query_directive.location,
                        ));
                        return Transformed::Keep;
                    }

                    if let Some(polling_interval) = polling_interval {
                        let poll_interval_value = match polling_interval.value.item {
                            Value::Constant(ConstantValue::Int(value)) => value,
                            _ => {
                                self.errors.push(Diagnostic::error(
                                    LiveQueryTransformValidationMessage::InvalidPollingInterval {
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
                                    LiveQueryTransformValidationMessage::InvalidConfigId {
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
                } else {
                    // Look for `@live` query root fields
                    let live_directives = operation
                        .selections
                        .iter()
                        .filter(|sel| !matches!(sel, Selection::Condition(_)))
                        .filter_map(|sel| sel.directives().named(*LIVE_DIRECTIVE_NAME))
                        .collect::<Vec<_>>();

                    if live_directives.is_empty() {
                        return Transformed::Keep;
                    }
                    // We allow multiple `@live` selections in a query but don't allow multiple `config_id`s. Because
                    // it confuses `method` header formation. `config_id` on `@live` is only used for `@live_query`
                    // use case migration, which translates into exactly 1 `@live` selection.
                    let config_id = live_directives
                        .iter()
                        .filter_map(|dir| dir.arguments.named(*CONFIG_ID_ARG))
                        .at_most_one()
                        .unwrap()
                        .and_then(|arg| arg.value.item.get_string_literal())
                        .unwrap_or_else(|| StringKey::from_str("").unwrap());

                    next_directives.push(create_metadata_directive(
                        *LIVE_METADATA_KEY,
                        ConstantValue::Object(vec![ConstantArgument {
                            name: WithLocation::generated(*CONFIG_ID_ARG),
                            value: WithLocation::generated(ConstantValue::String(config_id)),
                        }]),
                    ));
                }
                Transformed::Replace(OperationDefinition {
                    directives: next_directives,
                    ..operation.clone()
                })
            }
            _ => Transformed::Keep,
        }
    }
}

#[derive(Error, Debug, serde::Serialize)]
#[serde(tag = "type")]
enum LiveQueryTransformValidationMessage {
    #[error(
        "Live query expects 'polling_interval' or 'config_id' as an argument to @live_query to for root field {query_name}"
    )]
    MissingConfig { query_name: OperationDefinitionName },

    #[error(
        "'polling_interval' and 'config_id' cannot both be present in @live_query for root field {query_name}"
    )]
    InvalidConfig { query_name: OperationDefinitionName },

    #[error(
        "Expected the 'polling_interval' argument to @live_query to be a literal number for root field {query_name}"
    )]
    InvalidPollingInterval { query_name: OperationDefinitionName },

    #[error(
        "Expected the 'config_id' argument to @live_query to be a literal string for root field {query_name}"
    )]
    InvalidConfigId { query_name: OperationDefinitionName },
}
