/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
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
mod minimized_executable;
mod schema_change_analyzer;

pub use ast::ReachableAst;
pub use ast::get_definition_references;
pub use ast::get_reachable_ast;
pub use ir::ExecutableDefinitionNameMap;
pub use ir::ExecutableDefinitionNameSet;
pub use ir::ExecutableDefinitionNameVec;
pub use ir::get_ir_definition_references;
pub use ir::get_reachable_ir;
pub use minimized_executable::MinProgram;
