/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::CompilerState;
use crate::config::ProjectConfig;
use crate::docblocks::extract_schema_from_docblock_sources;
use common::DiagnosticsResult;
use graphql_syntax::TypeSystemDefinition;
use schema::SDLSchema;
use std::sync::Arc;

pub fn build_schema(
    compiler_state: &CompilerState,
    project_config: &ProjectConfig,
) -> DiagnosticsResult<Arc<SDLSchema>> {
    let schema = compiler_state.schema_cache.get(&project_config.name);
    match schema {
        Some(schema) if !compiler_state.project_has_pending_schema_changes(project_config.name) => {
            Ok(schema.clone())
        }
        _ => {
            let mut extensions = vec![];
            if let Some(project_extensions) = compiler_state.extensions.get(&project_config.name) {
                extensions.extend(project_extensions.get_sources_with_location());
            }
            if let Some(base_project_name) = project_config.base {
                if let Some(base_project_extensions) =
                    compiler_state.extensions.get(&base_project_name)
                {
                    extensions.extend(base_project_extensions.get_sources_with_location());
                }
            }
            let mut schema_sources = Vec::new();
            schema_sources.extend(
                compiler_state.schemas[&project_config.name]
                    .get_sources()
                    .into_iter()
                    .map(String::as_str),
            );
            let mut schema =
                relay_schema::build_schema_with_extensions(&schema_sources, &extensions)?;

            if project_config.feature_flags.enable_relay_resolver_transform {
                let mut projects = vec![project_config.name];
                projects.extend(project_config.base);

                let docblock_sources = projects
                    .iter()
                    .map(|name| compiler_state.docblocks.get(name))
                    .flatten();

                for docblocks in docblock_sources {
                    for (file_path, docblock_sources) in &docblocks.get_all() {
                        for schema_document in extract_schema_from_docblock_sources(
                            file_path,
                            docblock_sources,
                            &schema,
                        )? {
                            for definition in schema_document.definitions {
                                match definition {
                                    TypeSystemDefinition::ObjectTypeExtension(extension) => schema
                                        .add_object_type_extension(
                                            extension,
                                            schema_document.location.source_location(),
                                            true,
                                        )?,
                                    TypeSystemDefinition::InterfaceTypeExtension(extension) => {
                                        schema.add_interface_type_extension(
                                            extension,
                                            schema_document.location.source_location(),
                                            true,
                                        )?
                                    }
                                    _ => panic!(
                                        "Expected docblocks to only expose object and interface extensions"
                                    ),
                                }
                            }
                        }
                    }
                }
            }

            Ok(Arc::new(schema))
        }
    }
}
