/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
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
mod apply_custom_transforms;
mod apply_fragment_arguments;
mod apply_transforms;
mod assignable_fragment_spread;
mod client_edges;
mod client_extensions;
mod client_extensions_abstract_types;
mod connections;
mod declarative_connection;
mod defer_stream;
mod directive_finder;
mod errors;
mod flatten;
mod fragment_alias_directive;
mod generate_data_driven_dependency_metadata;
mod generate_id_field;
mod generate_live_query_metadata;
pub mod generate_relay_resolvers_model_fragments;
mod generate_relay_resolvers_operations_for_nested_objects;
mod generate_relay_resolvers_root_fragment_split_operation;
mod generate_typename;
mod handle_fields;
mod hash_arguments;
mod inline_data_fragment;
mod inline_fragments;
mod mask;
mod match_;
mod metadata_directive;
mod murmurhash;
mod no_inline;
mod preloadable_directive;
mod provided_variable_fragment_transform;
mod refetchable_fragment;
mod relay_actor_change;
mod relay_directive;
mod relay_node_identifier;
pub mod relay_resolvers;
mod relay_resolvers_abstract_types;
mod remove_base_fragments;
mod required_directive;
mod root_variables;
mod skip_client_directives;
mod skip_client_extensions;
mod skip_null_arguments_transform;
mod skip_redundant_nodes;
mod skip_split_operation;
mod skip_unreachable_node;
mod skip_updatable_queries;
mod sort_selections;
mod test_operation_metadata;
mod transform_connections;
mod unwrap_custom_directive_selection;
mod util;
mod validate_operation_variables;
mod validations;

use std::collections::HashMap;
use std::collections::HashSet;

use intern::string_key::StringKey;
use intern::BuildIdHasher;
pub use metadata_directive::create_metadata_directive;
pub use metadata_directive::INTERNAL_METADATA_DIRECTIVE;

/// Name of an executable operation
type OperationName = StringKey;

// NOTE: Types are based on intern::string_key::{StringKeyMap, StringKeySet}
pub type DependencyMap = HashMap<OperationName, DependencySet, BuildIdHasher<u32>>;
pub type DependencySet = HashSet<OperationName, BuildIdHasher<u32>>;

