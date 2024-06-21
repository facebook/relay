/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticsResult;
use docblock_syntax::DocblockAST;
use fnv::FnvHashMap;
use graphql_syntax::ExecutableDefinition;
use relay_docblock::extend_schema_with_resolver_type_system_definition;
use schema::SDLSchema;

use crate::compiler_state::CompilerState;
use crate::compiler_state::ProjectName;
use crate::config::ProjectConfig;
use crate::docblocks::build_schema_documents_from_docblocks;
use crate::docblocks::parse_docblock_asts_from_sources;
use crate::GraphQLAsts;

pub(crate) fn extend_schema_with_resolvers(
    schema: &mut SDLSchema,
    compiler_state: &CompilerState,
    project_config: &ProjectConfig,
    graphql_asts_map: &FnvHashMap<ProjectName, GraphQLAsts>,
) -> DiagnosticsResult<()> {
    let ResolverSchemaDocuments {
        type_asts,
        field_asts_and_definitions,
    } = extract_schema_documents_for_resolvers(compiler_state, project_config, graphql_asts_map)?;

    extend_schema_with_types(schema, project_config, type_asts)?;
    extend_schema_with_fields(schema, project_config, field_asts_and_definitions)?;

    Ok(())
}

fn extend_schema_with_types(
    schema: &mut SDLSchema,
    project_config: &ProjectConfig,
    type_asts: TypeAsts,
) -> DiagnosticsResult<()> {
    let type_definitions =
        build_schema_documents_from_docblocks(&type_asts.0, project_config, schema, None)?;

    for schema_document in type_definitions {
        for definition in schema_document.definitions {
            extend_schema_with_resolver_type_system_definition(
                definition,
                schema,
                schema_document.location,
            )?;
        }
    }

    Ok(())
}

fn extend_schema_with_fields<'a>(
    schema: &mut SDLSchema,
    project_config: &ProjectConfig,
    field_asts_and_definitions: FieldAstsAndDefinitions<'a>,
) -> DiagnosticsResult<()> {
    let mut field_definitions = vec![];
    for (asts, definitions) in field_asts_and_definitions.0 {
        field_definitions.extend(build_schema_documents_from_docblocks(
            &asts,
            project_config,
            schema,
            definitions,
        )?);
    }

    for schema_document in field_definitions {
        for definition in schema_document.definitions {
            extend_schema_with_resolver_type_system_definition(
                definition,
                schema,
                schema_document.location,
            )?;
        }
    }

    Ok(())
}

struct ResolverSchemaDocuments<'a> {
    type_asts: TypeAsts,
    field_asts_and_definitions: FieldAstsAndDefinitions<'a>,
}
struct TypeAsts(Vec<DocblockAST>);
struct FieldAstsAndDefinitions<'a>(Vec<(Vec<DocblockAST>, Option<&'a Vec<ExecutableDefinition>>)>);

fn extract_schema_documents_for_resolvers<'a>(
    compiler_state: &'a CompilerState,
    project_config: &'a ProjectConfig,
    graphql_asts_map: &'a FnvHashMap<ProjectName, GraphQLAsts>,
) -> DiagnosticsResult<ResolverSchemaDocuments<'a>> {
    let mut projects = vec![project_config.name];
    projects.extend(project_config.base);

    let docblock_ast_sources = projects.iter().map(|project_name| {
        (
            compiler_state.docblocks.get(project_name),
            graphql_asts_map.get(project_name),
        )
    });

    let mut errors = vec![];
    let mut type_asts = vec![];
    let mut field_asts_and_definitions = vec![];

    for docblock_ast in docblock_ast_sources {
        if let (Some(docblocks), Some(graphql_asts)) = docblock_ast {
            for (file_path, docblock_sources) in &docblocks.get_all() {
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
                            field_asts_and_definitions.push((
                                result.fields,
                                graphql_asts.get_executable_definitions_for_file(file_path),
                            ));
                        }
                    }
                    Err(err) => errors.extend(err),
                }
            }
        } else {
            panic!("Expected to have access to AST and docblock sources.");
        }
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
