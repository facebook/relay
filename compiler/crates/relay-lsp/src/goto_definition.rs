/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

use crate::{
    location::to_lsp_location_of_graphql_literal,
    lsp::GotoDefinitionResponse,
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    resolution_path::utils::find_selection_parent_type,
    resolution_path::{
        IdentParent, IdentPath, LinkedFieldPath, ResolutionPath, ResolvePosition, ScalarFieldPath,
        SelectionParent, TypeConditionPath,
    },
    server::LSPState,
    server::SourcePrograms,
    FieldDefinitionSourceInfo, LSPExtraDataProvider,
};
use common::{NamedItem, PerfLogger};

use graphql_syntax::ConstantValue;
use interner::{Intern, StringKey};
use lsp_types::{
    request::{GotoDefinition, Request},
    Url,
};
use relay_transforms::{RELAY_RESOLVER_DIRECTIVE_NAME, RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME};
use schema::{SDLSchema, Schema, Type};
use serde::{Deserialize, Serialize};
use std::{
    path::{Path, PathBuf},
    str,
};

fn get_goto_definition_response<'a>(
    node_path: ResolutionPath<'a>,
    project_name: StringKey,
    source_programs: &SourcePrograms,
    root_dir: &Path,
    extra_data_provider: &(dyn LSPExtraDataProvider + 'static),
) -> LSPRuntimeResult<GotoDefinitionResponse> {
    match node_path {
        ResolutionPath::Ident(IdentPath {
            inner: fragment_name,
            parent: IdentParent::FragmentSpreadName(_),
        }) => {
            if let Some(source_program) = source_programs.get(&project_name) {
                let fragment = source_program
                    .fragment(fragment_name.value)
                    .ok_or_else(|| {
                        LSPRuntimeError::UnexpectedError(format!(
                            "Could not find fragment with name {}",
                            fragment_name
                        ))
                    })?;

                Ok(GotoDefinitionResponse::Scalar(
                    to_lsp_location_of_graphql_literal(fragment.name.location, root_dir)?,
                ))
            } else {
                Err(LSPRuntimeError::UnexpectedError(format!(
                    "Project name {} not found",
                    project_name
                )))
            }
        }
        ResolutionPath::Ident(IdentPath {
            inner: field_name,
            parent:
                IdentParent::LinkedFieldName(LinkedFieldPath {
                    inner: _,
                    parent: selection_path,
                }),
        }) => resolve_field(
            field_name.value.to_string(),
            selection_path.parent,
            project_name,
            source_programs,
            root_dir,
            extra_data_provider,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: field_name,
            parent:
                IdentParent::ScalarFieldName(ScalarFieldPath {
                    inner: _,
                    parent: selection_path,
                }),
        }) => resolve_field(
            field_name.value.to_string(),
            selection_path.parent,
            project_name,
            source_programs,
            root_dir,
            extra_data_provider,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::TypeConditionType(TypeConditionPath {
                    inner: type_condition,
                    parent: _,
                }),
        }) => {
            let provider_response = extra_data_provider.resolve_field_definition(
                project_name.to_string(),
                type_condition.type_.value.to_string(),
                None,
            );
            let FieldDefinitionSourceInfo {
                file_path,
                line_number,
                is_local,
            } = provider_response.map_err(|e| -> LSPRuntimeError {
                LSPRuntimeError::UnexpectedError(format!(
                    "Error resolving field definition location: {}",
                    e
                ))
            })?;
            if is_local {
                Ok(GotoDefinitionResponse::Scalar(get_location(
                    &file_path,
                    line_number,
                )?))
            } else {
                Err(LSPRuntimeError::ExpectedError)
            }
        }
        _ => Err(LSPRuntimeError::ExpectedError),
    }
}

fn resolve_field<'a>(
    field_name: String,
    selection_parent: SelectionParent<'a>,
    project_name: StringKey,
    source_programs: &SourcePrograms,
    root_dir: &Path,
    extra_data_provider: &(dyn LSPExtraDataProvider + 'static),
) -> LSPRuntimeResult<GotoDefinitionResponse> {
    let source_program = source_programs.get(&project_name).ok_or_else(|| {
        LSPRuntimeError::UnexpectedError(format!("Project name {} not found", project_name))
    })?;

    let parent_type = find_selection_parent_type(selection_parent, &source_program.schema)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let field_name_key = field_name.intern();

    if let Some(response) = get_relay_resolver_location(
        &source_program.schema,
        parent_type,
        field_name_key,
        root_dir,
    )? {
        return Ok(response);
    }


    let parent_name = source_program.schema.get_type_name(parent_type);

    let provider_response = extra_data_provider.resolve_field_definition(
        project_name.to_string(),
        parent_name.to_string(),
        Some(field_name_key.to_string()),
    );
    let FieldDefinitionSourceInfo {
        file_path,
        line_number,
        is_local,
    } = provider_response.map_err(|e| -> LSPRuntimeError {
        LSPRuntimeError::UnexpectedError(format!(
            "Error resolving field definition location: {}",
            e
        ))
    })?;
    if is_local {
        Ok(GotoDefinitionResponse::Scalar(get_location(
            &file_path,
            line_number,
        )?))
    } else {
        Err(LSPRuntimeError::ExpectedError)
    }
}

