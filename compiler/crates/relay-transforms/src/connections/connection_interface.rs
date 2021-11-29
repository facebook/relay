/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::{Intern, StringKey};

use serde::{Deserialize, Serialize};

/// Configuration where Relay should expect some fields in the schema.
#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct ConnectionInterface {
    pub cursor: StringKey,
    pub edges: StringKey,
    pub end_cursor: StringKey,
    pub has_next_page: StringKey,
    pub has_previous_page: StringKey,
    pub node: StringKey,
    pub page_info: StringKey,
    pub start_cursor: StringKey,
}

impl Default for ConnectionInterface {
    fn default() -> Self {
        ConnectionInterface {
            cursor: "cursor".intern(),
            edges: "edges".intern(),
            end_cursor: "endCursor".intern(),
            has_next_page: "hasNextPage".intern(),
            has_previous_page: "hasPreviousPage".intern(),
            node: "node".intern(),
            page_info: "pageInfo".intern(),
            start_cursor: "startCursor".intern(),
        }
    }
}
