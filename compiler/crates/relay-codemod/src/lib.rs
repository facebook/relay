/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod codemod;

pub use crate::codemod::AvailableCodemod;
pub use crate::codemod::fix_diagnostics;
pub use crate::codemod::run_codemod;
pub use crate::codemod::run_codemod_impl;
