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

use std::iter::once;

use ::intern::string_key::StringKey;
use common::ArgumentName;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::SourceLocationKey;
use intern::intern;
use lazy_static::lazy_static;
use schema::ArgumentDefinitions;
use schema::SDLSchema;
use schema::TypeReference;

const RELAY_EXTENSIONS: &str = include_str!("./relay-extensions.graphql");

lazy_static! {
    static ref DEFER: DirectiveName = DirectiveName(intern!("defer"));
    static ref STREAM: DirectiveName = DirectiveName(intern!("stream"));
    static ref LABEL: ArgumentName = ArgumentName(intern!("label"));
    pub static ref CUSTOM_SCALAR_DIRECTIVE_NAME: StringKey = intern!("__RelayCustomScalar");
    pub static ref PATH_CUSTOM_SCALAR_ARGUMENT_NAME: StringKey = intern!("path");
    pub static ref EXPORT_NAME_CUSTOM_SCALAR_ARGUMENT_NAME: StringKey = intern!("export_name");
}

pub fn build_schema_with_extensions<T: AsRef<str>, U: AsRef<str>>(
    server_sdls: &[(T, SourceLocationKey)],
    extension_sdls: &[(U, SourceLocationKey)],
) -> DiagnosticsResult<SDLSchema> {
    let extensions: Vec<(&str, SourceLocationKey)> =
        once((RELAY_EXTENSIONS, SourceLocationKey::generated()))
            .chain(
                extension_sdls
                    .iter()
                    .map(|(source, location_key)| (source.as_ref(), *location_key)),
            )
            .collect();

    let mut schema = schema::build_schema_with_extensions(server_sdls, &extensions)?;

    // Remove label arg from @defer and @stream directives since the compiler
    // adds these arguments.
    for directive_name in &[*DEFER, *STREAM] {
        if let Some(directive) = schema.get_directive_mut(*directive_name) {
            let mut next_args: Vec<_> = directive.arguments.iter().cloned().collect();
            for arg in next_args.iter_mut() {
                if arg.name == *LABEL {
                    if let TypeReference::NonNull(of) = &arg.type_ {
                        arg.type_ = *of.clone()
                    };
                }
            }
            directive.arguments = ArgumentDefinitions::new(next_args);
        }
    }
    Ok(schema)
}
