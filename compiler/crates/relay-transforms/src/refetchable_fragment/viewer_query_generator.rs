/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{
    build_fragment_metadata_as_directive, build_fragment_spread,
    build_operation_variable_definitions, build_used_global_variables,
    validation_message::ValidationMessage, QueryGenerator, RefetchRoot, RefetchableMetadata,
    CONSTANTS,
};
use crate::root_variables::VariableMap;
use common::{Diagnostic, DiagnosticsResult, WithLocation};
use graphql_ir::{FragmentDefinition, LinkedField, Selection};
use intern::string_key::StringKey;
use relay_config::SchemaConfig;
use schema::{FieldID, SDLSchema, Schema, Type};
use std::sync::Arc;

fn build_refetch_operation(
    schema: &SDLSchema,
    _schema_config: &SchemaConfig,
    fragment: &Arc<FragmentDefinition>,
    query_name: StringKey,
    variables_map: &VariableMap,
) -> DiagnosticsResult<Option<RefetchRoot>> {
    let query_type = schema.query_type().unwrap();
    let viewer_field_id = get_viewer_field_id(schema, query_type, fragment)?;

    let fragment = Arc::new(FragmentDefinition {
        directives: build_fragment_metadata_as_directive(
            fragment,
            RefetchableMetadata {
                operation_name: query_name,
                path: vec![CONSTANTS.viewer_field_name],
                identifier_field: None,
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
    let viewer_field_id = schema.named_field(query_type, CONSTANTS.viewer_field_name);
    if let Some(viewer_field_id) = viewer_field_id {
        let viewer_field = schema.field(viewer_field_id);
        if viewer_field.type_.inner().is_object() && !viewer_field.type_.is_list()
            && viewer_field.type_.inner() == fragment.type_condition
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
    description: "the 'viewer:' field's type",
    build_refetch_operation,
};
