/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::WithLocation;
use graphql_ir::FragmentDefinition;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Selection;
use relay_config::SchemaConfig;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use super::CONSTANTS;
use super::QueryGenerator;
use super::RefetchRoot;
use super::RefetchableMetadata;
use super::build_fragment_metadata_as_directive;
use super::build_fragment_spread;
use super::build_operation_variable_definitions;
use super::build_used_global_variables;
use super::uses_prefetchable_pagination_in_connection;
use super::validation_message::ValidationMessage;
use crate::root_variables::VariableMap;

fn build_refetch_operation(
    schema: &SDLSchema,
    _schema_config: &SchemaConfig,
    fragment: &Arc<FragmentDefinition>,
    query_name: OperationDefinitionName,
    variables_map: &VariableMap,
) -> DiagnosticsResult<Option<RefetchRoot>> {
    if schema.get_type_name(fragment.type_condition) != CONSTANTS.viewer_type_name {
        return Ok(None);
    }
    let query_type = schema.query_type().unwrap();
    let viewer_field_id = get_viewer_field_id(schema, query_type, fragment)?;

    let fragment = Arc::new(FragmentDefinition {
        directives: build_fragment_metadata_as_directive(
            fragment,
            RefetchableMetadata {
                operation_name: query_name,
                path: vec![CONSTANTS.viewer_field_name],
                identifier_info: None,
                is_prefetchable_pagination: uses_prefetchable_pagination_in_connection(fragment),
            },
        ),
        used_global_variables: build_used_global_variables(
            variables_map,
            &fragment.variable_definitions,
        )?,
        variable_definitions: fragment.variable_definitions.clone(),
        ..fragment.as_ref().clone()
    });
    Ok(Some(RefetchRoot {
        variable_definitions: build_operation_variable_definitions(&fragment),
        selections: vec![Selection::LinkedField(Arc::new(LinkedField {
            alias: None,
            definition: WithLocation::new(fragment.name.location, viewer_field_id),
            arguments: vec![],
            directives: vec![],
            selections: vec![build_fragment_spread(&fragment)],
        }))],
        fragment,
    }))
}

fn get_viewer_field_id(
    schema: &SDLSchema,
    query_type: Type,
    fragment: &FragmentDefinition,
) -> DiagnosticsResult<FieldID> {
    let viewer_type = schema.get_type(CONSTANTS.viewer_type_name);
    let viewer_field_id = schema.named_field(query_type, CONSTANTS.viewer_field_name);
    if let Some(viewer_type) = viewer_type
        && let Some(viewer_field_id) = viewer_field_id
    {
        let viewer_field = schema.field(viewer_field_id);
        if viewer_type.is_object()
            && viewer_type == viewer_field.type_.inner()
            && viewer_type == fragment.type_condition
            && viewer_field.arguments.is_empty()
        {
            return Ok(viewer_field_id);
        }
    }
    Err(vec![Diagnostic::error(
        ValidationMessage::InvalidViewerSchemaForRefetchableFragmentOnViewer {
            fragment_name: fragment.name.item,
        },
        fragment.name.location,
    )])
}

pub const VIEWER_QUERY_GENERATOR: QueryGenerator = QueryGenerator {
    description: "the Viewer type",
    build_refetch_operation,
};
