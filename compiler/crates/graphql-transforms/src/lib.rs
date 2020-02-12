/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod compiler_context;
mod generate_typename;
mod inline_fragments;
mod sort_selections;

pub use compiler_context::CompilerContext;
pub use generate_typename::generate_typename;
pub use inline_fragments::inline_fragments;
pub use sort_selections::sort_selections;
