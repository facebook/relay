/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::{collections::HashSet, sync::Arc};

use common::{FeatureFlag, PerfLogger, SourceLocationKey};
use graphql_ir::{
    build_ir_with_extra_features, BuilderOptions, ExecutableDefinition, FragmentDefinition,
    FragmentVariablesSemantic, OperationDefinition, Program, Selection,
};
use graphql_syntax::parse_executable_with_error_recovery;
use graphql_text_printer::print_full_operation;
use intern::string_key::{Intern, StringKey};
use lsp_types::{request::Request, Url};
use relay_compiler::config::{Config, ProjectConfig};
use relay_transforms::{apply_transforms, Programs};
use schema::SDLSchema;
use schema_documentation::SchemaDocumentation;

use crate::{
    lsp_runtime_error::LSPRuntimeResult,
    server::{GlobalState, LSPState},
    LSPRuntimeError,
};
use serde::{Deserialize, Serialize};

pub(crate) enum GraphQLExecuteQuery {}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct GraphQLExecuteQueryParams {
    text: String,
    document_path: Option<String>,
    schema_name: Option<String>,
}

impl GraphQLExecuteQueryParams {
    fn get_url(&self) -> Option<Url> {
        if let Some(path) = &self.document_path {
            Url::parse(&format!("file://{}", path)).ok()
        } else {
            None
        }
    }

    fn get_schema_name(&self) -> StringKey {
        if let Some(schema_name) = &self.schema_name {
            schema_name.clone().intern()
        } else {
            "facebook".intern()
        }
    }
}

impl Request for GraphQLExecuteQuery {
    type Params = GraphQLExecuteQueryParams;
    type Result = String;
    const METHOD: &'static str = "graphql/executeQuery";
}

/// This function will return the program that contains only operation
/// and all referenced fragments.
/// We can use it to print the full query text
fn get_operation_only_program(
    operation: Arc<OperationDefinition>,
    fragments: Vec<Arc<FragmentDefinition>>,
    program: &Program,
) -> Option<Program> {
    let mut selections_to_visit: Vec<_> = vec![&operation.selections];
    let mut next_program = Program::new(program.schema.clone());
    next_program.insert_operation(Arc::clone(&operation));
    for fragment in fragments.iter() {
        selections_to_visit.push(&fragment.selections);
        next_program.insert_fragment(Arc::clone(fragment));
    }

    let mut visited_fragments: HashSet<StringKey> = HashSet::default();

    while !selections_to_visit.is_empty() {
        let current_selections = selections_to_visit.pop()?;
        for selection in current_selections {
            match selection {
                Selection::FragmentSpread(spread) => {
                    // Skip, if we already visited this fragment
                    if visited_fragments.contains(&spread.fragment.item) {
                        continue;
                    }
                    visited_fragments.insert(spread.fragment.item);
                    // Second, if this fragment is already in the `next_program`,
                    // it selection already added to the visiting stack
                    if next_program.fragment(spread.fragment.item).is_some() {
                        continue;
                    }

                    // Finally, add all missing fragment spreads from the full program
                    let fragment = program.fragment(spread.fragment.item)?;

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
/// function will `apply_transforms` and create a full set of programs, including the one
/// that may generate full operation text
fn transform_program<TPerfLogger: PerfLogger + 'static>(
    project_config: &ProjectConfig,
    config: Arc<Config>,
    program: Arc<Program>,
    perf_logger: Arc<TPerfLogger>,
) -> Result<Programs, String> {
    apply_transforms(
        project_config.name,
        program,
        Default::default(),
        &config.connection_interface,
        Arc::clone(&project_config.feature_flags),
        &None,
        perf_logger,
        None,
    )
    .map_err(|errors| format!("{:?}", errors))
}

fn print_full_operation_text(programs: Programs, operation_name: StringKey) -> String {
    let print_operation_node = programs
        .operation_text
        .operation(operation_name)
        .expect("a query text operation should be generated for this operation");

    print_full_operation(&programs.operation_text, print_operation_node)
}

/// From the list of AST nodes we're trying to extract the operation and possible
/// list of fragment, to construct the initial `Program` that we could later transform
/// and print
fn build_operation_ir_with_fragments(
    definitions: &[graphql_syntax::ExecutableDefinition],
    schema: Arc<SDLSchema>,
    enable_provided_variables: &FeatureFlag,
) -> Result<(Arc<OperationDefinition>, Vec<Arc<FragmentDefinition>>), String> {
    let ir = build_ir_with_extra_features(
        &schema,
        definitions,
        &BuilderOptions {
            allow_undefined_fragment_spreads: true,
            fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
            relay_mode: Some(graphql_ir::RelayMode {
                enable_provided_variables,
            }),
            default_anonymous_operation_name: Some("anonymous".intern()),
        },
    )
    .map_err(|errors| format!("{:?}", errors))?;

    if let Some(operation) = ir.iter().find_map(|item| {
        if let ExecutableDefinition::Operation(operation) = item {
            Some(Arc::new(operation.clone()))
        } else {
            None
        }
    }) {
        let fragments = ir
            .iter()
            .filter_map(|item| {
                if let ExecutableDefinition::Fragment(fragment) = item {
                    Some(Arc::new(fragment.clone()))
                } else {
                    None
                }
            })
            .collect::<Vec<_>>();

        Ok((operation, fragments))
    } else {
        Err("Unable to find an operation.".to_string())
    }
}

pub(crate) fn get_query_text<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation,
>(
    state: &LSPState<TPerfLogger, TSchemaDocumentation>,
    original_text: String,
    project_name: &StringKey,
) -> LSPRuntimeResult<String> {
    let schema = state.get_schema(project_name)?;

    let project_config = state
        .config
        .enabled_projects()
        .find(|project_config| &project_config.name == project_name)
        .ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!(
                "Unable to get project config for project {}.",
                project_name
            ))
        })?;

    let result = parse_executable_with_error_recovery(&original_text, SourceLocationKey::Generated);

    if !&result.errors.is_empty() {
        return Err(LSPRuntimeError::UnexpectedError(
            result
                .errors
                .iter()
                .map(|err| format!("- {}\n", err))
                .collect::<String>(),
        ));
    }

    let (operation, fragments) = build_operation_ir_with_fragments(
        &result.item.definitions,
        schema,
        &project_config.feature_flags.enable_provided_variables,
    )
    .map_err(LSPRuntimeError::UnexpectedError)?;

    let operation_name = operation.name.item;
    let program = state.get_program(project_name)?;

    let query_text =
        if let Some(program) = get_operation_only_program(operation, fragments, &program) {
            let programs = transform_program(
                project_config,
                Arc::clone(&state.config),
                Arc::new(program),
                Arc::clone(&state.perf_logger),
            )
            .map_err(LSPRuntimeError::UnexpectedError)?;

            print_full_operation_text(programs, operation_name)
        } else {
            original_text
        };

    Ok(query_text)
}

pub(crate) fn on_graphql_execute_query(
    state: &impl GlobalState,
    params: GraphQLExecuteQueryParams,
) -> LSPRuntimeResult<<GraphQLExecuteQuery as Request>::Result> {
    let project_name = if let Some(url) = &params.get_url() {
        state
            .extract_project_name_from_url(url)
            .unwrap_or_else(|_| params.get_schema_name())
    } else {
        params.get_schema_name()
    };

    state.get_full_query_text(params.text, &project_name)
}
