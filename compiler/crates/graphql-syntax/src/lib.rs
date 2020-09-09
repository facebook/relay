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
mod node;
mod parser;
mod source;
mod syntax_error;

pub use node::*;
pub use parser::ParserFeatures;
pub use source::GraphQLSource;
pub use syntax_error::SyntaxError;

use crate::parser::Parser;
use common::{DiagnosticsResult, SourceLocationKey};

pub fn parse_executable(
    source: &str,
    source_location: SourceLocationKey,
) -> DiagnosticsResult<ExecutableDocument> {
    let features = ParserFeatures::default();
    let parser = Parser::new(source, source_location, features);
    parser.parse_executable_document()
}

pub fn parse_executable_with_features(
    source: &str,
    source_location: SourceLocationKey,
    features: ParserFeatures,
) -> DiagnosticsResult<ExecutableDocument> {
    let parser = Parser::new(source, source_location, features);
    parser.parse_executable_document()
}

pub fn parse_type(
    source: &str,
    source_location: SourceLocationKey,
) -> DiagnosticsResult<TypeAnnotation> {
    let features = ParserFeatures::default();
    let parser = Parser::new(source, source_location, features);
    parser.parse_type()
}
