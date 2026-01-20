/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Location;
use common::Span;
use graphql_ir::Argument;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::Program;
use graphql_ir::Visitor;
use intern::string_key::StringKey;
use lsp_types::InlayHint;
use lsp_types::InlayHintLabel;
use lsp_types::InlayHintTooltip;
use lsp_types::MarkupContent;
use lsp_types::request::InlayHintRequest;
use lsp_types::request::Request;
use schema::SDLSchema;
use schema::Schema;

use crate::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;
use crate::server::build_ir_for_lsp;
use crate::utils::is_file_uri_in_dir;

pub fn on_inlay_hint_request(
    state: &impl GlobalState,
    params: <InlayHintRequest as Request>::Params,
) -> LSPRuntimeResult<<InlayHintRequest as Request>::Result> {
    let uri = params.text_document.uri.clone();
    let root_dir = state.root_dir();

    if !is_file_uri_in_dir(root_dir, &uri) {
        return Err(LSPRuntimeError::ExpectedError);
    }

    let project_name = state.extract_project_name_from_url(&uri)?;
    let schema = state.get_schema(&project_name)?;
    let program = state.get_program(&project_name)?;
    let asts = state.resolve_executable_definitions(&uri)?;
    let irs = build_ir_for_lsp(&schema, &asts).map_err(|_| LSPRuntimeError::ExpectedError)?;
    let mut visitor = InlayHintVisitor::new(&program, &schema);
    for executable_definition in irs {
        visitor.visit_executable_definition(&executable_definition);
    }

    if visitor.inlay_hints.is_empty() {
        return Ok(None);
    }

    let inlay_hints = visitor
        .inlay_hints
        .into_iter()
        .filter_map(|hint| hint.into_inlay_hint(state).ok())
        .collect();

    Ok(Some(inlay_hints))
}

// Simplified version of the InlayHint struct that uses Relay location. Assumes
// the following:
// 1. The hint will be placed at the start of the location
// 2. Padding right should be added
// 3. Tooltips are rendered as markdown
struct Hint {
    location: Location,
    label: String,
    tooltip: Option<String>,
}

impl Hint {
    // Resolve Relay location to LSP location and create an InlayHint
    fn into_inlay_hint(self, state: &impl GlobalState) -> LSPRuntimeResult<InlayHint> {
        let lsp_location =
            state.transform_relay_location_in_editor_to_lsp_location(self.location)?;
        Ok(InlayHint {
            position: lsp_location.range.start,
            label: InlayHintLabel::String(self.label),
            kind: None,
            text_edits: None,
            tooltip: self.tooltip.map(|tooltip| {
                InlayHintTooltip::MarkupContent(MarkupContent {
                    kind: lsp_types::MarkupKind::Markdown,
                    value: tooltip,
                })
            }),
            padding_left: None,
            padding_right: Some(true),
            data: None,
        })
    }
}

struct InlayHintVisitor<'a> {
    program: &'a Program,
    schema: &'a SDLSchema,
    inlay_hints: Vec<Hint>,
}

impl<'a> InlayHintVisitor<'a> {
    fn new(program: &'a Program, schema: &'a SDLSchema) -> Self {
        Self {
            program,
            schema,
            inlay_hints: vec![],
        }
    }

    fn add_alias_hint(&mut self, alias: StringKey, location: Location) {
        self.inlay_hints.push(Hint {
                location,
                label: format!("{alias}:"),
                tooltip: Some("Fragment alias from the attached `@alias` directive. [Read More](https://relay.dev/docs/guides/alias-directive/).".to_string()),
            });
    }

    fn add_field_argument_hints(&mut self, field_def: &schema::Field, arguments: &[Argument]) {
        for arg in arguments {
            if let Some(arg_def) = field_def.arguments.named(arg.name.item) {
                let arg_type = self.schema.get_type_string(&arg_def.type_);
                self.inlay_hints.push(Hint {
                    location: arg.value.location,
                    label: arg_type,
                    tooltip: None,
                });
            }
        }
    }

    fn add_fragment_argument_hints(
        &mut self,
        fragment_name: FragmentDefinitionName,
        arguments: &[Argument],
    ) {
        if let Some(fragment) = self.program.fragment(fragment_name) {
            for arg in arguments {
                if let Some(variable_def) = fragment
                    .variable_definitions
                    .iter()
                    .find(|variable| variable.name.item.0 == arg.name.item.0)
                {
                    let arg_type = self.schema.get_type_string(&variable_def.type_);
                    self.inlay_hints.push(Hint {
                        location: arg.value.location,
                        label: arg_type,
                        tooltip: None,
                    });
                }
            }
        }
    }
}

impl Visitor for InlayHintVisitor<'_> {
    const NAME: &'static str = "InlayHintVisitor";

    const VISIT_ARGUMENTS: bool = false;

    const VISIT_DIRECTIVES: bool = false;

    fn visit_scalar_field(&mut self, field: &graphql_ir::ScalarField) {
        let field_def = self.schema.field(field.definition.item);
        self.add_field_argument_hints(field_def, &field.arguments)
    }

    fn visit_linked_field(&mut self, field: &graphql_ir::LinkedField) {
        let field_def = self.schema.field(field.definition.item);
        self.add_field_argument_hints(field_def, &field.arguments);

        self.default_visit_linked_field(field);
    }

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if let Ok(Some(alias)) = spread.alias() {
            let initial_span = spread.fragment.location.span();

            // We don't actually have location information for the `...` in the
            // spread, so we adjust the span assuming it's been formatted and the `...`
            // immediately precedes the fragment name.
            let adjusted_location = Location::with_span(
                &spread.fragment.location,
                Span::new(initial_span.start - 3, initial_span.end),
            );
            self.add_alias_hint(alias.item, adjusted_location);
        }

        self.add_fragment_argument_hints(spread.fragment.item, &spread.arguments);
    }

    fn visit_inline_fragment(&mut self, fragment: &InlineFragment) {
        if let Ok(Some(alias)) = fragment.alias(self.schema) {
            self.add_alias_hint(alias.item, fragment.spread_location);
        }

        self.default_visit_inline_fragment(fragment)
    }
}