fn get_relay_resolver_location(
    schema: &SDLSchema,
    parent_type: Type,
    field_name: StringKey,
    root_dir: &Path,
) -> LSPRuntimeResult<Option<GotoDefinitionResponse>> {
    let maybe_resolver_directive =
        schema
            .named_field(parent_type, field_name)
            .and_then(|field_id| {
                schema
                    .field(field_id)
                    .directives
                    .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
            });

    Ok(if let Some(resolver_directive) = maybe_resolver_directive {
        let resolver_path = resolver_directive
            .arguments
            .named(*RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME)
            .and_then(|argument| match &argument.value {
                ConstantValue::String(import_path) => Some(import_path.value),
                _ => None,
            })
            .ok_or_else(|| {
                LSPRuntimeError::UnexpectedError(
                "Error resolving field definition location. Malformed schema for Relay Resolver."
                    .to_string(),
            )
            })?;

        let absolute_resolver_path = root_dir.join(PathBuf::from(resolver_path.lookup()));
        Some(GotoDefinitionResponse::Scalar(get_location(
            &absolute_resolver_path.to_string_lossy(),
            0,
        )?))
    } else {
        None
    })
}

pub(crate) fn on_goto_definition<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: <GotoDefinition as Request>::Params,
) -> LSPRuntimeResult<<GotoDefinition as Request>::Result> {
    let (document, position_span, project_name) =
        state.extract_executable_document_from_text(&params.text_document_position_params, 1)?;
    let path = document.resolve((), position_span);

    let goto_definition_response = get_goto_definition_response(
        path,
        project_name,
        state.get_source_programs_ref(),
        state.root_dir(),
        state.extra_data_provider.as_ref(),
    )?;

    Ok(Some(goto_definition_response))
}

fn get_location(path: &str, line: u64) -> Result<lsp_types::Location, LSPRuntimeError> {
    let start = lsp_types::Position {
        line: line as u32,
        character: 0,
    };
    let range = lsp_types::Range { start, end: start };

    let uri = Url::parse(&format!("file://{}", path)).map_err(|e| {
        LSPRuntimeError::UnexpectedError(format!("Could not parse path as URL: {}", e))
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
    const METHOD: &'static str = "$/getSourceLocationOfTypeDefinition";
}

pub(crate) fn on_get_source_location_of_type_definition<TPerfLogger: PerfLogger + 'static>(
    state: &mut LSPState<TPerfLogger>,
    params: <GetSourceLocationOfTypeDefinition as Request>::Params,
) -> LSPRuntimeResult<<GetSourceLocationOfTypeDefinition as Request>::Result> {
    let field_definition_source_info = state
        .extra_data_provider
        .resolve_field_definition(params.schema_name, params.type_name, params.field_name)
        .map_err(LSPRuntimeError::UnexpectedError)?;
    Ok(GetSourceLocationOfTypeDefinitionResult {
        field_definition_source_info,
    })
}

#[cfg(test)]
mod test {
    use std::{path::PathBuf, sync::Arc};

    use common::{SourceLocationKey, Span};
    use dashmap::DashMap;
    use fnv::FnvBuildHasher;
    use graphql_ir::Program;
    use graphql_syntax::{parse_executable_with_features, ParserFeatures};
    use interner::Intern;
    use lsp_types::{GotoDefinitionResponse, Location};
    use relay_test_schema::get_test_schema_with_extensions;
    use schema_documentation::SchemaDocumentation;

    use crate::{
        resolution_path::ResolvePosition, server::SourcePrograms, FieldDefinitionSourceInfo,
        LSPExtraDataProvider,
    };

    use super::get_goto_definition_response;

    struct DummyExtraDataProvider {}

    impl LSPExtraDataProvider for DummyExtraDataProvider {
        fn fetch_query_stats(&self, _search_token: String) -> Vec<String> {
            Vec::new()
        }

        fn resolve_field_definition(
            &self,
            _project_name: String,
            _parent_type: String,
            _field_name: Option<String>,
        ) -> Result<FieldDefinitionSourceInfo, String> {
            Err("Not implemented".to_string())
        }

        fn get_schema_documentation(
            &self,
            _schema_name: &str,
        ) -> Arc<schema_documentation::SchemaDocumentation> {
            Arc::new(SchemaDocumentation::default())
        }
    }

    #[test]
    fn resolver_field() {
        let source = r#"
    query Foo {
        me {
            greeting
        }
    }
"#;
        let sub_str = "greeting";
        let document = parse_executable_with_features(
            source,
            SourceLocationKey::standalone("/test/file"),
            ParserFeatures {
                enable_variable_definitions: true,
            },
        )
        .unwrap();

        let pos = source.find(sub_str).unwrap() as u32;

        // Select the `uri` field
        let position_span = Span {
            start: pos,
            end: pos,
        };

        let resolved = document.resolve((), position_span);

        let project_name = "test".intern();
        let program_map = DashMap::with_hasher(FnvBuildHasher::default());
        let program = Program::new(get_test_schema_with_extensions(
            r#"
        extend type User {
            greeting: String @relay_resolver(fragment_name: "resolverFragment", import_path: "path/to/resolver.js")
          }
        "#,
        ));
        program_map.insert(project_name, program);
        let programs: SourcePrograms = Arc::new(program_map);
        let root_dir = PathBuf::from("/config/root/");
        let extra_data_provider = DummyExtraDataProvider {};


        let goto_definition_response = get_goto_definition_response(
            resolved,
            project_name,
            &programs,
            &root_dir,
            &extra_data_provider,
        );

        let uri = match goto_definition_response {
            Ok(GotoDefinitionResponse::Scalar(Location { uri, .. })) => uri.path().to_string(),
            _ => panic!("Invalid go to definition response."),
        };



        assert_eq!(uri, "/config/root/path/to/resolver.js");
    }
}
