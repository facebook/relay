/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
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
mod utils;

use common::DiagnosticsResult;
use common::SourceLocationKey;
use common::WithDiagnostics;
pub use lexer::TokenKind;
pub use node::*;
pub use parser::FragmentArgumentSyntaxKind;
pub use parser::ParserFeatures;
pub use source::GraphQLSource;
pub use syntax_error::SyntaxError;
pub use utils::*;

use crate::parser::Parser;

/// Parses a GraphQL document that might contain type system and executable
/// definitions.
pub fn parse_document(
    source: &str,
    source_location: SourceLocationKey,
) -> DiagnosticsResult<Document> {
    let features = ParserFeatures::default();
    let parser = Parser::new(source, source_location, features);
    parser.parse_document()
}

/// Parses a GraphQL document that might contain type system and executable
/// definitions with custom feature flags passed as `features`.
pub fn parse_document_with_features(
    source: &str,
    source_location: SourceLocationKey,
    features: ParserFeatures,
) -> DiagnosticsResult<Document> {
    let parser = Parser::new(source, source_location, features);
    parser.parse_document()
}

/// Parses a GraphQL document that's restricted to executable definitions.
pub fn parse_executable(
    source: &str,
    source_location: SourceLocationKey,
) -> DiagnosticsResult<ExecutableDocument> {
    parse_executable_with_error_recovery(source, source_location).into()
}

/// Parses a GraphQL document that's restricted to executable definitions,
/// with error recovery.
pub fn parse_executable_with_error_recovery(
    source: &str,
    source_location: SourceLocationKey,
) -> WithDiagnostics<ExecutableDocument> {
    let features = ParserFeatures::default();
    let parser = Parser::new(source, source_location, features);
    parser.parse_executable_document()
}

/// Parses a GraphQL document that's restricted to executable definitions,
/// with error recovery and customed ParserFeatures.
pub fn parse_executable_with_error_recovery_and_parser_features(
    source: &str,
    source_location: SourceLocationKey,
    features: ParserFeatures,
) -> WithDiagnostics<ExecutableDocument> {
    let parser = Parser::new(source, source_location, features);
    parser.parse_executable_document()
}

/// Parses a GraphQL document that's restricted to executable
/// definitions with custom feature flags passed as `features`.
pub fn parse_executable_with_features(
    source: &str,
    source_location: SourceLocationKey,
    features: ParserFeatures,
) -> DiagnosticsResult<ExecutableDocument> {
    parse_executable_with_error_recovery_and_parser_features(source, source_location, features)
        .into()
}

/// Parses a GraphQL document that's restricted to type system definitions
/// including schema definition, type definitions and type system extensions.
pub fn parse_schema_document(
    source: &str,
    source_location: SourceLocationKey,
) -> DiagnosticsResult<SchemaDocument> {
    let features = ParserFeatures::default();
    let parser = Parser::new(source, source_location, features);
    parser.parse_schema_document()
}

pub fn parse_field_definition(
    source: &str,
    source_location: SourceLocationKey,
    offset: u32,
) -> DiagnosticsResult<FieldDefinition> {
    let features = ParserFeatures::default();
    let parser = Parser::with_offset(source, source_location, features, offset);
    parser.parse_field_definition()
}

pub fn parse_field_definition_stub(
    source: &str,
    source_location: SourceLocationKey,
    offset: u32,
) -> DiagnosticsResult<FieldDefinitionStub> {
    let features = ParserFeatures::default();
    let parser = Parser::with_offset(source, source_location, features, offset);
    parser.parse_field_definition_stub()
}

/// Parses a GraphQL type, such as `ID` or `[User!]!`.
pub fn parse_type(
    source: &str,
    source_location: SourceLocationKey,
    offset: u32,
) -> DiagnosticsResult<TypeAnnotation> {
    let features = ParserFeatures::default();
    let parser = Parser::with_offset(source, source_location, features, offset);
    parser.parse_type()
}

/// Parses a GraphQL identifier, such as `foo` or `User`.
pub fn parse_identifier(
    source: &str,
    source_location: SourceLocationKey,
    offset: u32,
) -> DiagnosticsResult<Identifier> {
    let features = ParserFeatures::default();
    let parser = Parser::with_offset(source, source_location, features, offset);
    parser.parse_identifier_result()
}

/// Parses a GraphQL document that's restricted to type system definitions
/// including schema definition, type definitions and type system extensions.
pub fn parse_directive(
    source: &str,
    source_location: SourceLocationKey,
    offset: u32,
) -> DiagnosticsResult<Directive> {
    let features = ParserFeatures::default();
    let parser = Parser::with_offset(source, source_location, features, offset);
    parser.parse_directive()
}
