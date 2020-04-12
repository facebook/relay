/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};

#[derive(Debug, Copy, Clone)]
pub struct HandleFieldConstants {
    pub handle_field_directive_name: StringKey,

    pub handler_arg_name: StringKey,
    pub filters_arg_name: StringKey,
    pub key_arg_name: StringKey,
    pub dynamic_key_arg_name: StringKey,
}

impl Default for HandleFieldConstants {
    fn default() -> Self {
        Self {
            handle_field_directive_name: "__clientField".intern(),

            handler_arg_name: "handler".intern(),
            filters_arg_name: "filters".intern(),
            key_arg_name: "key".intern(),
            dynamic_key_arg_name: "dynamicKey_UNSTABLE".intern(),
        }
    }
}
