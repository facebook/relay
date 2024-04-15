/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::reexport::StringKey;
use intern::string_key::Intern;
use intern::Lookup;
use lsp_types::request::Request;
use schema::Schema;
use schema_documentation::SchemaDocumentation;
use serde::Deserialize;
use serde::Serialize;

use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;

pub(crate) enum SearchSchemaItems {}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaSearchItem {
    name: String,
    description: Option<String>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SearchSchemaItemsResponse {
    pub items: Vec<SchemaSearchItem>,
    pub has_more: bool,
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
    type Result = SearchSchemaItemsResponse;
    const METHOD: &'static str = "relay/searchSchemaItems";
}

pub(crate) fn on_search_schema_items(
    state: &impl GlobalState,
    params: SearchSchemaItemsParams,
) -> LSPRuntimeResult<<SearchSchemaItems as Request>::Result> {
    let filter = params.filter.map(|f| f.to_lowercase());
    let schema_name: &str = &params.schema_name;
    let schema = state.get_schema(&schema_name.intern())?;

    let schema_documentation = state.get_schema_documentation(schema_name);

    let objects = filter_and_transform_items(
        schema.objects().map(|o| o.name.item.0),
        &schema_documentation,
        &filter,
    );
    let interfaces = filter_and_transform_items(
        schema.interfaces().map(|i| i.name.item.0),
        &schema_documentation,
        &filter,
    );
    let enums = filter_and_transform_items(
        schema.enums().map(|e| e.name.item.0),
        &schema_documentation,
        &filter,
    );
    let unions = filter_and_transform_items(
        schema.unions().map(|u| u.name.item.0),
        &schema_documentation,
        &filter,
    );
    let input_objects = filter_and_transform_items(
        schema.input_objects().map(|io| io.name.item.0),
        &schema_documentation,
        &filter,
    );
    let scalars = filter_and_transform_items(
        schema.scalars().map(|s| s.name.item.0),
        &schema_documentation,
        &filter,
    );

    let mut items = objects
        .chain(interfaces)
        .chain(enums)
        .chain(unions)
        .chain(input_objects)
        .chain(scalars)
        .collect::<Vec<_>>();

    items.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    let skip = *params.skip.as_ref().unwrap_or(&0);
    let take = *params.take.as_ref().unwrap_or(&500);
    let has_more = items.len() > skip + take;

    let items = items.into_iter().skip(skip).take(take).collect::<Vec<_>>();

    Ok(SearchSchemaItemsResponse { items, has_more })
}

fn filter_and_transform_items<'a>(
    items: impl Iterator<Item = StringKey> + 'a,
    schema_documentation: &'a impl SchemaDocumentation,
    filter: &'a Option<String>,
) -> impl Iterator<Item = SchemaSearchItem> + 'a {
    items.filter_map(move |obj| {
        let name = obj.lookup();
        let description = schema_documentation
            .get_type_description(name)
            .map(|s| s.to_string());

        if should_include_named_item(name, &description, filter) {
            Some(SchemaSearchItem {
                name: name.to_string(),
                description,
            })
        } else {
            None
        }
    })
}

fn should_include_named_item(
    name: &str,
    description: &Option<String>,
    filter: &Option<String>,
) -> bool {
    if let Some(filter) = filter.as_ref() {
        if name.to_lowercase().contains(filter) {
            true
        } else if let Some(description) = description {
            description.to_lowercase().contains(filter)
        } else {
            false
        }
    } else {
        true
    }
}

#[cfg(test)]
mod tests {
    use crate::search_schema_items::should_include_named_item;

    #[test]
    fn test_no_filter() {
        assert!(should_include_named_item(
            "Yohan Blake",
            &Some("London 2012".to_string()),
            &None
        ));
        assert!(should_include_named_item("Usain Bolt", &None, &None));
    }

    #[test]
    fn test_filter_matches_name() {
        assert!(should_include_named_item(
            "Michael Frater",
            &None,
            &Some("michael".to_string())
        ));
        assert!(should_include_named_item(
            "Nesta Carter",
            &Some("London 2012".to_string()),
            &Some("nesta".to_string())
        ));
    }

    #[test]
    fn test_filter_matches_description() {
        assert!(should_include_named_item(
            "Tiana Bartoletta",
            &Some("London 2012".to_string()),
            &Some("london".to_string())
        ));
    }

    #[test]
    fn test_non_matching_filter() {
        assert!(!should_include_named_item(
            "Allyson Felix",
            &Some("London 2012".to_string()),
            &Some("salt lake city".to_string())
        ));
    }
}
