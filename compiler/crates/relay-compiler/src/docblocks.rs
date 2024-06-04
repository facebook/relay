/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;

use common::DiagnosticsResult;
use common::FeatureFlag;
use common::SourceLocationKey;
use docblock_syntax::parse_docblock;
use docblock_syntax::DocblockAST;
use errors::try_all;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::SchemaDocument;
use relay_config::ProjectConfig;
use relay_docblock::parse_docblock_ast;
use relay_docblock::resolver_maybe_defining_type;
use relay_docblock::ParseOptions;
use schema::SDLSchema;

use crate::file_source::LocatedDocblockSource;
pub struct DocblockASTs {
    pub types: Vec<DocblockAST>,
    pub fields: Vec<DocblockAST>,
}

pub fn parse_docblock_asts_from_sources(
    file_path: &Path,
    docblock_sources: &[LocatedDocblockSource],
) -> DiagnosticsResult<DocblockASTs> {
    let (types, fields) = try_all(
        docblock_sources
            .iter()
            .map(|docblock_source| parse_source_to_ast(file_path, docblock_source)),
    )?
    .into_iter()
    .partition(resolver_maybe_defining_type);

    Ok(DocblockASTs { types, fields })
}

pub fn build_schema_documents_from_docblocks(
    docblocks: &[DocblockAST],
    project_config: &ProjectConfig,
    schema: &SDLSchema,
    definitions: Option<&Vec<ExecutableDefinition>>,
) -> DiagnosticsResult<Vec<SchemaDocument>> {
    try_all(docblocks.iter().filter_map(|ast: &DocblockAST| {
        parse_source(ast, project_config, schema, definitions).transpose()
    }))
}

fn parse_source_to_ast(
    file_path: &Path,
    docblock_source: &LocatedDocblockSource,
) -> DiagnosticsResult<DocblockAST> {
    let source_location =
        SourceLocationKey::embedded(file_path.to_str().unwrap(), docblock_source.index);

    parse_docblock(
        &docblock_source.docblock_source.text_source().text,
        source_location,
    )
}

fn parse_source(
    ast: &DocblockAST,
    project_config: &ProjectConfig,
    schema: &SDLSchema,
    definitions: Option<&Vec<ExecutableDefinition>>,
) -> DiagnosticsResult<Option<SchemaDocument>> {
    let maybe_ir = parse_docblock_ast(
        project_config.name,
        ast,
        definitions,
        ParseOptions {
            allow_legacy_verbose_syntax: &FeatureFlag::Disabled,
            enable_interface_output_type: &project_config
                .feature_flags
                .relay_resolver_enable_interface_output_type,
            allow_resolver_non_nullable_return_type: &project_config
                .feature_flags
                .allow_resolver_non_nullable_return_type,
        },
    )?;
    maybe_ir
        .map(|ir| {
            ir.to_graphql_schema_ast(project_config.name, schema, &project_config.schema_config)
        })
        .transpose()
}
