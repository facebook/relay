/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod create_fragment_argument;
mod create_name_suggestion;
mod create_operation_variable;

use std::collections::HashMap;
use std::collections::HashSet;

use common::Location;
use common::Span;
use create_name_suggestion::create_default_name;
use create_name_suggestion::create_default_name_with_index;
use create_name_suggestion::create_impactful_name;
use create_name_suggestion::create_name_wrapper;
use create_name_suggestion::DefinitionNameSuffix;
use graphql_ir::ValidationDiagnosticCode;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::ExecutableDocument;
use intern::Lookup;
use itertools::Itertools;
use lsp_types::request::CodeActionRequest;
use lsp_types::request::Request;
use lsp_types::CodeAction;
use lsp_types::CodeActionOrCommand;
use lsp_types::Diagnostic;
use lsp_types::NumberOrString;
use lsp_types::Position;
use lsp_types::Range;
use lsp_types::TextDocumentPositionParams;
use lsp_types::TextEdit;
use lsp_types::Url;
use lsp_types::WorkspaceEdit;
use resolution_path::IdentParent;
use resolution_path::IdentPath;
use resolution_path::OperationDefinitionPath;
use resolution_path::ResolutionPath;
use resolution_path::ResolveDefinition;
use resolution_path::ResolvePosition;
use serde_json::Value;

use self::create_fragment_argument::create_fragment_argument_code_action;
use self::create_operation_variable::create_operation_variable_code_action;
use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;
use crate::utils::is_file_uri_in_dir;

pub(crate) fn on_code_action(
    state: &impl GlobalState,
    params: <CodeActionRequest as Request>::Params,
) -> LSPRuntimeResult<<CodeActionRequest as Request>::Result> {
    let uri = params.text_document.uri.clone();

    if !is_file_uri_in_dir(state.root_dir(), &uri) {
        return Err(LSPRuntimeError::ExpectedError);
    }

    let text_document_position_params = TextDocumentPositionParams {
        text_document: params.text_document,
        position: params.range.start,
    };
    let (document, location) =
        state.extract_executable_document_from_text(&text_document_position_params, 1)?;

    if let Some(diagnostic) = state.get_diagnostic_for_range(&uri, params.range) {
        let code_actions =
            get_code_actions_from_diagnostic(&uri, diagnostic, &document, &location, state);
        if code_actions.is_some() {
            return Ok(code_actions);
        }
    }

    let path = document.resolve((), location.span());
    let definitions = state.resolve_executable_definitions(&uri)?;
    let used_definition_names = get_definition_names(&definitions);

    get_code_actions(path, used_definition_names, uri, params.range)
        .map(|code_actions| Some(code_actions))
        .ok_or(LSPRuntimeError::ExpectedError)
}

fn get_code_actions_from_diagnostic(
    url: &Url,
    diagnostic: Diagnostic,
    document: &ExecutableDocument,
    location: &Location,
    state: &impl GlobalState,
) -> Option<Vec<CodeActionOrCommand>> {
    match diagnostic {
        Diagnostic {
            code:
                Some(NumberOrString::Number(
                    ValidationDiagnosticCode::EXPECTED_OPERATION_VARIABLE_TO_BE_DEFINED
                    | ValidationDiagnosticCode::UNDEFINED_VARIABLE_REFERENCED,
                )),
            data: Some(Value::Array(array_data)),
            ..
        } => {
            let definition = document.find_definition(location.span())?;

            match &array_data[..] {
                [Value::String(variable_name), Value::String(variable_type)] => match definition {
                    ExecutableDefinition::Operation(operation) => {
                        create_operation_variable_code_action(
                            operation,
                            variable_name,
                            variable_type,
                            location,
                            state,
                            url,
                        )
                        .and_then(|code_action| Some(vec![code_action]))
                    }
                    ExecutableDefinition::Fragment(fragment) => {
                        create_fragment_argument_code_action(
                            fragment,
                            variable_name,
                            variable_type,
                            location,
                            state,
                            url,
                        )
                        .and_then(|code_action| Some(vec![code_action]))
                    }
                },
                _ => None,
            }
        }
        Diagnostic {
            data: Some(Value::Array(array_data)),
            ..
        } => Some(
            array_data
                .iter()
                .filter_map(|item| match item {
                    Value::String(suggestion) => Some(create_code_action(
                        "Fix Error",
                        suggestion.to_string(),
                        url,
                        diagnostic.range,
                    )),
                    _ => None,
                })
                .collect_vec(),
        ),
        _ => None,
    }
}

