/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::{Intern, StringKey};

pub trait ConnectionInterface {
    fn client_mutation_id_selection_name(&self) -> StringKey;
    fn cursor_selection_name(&self) -> StringKey;
    fn edges_selection_name(&self) -> StringKey;
    fn end_cursor_selection_name(&self) -> StringKey;
    fn has_next_page_selection_name(&self) -> StringKey;
    fn has_prev_page_selection_name(&self) -> StringKey;
    fn node_selection_name(&self) -> StringKey;
    fn page_info_selection_name(&self) -> StringKey;
    fn start_cursor_selection_name(&self) -> StringKey;
}

#[derive(Debug)]
pub struct OSSConnectionInterface {
    client_mutation_id_selection_name_: StringKey,
    cursor_selection_name_: StringKey,
    edges_selection_name_: StringKey,
    end_cursor_selection_name_: StringKey,
    has_next_page_selection_name_: StringKey,
    has_prev_page_selection_name_: StringKey,
    node_selection_name_: StringKey,
    page_info_selection_name_: StringKey,
    start_cursor_selection_name_: StringKey,
}

impl Default for OSSConnectionInterface {
    fn default() -> Self {
        Self {
            client_mutation_id_selection_name_: "clientMutationId".intern(),
            cursor_selection_name_: "cursor".intern(),
            edges_selection_name_: "edges".intern(),
            end_cursor_selection_name_: "endCursor".intern(),
            has_next_page_selection_name_: "hasNextPage".intern(),
            has_prev_page_selection_name_: "hasPreviousPage".intern(),
            node_selection_name_: "node".intern(),
            page_info_selection_name_: "pageInfo".intern(),
            start_cursor_selection_name_: "startCursor".intern(),
        }
    }
}

impl ConnectionInterface for OSSConnectionInterface {
    fn client_mutation_id_selection_name(&self) -> interner::StringKey {
        self.client_mutation_id_selection_name_
    }
    fn cursor_selection_name(&self) -> interner::StringKey {
        self.cursor_selection_name_
    }
    fn edges_selection_name(&self) -> interner::StringKey {
        self.edges_selection_name_
    }
    fn end_cursor_selection_name(&self) -> interner::StringKey {
        self.end_cursor_selection_name_
    }
    fn has_next_page_selection_name(&self) -> interner::StringKey {
        self.has_next_page_selection_name_
    }
    fn has_prev_page_selection_name(&self) -> interner::StringKey {
        self.has_prev_page_selection_name_
    }
    fn node_selection_name(&self) -> interner::StringKey {
        self.node_selection_name_
    }
    fn page_info_selection_name(&self) -> interner::StringKey {
        self.page_info_selection_name_
    }
    fn start_cursor_selection_name(&self) -> interner::StringKey {
        self.start_cursor_selection_name_
    }
}

#[derive(Debug)]
pub struct FBConnectionInterface {
    client_mutation_id_selection_name_: StringKey,
    cursor_selection_name_: StringKey,
    edges_selection_name_: StringKey,
    end_cursor_selection_name_: StringKey,
    has_next_page_selection_name_: StringKey,
    has_prev_page_selection_name_: StringKey,
    node_selection_name_: StringKey,
    page_info_selection_name_: StringKey,
    start_cursor_selection_name_: StringKey,
}

impl Default for FBConnectionInterface {
    fn default() -> Self {
        Self {
            client_mutation_id_selection_name_: "client_mutation_id".intern(),
            cursor_selection_name_: "cursor".intern(),
            edges_selection_name_: "edges".intern(),
            end_cursor_selection_name_: "end_cursor".intern(),
            has_next_page_selection_name_: "has_next_page".intern(),
            has_prev_page_selection_name_: "has_previous_page".intern(),
            node_selection_name_: "node".intern(),
            page_info_selection_name_: "page_info".intern(),
            start_cursor_selection_name_: "start_cursor".intern(),
        }
    }
}

impl ConnectionInterface for FBConnectionInterface {
    fn client_mutation_id_selection_name(&self) -> interner::StringKey {
        self.client_mutation_id_selection_name_
    }
    fn cursor_selection_name(&self) -> interner::StringKey {
        self.cursor_selection_name_
    }
    fn edges_selection_name(&self) -> interner::StringKey {
        self.edges_selection_name_
    }
    fn end_cursor_selection_name(&self) -> interner::StringKey {
        self.end_cursor_selection_name_
    }
    fn has_next_page_selection_name(&self) -> interner::StringKey {
        self.has_next_page_selection_name_
    }
    fn has_prev_page_selection_name(&self) -> interner::StringKey {
        self.has_prev_page_selection_name_
    }
    fn node_selection_name(&self) -> interner::StringKey {
        self.node_selection_name_
    }
    fn page_info_selection_name(&self) -> interner::StringKey {
        self.page_info_selection_name_
    }
    fn start_cursor_selection_name(&self) -> interner::StringKey {
        self.start_cursor_selection_name_
    }
}
