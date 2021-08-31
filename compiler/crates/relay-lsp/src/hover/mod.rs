/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the hover feature

use crate::{
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    node_resolution_info::{NodeKind, NodeResolutionInfo},
    resolution_path::ResolvePosition,
    server::{LSPState, SourcePrograms},
};
use common::PerfLogger;
use graphql_ir::Value;
use graphql_text_printer::print_value;
use lsp_types::{
    request::{HoverRequest, Request},
    Hover, HoverContents, LanguageString, MarkedString,
};
use schema::{SDLSchema, Schema};
use schema_documentation::SchemaDocumentation;
use schema_print::print_directive;
use serde::Serialize;

mod with_resolution_path;
use with_resolution_path::hover_with_node_resolution_path;

fn graphql_marked_string(value: String) -> MarkedString {
    MarkedString::LanguageString(LanguageString {
        language: "graphql".to_string(),
        value,
    })
}

fn hover_content_wrapper(value: String) -> HoverContents {
    HoverContents::Scalar(graphql_marked_string(value))
}

/// This will provide a more accurate information about some of the specific Relay directives
/// that cannot be expressed via SDL
fn argument_definition_hover_info(directive_name: &str) -> Option<HoverContents> {
    let content = match directive_name {
        "argumentDefinitions" => Some(
            r#"
`@argumentDefinitions` is a directive used to specify arguments taken by a fragment.

---
@see: https://relay.dev/docs/en/graphql-in-relay.html#argumentdefinitions
"#,
        ),
        "arguments" => Some(
            r#"
`@arguments` is a directive used to pass arguments to a fragment that was defined using `@argumentDefinitions`.

---
@see: https://relay.dev/docs/en/graphql-in-relay.html#arguments
"#,
        ),
        "uncheckedArguments_DEPRECATED" => Some(
            r#"
DEPRECATED version of `@arguments` directive.
`@arguments` is a directive used to pass arguments to a fragment that was defined using `@argumentDefinitions`.

---
@see: https://relay.dev/docs/en/graphql-in-relay.html#arguments
"#,
        ),
        _ => None,
    };

    content.map(|value| HoverContents::Scalar(MarkedString::String(value.to_string())))
}

