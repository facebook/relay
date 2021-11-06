/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct FieldDefinitionSourceInfo {
    pub file_path: String,
    pub line_number: u64,
    pub is_local: bool,
}

pub struct FieldSchemaInfo {
    pub name: String,
    pub is_extension: bool,
}

/// Interface for the LSP server to handle external data sources
pub trait LSPExtraDataProvider: Send + Sync {
    fn fetch_query_stats(&self, search_token: &str) -> Vec<String>;
    fn resolve_field_definition(
        &self,
        project_name: String,
        parent_type: String,
        field_info: Option<FieldSchemaInfo>,
    ) -> Result<Option<FieldDefinitionSourceInfo>, String>;
}
