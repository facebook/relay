/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! This crate contains a Schema representation and a parser to parse a
//! GraphQL SDL string into a [`Schema`] instance.

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod definitions;
mod errors;
mod lexer;
mod parser;
mod token;
pub mod type_system_node_v1;

use common::{Diagnostic, DiagnosticsResult, Location};
pub use definitions::{
    Argument, ArgumentDefinitions, ArgumentValue, Directive, DirectiveValue, Enum, EnumID,
    EnumValue, Field, FieldID, InputObject, InputObjectID, Interface, InterfaceID, Object,
    ObjectID, Scalar, ScalarID, Schema, Type, TypeReference, TypeWithFields, Union, UnionID,
};
pub use errors::{Result, SchemaError};
use lexer::Lexer;
use parser::Parser;

pub const BUILTINS: &str = include_str!("./builtins.graphql");

pub const RELAY_EXTENSIONS: &str = include_str!("./relay-extensions.graphql");

pub fn build_schema(sdl: &str) -> DiagnosticsResult<Schema> {
    build_schema_with_extensions::<_, &str>(&[sdl], &[])
}

pub fn build_schema_with_extensions<T: AsRef<str>, U: AsRef<str>>(
    server_sdls: &[T],
    extension_sdls: &[U],
) -> DiagnosticsResult<Schema> {
    let mut server_definitions =
        parse_definitions(BUILTINS).map_err(todo_convert_to_diagnostics)?;

    let mut combined_sdl: String = String::new();
    for server_sdl in server_sdls {
        combined_sdl.push_str("\n");
        combined_sdl.push_str(server_sdl.as_ref());
    }
    server_definitions
        .extend(parse_definitions(&combined_sdl).map_err(todo_convert_to_diagnostics)?);

    let mut extension_definitions = Vec::new();
    for extension_sdl in extension_sdls {
        extension_definitions.extend(
            parse_definitions(extension_sdl.as_ref()).map_err(todo_convert_to_diagnostics)?,
        );
    }

    Schema::build(&server_definitions, &extension_definitions)
}

fn todo_convert_to_diagnostics(err: SchemaError) -> Vec<Diagnostic> {
    vec![Diagnostic::error(err, Location::generated())]
}

pub fn parse_definitions(input: &str) -> Result<Vec<type_system_node_v1::TypeSystemDefinition>> {
    let lexer = Lexer::new(input);
    let parser = Parser::new(lexer);
    parser.parse_schema_document()
}
