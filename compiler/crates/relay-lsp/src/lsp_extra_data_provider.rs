/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use schema_documentation::SchemaDocumentation;
use serde_json::Value;
use std::{path::PathBuf, sync::Arc};

pub enum Query {
    Text(String),
    Id(String),
}

/// Interface for the LSP server to handle external data sources
pub trait LSPExtraDataProvider {
    fn fetch_query_stats(&self, search_token: String) -> Vec<String>;
    fn resolve_field_definition(
        &self,
        project_name: String,
        root_dir: &PathBuf,
        parent_type: String,
        field_name: Option<String>,
    ) -> Option<Result<(String, u64), String>>;
    fn get_schema_documentation(&self, schema_name: String) -> Arc<SchemaDocumentation>;
    fn execute_query(&self, query: Query, variables: Value) -> Result<Value, Value>;
}
