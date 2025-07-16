/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Type information LSP request

use intern::Lookup;
use intern::string_key::Intern;
use lsp_types::Url;
use lsp_types::request::Request;
use schema::Schema;
use serde::Deserialize;
use serde::Serialize;

use crate::LSPRuntimeError;
use crate::explore_schema_for_type::types;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;

pub(crate) fn on_type_information(
    lsp_state: &impl GlobalState,
    params: TypeInformationParams,
) -> LSPRuntimeResult<TypeInformationResponse> {
    let Ok(project_name) = lsp_state.extract_project_name_from_url(&params.uri) else {
        return Err(LSPRuntimeError::UnexpectedError(format!(
            "Unable to extract Relay GraphQL project from uri: {:?}",
            params.uri
        )));
    };

    let type_name = &params.type_name;

    let schema = lsp_state.get_schema(&project_name)?;

    let type_ = if params.type_name == "Query" {
        schema.query_type()
    } else if params.type_name == "Subscription" {
        schema.subscription_type()
    } else if params.type_name == "Mutation" {
        schema.mutation_type()
    } else {
        schema.get_type(type_name.intern())
    };

    let Some(type_) = type_ else {
        return Err(LSPRuntimeError::UnexpectedError(format!(
            "Unable to find type information for {type_name}",
        )));
    };

    // TODO these should not be expected errors
    let schema_item = types::get_full_schema_explorer_type_reference(
        type_,
        &params.type_name,
        &schema,
        &lsp_state.get_schema_documentation(project_name.lookup()),
        &None,
        None,
    );

    Ok(TypeInformationResponse { schema_item })
}

pub(crate) enum TypeInformation {}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub(crate) struct TypeInformationParams {
    pub uri: Url,
    pub type_name: String,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct TypeInformationResponse {
    schema_item: crate::explore_schema_for_type::types::SchemaExplorerTypeReference<
        crate::explore_schema_for_type::types::SchemaExplorerSchemaType,
    >,
}

impl Request for TypeInformation {
    type Params = TypeInformationParams;
    type Result = TypeInformationResponse;
    const METHOD: &'static str = "relay/typeInformation";
}
