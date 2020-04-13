/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};
use lazy_static::lazy_static;

pub struct MatchConstants {
    pub js_field_type: StringKey,
    pub js_field_id_arg: StringKey,
    pub js_field_module_arg: StringKey,
    pub js_field_name: StringKey,
    pub key_arg: StringKey,
    pub module_directive_name: StringKey,
    pub match_directive_name: StringKey,
    pub supported_arg: StringKey,
    pub name_arg: StringKey,
    pub module_component_key_prefix: &'static str,
    pub module_operation_key_prefix: &'static str,
    pub custom_module_directive_name: StringKey,
    pub source_document_arg: StringKey,
    pub parent_sources_arg: StringKey,
    pub derived_from_arg: StringKey,
}

impl Default for MatchConstants {
    fn default() -> Self {
        Self {
            js_field_type: "JSDependency".intern(),
            js_field_id_arg: "id".intern(),
            js_field_module_arg: "module".intern(),
            js_field_name: "js".intern(),
            key_arg: "key".intern(),
            match_directive_name: "match".intern(),
            module_directive_name: "module".intern(),
            supported_arg: "supported".intern(),
            name_arg: "name".intern(),
            module_component_key_prefix: "__module_component_",
            module_operation_key_prefix: "__module_operation_",
            custom_module_directive_name: "__module".intern(),
            source_document_arg: "sourceDocuement".intern(),
            parent_sources_arg: "parentSources".intern(),
            derived_from_arg: "derivedFrom".intern(),
        }
    }
}

lazy_static! {
    pub static ref MATCH_CONSTANTS: MatchConstants = Default::default();
}
