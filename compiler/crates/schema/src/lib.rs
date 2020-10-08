/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! This crate contains a GraphQL schema representation.

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

pub mod definitions;
mod errors;

use common::{DiagnosticsResult, SourceLocationKey};
pub use definitions::{
    Argument, ArgumentDefinitions, ArgumentValue, Directive, DirectiveValue, Enum, EnumID,
    EnumValue, Field, FieldID, InputObject, InputObjectID, Interface, InterfaceID, Object,
    ObjectID, Scalar, ScalarID, Schema, Type, TypeReference, TypeWithFields, Union, UnionID,
};
pub use errors::{Result, SchemaError};
pub use graphql_syntax::DirectiveLocation;

pub const BUILTINS: &str = include_str!("./builtins.graphql");

pub const RELAY_EXTENSIONS: &str = include_str!("./relay-extensions.graphql");

pub fn build_schema(sdl: &str) -> DiagnosticsResult<Schema> {
    build_schema_with_extensions::<_, &str>(&[sdl], &[])
}

pub fn build_schema_with_extensions<T: AsRef<str>, U: AsRef<str>>(
    server_sdls: &[T],
    extension_sdls: &[U],
) -> DiagnosticsResult<Schema> {
    let mut server_definitions = {
        let schema_doc =
            graphql_syntax::parse_schema_document(BUILTINS, SourceLocationKey::generated())?;
        schema_doc.definitions
    };

    let mut combined_sdl: String = String::new();
    for server_sdl in server_sdls {
        combined_sdl.push_str(server_sdl.as_ref());
        combined_sdl.push_str("\n");
    }
    server_definitions.extend(
        graphql_syntax::parse_schema_document(&combined_sdl, SourceLocationKey::generated())?
            .definitions,
    );

    let mut extension_definitions = Vec::new();
    for extension_sdl in extension_sdls {
        extension_definitions.extend(
            graphql_syntax::parse_schema_document(
                extension_sdl.as_ref(),
                SourceLocationKey::generated(),
            )?
            .definitions,
        );
    }

    Schema::build(&server_definitions, &extension_definitions)
}

pub fn parse_schema_document(input: &str) -> DiagnosticsResult<graphql_syntax::SchemaDocument> {
    graphql_syntax::parse_schema_document(input, SourceLocationKey::generated())
}
