/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]
#![allow(clippy::large_enum_variant)]

mod lexer;
mod parser;
mod source;
mod syntax_error;
mod syntax_node;

pub use source::GraphQLSource;
pub use syntax_error::{SyntaxError, SyntaxErrorKind, SyntaxErrorWithSource, SyntaxResult};
pub use syntax_node::*;

use crate::parser::Parser;
use common::SourceLocationKey;

pub fn parse_executable(
    source: &str,
    source_location: SourceLocationKey,
) -> SyntaxResult<ExecutableDocument> {
    let parser = Parser::new(source, source_location);
    parser.parse_executable_document()
}

pub fn parse_type(
    source: &str,
    source_location: SourceLocationKey,
) -> SyntaxResult<TypeAnnotation> {
    let parser = Parser::new(source, source_location);
    parser.parse_type()
}
