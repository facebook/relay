/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

use crate::{
    location::{read_graphql_file_and_get_range, to_lsp_location_of_graphql_literal},
    lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult},
    resolution_path::{
        IdentParent, IdentPath, LinkedFieldPath, ResolutionPath, ResolvePosition, ScalarFieldPath,
        SelectionParent, TypeConditionPath,
    },
    server::GlobalState,
    FieldDefinitionSourceInfo, FieldSchemaInfo, LSPExtraDataProvider,
};
use common::NamedItem;

use graphql_ir::Program;
use intern::string_key::{Intern, StringKey};
use lsp_types::{
    request::{GotoDefinition, Request},
    GotoDefinitionResponse, Url,
};
use relay_transforms::{RELAY_RESOLVER_DIRECTIVE_NAME, RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME};
use schema::Schema;
use serde::{Deserialize, Serialize};
use std::{
    path::{Path, PathBuf},
    str,
};

fn get_goto_definition_response<'a>(
    node_path: ResolutionPath<'a>,
    project_name: StringKey,
    program: &Program,
    root_dir: &Path,
    extra_data_provider: &dyn LSPExtraDataProvider,
) -> LSPRuntimeResult<GotoDefinitionResponse> {
    match node_path {
        ResolutionPath::Ident(IdentPath {
            inner: fragment_name,
            parent: IdentParent::FragmentSpreadName(_),
        }) => {
            let fragment = program.fragment(fragment_name.value).ok_or_else(|| {
                LSPRuntimeError::UnexpectedError(format!(
                    "Could not find fragment with name {}",
                    fragment_name
                ))
            })?;

            Ok(GotoDefinitionResponse::Scalar(
                to_lsp_location_of_graphql_literal(fragment.name.location, root_dir)?,
            ))
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
            program,
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
            program,
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
            } = get_field_definition_source_info_result(provider_response)?;
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
    program: &Program,
    root_dir: &Path,
    extra_data_provider: &dyn LSPExtraDataProvider,
) -> LSPRuntimeResult<GotoDefinitionResponse> {
    let parent_type = selection_parent
        .find_parent_type(&program.schema)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let field_name_key = (&field_name as &str).intern();

    let field = program.schema.field(
        program
            .schema
            .named_field(parent_type, field_name_key)
            .ok_or_else(|| {
                LSPRuntimeError::UnexpectedError(format!(
                    "Could not find field with name {}",
                    field_name,
                ))
            })?,
    );

    // Step 1: is this field a resolver?
    if let Some(response) = get_relay_resolver_location(field, root_dir)? {
        return Ok(response);
    }

    let parent_name = program.schema.get_type_name(parent_type);
    let provider_response = extra_data_provider.resolve_field_definition(
        project_name.to_string(),
        parent_name.to_string(),
        Some(FieldSchemaInfo {
            name: field.name.item.to_string(),
            is_extension: field.is_extension,
        }),
    );

    if let Ok(Some(source_info)) = provider_response {
        // Step 2: does extra_data_provider know anything about this field?
        if source_info.is_local {
            Ok(GotoDefinitionResponse::Scalar(get_location(
                &source_info.file_path,
                source_info.line_number,
            )?))
        } else {
            Err(LSPRuntimeError::ExpectedError)
        }
    } else if let Ok((_, location)) = read_graphql_file_and_get_range(field.name.location, root_dir)
    {
        // Step 3: is field a standalone graphql file?
        Ok(GotoDefinitionResponse::Scalar(location))
    } else {
        // Give up
        Err(LSPRuntimeError::ExpectedError)
    }
}

fn get_relay_resolver_location(
    field: &schema::Field,
    root_dir: &Path,
) -> LSPRuntimeResult<Option<GotoDefinitionResponse>> {
    let maybe_resolver_directive = field.directives.named(*RELAY_RESOLVER_DIRECTIVE_NAME);

    Ok(if let Some(resolver_directive) = maybe_resolver_directive {
        let resolver_path = resolver_directive
            .arguments
            .named(*RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME)
            .and_then(|argument| argument.value.get_string_literal())
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

pub fn on_goto_definition(
    state: &impl GlobalState,
    params: <GotoDefinition as Request>::Params,
) -> LSPRuntimeResult<<GotoDefinition as Request>::Result> {
    let (document, position_span) =
        state.extract_executable_document_from_text(&params.text_document_position_params, 1)?;
    let path = document.resolve((), position_span);
    let project_name = state
        .extract_project_name_from_url(&params.text_document_position_params.text_document.uri)?;

    let goto_definition_response = get_goto_definition_response(
        path,
        project_name,
        &state.get_program(&project_name)?,
        &state.root_dir(),
        &*state.get_extra_data_provider(),
    )?;

    // For some lsp-clients, such as clients relying on org.eclipse.lsp4j,
    // (see https://javadoc.io/static/org.eclipse.lsp4j/org.eclipse.lsp4j/0.8.1/org/eclipse/lsp4j/services/TextDocumentService.html)
    // the definition response should be vector of location or locationlink.
    // Therefore, let's convert the GotoDefinitionResponse::Scalar into Vector
    if let GotoDefinitionResponse::Scalar(l) = goto_definition_response {
        return Ok(Some(GotoDefinitionResponse::Array(vec![l])));
    }

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
    const METHOD: &'static str = "relay/getSourceLocationOfTypeDefinition";
}

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
                        "Could not find field with name {}",
                        field_name
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

#[cfg(test)]
mod test {
    use std::path::PathBuf;

    use common::{SourceLocationKey, Span};
    use graphql_ir::Program;
    use graphql_syntax::{parse_executable_with_features, ParserFeatures};
    use intern::string_key::Intern;
    use lsp_types::{GotoDefinitionResponse, Location};
    use relay_test_schema::get_test_schema_with_extensions;

    use crate::{
        resolution_path::ResolvePosition, FieldDefinitionSourceInfo, FieldSchemaInfo,
        LSPExtraDataProvider,
    };

    use super::get_goto_definition_response;

    struct DummyExtraDataProvider {}

    impl LSPExtraDataProvider for DummyExtraDataProvider {
        fn fetch_query_stats(&self, _search_token: &str) -> Vec<String> {
            Vec::new()
        }

        fn resolve_field_definition(
            &self,
            _project_name: String,
            _parent_type: String,
            _field_info: Option<FieldSchemaInfo>,
        ) -> Result<Option<FieldDefinitionSourceInfo>, String> {
            Err("Not implemented".to_string())
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
        let program = Program::new(get_test_schema_with_extensions(
            r#"
        extend type User {
            greeting: String @relay_resolver(fragment_name: "resolverFragment", import_path: "path/to/resolver.js")
          }
        "#,
        ));
        let root_dir = PathBuf::from("/config/root/");
        let extra_data_provider = DummyExtraDataProvider {};

        let goto_definition_response = get_goto_definition_response(
            resolved,
            project_name,
            &program,
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
