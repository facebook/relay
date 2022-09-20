/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::DirectiveName;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;

pub struct MatchConstants {
    pub js_field_type: StringKey,
    pub js_field_id_arg: ArgumentName,
    pub js_field_branch_arg: ArgumentName,
    pub js_field_module_arg: ArgumentName,
    pub js_field_name: StringKey,
    pub key_arg: ArgumentName,
    pub module_directive_name: DirectiveName,
    pub match_directive_name: DirectiveName,
    pub supported_arg: ArgumentName,
    pub name_arg: ArgumentName,
}

lazy_static! {
    pub static ref MATCH_CONSTANTS: MatchConstants = MatchConstants {
        js_field_type: "JSDependency".intern(),
        js_field_id_arg: ArgumentName("id".intern()),
        js_field_branch_arg: ArgumentName("branch".intern()),
        js_field_module_arg: ArgumentName("module".intern()),
        js_field_name: "js".intern(),
        key_arg: ArgumentName("key".intern()),
        match_directive_name: DirectiveName("match".intern()),
        module_directive_name: DirectiveName("module".intern()),
        supported_arg: ArgumentName("supported".intern()),
        name_arg: ArgumentName("name".intern()),
    };
}
