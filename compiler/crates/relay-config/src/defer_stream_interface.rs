/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::DirectiveName;
use intern::string_key::Intern;
use serde::Deserialize;
use serde::Serialize;

/// Configuration where Relay should expect some fields in the schema.
#[derive(Copy, Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct DeferStreamInterface {
    pub defer_name: DirectiveName,
    pub stream_name: DirectiveName,
    pub if_arg: ArgumentName,
    pub label_arg: ArgumentName,
    pub initial_count_arg: ArgumentName,
    pub use_customized_batch_arg: ArgumentName,
}

impl Default for DeferStreamInterface {
    fn default() -> Self {
        DeferStreamInterface {
            defer_name: DirectiveName("defer".intern()),
            stream_name: DirectiveName("stream".intern()),
            if_arg: ArgumentName("if".intern()),
            label_arg: ArgumentName("label".intern()),
            initial_count_arg: ArgumentName("initialCount".intern()),
            use_customized_batch_arg: ArgumentName("useCustomizedBatch".intern()),
        }
    }
}
