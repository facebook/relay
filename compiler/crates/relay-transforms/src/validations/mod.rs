/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod deprecated_fields;
mod disallow_circular_no_inline_fragments;
mod disallow_reserved_aliases;
mod disallow_typename_on_root;
pub(crate) mod validate_assignable_directive;
mod validate_connections;
mod validate_global_variables;
mod validate_module_names;
mod validate_no_double_underscore_alias;
mod validate_no_inline_with_raw_response_type;
mod validate_relay_directives;
mod validate_required_arguments;
mod validate_selection_conflict;
mod validate_server_only_directives;
mod validate_unused_fragment_variables;
mod validate_unused_variables;
mod validate_updatable_directive;

pub use deprecated_fields::{deprecated_fields, deprecated_fields_for_executable_definition};
pub use disallow_circular_no_inline_fragments::disallow_circular_no_inline_fragments;
pub use disallow_reserved_aliases::disallow_reserved_aliases;
pub use disallow_typename_on_root::disallow_typename_on_root;
pub use validate_assignable_directive::validate_assignable_directive;
pub use validate_connections::validate_connections;
pub use validate_global_variables::validate_global_variables;
pub use validate_module_names::{extract_module_name, validate_module_names};
pub use validate_no_double_underscore_alias::validate_no_double_underscore_alias;
pub use validate_no_inline_with_raw_response_type::validate_no_inline_fragments_with_raw_response_type;
pub use validate_relay_directives::validate_relay_directives;
pub use validate_required_arguments::validate_required_arguments;
pub use validate_selection_conflict::validate_selection_conflict;
pub use validate_server_only_directives::validate_server_only_directives;
pub use validate_unused_fragment_variables::validate_unused_fragment_variables;
pub use validate_unused_variables::validate_unused_variables;
pub use validate_updatable_directive::{validate_updatable_directive, UPDATABLE_DIRECTIVE_NAME};
