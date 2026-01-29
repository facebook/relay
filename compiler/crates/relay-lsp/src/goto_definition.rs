/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

mod goto_docblock_definition;
mod goto_graphql_definition;
use std::str;
use std::sync::Arc;

use common::ArgumentName;
use common::DirectiveName;
use graphql_ir::FragmentDefinitionName;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use log::error;
use log::info;
use lsp_types::GotoDefinitionResponse;
use lsp_types::Url;
use lsp_types::request::GotoDefinition;
use lsp_types::request::Request;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use serde::Deserialize;
use serde::Serialize;

use self::goto_docblock_definition::get_docblock_definition_description;
use self::goto_graphql_definition::get_graphql_definition_description;
use self::goto_graphql_definition::get_graphql_schema_definition_description;
use crate::FieldDefinitionSourceInfo;
use crate::FieldSchemaInfo;
use crate::LSPExtraDataProvider;
use crate::location::transform_relay_location_on_disk_to_lsp_location;
use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::server::GlobalState;

/// A concrete description of a GraphQL definition that a user would like to goto.
pub enum DefinitionDescription {
    Field {
        parent_type: Type,
        field_name: StringKey,
    },
    FieldArgument {
        parent_type: Type,
        field_name: StringKey,
        argument_name: ArgumentName,
    },
    DirectiveArgument {
        directive_name: DirectiveName,
        argument_name: ArgumentName,
    },
    Fragment {
        fragment_name: FragmentDefinitionName,
    },
    Type {
        type_name: StringKey,
    },
    Directive {
        directive_name: DirectiveName,
    },
}

/// Resolve a GotoDefinitionRequest to a GotoDefinitionResponse
pub fn on_goto_definition(
    state: &impl GlobalState,
    params: <GotoDefinition as Request>::Params,
) -> LSPRuntimeResult<<GotoDefinition as Request>::Result> {
    let (feature, location) =
        state.extract_feature_from_text(&params.text_document_position_params, 1)?;

    let project_name = state
        .extract_project_name_from_url(&params.text_document_position_params.text_document.uri)?;
    let schema = state.get_schema(&project_name)?;
    let program = state.get_program(&project_name)?;
    let position_span = location.span();

    let definition_description = match feature {
        crate::Feature::ExecutableDocument(document) => {
            get_graphql_definition_description(document, position_span, &schema)?
        }
        crate::Feature::DocblockIr(docblock_ir) => {
            get_docblock_definition_description(&docblock_ir, position_span)?
        }
        crate::Feature::SchemaDocument(document) => {
            get_graphql_schema_definition_description(document, position_span)?
        }
    };

    let extra_data_provider = state.get_extra_data_provider();
    let root_dir = state.root_dir();

    let goto_definition_response: GotoDefinitionResponse = match definition_description {
        DefinitionDescription::FieldArgument {
            parent_type,
            field_name,
            argument_name,
        } => locate_field_argument_definition(
            &schema,
            parent_type,
            field_name,
            argument_name,
            &root_dir,
        )?,
        DefinitionDescription::DirectiveArgument {
            directive_name,
            argument_name,
        } => {
            locate_directive_argument_definition(&schema, directive_name, argument_name, &root_dir)?
        }
        DefinitionDescription::Field {
            parent_type,
            field_name,
        } => locate_field_definition(
            &schema,
            parent_type,
            field_name,
            extra_data_provider,
            project_name,
            &root_dir,
        )?,
        DefinitionDescription::Fragment { fragment_name } => {
            locate_fragment_definition(program, fragment_name, &root_dir)?
        }
        DefinitionDescription::Type { type_name } => locate_type_definition(
            extra_data_provider,
            project_name,
            type_name,
            &schema,
            &root_dir,
        )?,
        DefinitionDescription::Directive { directive_name } => {
            locate_directive_definition(directive_name, &schema, &root_dir)?
        }
    };

    // For some lsp-clients, such as clients relying on org.eclipse.lsp4j,
    // (see https://javadoc.io/static/org.eclipse.lsp4j/org.eclipse.lsp4j/0.8.1/org/eclipse/lsp4j/services/TextDocumentService.html)
    // the definition response should be vector of location or locationlink.
    // Therefore, let's convert the GotoDefinitionResponse::Scalar into Vector
    if let GotoDefinitionResponse::Scalar(l) = goto_definition_response {
        return Ok(Some(GotoDefinitionResponse::Array(vec![l])));
    }

    Ok(Some(goto_definition_response))
}

