/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

use std::sync::Arc;

use common::SourceLocationKey;
use lazy_static::lazy_static;
use relay_schema::build_schema_with_extensions;
use schema::SDLSchema;

const TEST_SCHEMA_DATA: &str = include_str!("testschema.graphql");
const TEST_SCHEMA_WITH_CUSTOM_ID_DATA: &str = include_str!("testschema_with_custom_id.graphql");

lazy_static! {
    pub static ref TEST_SCHEMA: Arc<SDLSchema> = Arc::new(
        build_schema_with_extensions::<_, &str>(
            &[(TEST_SCHEMA_DATA, SourceLocationKey::generated())],
            &[]
        )
        .expect("Expected test schema to be valid")
    );
    pub static ref TEST_SCHEMA_WITH_CUSTOM_ID: Arc<SDLSchema> = Arc::new(
        build_schema_with_extensions::<_, &str>(
            &[(
                TEST_SCHEMA_WITH_CUSTOM_ID_DATA,
                SourceLocationKey::generated()
            )],
            &[]
        )
        .expect("Expected test schema to be valid")
    );
}

pub fn get_test_schema() -> Arc<SDLSchema> {
    Arc::clone(&TEST_SCHEMA)
}

pub fn get_test_schema_with_extensions(extensions_sdl: &str) -> Arc<SDLSchema> {
    get_test_schema_with_located_extensions(extensions_sdl, SourceLocationKey::generated())
}

pub fn get_test_schema_with_located_extensions(
    extensions_sdl: &str,
    source_location: SourceLocationKey,
) -> Arc<SDLSchema> {
    Arc::new(
        build_schema_with_extensions(
            &[(TEST_SCHEMA_DATA, SourceLocationKey::generated())],
            &[(extensions_sdl, source_location)],
        )
        .expect("Expected test schema (and extensions) to be valid"),
    )
}

pub fn get_test_schema_with_custom_id() -> Arc<SDLSchema> {
    Arc::clone(&TEST_SCHEMA_WITH_CUSTOM_ID)
}

pub fn get_test_schema_with_custom_id_with_extensions(extensions_sdl: &str) -> Arc<SDLSchema> {
    Arc::new(
        build_schema_with_extensions(
            &[(
                TEST_SCHEMA_WITH_CUSTOM_ID_DATA,
                SourceLocationKey::generated(),
            )],
            &[(extensions_sdl, SourceLocationKey::generated())],
        )
        .expect("Expected test schema (and extensions) to be valid"),
    )
}
