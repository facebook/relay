/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
// #![deny(clippy::all)]
#![deny(clippy::clone_on_ref_ptr)]

mod build;
mod errors;
mod ir;
mod program;
mod signatures;
mod transform;
mod validator;
mod visitor;

pub use crate::errors::{ValidationError, ValidationMessage};
pub use build::build_ir as build;
pub use ir::*;
pub use program::Program;
pub use transform::{Transformed, TransformedValue, Transformer};
pub use validator::Validator;
pub use visitor::Visitor;
