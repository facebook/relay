/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

use common::SourceLocationKey;
use lazy_static::lazy_static;
use relay_schema::build_schema_with_extensions;
use schema::SDLSchema;
use std::sync::Arc;

const TEST_SCHEMA_DATA: &str = include_str!("testschema.graphql");

lazy_static! {
    pub static ref TEST_SCHEMA: Arc<SDLSchema> = Arc::new(
        build_schema_with_extensions::<_, &str>(&[TEST_SCHEMA_DATA], &[])
            .expect("Expected test schema to be valid")
    );
}

pub fn get_test_schema() -> Arc<SDLSchema> {
    Arc::clone(&TEST_SCHEMA)
}

pub fn get_test_schema_with_extensions(extensions_sdl: &str) -> Arc<SDLSchema> {
    Arc::new(
        build_schema_with_extensions(
            &[TEST_SCHEMA_DATA],
            &[(extensions_sdl, SourceLocationKey::generated())],
        )
        .expect("Expected test schema (and extensions) to be valid"),
    )
}
