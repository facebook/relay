/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod build_codegen_ast;
mod codegen_ast;
mod print_to_json;

pub use print_to_json::{
    print_fragment, print_fragment_deduped, print_operation, print_operation_deduped,
    print_request_deduped,
};
