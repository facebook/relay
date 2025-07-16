/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod create_name_suggestion;

use std::collections::HashMap;
use std::collections::HashSet;

use common::Span;
use create_name_suggestion::DefinitionNameSuffix;
use create_name_suggestion::create_default_name;
use create_name_suggestion::create_default_name_with_index;
use create_name_suggestion::create_impactful_name;
use create_name_suggestion::create_name_wrapper;
use graphql_syntax::ExecutableDefinition;
use intern::Lookup;
use lsp_types::CodeAction;
use lsp_types::CodeActionOrCommand;
use lsp_types::Diagnostic;
use lsp_types::Position;
use lsp_types::Range;
use lsp_types::TextDocumentPositionParams;
use lsp_types::TextEdit;
use lsp_types::Url;
use lsp_types::WorkspaceEdit;
use lsp_types::request::CodeActionRequest;
use lsp_types::request::Request;
use resolution_path::FragmentDefinitionPath;
use resolution_path::IdentParent;
use resolution_path::IdentPath;
use resolution_path::OperationDefinitionPath;
use resolution_path::ResolutionPath;
use resolution_path::ResolvePosition;
use serde_json::Value;

use self::create_name_suggestion::create_default_fragment_name;
use self::create_name_suggestion::create_default_fragment_name_with_index;
use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;
use crate::utils::is_file_uri_in_dir;

pub fn on_code_action(
    state: &impl GlobalState,
    params: <CodeActionRequest as Request>::Params,
) -> LSPRuntimeResult<<CodeActionRequest as Request>::Result> {
    let uri = params.text_document.uri.clone();

    if !is_file_uri_in_dir(state.root_dir(), &uri) {
        return Err(LSPRuntimeError::ExpectedError);
    }

    if let Some(diagnostic) = state.get_diagnostic_for_range(&uri, params.range) {
        let code_actions = get_code_actions_from_diagnostic(&uri, diagnostic);
        if code_actions.is_some() {
            return Ok(code_actions);
        }
    }

    let definitions = state.resolve_executable_definitions(&params.text_document.uri)?;

    let text_document_position_params = TextDocumentPositionParams {
        text_document: params.text_document,
        position: params.range.start,
    };
    let (document, position_span) =
        state.extract_executable_document_from_text(&text_document_position_params, 1)?;

    let path = document.resolve((), position_span);

    let used_definition_names = get_definition_names(&definitions);
    let result = get_code_actions(path, used_definition_names, uri, params.range)
        .ok_or(LSPRuntimeError::ExpectedError)?;
    Ok(Some(result))
}

pub fn get_code_actions_from_diagnostic(
    url: &Url,
    diagnostic: Diagnostic,
) -> Option<Vec<CodeActionOrCommand>> {
    let code_actions = if let Some(Value::Array(data)) = &diagnostic.data {
        data.iter()
            .filter_map(|item| match item {
                Value::String(suggestion) => Some(create_code_action(
                    "Fix Error",
                    suggestion.to_string(),
                    url,
                    diagnostic.range,
                )),
                _ => None,
            })
            .collect::<_>()
    } else {
        vec![]
    };

    if !code_actions.is_empty() {
        Some(code_actions)
    } else {
        None
    }
}

struct FragmentAndOperationNames {
    operation_names: HashSet<String>,
    fragment_names: HashSet<String>,
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
        fragment_names,
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
            Some(create_rename_operation_code_actions(
                operation_name.value.lookup(),
                used_definition_names.operation_names,
                suffix,
                &url,
                code_action_range,
            ))
        }
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::FragmentDefinitionName(FragmentDefinitionPath {
                    inner: fragment_definition,
                    parent: _,
                }),
        }) => {
            let code_action_range = get_code_action_range(range, fragment_definition.name.span);
            Some(create_rename_fragment_code_actions(
                fragment_definition.name.value.lookup(),
                used_definition_names.fragment_names,
                &url,
                code_action_range,
            ))
        }
        _ => None,
    }
}

fn create_rename_fragment_code_actions(
    _original_name: &str,
    used_names: HashSet<String>,
    url: &Url,
    range: Range,
) -> Vec<CodeActionOrCommand> {
    let mut suggested_names = Vec::with_capacity(2);
    suggested_names.push(create_default_fragment_name(url.path()));
    suggested_names.push(create_default_fragment_name_with_index(
        url.path(),
        &used_names,
    ));

    suggested_names
        .iter()
        .filter_map(|suggested_name| {
            if let Some(name) = suggested_name {
                if used_names.contains(name) {
                    return None;
                }

                Some(create_code_action(
                    "Rename Fragment",
                    name.clone(),
                    url,
                    range,
                ))
            } else {
                None
            }
        })
        .collect::<Vec<_>>()
}

fn create_rename_operation_code_actions(
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

                Some(create_code_action(
                    "Rename Operation",
                    name.clone(),
                    url,
                    range,
                ))
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

#[cfg(test)]
mod tests {
    use lsp_types::CodeActionOrCommand;
    use lsp_types::Diagnostic;
    use lsp_types::Position;
    use lsp_types::Range;
    use lsp_types::Url;
    use serde_json::json;

    use crate::code_action::get_code_actions_from_diagnostic;

    #[test]
    fn test_get_code_actions_from_diagnostics() {
        let diagnostic = Diagnostic {
            range: Range {
                start: Position {
                    line: 0,
                    character: 0,
                },
                end: Position {
                    line: 0,
                    character: 0,
                },
            },
            message: "Error Message".to_string(),
            data: Some(json!(vec!["item1", "item2"])),
            ..Default::default()
        };
        let url = Url::parse("file://relay.js").unwrap();
        let code_actions = get_code_actions_from_diagnostic(&url, diagnostic);

        assert_eq!(
            code_actions
                .unwrap()
                .iter()
                .map(|item| {
                    match item {
                        CodeActionOrCommand::CodeAction(action) => action.title.clone(),
                        _ => panic!("unexpected case"),
                    }
                })
                .collect::<Vec<String>>(),
            vec![
                "Fix Error: 'item1'".to_string(),
                "Fix Error: 'item2'".to_string(),
            ]
        );
    }
}
