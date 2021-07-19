/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod sdl_schema_impl;

use std::sync::Arc;

pub trait SchemaDocumentationLoader<T: SchemaDocumentation> {
    fn get_schema_documentation(&self, schema_name: &str) -> Arc<T>;
}

pub trait SchemaDocumentation {
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
