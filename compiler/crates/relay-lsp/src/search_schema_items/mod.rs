/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{lsp_runtime_error::LSPRuntimeResult, server::LSPState};
use common::PerfLogger;
use lsp_types::request::Request;
use serde::{Deserialize, Serialize};

pub(crate) enum SearchSchemaItems {}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaSearchItemsResponse {
    pub items: Vec<()>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct SearchSchemaItemsParams {
    pub filter: Option<String>,
    pub schema_name: String,
    pub take: Option<usize>,
    pub skip: Option<usize>,
}

impl Request for SearchSchemaItems {
    type Params = SearchSchemaItemsParams;
    type Result = SchemaSearchItemsResponse;
    const METHOD: &'static str = "relay/searchSchemaItems";
}

pub(crate) fn on_search_schema_items<TPerfLogger: PerfLogger + 'static>(
    _state: &mut LSPState<TPerfLogger>,
    _params: SearchSchemaItemsParams,
) -> LSPRuntimeResult<<SearchSchemaItems as Request>::Result> {
    let items = vec![];

    Ok(SchemaSearchItemsResponse { items })
}
