use std::collections::HashMap;

use common::Location;
use common::Span;
use docblock_shared::ARGUMENT_DEFINITIONS;
use lsp_types::CodeAction;
use lsp_types::CodeActionOrCommand;
use lsp_types::TextEdit;
use lsp_types::Url;
use lsp_types::WorkspaceEdit;

use crate::GlobalState;

pub fn create_fragment_argument_code_action(
    fragment: &graphql_syntax::FragmentDefinition,
    variable_name: &str,
    variable_type: &str,
    location: &Location,
    state: &impl GlobalState,
    url: &Url,
) -> Option<CodeActionOrCommand> {
    create_fragment_argument_text_edit(fragment, variable_name, variable_type, location, state).map(
        |text_edit| {
            let mut changes = HashMap::new();
            changes.insert(url.to_owned(), vec![text_edit]);

            CodeActionOrCommand::CodeAction(CodeAction {
                title: format!("Create fragment argument '${}'", variable_name),
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
        },
    )
}

fn create_fragment_argument_text_edit(
    fragment: &graphql_syntax::FragmentDefinition,
    variable_name: &str,
    variable_type: &str,
    location: &Location,
    state: &impl GlobalState,
) -> Option<TextEdit> {
    if let Some(argument_definitions_directive) = fragment
        .directives
        .iter()
        .find(|directive| directive.name.value == ARGUMENT_DEFINITIONS.0)
    {
        argument_definitions_directive
            .arguments
            .as_ref()
            .and_then(|arguments| arguments.items.last())
            .and_then(|argument| {
                state
                    .get_lsp_location(location.with_span(Span {
                        start: argument.span.end,
                        end: argument.span.end,
                    }))
                    .ok()
            })
            .map(|lsp_location| TextEdit {
                range: lsp_location.range,
                new_text: format!(
                    ", {name}: {{ type: \"{type}\" }}",
                    name = variable_name,
                    type = variable_type
                ),
            })
    } else {
        state
            .get_lsp_location(location.with_span(Span {
                start: fragment.type_condition.span.end,
                end: fragment.type_condition.span.end,
            }))
            .ok()
            .map(|lsp_location| TextEdit {
                range: lsp_location.range,
                new_text: format!(
                    " @{directive_name}({name}: {{ type: \"{type}\" }})",
                    directive_name = ARGUMENT_DEFINITIONS.0,
                    name = variable_name,
                    type = variable_type
                ),
            })
    }
}
