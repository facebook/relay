/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::sync::Arc;

use common::DirectiveName;
use common::PerfLogger;
use common::SourceLocationKey;
use graphql_ir::BuilderOptions;
use graphql_ir::ExecutableDefinition;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentVariablesSemantic;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::build_ir_with_extra_features;
use graphql_syntax::parse_executable_with_error_recovery_and_parser_features;
use graphql_text_printer::print_full_operation;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lsp_types::Url;
use lsp_types::request::Request;
use relay_compiler::ProjectName;
use relay_compiler::config::ProjectConfig;
use relay_compiler::get_parser_features;
use relay_transforms::CustomTransformsConfig;
use relay_transforms::Programs;
use relay_transforms::apply_transforms;
use schema::SDLSchema;
use schema_documentation::SchemaDocumentation;
use serde::Deserialize;
use serde::Serialize;

use crate::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;
use crate::server::LSPState;

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
            Url::parse(&format!("file://{path}")).ok()
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
pub fn get_operation_only_program(
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

    let mut visited_fragments: HashSet<FragmentDefinitionName> = HashSet::default();

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
    program: Arc<Program>,
    perf_logger: Arc<TPerfLogger>,
    custom_transforms_config: Option<&CustomTransformsConfig>,
    transferrable_refetchable_query_directives: Vec<DirectiveName>,
) -> Result<Programs, String> {
    apply_transforms(
        project_config,
        program,
        Default::default(),
        perf_logger,
        None,
        custom_transforms_config,
        transferrable_refetchable_query_directives,
    )
    .map_err(|errors| format!("{errors:?}"))
}

fn print_full_operation_text(programs: Programs, operation_name: StringKey) -> Option<String> {
    let print_operation_node = programs
        .operation_text
        .operation(OperationDefinitionName(operation_name))?;

    Some(print_full_operation(
        &programs.operation_text,
        print_operation_node,
        Default::default(),
    ))
}

/// From the list of AST nodes we're trying to extract the operation and possible
/// list of fragment, to construct the initial `Program` that we could later transform
/// and print
fn build_operation_ir_with_fragments(
    definitions: &[graphql_syntax::ExecutableDefinition],
    schema: Arc<SDLSchema>,
) -> Result<(Arc<OperationDefinition>, Vec<Arc<FragmentDefinition>>), String> {
    let ir = build_ir_with_extra_features(
        &schema,
        definitions,
        &BuilderOptions {
            allow_undefined_fragment_spreads: true,
            allow_non_overlapping_abstract_spreads: false,
            fragment_variables_semantic: FragmentVariablesSemantic::PassedValue,
            relay_mode: Some(graphql_ir::RelayMode),
            default_anonymous_operation_name: Some("anonymous".intern()),
            allow_custom_scalar_literals: true, // for compatibility
        },
    )
    .map_err(|errors| format!("{errors:?}"))?;

    match ir.iter().find_map(|item| {
        if let ExecutableDefinition::Operation(operation) = item {
            Some(Arc::new(operation.clone()))
        } else {
            None
        }
    }) {
        Some(operation) => {
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
        }
        _ => Err("Unable to find an operation.".to_string()),
    }
}

pub(crate) fn get_query_text<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation,
>(
    state: &LSPState<TPerfLogger, TSchemaDocumentation>,
    original_text: String,
    project_name: ProjectName,
) -> LSPRuntimeResult<String> {
    let schema = state.get_schema(&project_name.into())?;

    let project_config = state
        .config
        .enabled_projects()
        .find(|project_config| project_config.name == project_name)
        .ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!(
                "Unable to get project config for project {project_name}."
            ))
        })?;

    let result = parse_executable_with_error_recovery_and_parser_features(
        &original_text,
        SourceLocationKey::Generated,
        get_parser_features(project_config),
    );

    if !&result.diagnostics.is_empty() {
        let err_string = "".to_string();
        return Err(LSPRuntimeError::UnexpectedError(
            result
                .diagnostics
                .iter()
                .fold(err_string, |acc, err| format!("{acc} - {err}\n")),
        ));
    }

    let (operation, fragments) =
        build_operation_ir_with_fragments(&result.item.definitions, schema)
            .map_err(LSPRuntimeError::UnexpectedError)?;

    let operation_name = operation.name.item.0;
    let program = state.get_program(&project_name.into())?;

    let query_text = match get_operation_only_program(operation, fragments, &program) {
        Some(program) => {
            let programs = transform_program(
                project_config,
                Arc::new(program),
                Arc::clone(&state.perf_logger),
                state.config.custom_transforms.as_ref(),
                state
                    .config
                    .transferrable_refetchable_query_directives
                    .clone(),
            )
            .map_err(LSPRuntimeError::UnexpectedError)?;

            print_full_operation_text(programs, operation_name).unwrap_or(original_text)
        }
        _ => original_text,
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
