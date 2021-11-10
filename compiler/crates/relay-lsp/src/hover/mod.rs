/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the hover feature

use crate::{
    lsp_runtime_error::LSPRuntimeResult, resolution_path::ResolvePosition, server::GlobalState,
};
use lsp_types::{
    request::{HoverRequest, Request},
    LanguageString, MarkedString,
};
use serde::Serialize;

mod with_resolution_path;
use with_resolution_path::get_hover;

pub use self::with_resolution_path::ContentConsumerType;

fn graphql_marked_string(value: String) -> MarkedString {
    MarkedString::LanguageString(LanguageString {
        language: "graphql".to_string(),
        value,
    })
}

/// This will provide a more accurate information about some of the specific Relay directives
/// that cannot be expressed via SDL
fn argument_definition_hover_info(directive_name: &str) -> Option<MarkedString> {
    match directive_name {
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
    }.map(|s| MarkedString::String(s.to_string()))
}

pub fn on_hover(
    state: &impl GlobalState,
    params: <HoverRequest as Request>::Params,
) -> LSPRuntimeResult<<HoverRequest as Request>::Result> {
    let (document, position_span) =
        state.extract_executable_document_from_text(&params.text_document_position_params, 1)?;

    let resolution_path = document.resolve((), position_span);

    let project_name = state
        .extract_project_name_from_url(&params.text_document_position_params.text_document.uri)?;

    let schema = state.get_schema(&project_name)?;

    let schema_documentation = state.get_schema_documentation(project_name.lookup());

    Ok(get_hover(
        &resolution_path,
        &schema,
        project_name,
        &*state.get_extra_data_provider(),
        &schema_documentation,
        &state.get_program(&project_name)?,
        state.get_content_consumer_type(),
    ))
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
