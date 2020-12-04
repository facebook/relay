/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Analyze IR dependencies and filter out the irrevelant IRs
#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod ast;
mod ir;

pub use ast::{get_definition_references, get_reachable_ast, ReachableAst};
pub use ir::get_reachable_ir;