pub use applied_fragment_name::get_applied_fragment_name;
pub use apply_custom_transforms::BaseFragmentNames;
pub use apply_custom_transforms::CustomTransform;
pub use apply_custom_transforms::CustomTransforms;
pub use apply_custom_transforms::CustomTransformsConfig;
pub use apply_fragment_arguments::apply_fragment_arguments;
pub use apply_fragment_arguments::NoInlineFragmentSpreadMetadata;
pub use apply_transforms::apply_transforms;
pub use apply_transforms::Programs;
pub use assignable_fragment_spread::transform_assignable_fragment_spreads_in_regular_queries;
pub use assignable_fragment_spread::transform_assignable_fragment_spreads_in_updatable_queries;
pub use assignable_fragment_spread::validate_assignable_directive;
pub use assignable_fragment_spread::validate_updatable_directive;
pub use assignable_fragment_spread::validate_updatable_fragment_spread;
pub use assignable_fragment_spread::TypeConditionInfo;
pub use assignable_fragment_spread::ASSIGNABLE_DIRECTIVE;
pub use assignable_fragment_spread::ASSIGNABLE_DIRECTIVE_FOR_TYPEGEN;
pub use assignable_fragment_spread::UPDATABLE_DIRECTIVE;
pub use assignable_fragment_spread::UPDATABLE_DIRECTIVE_FOR_TYPEGEN;
pub use client_edges::client_edges;
pub use client_edges::remove_client_edge_selections;
pub use client_edges::ClientEdgeGeneratedQueryMetadataDirective;
pub use client_edges::ClientEdgeMetadata;
pub use client_edges::ClientEdgeMetadataDirective;
pub use client_edges::ClientEdgeModelResolver;
pub use client_edges::CLIENT_EDGE_SOURCE_NAME;
pub use client_edges::CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME;
pub use client_extensions::client_extensions;
pub use client_extensions::CLIENT_EXTENSION_DIRECTIVE_NAME;
pub use client_extensions_abstract_types::client_extensions_abstract_types;
pub use client_extensions_abstract_types::ClientExtensionAbstractTypeMetadataDirective;
pub use connections::extract_connection_metadata_from_directive;
pub use connections::ConnectionConstants;
pub use connections::ConnectionInterface;
pub use connections::ConnectionMetadata;
pub use declarative_connection::transform_declarative_connection;
pub use defer_stream::transform_defer_stream;
pub use defer_stream::DeferDirective;
pub use defer_stream::StreamDirective;
pub use directive_finder::DirectiveFinder;
pub use flatten::flatten;
pub use fragment_alias_directive::fragment_alias_directive;
pub use fragment_alias_directive::FragmentAliasMetadata;
pub use generate_data_driven_dependency_metadata::generate_data_driven_dependency_metadata;
pub use generate_data_driven_dependency_metadata::RelayDataDrivenDependencyMetadata;
pub use generate_id_field::generate_id_field;
pub use generate_live_query_metadata::generate_live_query_metadata;
pub use generate_relay_resolvers_model_fragments::ArtifactSourceKeyData;
pub use generate_relay_resolvers_operations_for_nested_objects::generate_relay_resolvers_operations_for_nested_objects;
pub use generate_relay_resolvers_root_fragment_split_operation::annotate_resolver_root_fragments;
pub use generate_relay_resolvers_root_fragment_split_operation::generate_relay_resolvers_root_fragment_split_operation;
pub use generate_typename::generate_typename;
pub use generate_typename::TYPE_DISCRIMINATOR_DIRECTIVE_NAME;
pub use handle_fields::extract_handle_field_directives;
pub use handle_fields::extract_values_from_handle_field_directive;
pub use handle_fields::handle_field_transform;
pub use hash_arguments::hash_arguments;
pub use inline_data_fragment::inline_data_fragment;
pub use inline_data_fragment::InlineDirectiveMetadata;
pub use inline_data_fragment::INLINE_DIRECTIVE_NAME;
pub use inline_fragments::inline_fragments;
pub use mask::mask;
pub use match_::split_module_import;
pub use match_::transform_match;
pub use match_::transform_subscriptions;
pub use match_::ModuleMetadata;
pub use match_::RawResponseGenerationMode;
pub use match_::SplitOperationMetadata;
pub use match_::DIRECTIVE_SPLIT_OPERATION;
pub use match_::MATCH_CONSTANTS;
pub use no_inline::NO_INLINE_DIRECTIVE_NAME;
pub use preloadable_directive::is_operation_preloadable;
pub use preloadable_directive::should_generate_hack_preloader;
pub use provided_variable_fragment_transform::provided_variable_fragment_transform;
pub use refetchable_fragment::transform_refetchable_fragment;
pub use refetchable_fragment::RefetchableDerivedFromMetadata;
pub use refetchable_fragment::RefetchableMetadata;
pub use refetchable_fragment::CONSTANTS as REFETCHABLE_CONSTANTS;
pub use refetchable_fragment::REFETCHABLE_NAME;
pub use relay_actor_change::relay_actor_change_transform;
pub use relay_actor_change::RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN;
pub use relay_directive::RelayDirective;
pub use relay_node_identifier::RelayLocationAgnosticBehavior;
pub use relay_resolvers::get_resolver_fragment_dependency_name;
pub use relay_resolvers::relay_resolvers;
pub use relay_resolvers::resolver_type_import_alias;
pub use relay_resolvers::FragmentDataInjectionMode;
pub use relay_resolvers::RelayResolverMetadata;
pub use relay_resolvers::ResolverOutputTypeInfo;
pub use relay_resolvers_abstract_types::relay_resolvers_abstract_types;
pub use remove_base_fragments::remove_base_fragments;
pub use remove_base_fragments::RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE;
pub use required_directive::required_directive;
pub use required_directive::RequiredAction;
pub use required_directive::RequiredMetadataDirective;
pub use required_directive::ACTION_ARGUMENT;
pub use required_directive::CHILDREN_CAN_BUBBLE_METADATA_KEY;
pub use required_directive::REQUIRED_DIRECTIVE_NAME;
pub use required_directive::THROW_ACTION;
pub use skip_client_directives::skip_client_directives;
pub use skip_client_extensions::skip_client_extensions;
pub use skip_null_arguments_transform::skip_null_arguments_transform;
pub use skip_redundant_nodes::skip_redundant_nodes;
pub use skip_redundant_nodes::SkipRedundantNodesTransform;
pub use skip_split_operation::skip_split_operation;
pub use skip_unreachable_node::skip_unreachable_node_loose;
pub use skip_unreachable_node::skip_unreachable_node_strict;
pub use sort_selections::sort_selections;
pub use test_operation_metadata::generate_test_operation_metadata;
pub use transform_connections::transform_connections;
pub use unwrap_custom_directive_selection::unwrap_custom_directive_selection;
pub use util::extract_variable_name;
pub use util::generate_abstract_type_refinement_key;
pub use util::get_fragment_filename;
pub use util::get_normalization_operation_name;
pub use util::remove_directive;
pub use validate_operation_variables::validate_operation_variables;
pub use validations::*;

pub use crate::errors::ValidationMessage;
pub use crate::errors::ValidationMessageWithData;
