/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;

pub struct MatchConstants {
    pub js_field_type: StringKey,
    pub js_field_id_arg: StringKey,
    pub js_field_branch_arg: StringKey,
    pub js_field_module_arg: StringKey,
    pub js_field_name: StringKey,
    pub key_arg: StringKey,
    pub module_directive_name: StringKey,
    pub match_directive_name: StringKey,
    pub supported_arg: StringKey,
    pub name_arg: StringKey,
}

lazy_static! {
    pub static ref MATCH_CONSTANTS: MatchConstants = MatchConstants {
        js_field_type: "JSDependency".intern(),
        js_field_id_arg: "id".intern(),
        js_field_branch_arg: "branch".intern(),
        js_field_module_arg: "module".intern(),
        js_field_name: "js".intern(),
        key_arg: "key".intern(),
        match_directive_name: "match".intern(),
        module_directive_name: "module".intern(),
        supported_arg: "supported".intern(),
        name_arg: "name".intern(),
    };
}
