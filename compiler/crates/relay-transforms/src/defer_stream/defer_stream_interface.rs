/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};

use serde::Deserialize;

/// Configuration where Relay should expect some fields in the schema.
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct DeferStreamInterface {
    pub defer_name: StringKey,
    pub stream_name: StringKey,
    pub if_arg: StringKey,
    pub label_arg: StringKey,
    pub initial_count_arg: StringKey,
    pub use_customized_batch_arg: StringKey,
}

impl Default for DeferStreamInterface {
    fn default() -> Self {
        DeferStreamInterface {
            defer_name: "defer".intern(),
            stream_name: "stream".intern(),
            if_arg: "if".intern(),
            label_arg: "label".intern(),
            initial_count_arg: "initialCount".intern(),
            use_customized_batch_arg: "useCustomizedBatch".intern(),
        }
    }
}
