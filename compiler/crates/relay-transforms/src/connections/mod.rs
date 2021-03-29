/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod connection_constants;
mod connection_interface;
mod connection_util;

pub use connection_constants::{
    ConnectionConstants, CONNECTION_METADATA_ARGUMENT_NAME, CONNECTION_METADATA_DIRECTIVE_NAME,
};
pub use connection_interface::ConnectionInterface;
pub use connection_util::{
    assert_connection_selections, build_connection_metadata,
    build_connection_metadata_as_directive, build_edge_selections, build_page_info_selections,
    extract_connection_directive, extract_connection_metadata_from_directive, get_default_filters,
    ConnectionMetadata,
};
