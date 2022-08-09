/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Span;
use graphql_ir::FragmentDefinitionName;
use graphql_syntax::ExecutableDocument;
use intern::string_key::StringKey;
use resolution_path::IdentParent;
use resolution_path::IdentPath;
use resolution_path::LinkedFieldPath;
use resolution_path::ResolutionPath;
use resolution_path::ResolvePosition;
use resolution_path::ScalarFieldPath;
use resolution_path::SelectionParent;
use resolution_path::TypeConditionPath;
use schema::SDLSchema;

use super::DefinitionDescription;
use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;

pub fn get_graphql_definition_description(
    document: ExecutableDocument,
    position_span: Span,
    schema: &Arc<SDLSchema>,
) -> LSPRuntimeResult<DefinitionDescription> {
    let node_path = document.resolve((), position_span);
    match node_path {
        ResolutionPath::Ident(IdentPath {
            inner: fragment_name,
            parent: IdentParent::FragmentSpreadName(_),
        }) => Ok(DefinitionDescription::Fragment {
            fragment_name: FragmentDefinitionName(fragment_name.value),
        }),
        ResolutionPath::Ident(IdentPath {
            inner: field_name,
            parent:
                IdentParent::LinkedFieldName(LinkedFieldPath {
                    inner: _,
                    parent: selection_path,
                }),
        }) => resolve_field(field_name.value, selection_path.parent, schema),
        ResolutionPath::Ident(IdentPath {
            inner: field_name,
            parent:
                IdentParent::ScalarFieldName(ScalarFieldPath {
                    inner: _,
                    parent: selection_path,
                }),
        }) => resolve_field(field_name.value, selection_path.parent, schema),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::TypeConditionType(TypeConditionPath {
                    inner: type_condition,
                    parent: _,
                }),
        }) => Ok(DefinitionDescription::Type {
            type_name: type_condition.type_.value,
        }),
        _ => Err(LSPRuntimeError::ExpectedError),
    }
}

fn resolve_field(
    field_name: StringKey,
    selection_parent: SelectionParent<'_>,
    schema: &Arc<SDLSchema>,
) -> LSPRuntimeResult<DefinitionDescription> {
    let parent_type = selection_parent
        .find_parent_type(schema)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    Ok(DefinitionDescription::Field {
        parent_type,
        field_name,
    })
}
