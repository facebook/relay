use std::collections::HashMap;

use common::Location;
use common::Span;
use lsp_types::CodeAction;
use lsp_types::CodeActionOrCommand;
use lsp_types::TextEdit;
use lsp_types::Url;
use lsp_types::WorkspaceEdit;

use crate::GlobalState;

pub fn create_operation_variable_code_action(
    operation: &graphql_syntax::OperationDefinition,
    variable_name: &str,
    variable_type: &str,
    location: &Location,
    state: &impl GlobalState,
    url: &Url,
) -> Option<CodeActionOrCommand> {
    create_operation_variable_text_edit(operation, variable_name, variable_type, location, state)
        .map(|text_edit| {
            let mut changes = HashMap::new();
            changes.insert(url.to_owned(), vec![text_edit]);

            CodeActionOrCommand::CodeAction(CodeAction {
                title: format!("Create operation variable '${}'", variable_name),
                kind: Some(lsp_types::CodeActionKind::QUICKFIX),
                diagnostics: None,
                edit: Some(WorkspaceEdit {
                    changes: Some(changes),
                    document_changes: None,
                    ..Default::default()
                }),
                command: None,
                is_preferred: Some(true),
                ..Default::default()
            })
        })
}

fn create_operation_variable_text_edit(
    operation: &graphql_syntax::OperationDefinition,
    variable_name: &str,
    variable_type: &str,
    location: &Location,
    state: &impl GlobalState,
) -> Option<TextEdit> {
    if operation.variable_definitions.is_none() {
        operation
            .name
            .and_then(|operation_name| {
                state
                    .get_lsp_location(location.with_span(Span {
                        start: operation_name.span.end,
                        end: operation_name.span.end,
                    }))
                    .ok()
            })
            .map(|lsp_location| TextEdit {
                range: lsp_location.range,
                new_text: format!(
                    "(${name}: {type})",
                    name = variable_name,
                    type = variable_type
                ),
            })
    } else {
        operation
            .variable_definitions
            .as_ref()
            .and_then(|variable_definitions| variable_definitions.items.last())
            .and_then(|last_variable| {
                state
                    .get_lsp_location(location.with_span(Span {
                        start: last_variable.span.end,
                        end: last_variable.span.end,
                    }))
                    .ok()
            })
            .map(|lsp_location| TextEdit {
                range: lsp_location.range,
                new_text: format!(
                    ", ${name}: {type}",
                    name = variable_name,
                    type = variable_type
                ),
            })
    }
}
