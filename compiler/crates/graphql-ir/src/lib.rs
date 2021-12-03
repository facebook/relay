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

mod associated_data;
mod build;
mod constants;
mod errors;
mod ir;
mod program;
mod signatures;
mod suggestion_list;
mod transform;
mod validator;
mod visitor;

pub use crate::errors::ValidationMessage;
pub use associated_data::AssociatedData;
pub use build::{
    build_directive, build_ir as build, build_ir_with_extra_features,
    build_ir_with_relay_feature_flags, BuilderOptions, FragmentVariablesSemantic, RelayMode,
    DIRECTIVE_ARGUMENTS,
};
pub use constants::ARGUMENT_DEFINITION;
pub use ir::*;
pub use program::Program;
pub use signatures::{ProvidedVariableMetadata, UNUSED_LOCAL_VARIABLE_DEPRECATED};
pub use suggestion_list::GraphQLSuggestions;
pub use transform::{Transformed, TransformedMulti, TransformedValue, Transformer};
pub use validator::Validator;
pub use visitor::Visitor;

/// Re-exported values to be used by the `associated_data_impl!` macro.
pub mod reexport {
    pub use crate::associated_data::AsAny;
    pub use common::{NamedItem, WithLocation};
    pub use fnv::FnvHasher;
    pub use intern::string_key::{self, Intern, StringKey};
    pub use once_cell::sync::Lazy;
}