fn get_hover_response_contents<'a>(
    node_resolution_info: NodeResolutionInfo,
    schema: &SDLSchema,
    schema_documentation: &impl SchemaDocumentation,
    source_programs: &SourcePrograms,
) -> Option<HoverContents> {
    let kind = node_resolution_info.kind;
    let schema_name = node_resolution_info.project_name.lookup();

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
                let directive_definition = print_directive(schema, &schema_directive);
                let markdown_definition = graphql_marked_string(directive_definition);
                let mut hover_contents: Vec<MarkedString> = vec![markdown_definition];
                if let Some(description) = schema_directive.description {
                    hover_contents.push(MarkedString::String(description.to_string()));
                }
                Some(HoverContents::Array(hover_contents))
            }
        }
        NodeKind::FieldName => {
            let (parent_type, field) = node_resolution_info
                .type_path
                .resolve_current_field(schema)?;

            let rendered_type_string = schema.get_type_string(&field.type_);
            let field_type_name = schema.get_type_name(field.type_.inner()).lookup();
            let parent_type_name = schema.get_type_name(parent_type).lookup();

            let mut hover_contents: Vec<MarkedString> =
                vec![MarkedString::String(format!("Field: **{}**", field.name))];

            if let Some(field_description) =
                schema_documentation.get_field_description(parent_type_name, field.name.lookup())
            {
                hover_contents.push(MarkedString::String(field_description.to_string()));
            }

            hover_contents.push(MarkedString::String(format!(
                "Type: **{}**",
                get_open_schema_explorer_command_link(
                    &rendered_type_string,
                    &GraphQLSchemaExplorerParams {
                        path: vec![field_type_name],
                        schema_name,
                        filter: None,
                    }
                )
            )));

            if let Some(type_description) =
                schema_documentation.get_type_description(field_type_name)
            {
                hover_contents.push(MarkedString::String(type_description.to_string()));
            }

            if !field.arguments.is_empty() {
                hover_contents.push(MarkedString::String(
                    "This field accepts these arguments".to_string(),
                ));

                for arg in field.arguments.iter() {
                    let arg_type_name = schema.get_type_name(arg.type_.inner()).lookup();
                    hover_contents.push(MarkedString::from_markdown(format!(
                        "{}: **{}**{}\n\n{}",
                        arg.name,
                        get_open_schema_explorer_command_link(
                            &schema.get_type_string(&arg.type_),
                            &GraphQLSchemaExplorerParams {
                                path: vec![field_type_name, arg_type_name],
                                schema_name,
                                filter: None,
                            }
                        ),
                        if let Some(default_value) = &arg.default_value {
                            format!(" = {}", default_value)
                        } else {
                            "".to_string()
                        },
                        if let Some(description) = schema_documentation
                            .get_field_argument_description(
                                parent_type_name,
                                field.name.lookup(),
                                arg.name.lookup(),
                            )
                        {
                            description.to_string()
                        } else {
                            "".to_string()
                        }
                    )));
                }
            }

            Some(HoverContents::Array(hover_contents))
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
                    get_open_schema_explorer_command_link(
                        &schema.get_type_string(&argument.type_),
                        &GraphQLSchemaExplorerParams {
                            path: vec![schema.get_type_name(argument.type_.inner()).lookup()],
                            filter: None,
                            schema_name,
                        }
                    )
                );
                Some(HoverContents::Scalar(MarkedString::from_markdown(content)))
            } else {
                None
            }
        }
        NodeKind::FragmentSpread(fragment_name) => {
            let project_name = node_resolution_info.project_name;
            if let Some(source_program) = source_programs.get(&project_name) {
                let fragment = source_program.fragment(fragment_name)?;
                let mut hover_contents: Vec<MarkedString> = vec![];
                let fragment_type_name = schema.get_type_name(fragment.type_condition).lookup();
                hover_contents.push(MarkedString::from_markdown(format!(
                    "fragment {} on {}",
                    fragment.name.item,
                    get_open_schema_explorer_command_link(
                        fragment_type_name,
                        &GraphQLSchemaExplorerParams {
                            path: vec![fragment_type_name],
                            filter: None,
                            schema_name,
                        }
                    )
                )));

                if !fragment.variable_definitions.is_empty() {
                    let mut variables_string: Vec<String> =
                        vec!["This fragment accepts these arguments:".to_string()];
                    for var in &fragment.variable_definitions {
                        let default_value = match var.default_value.clone() {
                            Some(default_value) => format!(
                                ", with a default value of {}",
                                print_value(schema, &Value::Constant(default_value.item))
                            ),
                            None => "".to_string(),
                        };
                        variables_string.push(format!(
                            "* {}: {}{}",
                            var.name.item,
                            get_open_schema_explorer_command_link(
                                &schema.get_type_string(&var.type_),
                                &GraphQLSchemaExplorerParams {
                                    path: vec![schema.get_type_name(var.type_.inner()).lookup()],
                                    schema_name,
                                    filter: None,
                                }
                            ),
                            default_value,
                        ));
                    }
                    hover_contents.push(MarkedString::from_markdown(variables_string.join("\n")))
                }

                let fragment_name_details: Vec<&str> = fragment_name.lookup().split('_').collect();
                // We expect the fragment name to be `ComponentName_propName`
                if fragment_name_details.len() == 2 {
                    hover_contents.push(MarkedString::from_markdown(format!(
                        r#"
To consume this fragment spread,
pass it to the component that defined it.

For example:
```js
    <{} {}={{data.{}}} />
```
"#,
                        fragment_name_details[0],
                        fragment_name_details[1],
                        fragment_name_details[1],
                    )));
                } // We may log an error (later), if that is not the case.

                hover_contents.push(MarkedString::String(
                    "@see: https://relay.dev/docs/en/thinking-in-relay#data-masking".to_string(),
                ));
                Some(HoverContents::Array(hover_contents))
            } else {
                None
            }
        }
        NodeKind::OperationDefinition(_operation) => None,
        NodeKind::FragmentDefinition(fragment) => {
            let type_ = node_resolution_info
                .type_path
                .resolve_current_type_reference(schema)?;
            let title = MarkedString::from_markdown(format!(
                "fragment {} on {}",
                fragment.name.value,
                get_open_schema_explorer_command_link(
                    schema.get_type_name(type_.inner()).lookup(),
                    &GraphQLSchemaExplorerParams {
                        path: vec![schema.get_type_name(type_.inner()).lookup()],
                        schema_name,
                        filter: None
                    }
                )
            ));

            let hover_contents = vec![
                title,
                MarkedString::String(
                    r#"Fragments let you select fields,
and then include them in queries where you need to.

---
@see: https://graphql.org/learn/queries/#fragments
"#
                    .to_string(),
                ),
            ];

            Some(HoverContents::Array(hover_contents))
        }
        NodeKind::InlineFragment => None,
        NodeKind::TypeCondition(_) => None,
    }
}

