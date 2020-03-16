/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod print_full_operation;
mod print_to_text;

pub use print_full_operation::print_full_operation;
pub use print_to_text::{
    print_arguments, print_definition, print_directives, print_fragment, print_ir, print_operation,
    write_arguments, write_directives,
};
