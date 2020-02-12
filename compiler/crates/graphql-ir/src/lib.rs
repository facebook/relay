/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]
#![allow(clippy::clone_on_copy)]

mod build;
mod error_combinators;
mod errors;
mod ir;
mod signatures;
mod transform;
mod visitor;

pub use build::build_ir as build;
pub use errors::{ValidationError, ValidationErrors, ValidationMessage, ValidationResult};
pub use ir::*;
pub use transform::{Transformed, Transformer};
pub use visitor::Visitor;
