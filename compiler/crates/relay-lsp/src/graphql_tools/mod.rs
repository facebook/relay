/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::{PerfLogger, SourceLocationKey};
use graphql_ir::{
    build_ir_with_extra_features, BuilderOptions, FragmentVariablesSemantic, OperationDefinition,
    Program, Selection,
};
use graphql_syntax::{parse_executable_with_error_recovery, ExecutableDefinition};
use graphql_text_printer::print_full_operation;
use interner::{Intern, StringKey};
use lsp_types::request::Request;
use relay_compiler::{
    apply_transforms,
    config::{Config, ProjectConfig},
};
use serde_json::Value;

use crate::{
    lsp_extra_data_provider::Query,
    lsp_runtime_error::LSPRuntimeResult,
    server::{LSPState, SourcePrograms},
    Schemas,
};
use serde::{Deserialize, Serialize};

pub(crate) enum GraphQlExecuteQuery {}

#[derive(Serialize, Deserialize)]
pub(crate) struct GraphQlExecuteQueryParams {
    text: String,
    variables: serde_json::Value,
}

#[derive(Serialize, Deserialize)]
pub(crate) enum GraphQlResponse {
    #[serde(rename = "data")]
    Data(serde_json::Value),
    #[serde(rename = "error")]
    Error(serde_json::Value),
}

impl Request for GraphQlExecuteQuery {
    type Params = GraphQlExecuteQueryParams;
    type Result = GraphQlResponse;
    const METHOD: &'static str = "graphql/executeQuery";
}

/// This function will return the program that contains only operation
/// and all referenced fragments.
/// We can use it to print the full query text
fn get_operation_only_program(
    operation: Arc<OperationDefinition>,
    project_name: StringKey,
    programs: &SourcePrograms,
) -> Option<Program> {
    let program = programs.get(&project_name)?;

    let mut selections_to_visit: Vec<_> = vec![&operation.selections];
    let mut next_program = Program::new(program.schema.clone());
    next_program.insert_operation(Arc::clone(&operation));

    while !selections_to_visit.is_empty() {
        let current_selections = selections_to_visit.pop()?;
        for selection in current_selections {
            match selection {
                Selection::FragmentSpread(spread) => {
                    let fragment = program
                        .fragment(spread.fragment.item)
                        .expect("Expect fragment to exist");
                    selections_to_visit.push(&fragment.selections);
                    next_program.insert_fragment(Arc::clone(fragment));
                }
                Selection::Condition(condition) => {
                    selections_to_visit.push(&condition.selections);
                }
                Selection::LinkedField(linked_field) => {
                    selections_to_visit.push(&linked_field.selections);
                }
                Selection::InlineFragment(inline_fragment) => {
                    selections_to_visit.push(&inline_fragment.selections);
                }
                Selection::ScalarField(_) => {}
            }
        }
    }

    Some(next_program)
}

/// Given the `Program` that contain operation+all its fragments this
/// function will `apply_transforms` and return a query text,
/// that can be sent to the server
fn get_full_operation_text<TPerfLogger: PerfLogger + 'static>(
    project_name: StringKey,
    project_config: &ProjectConfig,
    config: Arc<Config>,
    operation_name: StringKey,
    source_program: Arc<Program>,
    perf_logger: Arc<TPerfLogger>,
) -> String {
    let programs = apply_transforms(
        project_name,
        source_program,
        Default::default(),
        &config.connection_interface,
        Arc::new(
            project_config
                .feature_flags
                .as_ref()
                .cloned()
                .unwrap_or_else(|| config.feature_flags.clone()),
        ),
        perf_logger,
    )
    .unwrap();

    let print_operation_node = programs
        .operation_text
        .operation(operation_name)
        .expect("a query text operation should be generated for this operation");

    print_full_operation(&programs.operation_text, print_operation_node)
}

/// Given only one operation AST it will construct the typed IR
/// But it will ignore missing fragment spreads
fn build_operation_ir(
    project_config: &ProjectConfig,
    schemas: &Schemas,
    operation: graphql_syntax::OperationDefinition,
    operation_name: StringKey,
) -> Result<OperationDefinition, String> {
    let schema = schemas.get(&project_config.name).unwrap().clone();
    let definitions = vec![graphql_syntax::ExecutableDefinition::Operation(operation)];
    let ir = build_ir_with_extra_features(
        &schema,
        &definitions,
        BuilderOptions {
            allow_undefined_fragment_spreads: true,
            fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
            relay_mode: true,
        },
    )
    .map_err(|errors| format!("{:?}", errors))?;

    for item in ir {
        if let graphql_ir::ExecutableDefinition::Operation(op) = item {
            if op.name.item == operation_name {
                return Ok(op);
            }
        }
    }

    Err("Operation could not be constructed".to_string())
}

pub(crate) fn on_graphql_execute_query<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: GraphQlExecuteQueryParams,
) -> LSPRuntimeResult<<GraphQlExecuteQuery as Request>::Result> {
    let result = parse_executable_with_error_recovery(&params.text, SourceLocationKey::Generated);
    // TODO: Figure out the project form request params
    let project_name = "facebook".intern();

    if !&result.errors.is_empty() {
        return Ok(GraphQlResponse::Error(Value::Array(
            result
                .errors
                .iter()
                .map(|err| Value::String(format!("{:?}", err)))
                .collect::<Vec<_>>(),
        )));
    }

    let query_text: String = match &result.item.definitions[0] {
        ExecutableDefinition::Fragment(_) => {
            return Ok(GraphQlResponse::Error(Value::String(
                "Cannot fetch data for fragments".to_string(),
            )));
        }
        ExecutableDefinition::Operation(operation) => match &operation.name {
            Some(operation_name) => {
                let project_config = state.get_project_config_ref(project_name).unwrap();

                let operation_ir = build_operation_ir(
                    project_config,
                    &state.get_schemas(),
                    operation.clone(),
                    operation_name.value,
                )
                .unwrap();

                let operation_name = operation_ir.name.item;

                // Internally, we have a rule that only operations with names can be used
                if let Some(operation_sources) = get_operation_only_program(
                    Arc::new(operation_ir),
                    project_name,
                    state.get_source_programs_ref(),
                ) {
                    let operation_text = get_full_operation_text(
                        project_name,
                        state.get_project_config_ref(project_name).unwrap(),
                        state.get_config(),
                        operation_name,
                        Arc::new(operation_sources),
                        state.get_logger(),
                    );

                    operation_text
                } else {
                    // If, for some reason we could not get the operation text from the sources
                    // we will send the original text to the server
                    params.text
                }
            }
            None => params.text,
        },
    };

    match state
        .extra_data_provider
        .execute_query(Query::Text(query_text), params.variables)
    {
        Ok(data) => Ok(GraphQlResponse::Data(data)),
        Err(error) => Ok(GraphQlResponse::Error(error)),
    }
}
