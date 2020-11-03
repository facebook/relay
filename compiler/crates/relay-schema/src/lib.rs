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

use common::DiagnosticsResult;
use schema::Schema;
use std::iter::once;

const RELAY_EXTENSIONS: &str = include_str!("./relay-extensions.graphql");

pub fn build_schema_with_extensions<T: AsRef<str>, U: AsRef<str>>(
    server_sdls: &[T],
    extension_sdls: &[U],
) -> DiagnosticsResult<Schema> {
    let extensions: Vec<&str> = once(RELAY_EXTENSIONS)
        .chain(extension_sdls.iter().map(|sdl| sdl.as_ref()))
        .collect();
    schema::build_schema_with_extensions(server_sdls, &extensions)
}
