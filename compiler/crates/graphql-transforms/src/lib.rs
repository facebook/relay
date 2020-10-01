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
#![allow(clippy::comparison_chain)]

mod applied_fragment_name;
mod apply_fragment_arguments;
mod client_extensions;
mod connections;
mod declarative_connection;
mod dedupe_type_discriminator;
mod defer_stream;
mod feature_flags;
mod flatten;
mod generate_data_driven_dependency_metadata;
mod generate_id_field;
mod generate_live_query_metadata;
mod generate_preloadable_metadata;
mod generate_subscription_name_metadata;
mod generate_typename;
mod handle_fields;
mod hash_arguments;
mod inline_data_fragment;
mod inline_fragments;
mod mask;
mod match_;
mod node_identifier;
mod react_flight;
mod refetchable_fragment;
mod relay_directive;
mod relay_early_flush;
mod remove_base_fragments;
mod required_directive;
mod root_variables;
mod skip_client_directives;
mod skip_client_extensions;
mod skip_redundant_nodes;
mod skip_split_operation;
mod skip_unreachable_node;
mod skip_unused_variables;
mod sort_selections;
mod test_operation_metadata;
mod transform_connections;
mod unwrap_custom_directive_selection;
mod util;
mod validations;

use interner::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref INTERNAL_METADATA_DIRECTIVE: StringKey = "__metadata".intern();
}

pub use applied_fragment_name::get_applied_fragment_name;
pub use apply_fragment_arguments::apply_fragment_arguments;
pub use client_extensions::{client_extensions, CLIENT_EXTENSION_DIRECTIVE_NAME};
pub use connections::{
    extract_connection_metadata_from_directive, ConnectionConstants, ConnectionInterface,
    ConnectionMetadata,
};
pub use declarative_connection::transform_declarative_connection;
pub use dedupe_type_discriminator::dedupe_type_discriminator;
pub use defer_stream::{
    transform_defer_stream, DeferDirective, StreamDirective, DEFER_STREAM_CONSTANTS,
};
pub use feature_flags::FeatureFlags;
pub use flatten::flatten;
pub use generate_data_driven_dependency_metadata::{
    generate_data_driven_dependency_metadata, DATA_DRIVEN_DEPENDENCY_METADATA_KEY,
};
pub use generate_id_field::generate_id_field;
pub use generate_live_query_metadata::generate_live_query_metadata;
pub use generate_preloadable_metadata::{generate_preloadable_metadata, is_preloadable_operation};
pub use generate_subscription_name_metadata::generate_subscription_name_metadata;
pub use generate_typename::{generate_typename, TYPE_DISCRIMINATOR_DIRECTIVE_NAME};
pub use handle_fields::{
    extract_handle_field_directives, extract_values_from_handle_field_directive,
    handle_field_transform,
};
pub use hash_arguments::hash_arguments;
pub use inline_data_fragment::{inline_data_fragment, INLINE_DATA_CONSTANTS};
pub use inline_fragments::inline_fragments;
pub use mask::mask;
pub use match_::{split_module_import, transform_match, SplitOperationMetaData, MATCH_CONSTANTS};
pub use node_identifier::NodeIdentifier;
pub use react_flight::{react_flight, REACT_FLIGHT_DIRECTIVE_NAME};
pub use refetchable_fragment::{
    extract_refetch_metadata_from_directive, transform_refetchable_fragment,
    RefetchableDerivedFromMetadata, CONSTANTS as REFETCHABLE_CONSTANTS,
};
pub use relay_directive::RelayDirective;
pub use relay_early_flush::relay_early_flush;
pub use remove_base_fragments::remove_base_fragments;
pub use required_directive::{
    required_directive, RequiredAction, ACTION_ARGUMENT, CHILDREN_CAN_BUBBLE_METADATA_KEY,
    PATH_METADATA_ARGUMENT, REQUIRED_METADATA_KEY,
};
pub use skip_client_directives::skip_client_directives;
pub use skip_client_extensions::skip_client_extensions;
pub use skip_redundant_nodes::skip_redundant_nodes;
pub use skip_split_operation::skip_split_operation;
pub use skip_unreachable_node::skip_unreachable_node;
pub use skip_unused_variables::skip_unused_variables;
pub use sort_selections::sort_selections;
pub use test_operation_metadata::generate_test_operation_metadata;
pub use transform_connections::transform_connections;
pub use unwrap_custom_directive_selection::unwrap_custom_directive_selection;
pub use util::{extract_variable_name, generate_abstract_type_refinement_key, remove_directive};
pub use validations::*;