fn locate_fragment_definition(
    program: graphql_ir::Program,
    fragment_name: FragmentDefinitionName,
    root_dir: &std::path::Path,
) -> Result<GotoDefinitionResponse, LSPRuntimeError> {
    let fragment = program.fragment(fragment_name).ok_or_else(|| {
        LSPRuntimeError::UnexpectedError(format!(
            "Could not find fragment with name {fragment_name}"
        ))
    })?;
    Ok(GotoDefinitionResponse::Scalar(
        transform_relay_location_on_disk_to_lsp_location(root_dir, fragment.name.location)?,
    ))
}

fn locate_directive_definition(
    directive_name: DirectiveName,
    schema: &Arc<SDLSchema>,
    root_dir: &std::path::Path,
) -> Result<GotoDefinitionResponse, LSPRuntimeError> {
    let directive = schema.get_directive(directive_name);

    directive
        .map(|directive| directive.name.location)
        .map(|schema_location| {
            transform_relay_location_on_disk_to_lsp_location(root_dir, schema_location)
                .map(GotoDefinitionResponse::Scalar)
        })
        .ok_or(LSPRuntimeError::ExpectedError)?
}

fn locate_type_definition(
    extra_data_provider: &dyn LSPExtraDataProvider,
    project_name: StringKey,
    type_name: StringKey,
    schema: &Arc<SDLSchema>,
    root_dir: &std::path::Path,
) -> Result<GotoDefinitionResponse, LSPRuntimeError> {
    let provider_response = extra_data_provider.resolve_field_definition(
        project_name.to_string(),
        type_name.to_string(),
        None,
    );

    let field_definition_source_info = get_field_definition_source_info_result(provider_response);

    match field_definition_source_info {
        Ok(source_info) => Ok(if source_info.is_local {
            GotoDefinitionResponse::Scalar(get_location(
                &source_info.file_path,
                source_info.line_number,
                source_info.column_number,
            )?)
        } else {
            return Err(LSPRuntimeError::ExpectedError);
        }),
        // If we couldn't resolve through the extra data provider, we'll fallback to
        // try to find a location in the server sdl.
        Err(err) => {
            error!(
                "Failed to resolve type definition through extra data provider. Falling back to schema file. Got error: {err:?}"
            );
            let type_ = schema.get_type(type_name);

            type_
                .map(|type_| match type_ {
                    Type::InputObject(input_object_id) => {
                        schema.input_object(input_object_id).name.location
                    }
                    Type::Enum(enum_id) => schema.enum_(enum_id).name.location,
                    Type::Interface(interface_id) => schema.interface(interface_id).name.location,
                    Type::Scalar(scalar_id) => schema.scalar(scalar_id).name.location,
                    Type::Union(union_id) => schema.union(union_id).name.location,
                    Type::Object(object_id) => schema.object(object_id).name.location,
                })
                .map(|schema_location| {
                    transform_relay_location_on_disk_to_lsp_location(root_dir, schema_location)
                        .map(GotoDefinitionResponse::Scalar)
                })
                .ok_or(LSPRuntimeError::ExpectedError)?
        }
    }
}

fn locate_field_argument_definition(
    schema: &Arc<SDLSchema>,
    parent_type: Type,
    field_name: StringKey,
    argument_name: ArgumentName,
    root_dir: &std::path::Path,
) -> Result<GotoDefinitionResponse, LSPRuntimeError> {
    let field = schema.field(schema.named_field(parent_type, field_name).ok_or_else(|| {
        LSPRuntimeError::UnexpectedError(format!("Could not find field with name {field_name}"))
    })?);

    let argument = field
        .arguments
        .iter()
        .find(|argument| argument.name.item == argument_name)
        .ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!(
                "Could not find argument with name {argument_name} on field with name {field_name}",
            ))
        })?;

    transform_relay_location_on_disk_to_lsp_location(root_dir, argument.name.location)
        .map(|location| Ok(GotoDefinitionResponse::Scalar(location)))?
}

fn locate_directive_argument_definition(
    schema: &SDLSchema,
    directive_name: DirectiveName,
    argument_name: ArgumentName,
    root_dir: &std::path::Path,
) -> LSPRuntimeResult<GotoDefinitionResponse> {
    let directive =
        schema
            .get_directive(directive_name)
            .ok_or(LSPRuntimeError::UnexpectedError(format!(
                "Could not find directive with name {directive_name}"
            )))?;

    let argument = directive
        .arguments
        .iter()
        .find(|argument| argument.name.item == argument_name)
        .ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!(
                "Could not find argument with name {argument_name} on directive with name {directive_name}",
            ))
        })?;

    transform_relay_location_on_disk_to_lsp_location(root_dir, argument.name.location)
        .map(|location| Ok(GotoDefinitionResponse::Scalar(location)))?
}

