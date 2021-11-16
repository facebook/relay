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
mod flatbuffer;
mod graphql_schema;
mod in_memory;
mod schema;

pub use crate::schema::SDLSchema;
use common::{DiagnosticsResult, SourceLocationKey};
pub use definitions::{
    Argument, ArgumentDefinitions, ArgumentValue, Directive, DirectiveValue, Enum, EnumID,
    EnumValue, Field, FieldID, InputObject, InputObjectID, Interface, InterfaceID, Object,
    ObjectID, Scalar, ScalarID, Type, TypeReference, TypeWithFields, Union, UnionID,
};
pub use errors::{Result, SchemaError};
use flatbuffer::FlatBufferSchema;
pub use flatbuffer::SchemaWrapper;
pub use graphql_schema::Schema;
use graphql_syntax::SchemaDocument;
pub use graphql_syntax::{DirectiveLocation, TypeSystemDefinition};
pub use in_memory::InMemorySchema;

const BUILTINS: &str = include_str!("./builtins.graphql");

pub use flatbuffer::serialize_as_flatbuffer;

pub fn build_schema(sdl: &str) -> DiagnosticsResult<SDLSchema> {
    build_schema_with_extensions::<_, &str>(&[sdl], &[])
}

pub fn build_schema_with_extensions<T: AsRef<str>, U: AsRef<str>>(
    server_sdls: &[T],
    extension_sdls: &[(U, SourceLocationKey)],
) -> DiagnosticsResult<SDLSchema> {
    let mut server_documents = vec![builtins()?];
    let mut combined_sdl: String = String::new();
    for server_sdl in server_sdls {
        combined_sdl.push_str(server_sdl.as_ref());
        combined_sdl.push('\n');
    }
    server_documents.push(graphql_syntax::parse_schema_document(
        &combined_sdl,
        SourceLocationKey::generated(),
    )?);

    let mut client_schema_documents = Vec::new();
    for (extension_sdl, location_key) in extension_sdls {
        client_schema_documents.push(graphql_syntax::parse_schema_document(
            extension_sdl.as_ref(),
            *location_key,
        )?);
    }

    SDLSchema::build(&server_documents, &client_schema_documents)
}

pub fn build_schema_with_flat_buffer(bytes: Vec<u8>) -> SDLSchema {
    SDLSchema::FlatBuffer(SchemaWrapper::from_vec(bytes))
}

pub fn build_schema_from_flat_buffer(bytes: &[u8]) -> DiagnosticsResult<FlatBufferSchema<'_>> {
    Ok(FlatBufferSchema::build(bytes))
}

pub fn builtins() -> DiagnosticsResult<SchemaDocument> {
    graphql_syntax::parse_schema_document(BUILTINS, SourceLocationKey::generated())
}
