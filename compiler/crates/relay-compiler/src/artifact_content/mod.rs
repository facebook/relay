/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod content;
mod content_section;

use crate::config::{Config, ProjectConfig};
use common::SourceLocationKey;
use content::{
    generate_fragment, generate_operation, generate_split_operation, generate_updatable_query,
};
use graphql_ir::{FragmentDefinition, OperationDefinition};
use relay_codegen::{Printer, QueryID};
use schema::SDLSchema;
use std::sync::Arc;

#[derive(Clone)]
pub enum ArtifactContent {
    Operation {
        normalization_operation: Arc<OperationDefinition>,
        reader_operation: Arc<OperationDefinition>,
        typegen_operation: Arc<OperationDefinition>,
        source_hash: String,
        text: Option<String>,
        id_and_text_hash: Option<QueryID>,
    },
    UpdatableQuery {
        reader_operation: Arc<OperationDefinition>,
        typegen_operation: Arc<OperationDefinition>,
        source_hash: String,
    },
    Fragment {
        reader_fragment: Arc<FragmentDefinition>,
        typegen_fragment: Arc<FragmentDefinition>,
        source_hash: String,
    },
    SplitOperation {
        normalization_operation: Arc<OperationDefinition>,
        typegen_operation: Option<Arc<OperationDefinition>>,
        source_hash: String,
    },
    Generic {
        content: Vec<u8>,
    },
}

impl ArtifactContent {
    pub fn as_bytes(
        &self,
        config: &Config,
        project_config: &ProjectConfig,
        printer: &mut Printer<'_>,
        schema: &SDLSchema,
        source_file: SourceLocationKey,
    ) -> Vec<u8> {
        let skip_types = project_config
            .skip_types_for_artifact
            .as_ref()
            .map_or(false, |skip_types_fn| skip_types_fn(source_file));
        match self {
            ArtifactContent::Operation {
                normalization_operation,
                reader_operation,
                typegen_operation,
                source_hash,
                text,
                id_and_text_hash,
            } => generate_operation(
                config,
                project_config,
                printer,
                schema,
                normalization_operation,
                reader_operation,
                typegen_operation,
                source_hash.into(),
                text,
                id_and_text_hash,
                skip_types,
            )
            .unwrap(),
            ArtifactContent::UpdatableQuery {
                reader_operation,
                typegen_operation,
                source_hash,
            } => generate_updatable_query(
                config,
                project_config,
                printer,
                schema,
                reader_operation,
                typegen_operation,
                source_hash.into(),
                skip_types,
            )
            .unwrap(),
            ArtifactContent::SplitOperation {
                normalization_operation,
                typegen_operation,
                source_hash,
            } => generate_split_operation(
                config,
                project_config,
                printer,
                schema,
                normalization_operation,
                typegen_operation,
                source_hash,
            )
            .unwrap(),
            ArtifactContent::Fragment {
                reader_fragment,
                typegen_fragment,
                source_hash,
            } => generate_fragment(
                config,
                project_config,
                printer,
                schema,
                reader_fragment,
                typegen_fragment,
                source_hash,
                skip_types,
            )
            .unwrap(),
            ArtifactContent::Generic { content } => content.clone(),
        }
    }
}
