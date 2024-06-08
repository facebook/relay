/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use common::Location;
use common::SourceLocationKey;
use common::Span;
use graphql_ir::Argument;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Visitor;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lsp_types::request::InlayHintRequest;
use lsp_types::request::Request;
use lsp_types::InlayHint;
use lsp_types::InlayHintLabel;
use lsp_types::InlayHintTooltip;
use lsp_types::MarkupContent;
use schema::Schema;

use crate::location::transform_relay_location_to_lsp_location;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;
use crate::utils::is_file_uri_in_dir;
use crate::LSPRuntimeError;

pub fn on_inlay_hint_request(
    state: &impl GlobalState,
    params: <InlayHintRequest as Request>::Params,
) -> LSPRuntimeResult<<InlayHintRequest as Request>::Result> {
    let uri = params.text_document.uri.clone();
    let root_dir = state.root_dir();

    if !is_file_uri_in_dir(&root_dir, &uri) {
        return Err(LSPRuntimeError::ExpectedError);
    }

    let absolute_file_path = uri.to_file_path().map_err(|_| {
        LSPRuntimeError::UnexpectedError(format!("Unable to convert URL to file path: {:?}", uri))
    })?;

    let file_path = absolute_file_path.strip_prefix(&root_dir).map_err(|_e| {
        LSPRuntimeError::UnexpectedError(format!(
            "Failed to strip prefix {:?} from {:?}",
            root_dir, absolute_file_path
        ))
    })?;

    let project_name = state.extract_project_name_from_url(&uri)?;
    let program = state.get_program(&project_name)?;
    let path = file_path.to_string_lossy().intern();

    let mut visitor = InlayHintVisitor::new(path, &root_dir, &program);
    visitor.visit_program(&program);

    Ok(Some(visitor.inlay_hints))
}

struct InlayHintVisitor<'a> {
    file_path: StringKey,
    root_dir: &'a PathBuf,
    program: &'a Program,
    inlay_hints: Vec<InlayHint>,
}

impl<'a> InlayHintVisitor<'a> {
    fn new(file_path: StringKey, root_dir: &'a PathBuf, program: &'a Program) -> Self {
        Self {
            file_path,
            root_dir,
            program,
            inlay_hints: vec![],
        }
    }

    fn location_is_in_file(&self, location: &Location) -> bool {
        match location.source_location() {
            SourceLocationKey::Standalone { path } => path == self.file_path,
            SourceLocationKey::Embedded { path, .. } => path == self.file_path,
            _ => false,
        }
    }

    fn add_alias_hint(&mut self, alias: StringKey, location: Location) {
        if let Ok(lsp_location) = transform_relay_location_to_lsp_location(&self.root_dir, location)
        {
            self.inlay_hints.push(InlayHint {
                position: lsp_location.range.start,
                label: InlayHintLabel::String(format!("{}:", alias)),
                kind: None,
                text_edits: None,
                tooltip: Some(InlayHintTooltip::MarkupContent(MarkupContent {
                    kind: lsp_types::MarkupKind::Markdown,
                    value: "Fragment alias from the attached `@alias` directive. [Read More](https://relay.dev/docs/next/guides/alias-directive/).".to_string(),
                })),
                padding_left: None,
                padding_right: Some(true),
                data: None,
            })
        }
    }

    fn add_field_argument_hints(&mut self, field_def: &schema::Field, arguments: &[Argument]) {
        for arg in arguments {
            if let Some(arg_def) = field_def.arguments.named(arg.name.item) {
                if let Ok(lsp_location) =
                    transform_relay_location_to_lsp_location(&self.root_dir, arg.value.location)
                {
                    let arg_type = self.program.schema.get_type_string(&arg_def.type_);
                    self.inlay_hints.push(InlayHint {
                        position: lsp_location.range.start,
                        label: InlayHintLabel::String(arg_type),
                        kind: None,
                        text_edits: None,
                        tooltip: None,
                        padding_left: None,
                        padding_right: Some(true),
                        data: None,
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

    fn visit_operation(&mut self, operation: &OperationDefinition) {
        if self.location_is_in_file(&operation.name.location) {
            self.default_visit_operation(operation);
        }
    }

    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        if self.location_is_in_file(&fragment.name.location) {
            self.default_visit_fragment(fragment);
        }
    }

    fn visit_scalar_field(&mut self, field: &graphql_ir::ScalarField) {
        let field_def = self.program.schema.field(field.definition.item);
        self.add_field_argument_hints(field_def, &field.arguments)
    }

    fn visit_linked_field(&mut self, field: &graphql_ir::LinkedField) {
        let field_def = self.program.schema.field(field.definition.item);
        self.add_field_argument_hints(field_def, &field.arguments)
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
            self.add_alias_hint(alias.item, adjusted_location)
        }
    }

    fn visit_inline_fragment(&mut self, fragment: &InlineFragment) {
        if let Ok(Some(alias)) = fragment.alias(&self.program.schema) {
            self.add_alias_hint(alias.item, fragment.spread_location)
        }
    }
}
