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
use schema::Schema;
use serde::Deserialize;
use serde::Serialize;

use crate::explore_schema_for_type::types;
use crate::server::GlobalState;

/// Implementation of the `relay type-information` CLI command.
pub(crate) fn get_type_information(
    lsp_state: &impl GlobalState,
    uri: Url,
    type_name: String,
) -> Result<TypeInformationResponse, String> {
    let Ok(project_name) = lsp_state.extract_project_name_from_url(&uri) else {
        return Err(format!(
            "Unable to extract Relay GraphQL project from uri: {uri:?}"
        ));
    };

    let schema = lsp_state
        .get_schema(&project_name)
        .map_err(|e| format!("{e:?}"))?;

    let type_ = match type_name.as_str() {
        "Query" => schema.query_type(),
        "Subscription" => schema.subscription_type(),
        "Mutation" => schema.mutation_type(),
        _ => schema.get_type((&type_name).intern()),
    };

    let Some(type_) = type_ else {
        return Err(format!("Unable to find type information for {type_name}"));
    };

    let schema_item = types::get_full_schema_explorer_type_reference(
        type_,
        &type_name,
        &schema,
        &lsp_state.get_schema_documentation(project_name.lookup()),
        &None,
        None,
    );

    Ok(TypeInformationResponse { schema_item })
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
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
