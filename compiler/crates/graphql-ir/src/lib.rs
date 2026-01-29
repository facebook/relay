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

mod associated_data;
mod build;
mod constants;
mod errors;
mod ir;
pub mod node_identifier;
mod program;
mod signatures;
mod transform;
mod validator;
mod visitor;

pub use associated_data::AssociatedData;
pub use build::BuilderOptions;
pub use build::DIRECTIVE_ARGUMENTS;
pub use build::FIXME_FAT_INTERFACE;
pub use build::FragmentVariablesSemantic;
pub use build::RelayMode;
pub use build::build_directive;
pub use build::build_ir as build;
pub use build::build_ir_in_relay_mode;
pub use build::build_ir_with_extra_features;
pub use constants::ARGUMENT_DEFINITION;
pub use ir::*;
pub use program::Program;
pub use signatures::FragmentSignature;
pub use signatures::FragmentSignatures;
pub use signatures::ProvidedVariableMetadata;
pub use signatures::UNUSED_LOCAL_VARIABLE_DEPRECATED;
pub use signatures::build_signatures;
pub use transform::TransformProgramPipe;
pub use transform::Transformed;
pub use transform::TransformedMulti;
pub use transform::TransformedValue;
pub use transform::Transformer;
pub use transform::transform_list;
pub use transform::transform_list_multi;
pub use validator::Validator;
pub use visitor::Visitor;

pub use crate::errors::MachineMetadataKey;
pub use crate::errors::ValidationMessage;
pub use crate::errors::ValidationMessageWithData;

/// Re-exported values to be used by the `associated_data_impl!` macro.
pub mod reexport {
    pub use common::NamedItem;
    pub use common::WithLocation;
    pub use fnv::FnvHasher;
    pub use intern::string_key;
    pub use intern::string_key::Intern;
    pub use intern::string_key::StringKey;
    pub use once_cell::sync::Lazy;

    pub use crate::associated_data::AsAny;
}
