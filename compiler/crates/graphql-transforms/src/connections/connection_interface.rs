/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};

use lazy_static::lazy_static;
use std::sync::Arc;

#[derive(Debug)]
pub struct ConnectionInterface {
    pub cursor_selection_name: StringKey,
    pub edges_selection_name: StringKey,
    pub end_cursor_selection_name: StringKey,
    pub has_next_page_selection_name: StringKey,
    pub has_prev_page_selection_name: StringKey,
    pub node_selection_name: StringKey,
    pub page_info_selection_name: StringKey,
    pub start_cursor_selection_name: StringKey,
}

#[cfg(feature = "is_FB")]
    lazy_static! {
        pub static ref CONNECTION_INTERFACE: Arc<ConnectionInterface> =
            Arc::new(ConnectionInterface {
                cursor_selection_name: "cursor".intern(),
                edges_selection_name: "edges".intern(),
                end_cursor_selection_name: "end_cursor".intern(),
                has_next_page_selection_name: "has_next_page".intern(),
                has_prev_page_selection_name: "has_previous_page".intern(),
                node_selection_name: "node".intern(),
                page_info_selection_name: "page_info".intern(),
                start_cursor_selection_name: "start_cursor".intern(),
            });
    }

#[cfg(not(feature = "is_FB"))]
    lazy_static! {
       pub static ref CONNECTION_INTERFACE: Arc<ConnectionInterface> =
            Arc::new(ConnectionInterface {
                cursor_selection_name: "cursor".intern(),
                edges_selection_name: "edges".intern(),
                end_cursor_selection_name: "endCursor".intern(),
                has_next_page_selection_name: "hasNextPage".intern(),
                has_prev_page_selection_name: "hasPreviousPage".intern(),
                node_selection_name: "node".intern(),
                page_info_selection_name: "pageInfo".intern(),
                start_cursor_selection_name: "startCursor".intern(),
            });
    }