struct FragmentAndOperationNames {
    operation_names: HashSet<String>,
    _fragment_names: HashSet<String>,
}

fn get_definition_names(definitions: &[ExecutableDefinition]) -> FragmentAndOperationNames {
    let mut operation_names = HashSet::new();
    let mut fragment_names = HashSet::new();
    for definition in definitions.iter() {
        match definition {
            ExecutableDefinition::Operation(operation) => {
                if let Some(name) = &operation.name {
                    operation_names.insert(name.value.lookup().to_string());
                }
            }
            ExecutableDefinition::Fragment(fragment) => {
                fragment_names.insert(fragment.name.value.lookup().to_string());
            }
        }
    }

    FragmentAndOperationNames {
        operation_names,
        _fragment_names: fragment_names,
    }
}

fn get_code_actions(
    path: ResolutionPath<'_>,
    used_definition_names: FragmentAndOperationNames,
    url: Url,
    range: Range,
) -> Option<Vec<CodeActionOrCommand>> {
    match path {
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::OperationDefinitionName(OperationDefinitionPath {
                    inner: operation_definition,
                    parent: _,
                }),
        }) => {
            let suffix = if let Some((_, operation_kind)) = operation_definition.operation {
                DefinitionNameSuffix::from(&operation_kind)
            } else {
                return None;
            };

            let operation_name = if let Some(operation_name) = &operation_definition.name {
                operation_name
            } else {
                return None;
            };

            let code_action_range = get_code_action_range(range, operation_name.span);
            Some(create_code_actions(
                "Rename Operation",
                operation_name.value.lookup(),
                used_definition_names.operation_names,
                suffix,
                &url,
                code_action_range,
            ))
        }
        _ => None,
    }
}

fn create_code_actions(
    title: &str,
    original_name: &str,
    used_names: HashSet<String>,
    suffix: DefinitionNameSuffix,
    url: &Url,
    range: Range,
) -> Vec<CodeActionOrCommand> {
    let mut suggested_names = Vec::with_capacity(4);
    suggested_names.push(create_default_name(url.path(), suffix));
    suggested_names.push(create_default_name_with_index(
        url.path(),
        suffix,
        &used_names,
    ));
    suggested_names.push(create_name_wrapper(original_name, url.path(), suffix));
    suggested_names.push(create_impactful_name(url.path(), suffix));
    suggested_names
        .iter()
        .filter_map(|suggested_name| {
            if let Some(name) = suggested_name {
                if used_names.contains(name) {
                    return None;
                }

                Some(create_code_action(title, name.clone(), url, range))
            } else {
                None
            }
        })
        .collect::<Vec<_>>()
}

fn get_code_action_range(range: Range, span: Span) -> Range {
    Range {
        start: Position {
            line: range.start.line,
            character: (span.start - 1),
        },
        end: Position {
            line: range.start.line,
            character: (span.end - 1),
        },
    }
}

fn create_code_action(
    title: &str,
    new_name: String,
    url: &Url,
    range: Range,
) -> CodeActionOrCommand {
    let mut changes = HashMap::new();
    let title = format!("{}: '{}'", title, &new_name);
    let text_edit = TextEdit {
        range,
        new_text: new_name,
    };
    changes.insert(url.clone(), vec![text_edit]);

    CodeActionOrCommand::CodeAction(CodeAction {
        title,
        kind: Some(lsp_types::CodeActionKind::QUICKFIX),
        diagnostics: None,
        edit: Some(WorkspaceEdit {
            changes: Some(changes),
            document_changes: None,
            ..Default::default()
        }),
        command: None,
        is_preferred: Some(false),
        ..Default::default()
    })
}
