/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    server::GlobalState,
};
use intern::string_key::Intern;
use lsp_types::request::Request;
use schema::Schema;
use serde::{Deserialize, Serialize};

mod types;

pub(crate) struct ExploreSchemaForType {}

#[derive(Deserialize, Serialize)]
pub(crate) struct ExploreSchemaForTypeParams {
    pub item: String,
    pub filter: Option<String>,
    pub schema_name: String,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct ExploreSchemaForTypeResult {
    schema_item: types::SchemaExplorerTypeReference<types::SchemaExplorerSchemaType>,
}

impl Request for ExploreSchemaForType {
    type Params = ExploreSchemaForTypeParams;
    type Result = ExploreSchemaForTypeResult;
    const METHOD: &'static str = "relay/exploreSchemaForType";
}

pub(crate) fn on_explore_schema_for_type(
    state: &impl GlobalState,
    params: <ExploreSchemaForType as Request>::Params,
) -> LSPRuntimeResult<<ExploreSchemaForType as Request>::Result> {
    // TODO these should not be expected errors
    let schema_name: &str = &params.schema_name;
    let schema = state.get_schema(&schema_name.intern())?;

    let type_ = if params.item == "Query" {
        schema.query_type()
    } else if params.item == "Subscription" {
        schema.subscription_type()
    } else if params.item == "Mutation" {
        schema.mutation_type()
    } else {
        let item: &str = &params.item;
        schema.get_type(item.intern())
    };

    // TODO these should not be expected errors
    let schema_item = type_
        .map(|type_| {
            types::get_full_schema_explorer_type_reference(
                type_,
                &params.item,
                &schema,
                &state.get_schema_documentation(&params.schema_name),
                &params.filter.as_ref().map(|x| x.to_lowercase()),
                None,
            )
        })
        .ok_or(LSPRuntimeError::ExpectedError)?;

    Ok(ExploreSchemaForTypeResult { schema_item })
}
