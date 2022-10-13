/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;

use common::DiagnosticsResult;
use common::SourceLocationKey;
use docblock_syntax::parse_docblock;
use errors::try_all;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::SchemaDocument;
use relay_config::ProjectConfig;
use relay_docblock::parse_docblock_ast;
use relay_docblock::ParseOptions;
use schema::SDLSchema;

use crate::file_source::LocatedDocblockSource;

pub fn extract_schema_from_docblock_sources(
    project_config: &ProjectConfig,
    file_path: &Path,
    docblock_sources: &[LocatedDocblockSource],
    schema: &SDLSchema,
    definitions: Option<&Vec<ExecutableDefinition>>,
) -> DiagnosticsResult<Vec<SchemaDocument>> {
    try_all(docblock_sources.iter().filter_map(|docblock_source| {
        parse_source(
            project_config,
            file_path,
            docblock_source,
            schema,
            definitions,
        )
        // Convert Result<Option<_>> to Option<Result<T>> so we can take advantage of filter_map
        .transpose()
    }))
}

fn parse_source(
    project_config: &ProjectConfig,
    file_path: &Path,
    docblock_source: &LocatedDocblockSource,
    schema: &SDLSchema,
    definitions: Option<&Vec<ExecutableDefinition>>,
) -> DiagnosticsResult<Option<SchemaDocument>> {
    let source_location =
        SourceLocationKey::embedded(file_path.to_str().unwrap(), docblock_source.index);

    let ast = parse_docblock(
        &docblock_source.docblock_source.text_source().text,
        source_location,
    )?;

    let maybe_ir = parse_docblock_ast(
        &ast,
        definitions,
        ParseOptions {
            use_named_imports: project_config
                .feature_flags
                .use_named_imports_for_relay_resolvers,
            relay_resolver_model_syntax_enabled: project_config
                .feature_flags
                .relay_resolver_model_syntax_enabled,
        },
    )?;
    maybe_ir
        .map(|ir| ir.to_graphql_schema_ast(schema))
        .transpose()
}
