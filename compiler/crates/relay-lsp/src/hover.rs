/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the hover feature
use crate::lsp::{
    Hover, HoverContents, LanguageString, MarkedString, MarkupContent, MarkupKind, Message,
    ServerRequestId, ServerResponse,
};
use crate::utils::{NodeKind, NodeResolutionInfo};
use crossbeam::Sender;
use graphql_ir::Program;
use graphql_text_printer::print_fragment;
use interner::StringKey;
use schema::Schema;
use schema_print::print_directive;
use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
};

fn hover_content_wrapper(content: String) -> HoverContents {
    HoverContents::Scalar(MarkedString::LanguageString(LanguageString {
        language: "graphql".to_string(),
        value: content,
    }))
}

/// This will provide a more accurate information about some of the specific Relay directives
/// that cannot be expressed via SDL
fn argument_definition_hover_info(directive_name: &str) -> Option<HoverContents> {
    let content = match directive_name {
        "argumentDefinitions" => Some(
            r#"
`@argumentDefinitions` is a directive used to specify arguments taken by a fragment.

@see: https://relay.dev/docs/en/graphql-in-relay.html#argumentdefinitions
"#,
        ),
        "arguments" => Some(
            r#"
`@arguments` is a directive used to pass arguments to a fragment that was defined using `@argumentDefinitions`.

@see: https://relay.dev/docs/en/graphql-in-relay.html#arguments
"#,
        ),
        "uncheckedArguments_DEPRECATED" => Some(
            r#"
DEPRECATED version of `@arguments` directive.
`@arguments` is a directive used to pass arguments to a fragment that was defined using `@argumentDefinitions`.

@see: https://relay.dev/docs/en/graphql-in-relay.html#arguments
"#,
        ),
        _ => None,
    };

    content.map(|value| {
        HoverContents::Markup(MarkupContent {
            kind: MarkupKind::Markdown,
            value: value.to_string(),
        })
    })
}

pub fn get_hover_response_contents(
    node_resolution_info: NodeResolutionInfo,
    schema: &Schema,
    source_programs: &Arc<RwLock<HashMap<StringKey, Program>>>,
) -> Option<HoverContents> {
    let kind = node_resolution_info.kind;

    match kind {
        NodeKind::Variable(type_name) => Some(hover_content_wrapper(type_name)),
        NodeKind::Directive(directive_name, argument_name) => {
            if let Some(argument_definition_hover_info) =
                argument_definition_hover_info(directive_name.lookup())
            {
                return Some(argument_definition_hover_info);
            }

            let schema_directive = schema.get_directive(directive_name)?;

            if let Some(argument_name) = argument_name {
                let argument = schema_directive.arguments.named(argument_name)?;
                let content = format!(
                    "{}: {}",
                    argument_name,
                    schema.get_type_string(&argument.type_)
                );
                Some(hover_content_wrapper(content))
            } else {
                let directive_text = print_directive(schema, &schema_directive);
                Some(hover_content_wrapper(directive_text))
            }
        }
        NodeKind::FieldName => {
            let type_ref = node_resolution_info
                .type_path
                .resolve_current_type_reference(schema)?;
            let type_name = schema.get_type_string(&type_ref);

            Some(hover_content_wrapper(type_name))
        }
        NodeKind::FieldArgument(field_name, argument_name) => {
            let type_ref = node_resolution_info
                .type_path
                .resolve_current_type_reference(schema)?;

            if type_ref.inner().is_object() || type_ref.inner().is_interface() {
                let field_id = schema.named_field(type_ref.inner(), field_name)?;
                let field = schema.field(field_id);
                let argument = field.arguments.named(argument_name)?;
                let content = format!(
                    "{}: {}",
                    argument_name,
                    schema.get_type_string(&argument.type_)
                );
                Some(hover_content_wrapper(content))
            } else {
                None
            }
        }
        NodeKind::FragmentSpread(fragment_name) => {
            let project_name = node_resolution_info.project_name;
            if let Some(source_program) = source_programs.read().unwrap().get(&project_name) {
                let fragment_text =
                    print_fragment(&schema, source_program.fragment(fragment_name)?);
                Some(hover_content_wrapper(fragment_text))
            } else {
                None
            }
        }
    }
}

pub fn send_hover_response(
    hover_contents: Option<HoverContents>,
    request_id: ServerRequestId,
    sender: &Sender<Message>,
) {
    let result = if let Some(hover_contents) = hover_contents {
        serde_json::to_value(Hover {
            contents: hover_contents,
            range: None,
        })
        .ok()
    } else {
        None
    };
    sender
        .send(Message::Response(ServerResponse {
            id: request_id,
            result,
            error: None,
        }))
        .ok();
}
