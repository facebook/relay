/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use schema_documentation::SchemaDocumentation;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Deserialize, Serialize)]
pub struct FieldDefinitionSourceInfo {
    pub file_path: String,
    pub line_number: u64,
    pub is_local: bool,
}

/// Interface for the LSP server to handle external data sources
pub trait LSPExtraDataProvider {
    fn fetch_query_stats(&self, search_token: String) -> Vec<String>;
    fn resolve_field_definition(
        &self,
        project_name: String,
        parent_type: String,
        field_name: Option<String>,
    ) -> Result<FieldDefinitionSourceInfo, String>;
    fn get_schema_documentation(&self, schema_name: &str) -> Arc<SchemaDocumentation>;
}
