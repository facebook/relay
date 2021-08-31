/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_syntax::OperationDefinition;
use lsp_types::{HoverContents, MarkedString};

use crate::{
    resolution_path::{
        IdentParent, IdentPath, OperationDefinitionPath, OperationPath, ResolutionPath,
    },
    LSPExtraDataProvider,
};

pub(crate) fn hover_with_node_resolution_path<'a>(
    path: ResolutionPath<'a>,
    extra_data_provider: &dyn LSPExtraDataProvider,
) -> Option<HoverContents> {
    match path {
        // Show query stats on the operation definition name
        // and "query/subscription/mutation" token
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::OperationDefinitionName(OperationDefinitionPath {
                    inner: operation_definition,
                    parent: _,
                }),
        }) => on_hover_operation(operation_definition, extra_data_provider),
        ResolutionPath::Operation(OperationPath {
            inner: _,
            parent:
                OperationDefinitionPath {
                    inner: operation_definition,
                    parent: _,
                },
        }) => on_hover_operation(operation_definition, extra_data_provider),
        // Explicity show no hover in other parts of the operation definition.
        // For example, the curly braces after the operation variables are included in
        // this match arm.
        ResolutionPath::OperationDefinition(_) => None,

        _ => None,
    }
}

fn on_hover_operation(
    operation_definition: &OperationDefinition,
    extra_data_provider: &dyn LSPExtraDataProvider,
) -> Option<HoverContents> {
    let name = operation_definition.name.as_ref()?;
    let extra_data = extra_data_provider.fetch_query_stats(name.value.lookup());
    if !extra_data.is_empty() {
        Some(HoverContents::Array(
            extra_data
                .iter()
                .map(|str| MarkedString::String(str.to_string()))
                .collect::<_>(),
        ))
    } else {
        None
    }
}
