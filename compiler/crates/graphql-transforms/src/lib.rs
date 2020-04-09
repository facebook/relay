/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]
#![deny(clippy::clone_on_ref_ptr)]

mod applied_fragment_name;
mod apply_fragment_arguments;
mod client_extensions;
mod connections;
mod defer_stream;
mod flatten;
mod generate_id_field;
mod generate_typename;
mod handle_fields;
mod hash_arguments;
mod inline_fragments;
mod mask;
mod match_;
mod node_identifier;
mod remove_base_fragments;
mod skip_client_extensions;
mod skip_redundant_nodes;
mod skip_unreachable_node;
mod sort_selections;
mod transform_connections;
mod util;
mod validations;

pub use applied_fragment_name::get_applied_fragment_name;
pub use apply_fragment_arguments::apply_fragment_arguments;
pub use client_extensions::client_extensions;
pub use connections::{
    extract_connection_metadata_from_directive, ConnectionConstants, ConnectionInterface,
    FBConnectionInterface, OSSConnectionInterface,
};
pub use defer_stream::{defer_stream, DEFER_STREAM_CONSTANTS};
pub use flatten::flatten;
pub use generate_id_field::generate_id_field;
pub use generate_typename::generate_typename;
pub use handle_fields::{
    extract_handle_field_directives, extract_values_from_handle_field_directive,
    handle_field_transform, HandleFieldConstants,
};
pub use hash_arguments::hash_arguments;
pub use inline_fragments::inline_fragments;
pub use mask::mask;
pub use match_::match_;
pub use node_identifier::NodeIdentifier;
pub use remove_base_fragments::remove_base_fragments;
pub use skip_client_extensions::skip_client_extensions;
pub use skip_redundant_nodes::skip_redundant_nodes;
pub use skip_unreachable_node::skip_unreachable_node;
pub use sort_selections::sort_selections;
pub use transform_connections::transform_connections;
pub use util::{find_argument, find_directive, get_variable_name, remove_directive};
pub use validations::*;
