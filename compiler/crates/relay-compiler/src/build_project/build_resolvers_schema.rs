/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod mark_document_as_base;

use std::path::PathBuf;

use common::DiagnosticsResult;
use docblock_syntax::DocblockAST;
use errors::try_all;
use fnv::FnvHashMap;
use graphql_syntax::ExecutableDefinition;
use relay_config::ProjectName;
use relay_docblock::extend_schema_with_resolver_type_system_definition;
use relay_docblock::DocblockIr;
use rustc_hash::FxHashMap;
use schema::SDLSchema;

use self::mark_document_as_base::mark_extension_as_base;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::config::ProjectConfig;
use crate::docblocks::build_schema_documents_from_docblocks;
use crate::docblocks::parse_docblock_asts_from_sources;
use crate::GraphQLAsts;

pub(crate) fn extend_schema_with_resolvers(
    schema: &mut SDLSchema,
    config: &Config,
    compiler_state: &CompilerState,
    project_config: &ProjectConfig,
    graphql_asts_map: &FnvHashMap<ProjectName, GraphQLAsts>,
) -> DiagnosticsResult<()> {
    // Get resolver types/fields for main project
    let ResolverSchemaDocuments {
        type_asts,
        field_asts_and_definitions,
    } = extract_schema_documents_for_resolvers(
        &project_config.name,
        compiler_state,
        graphql_asts_map,
    )?;

    let (types_ir, fields_ir) = {
        match &config.custom_extract_relay_resolvers {
            Some(custom_extract_relay_resolvers) => custom_extract_relay_resolvers(
                project_config.name,
                compiler_state,
                &field_asts_and_definitions.0,
            )?,
            None => (vec![], vec![]),
        }
    };

    extend_schema_with_types(schema, project_config, type_asts, types_ir, false)?;
    extend_schema_with_fields(
        schema,
        project_config,
        field_asts_and_definitions,
        fields_ir,
        false,
    )?;

    if let Some(base_project_name) = project_config.base {
        // We also need to extend the schema with resolvers from base project.
        // But we need to mark them with special directive, so we do not
        // add any new documents (query/fragment) for them,
        // when calling `apply_transform`.
        let ResolverSchemaDocuments {
            type_asts,
            field_asts_and_definitions,
        } = extract_schema_documents_for_resolvers(
            &base_project_name,
            compiler_state,
            graphql_asts_map,
        )?;

        let (types_ir, fields_ir) = {
            match &config.custom_extract_relay_resolvers {
                Some(custom_extract_relay_resolvers) => custom_extract_relay_resolvers(
                    base_project_name,
                    compiler_state,
                    &field_asts_and_definitions.0,
                )?,
                None => (vec![], vec![]),
            }
        };

        extend_schema_with_types(schema, project_config, type_asts, types_ir, true)?;
        extend_schema_with_fields(
            schema,
            project_config,
            field_asts_and_definitions,
            fields_ir,
            true,
        )?;
    }

    Ok(())
}

fn extend_schema_with_types(
    schema: &mut SDLSchema,
    project_config: &ProjectConfig,
    type_asts: TypeAsts,
    types_ir: Vec<DocblockIr>,
    is_base_project: bool,
) -> DiagnosticsResult<()> {
    let type_definitions =
        build_schema_documents_from_docblocks(&type_asts.0, project_config, schema, None)?;

    let new_type_defintions = try_all(types_ir.into_iter().map(|ir| {
        ir.to_graphql_schema_ast(project_config.name, schema, &project_config.schema_config)
    }))?;

    for schema_document in type_definitions
        .into_iter()
        .chain(new_type_defintions.into_iter())
    {
        for definition in schema_document.definitions {
            extend_schema_with_resolver_type_system_definition(
                if is_base_project {
                    mark_extension_as_base(definition)
                } else {
                    definition
                },
                schema,
                schema_document.location,
            )?;
        }
    }
    Ok(())
}

/// Extend the schema with resolver fields
fn extend_schema_with_fields(
    schema: &mut SDLSchema,
    project_config: &ProjectConfig,
    field_asts_and_definitions: FieldAstsAndDefinitions<'_>,
    fields_ir: Vec<DocblockIr>,
    is_base_project: bool,
) -> DiagnosticsResult<()> {
    let field_definitions = try_all(field_asts_and_definitions.0.into_iter().map(
        |(_, (asts, definitions))| {
            build_schema_documents_from_docblocks(&asts, project_config, schema, definitions)
        },
    ))?;

    let new_field_defintions = try_all(fields_ir.into_iter().map(|ir| {
        ir.to_graphql_schema_ast(project_config.name, schema, &project_config.schema_config)
    }))?;

    try_all(
        field_definitions
            .into_iter()
            .flatten()
            .chain(new_field_defintions.into_iter())
            .map::<DiagnosticsResult<()>, _>(|schema_document| {
                for definition in schema_document.definitions {
                    extend_schema_with_resolver_type_system_definition(
                        if is_base_project {
                            mark_extension_as_base(definition)
                        } else {
                            definition
                        },
                        schema,
                        schema_document.location,
                    )?;
                }
                Ok(())
            }),
    )?;

    Ok(())
}

struct ResolverSchemaDocuments<'a> {
    type_asts: TypeAsts,
    field_asts_and_definitions: FieldAstsAndDefinitions<'a>,
}
struct TypeAsts(Vec<DocblockAST>);
struct FieldAstsAndDefinitions<'a>(
    FxHashMap<&'a PathBuf, (Vec<DocblockAST>, Option<&'a Vec<ExecutableDefinition>>)>,
);

fn extract_schema_documents_for_resolvers<'a>(
    project_name: &'a ProjectName,
    compiler_state: &'a CompilerState,
    graphql_asts_map: &'a FnvHashMap<ProjectName, GraphQLAsts>,
) -> DiagnosticsResult<ResolverSchemaDocuments<'a>> {
    let docblock_ast_sources = (
        compiler_state.docblocks.get(project_name),
        graphql_asts_map.get(project_name),
    );
    let mut errors = vec![];
    let mut type_asts = vec![];
    let mut field_asts_and_definitions = FxHashMap::default();

    if let (Some(docblocks), Some(graphql_asts)) = docblock_ast_sources {
        for (file_path, docblock_sources) in docblocks.get_all() {
            match parse_docblock_asts_from_sources(file_path, docblock_sources) {
                Ok(result) => {
                    // Type resolvers should not rely on any fragments
                    // @rootFragment is not supported for them, so
                    // we don't need to extract any fragments from the `file_path`
                    type_asts.extend(result.types);

                    // But for fields, we may need to validate the correctness
                    // of the @rootFragment.
                    // And here we're reading GraphQL asts for the file,
                    // and keeping them together with Docblock ASTs
                    if !result.fields.is_empty() {
                        field_asts_and_definitions.insert(
                            file_path,
                            (
                                result.fields,
                                graphql_asts.get_executable_definitions_for_file(file_path),
                            ),
                        );
                    }
                }
                Err(err) => errors.extend(err),
            }
        }
    } else {
        panic!("Expected to have access to AST and docblock sources.");
    }

    if errors.is_empty() {
        Ok(ResolverSchemaDocuments {
            type_asts: TypeAsts(type_asts),
            field_asts_and_definitions: FieldAstsAndDefinitions(field_asts_and_definitions),
        })
    } else {
        Err(errors)
    }
}
