/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
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
mod field_descriptions;
mod flatbuffer;
mod graphql_schema;
mod in_memory;
mod schema;
pub mod suggestion_list;

use common::DiagnosticsResult;
use common::SourceLocationKey;
pub use definitions::Argument;
pub use definitions::ArgumentDefinitions;
pub use definitions::ArgumentValue;
pub use definitions::Directive;
pub use definitions::DirectiveValue;
pub use definitions::Enum;
pub use definitions::EnumID;
pub use definitions::EnumValue;
pub use definitions::Field;
pub use definitions::FieldID;
pub use definitions::InputObject;
pub use definitions::InputObjectID;
pub use definitions::Interface;
pub use definitions::InterfaceID;
pub use definitions::Object;
pub use definitions::ObjectID;
pub use definitions::Scalar;
pub use definitions::ScalarID;
pub use definitions::Type;
pub use definitions::TypeReference;
pub use definitions::TypeWithFields;
pub use definitions::Union;
pub use definitions::UnionID;
pub use errors::Result;
pub use errors::SchemaError;
use flatbuffer::FlatBufferSchema;
pub use flatbuffer::SchemaWrapper;
pub use graphql_schema::Schema;
pub use graphql_syntax::DirectiveLocation;
use graphql_syntax::SchemaDocument;
pub use graphql_syntax::TypeSystemDefinition;
pub use in_memory::InMemorySchema;

pub use crate::schema::SDLSchema;

const BUILTINS: &str = include_str!("./builtins.graphql");

pub use flatbuffer::serialize_as_flatbuffer;

pub fn build_schema(sdl: &str) -> DiagnosticsResult<SDLSchema> {
    build_schema_with_extensions::<_, &str>(&[(sdl, SourceLocationKey::generated())], &[])
}

pub fn build_schema_with_extensions<T: AsRef<str>, U: AsRef<str>>(
    server_sdls: &[(T, SourceLocationKey)],
    extension_sdls: &[(U, SourceLocationKey)],
) -> DiagnosticsResult<SDLSchema> {
    let mut server_documents = vec![builtins()?];

    let server_schema_document = match server_sdls {
        [(sdl, source_location)] => {
            graphql_syntax::parse_schema_document(sdl.as_ref(), *source_location)?
        }
        _ => {
            // When the schema is split across multiple files, the individual
            // files may not be syntactically complete, so we join them together
            // before parsing.

            // Note that this requires us to use a generates source location key which
            // means click to definition for schema files will not work.
            let mut combined_sdl: String = String::new();
            for (sdl, _) in server_sdls {
                combined_sdl.push_str(sdl.as_ref());
                combined_sdl.push('\n');
            }
            graphql_syntax::parse_schema_document(&combined_sdl, SourceLocationKey::Generated)?
        }
    };

    server_documents.push(server_schema_document);

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