pub(crate) fn on_hover<
    TPerfLogger: PerfLogger + 'static,
    TSchemaDocumentation: SchemaDocumentation,
>(
    state: &mut LSPState<TPerfLogger, TSchemaDocumentation>,
    params: <HoverRequest as Request>::Params,
) -> LSPRuntimeResult<<HoverRequest as Request>::Result> {
    let (document, position_span, project_name) =
        state.extract_executable_document_from_text(&params.text_document_position_params, 1)?;
    let resolution_path = document.resolve((), position_span);

    if let Some(schema) = state.get_schemas().get(&project_name) {
        let schema_documentation = state.get_schema_documentation(project_name.lookup());

        if let Some(contents) =
            hover_with_node_resolution_path(resolution_path, state.extra_data_provider.as_ref())
        {
            return Ok(Some(Hover {
                contents,
                range: None,
            }));
        }

        let node_resolution_info = state.resolve_node(&params.text_document_position_params)?;
        log::debug!("Hovering over {:?}", node_resolution_info);

        let contents = get_hover_response_contents(
            node_resolution_info,
            &schema,
            &schema_documentation,
            state.get_source_programs_ref(),
        )
        .ok_or_else(|| {
            LSPRuntimeError::UnexpectedError("Unable to get hover contents".to_string())
        })?;
        Ok(Some(Hover {
            contents,
            range: None,
        }))
    } else {
        Err(LSPRuntimeError::ExpectedError)
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct GraphQLSchemaExplorerParams<'a> {
    path: Vec<&'a str>,

    schema_name: &'a str,

    #[serde(skip_serializing_if = "Option::is_none")]
    filter: Option<&'a str>,
}

fn get_open_schema_explorer_command_link(
    text: &str,
    params: &GraphQLSchemaExplorerParams<'_>,
) -> String {
    format!(
        "[{}](command:{})",
        text,
        get_open_schema_explorer_command(params)
    )
}

fn get_open_schema_explorer_command(params: &GraphQLSchemaExplorerParams<'_>) -> String {
    // see https://docs.rs/percent-encoding/2.1.0/percent_encoding/
    use percent_encoding::{utf8_percent_encode, AsciiSet, CONTROLS};

    const FRAGMENT: AsciiSet = CONTROLS.add(b' ').add(b'"').add(b'<').add(b'>').add(b'`');

    return format!(
        "nuclide.relay-lsp.openSchemaExplorer?{}",
        utf8_percent_encode(&serde_json::to_string(params).unwrap(), &FRAGMENT)
    );
}
