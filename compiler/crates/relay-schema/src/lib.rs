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

use common::{DiagnosticsResult, SourceLocationKey};
use intern::intern;
use schema::{ArgumentDefinitions, SDLSchema, TypeReference};
use std::iter::once;

const RELAY_EXTENSIONS: &str = include_str!("./relay-extensions.graphql");

pub fn build_schema_with_extensions<T: AsRef<str>, U: AsRef<str>>(
    server_sdls: &[T],
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
    for directive_name in &[intern!("defer"), intern!("stream")] {
        if let Some(directive) = schema.get_directive_mut(*directive_name) {
            let mut next_args: Vec<_> = directive.arguments.iter().cloned().collect();
            for arg in next_args.iter_mut() {
                if arg.name == intern!("label") {
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
