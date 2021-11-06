/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod combined_schema_documentation;
mod sdl_schema_impl;

use std::sync::Arc;

pub use combined_schema_documentation::CombinedSchemaDocumentation;

pub trait SchemaDocumentationLoader<T: SchemaDocumentation>: Send + Sync {
    fn get_schema_documentation(&self, schema_name: &str) -> Arc<T>;
}

pub trait SchemaDocumentation: Send + Sync {
    fn get_type_description(&self, _type_name: &str) -> Option<&str> {
        None
    }
    fn get_field_description(&self, _type_name: &str, _field_name: &str) -> Option<&str> {
        None
    }
    fn get_field_argument_description(
        &self,
        _type_name: &str,
        _field_name: &str,
        _argument_name: &str,
    ) -> Option<&str> {
        None
    }
}

// This can probably be implemented more generically for AsRef<TSchemaDocumentation>
impl<TSchemaDocumentation: SchemaDocumentation> SchemaDocumentation for Arc<TSchemaDocumentation> {
    fn get_type_description(&self, type_name: &str) -> Option<&str> {
        self.as_ref().get_type_description(type_name)
    }

    fn get_field_description(&self, type_name: &str, field_name: &str) -> Option<&str> {
        self.as_ref().get_field_description(type_name, field_name)
    }

    fn get_field_argument_description(
        &self,
        type_name: &str,
        field_name: &str,
        argument_name: &str,
    ) -> Option<&str> {
        self.as_ref()
            .get_field_argument_description(type_name, field_name, argument_name)
    }
}

impl<TSchemaDocumentation: SchemaDocumentation> SchemaDocumentation
    for Option<TSchemaDocumentation>
{
    fn get_type_description(&self, type_name: &str) -> Option<&str> {
        self.as_ref()
            .and_then(|s| s.get_type_description(type_name))
    }

    fn get_field_description(&self, type_name: &str, field_name: &str) -> Option<&str> {
        self.as_ref()
            .and_then(|s| s.get_field_description(type_name, field_name))
    }

    fn get_field_argument_description(
        &self,
        type_name: &str,
        field_name: &str,
        argument_name: &str,
    ) -> Option<&str> {
        self.as_ref()
            .and_then(|s| s.get_field_argument_description(type_name, field_name, argument_name))
    }
}
