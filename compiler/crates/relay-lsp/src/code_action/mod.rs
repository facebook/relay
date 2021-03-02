/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod create_name_suggestion;

use common::{PerfLogger, Span};
use create_name_suggestion::{
    create_default_name, create_default_name_with_index, create_impactful_name,
    create_name_wrapper, DefinitionNameSuffix,
};
use graphql_syntax::ExecutableDefinition;
use lsp_types::{
    request::CodeActionRequest, request::Request, CodeAction, CodeActionOrCommand, Position, Range,
    TextDocumentPositionParams, TextEdit, Url, WorkspaceEdit,
};
use std::collections::{HashMap, HashSet};

use crate::{
    lsp_runtime_error::LSPRuntimeResult,
    resolution_path::{
        IdentParent, IdentPath, OperationDefinitionPath, ResolutionPath, ResolvePosition,
    },
    server::LSPState,
};

pub(crate) fn on_code_action<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: <CodeActionRequest as Request>::Params,
) -> LSPRuntimeResult<<CodeActionRequest as Request>::Result> {
    let uri = params.text_document.uri.clone();
    let range = params.range;

    let text_document_position_params = TextDocumentPositionParams {
        text_document: params.text_document,
        position: params.range.start,
    };
    let definitions = state.resolve_executable_definitions(&text_document_position_params)?;

    let (document, position_span, _project_name) =
        state.extract_executable_document_from_text(text_document_position_params, 1)?;

    let path = document.resolve((), position_span);

    let used_definition_names = get_definition_names(&definitions);
    Ok(get_code_actions(path, used_definition_names, uri, range))
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

            let code_action_range = get_code_action_range(range, &operation_name.span);
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

                Some(create_name_suggestion_action(
                    title,
                    name.clone(),
                    &url,
                    range,
                ))
            } else {
                None
            }
        })
        .collect::<Vec<_>>()
}

fn get_code_action_range(range: Range, span: &Span) -> Range {
    Range {
        start: Position {
            line: range.start.line,
            character: (span.start - 1).into(),
        },
        end: Position {
            line: range.start.line,
            character: (span.end - 1).into(),
        },
    }
}

fn create_name_suggestion_action(
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
        kind: Some("quickfix".to_string()),
        diagnostics: None,
        edit: Some(WorkspaceEdit {
            changes: Some(changes),
            document_changes: None,
        }),
        command: None,
        is_preferred: Some(false),
    })
}
