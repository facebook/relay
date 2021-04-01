/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::PerfLogger;
use lsp_types::request::Request;

use crate::{
    lsp_extra_data_provider::Query, lsp_runtime_error::LSPRuntimeResult, server::LSPState,
};
use serde::{Deserialize, Serialize};

pub enum GraphQlExecuteQuery {}

#[derive(Serialize, Deserialize)]
pub struct GraphQlExecuteQueryParams {
    text: String,
    variables: serde_json::Value,
}

impl Request for GraphQlExecuteQuery {
    type Params = GraphQlExecuteQueryParams;
    type Result = ();
    const METHOD: &'static str = "graphql/executeQuery";
}

#[allow(clippy::unnecessary_wraps)]
pub(crate) fn on_graphql_execute_query<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: GraphQlExecuteQueryParams,
) -> LSPRuntimeResult<<GraphQlExecuteQuery as Request>::Result> {
    dbg!(&params.text);
    // TODO: Parse text, extract variables check for missing variables

    match state
        .extra_data_provider
        .execute_query(Query::Text(params.text), params.variables)
    {
        Ok(data) => dbg!(data),
        Err(error) => dbg!(error),
    };

    Ok(())
}
