/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticsResult;
use errors::try_all;
use graphql_syntax::SchemaDocument;
use relay_docblock::ResolverFieldDocblockIr;
use relay_docblock::ResolverTypeDocblockIr;
use relay_docblock::extend_schema_with_resolver_type_system_definition;
use schema::SDLSchema;

use super::extract_docblock_ir::AllocatedDocblockIr;
use super::mark_document_as_base::mark_document_as_base;
use crate::config::Config;
use crate::config::ProjectConfig;

// FIXME: Use the base project's schema config where needed
/// FIXME: Move to relay-docblock crate
///
/// For types we construct SDL ASTs and use them to construct the initial SDLSchema
pub fn build_resolver_types_schema_documents(
    type_irs: &[AllocatedDocblockIr<ResolverTypeDocblockIr>],
    config: &Config,
    project_config: &ProjectConfig,
) -> Vec<SchemaDocument> {
    let schema_config = &project_config.schema_config;
    let base_config = project_config
        .base
        .map(|base_project_name| &config.projects[&base_project_name].schema_config);

    type_irs
        .iter()
        .map(|type_ir| {
            let ir_schema_config = if type_ir.is_base {
                base_config.unwrap()
            } else {
                schema_config
            };
            let schema_document = type_ir.ir.to_graphql_schema_ast(ir_schema_config);
            if type_ir.is_base {
                mark_document_as_base(schema_document)
            } else {
                schema_document
            }
        })
        .collect()
}

/// For fields, we extend the existing schema with the field definitions. This is achieved by generating
/// SDL ASTs for the fields and then using them to extend the schema.
pub fn extend_schema_with_field_ir(
    irs: Vec<AllocatedDocblockIr<ResolverFieldDocblockIr>>,
    schema: &mut SDLSchema,
    config: &Config,
    project_config: &ProjectConfig,
) -> DiagnosticsResult<()> {
    let base_project_config = project_config
        .base
        .map(|base_project_name| &config.projects[&base_project_name]);

    try_all(irs.into_iter().map(|field_ir| {
        let ir_project_config = if field_ir.is_base {
            base_project_config.unwrap()
        } else {
            project_config
        };
        let mut document = field_ir.ir.to_graphql_schema_ast(
            ir_project_config.name,
            schema,
            &ir_project_config.schema_config,
        )?;
        if field_ir.is_base {
            document = mark_document_as_base(document);
        }
        try_all(document.definitions.into_iter().map(|definition| {
            extend_schema_with_resolver_type_system_definition(
                definition,
                schema,
                document.location,
            )
        }))
    }))?;
    Ok(())
}