fn locate_field_definition(
    schema: &Arc<SDLSchema>,
    parent_type: Type,
    field_name: StringKey,
    extra_data_provider: &dyn LSPExtraDataProvider,
    project_name: StringKey,
    root_dir: &std::path::Path,
) -> Result<GotoDefinitionResponse, LSPRuntimeError> {
    let field = schema.field(schema.named_field(parent_type, field_name).ok_or_else(|| {
        LSPRuntimeError::UnexpectedError(format!("Could not find field with name {field_name}",))
    })?);
    let parent_type = schema.get_type_name(parent_type);
    let provider_response = extra_data_provider.resolve_field_definition(
        project_name.to_string(),
        parent_type.to_string(),
        Some(FieldSchemaInfo {
            name: field_name.to_string(),
            is_extension: field.is_extension,
        }),
    );

    match provider_response {
        Ok(Some(source_info)) => {
            // Step 1: does extra_data_provider know anything about this field?
            if source_info.is_local {
                return Ok(GotoDefinitionResponse::Scalar(get_location(
                    &source_info.file_path,
                    source_info.line_number,
                    source_info.column_number,
                )?));
            } else {
                error!(
                    "Expected local source info from extra data provider, but got non-local. Falling back to schema file.",
                );
            }
        }
        Ok(None) => {
            info!(
                "Extra data provider did not have any information about this field. Falling back to schema file."
            );
        }
        // Step 2: is field a standalone graphql file?
        Err(err) => {
            error!(
                "Failed to resolve field definition through extra data provider. Falling back to schema file. Got error: {err:?}"
            );
        }
    }

    transform_relay_location_on_disk_to_lsp_location(root_dir, field.name.location)
        .map(GotoDefinitionResponse::Scalar)
        // If the field does not exist in the schema, that's fine
        .map_err(|_| LSPRuntimeError::ExpectedError)
}

fn get_location(
    path: &str,
    line: u64,
    column: u64,
) -> Result<lsp_types::Location, LSPRuntimeError> {
    let start = lsp_types::Position {
        line: line as u32,
        character: column as u32,
    };
    let range = lsp_types::Range { start, end: start };

    let uri = Url::parse(&format!("file://{path}")).map_err(|e| {
        LSPRuntimeError::UnexpectedError(format!("Could not parse path as URL: {e}"))
    })?;

    Ok(lsp_types::Location { uri, range })
}

pub(crate) enum GetSourceLocationOfTypeDefinition {}

#[derive(Deserialize, Serialize)]
pub(crate) struct GetSourceLocationOfTypeDefinitionParams {
    type_name: String,
    field_name: Option<String>,
    schema_name: String,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct GetSourceLocationOfTypeDefinitionResult {
    field_definition_source_info: FieldDefinitionSourceInfo,
}

impl Request for GetSourceLocationOfTypeDefinition {
    type Params = GetSourceLocationOfTypeDefinitionParams;
    type Result = GetSourceLocationOfTypeDefinitionResult;
    const METHOD: &'static str = "relay/getSourceLocationOfTypeDefinition";
}

// Specific to schema explorer.
pub(crate) fn on_get_source_location_of_type_definition(
    state: &impl GlobalState,
    params: <GetSourceLocationOfTypeDefinition as Request>::Params,
) -> LSPRuntimeResult<<GetSourceLocationOfTypeDefinition as Request>::Result> {
    let schema = state.get_schema(&(&params.schema_name as &str).intern())?;

    let type_ = schema
        .get_type((&params.type_name as &str).intern())
        .ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!(
                "Could not find type with name {}",
                &params.type_name
            ))
        })?;

    let field_info = params
        .field_name
        .map(|field_name| {
            schema
                .named_field(type_, (&field_name as &str).intern())
                .ok_or_else(|| {
                    LSPRuntimeError::UnexpectedError(format!(
                        "Could not find field with name {field_name}"
                    ))
                })
        })
        .transpose()?
        .map(|field_id| {
            let field = schema.field(field_id);
            FieldSchemaInfo {
                name: field.name.item.to_string(),
                is_extension: field.is_extension,
            }
        });

    // TODO add go-to-definition for client fields
    let field_definition_source_info = get_field_definition_source_info_result(
        state.get_extra_data_provider().resolve_field_definition(
            params.schema_name,
            params.type_name,
            field_info,
        ),
    )?;

    Ok(GetSourceLocationOfTypeDefinitionResult {
        field_definition_source_info,
    })
}

fn get_field_definition_source_info_result(
    result: Result<Option<FieldDefinitionSourceInfo>, String>,
) -> LSPRuntimeResult<FieldDefinitionSourceInfo> {
    result
        .map_err(LSPRuntimeError::UnexpectedError)?
        .ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(
                "Expected result when resolving field definition location".to_string(),
            )
        })
}
