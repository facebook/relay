/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    server::LSPState,
};
use common::PerfLogger;
use interner::Intern;
use lsp_types::request::Request;
use schema::Schema;
use schema_documentation::TypeDescription;
use serde::{Deserialize, Serialize};

pub(crate) enum SearchSchemaItems {}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaSearchItemsResponse {
    pub items: Vec<TypeDescription>,
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
    state: &mut LSPState<TPerfLogger>,
    params: SearchSchemaItemsParams,
) -> LSPRuntimeResult<<SearchSchemaItems as Request>::Result> {
    let filter = params.filter.map(|f| f.to_lowercase());

    let schema_name: &str = &params.schema_name;
    let schema = state
        .schemas
        .get(&schema_name.intern())
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let items = state
        .extra_data_provider
        .get_schema_documentation(&params.schema_name)
        .types
        .iter()
        .filter(|(key, _)| {
            let key: &str = key;
            schema.get_type(key.intern()).is_some()
        })
        .filter(|(_, type_description)| {
            if let Some(filter) = filter.as_ref() {
                type_description.name.to_lowercase().contains(filter)
                    || type_description
                        .description
                        .as_ref()
                        .map_or(false, |d| d.to_lowercase().contains(filter))
            } else {
                true
            }
        })
        .map(|(_key, value)| value)
        .skip(params.skip.unwrap_or(0))
        .take(params.take.unwrap_or(1_000))
        .cloned()
        .collect();

    Ok(SchemaSearchItemsResponse { items })
}
