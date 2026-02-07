/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use common::Diagnostic;
use common::DiagnosticsResult;
use docblock_syntax::DocblockAST;
use fnv::FnvHashMap;
use graphql_syntax::ExecutableDefinition;
use relay_config::ProjectName;
use relay_docblock::DocblockIr;
use relay_docblock::ParseOptions;
use relay_docblock::ResolverFieldDocblockIr;
use relay_docblock::ResolverTypeDocblockIr;
use relay_docblock::parse_docblock_ast;
use rustc_hash::FxHashMap;

use crate::GraphQLAsts;
use crate::compiler_state::CompilerState;
use crate::config::Config;
use crate::config::ProjectConfig;
use crate::docblocks::parse_docblock_asts_from_sources;

#[derive(Default)]
pub struct ExtractedDocblockIr {
    pub type_irs: Vec<AllocatedDocblockIr<ResolverTypeDocblockIr>>,
    pub field_irs: Vec<AllocatedDocblockIr<ResolverFieldDocblockIr>>,
}

pub struct AllocatedDocblockIr<T> {
    pub ir: T,
    pub is_base: bool,
}

/// Extract docblock IR for this, and the base project
pub fn extract_docblock_ir(
    config: &Config,
    compiler_state: &CompilerState,
    project_config: &ProjectConfig,
    graphql_asts_map: &FnvHashMap<ProjectName, GraphQLAsts>,
) -> DiagnosticsResult<ExtractedDocblockIr> {
    let mut irs = extract_docblock_ir_for_project(
        config,
        compiler_state,
        project_config,
        graphql_asts_map,
        false,
    )?;
    if let Some(base_project_name) = &project_config.base {
        let base_project_irs = extract_docblock_ir_for_project(
            config,
            compiler_state,
            &config.projects[base_project_name],
            graphql_asts_map,
            true,
        )?;
        irs.type_irs.extend(base_project_irs.type_irs);
        irs.field_irs.extend(base_project_irs.field_irs)
    }

    Ok(irs)
}

/// Extract docblock IR for a given project. This includes types and fields extracted directly from
/// docblocks as well as those extracted from custom extractors.
fn extract_docblock_ir_for_project(
    config: &Config,
    compiler_state: &CompilerState,
    project_config: &ProjectConfig,
    graphql_asts_map: &FnvHashMap<ProjectName, GraphQLAsts>,
    is_base: bool,
) -> DiagnosticsResult<ExtractedDocblockIr> {
    let parse_options = ParseOptions {
        enable_interface_output_type: &project_config
            .feature_flags
            .relay_resolver_enable_interface_output_type,
        allow_resolver_non_nullable_return_type: &project_config
            .feature_flags
            .allow_resolver_non_nullable_return_type,
        enable_legacy_verbose_resolver_syntax: &project_config
            .feature_flags
            .enable_legacy_verbose_resolver_syntax,
    };

    let mut type_irs = vec![];
    let mut field_irs = vec![];

    let project_schema_docs = extract_schema_documents_for_resolvers(
        &project_config.name,
        compiler_state,
        graphql_asts_map,
    )?;

    if let Some(custom_extract_resolver) = &config.custom_extract_relay_resolvers {
        let graphql_asts = graphql_asts_map.get(&project_config.name);
        let (extracted_types, extracted_fields) = custom_extract_resolver(
            project_config.name,
            &project_config.typegen_config.custom_scalar_types,
            compiler_state,
            graphql_asts,
        )?;
        type_irs.extend(extracted_types);
        field_irs.extend(extracted_fields);
    }

    let mut parse_errors: Vec<Diagnostic> = vec![];

    for ast in project_schema_docs.type_asts.0 {
        match parse_docblock_ast(&project_config.name, &ast, None, &parse_options) {
            Ok(maybe_ir) => type_irs.extend(maybe_ir),
            Err(errors) => parse_errors.extend(errors),
        };
    }

    for (_, (asts, definitions)) in project_schema_docs.field_asts_and_definitions.0 {
        for ast in asts {
            match parse_docblock_ast(&project_config.name, &ast, definitions, &parse_options) {
                Ok(maybe_ir) => field_irs.extend(maybe_ir),
                Err(errors) => parse_errors.extend(errors),
            };
        }
    }

    if !parse_errors.is_empty() {
        return Err(parse_errors);
    }

    Ok(ExtractedDocblockIr {
        type_irs: type_irs
            .into_iter()
            .map(|docblock_ir| {
                let ir = expect_type_ir(docblock_ir);
                AllocatedDocblockIr { ir, is_base }
            })
            .collect(),
        field_irs: field_irs
            .into_iter()
            .map(|docblock_ir| {
                let ir = expect_field_ir(docblock_ir);
                AllocatedDocblockIr { ir, is_base }
            })
            .collect(),
    })
}

fn expect_type_ir(docblock_ir: relay_docblock::DocblockIr) -> ResolverTypeDocblockIr {
    match docblock_ir {
        DocblockIr::Type(ir) => ir,
        _ => panic!("Expected an IR that models a type"),
    }
}

fn expect_field_ir(docblock_ir: relay_docblock::DocblockIr) -> ResolverFieldDocblockIr {
    match docblock_ir {
        DocblockIr::Field(ir) => ir,
        _ => panic!("Expected an IR that models a field"),
    }
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
