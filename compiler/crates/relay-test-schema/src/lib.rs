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
use std::sync::LazyLock;

use common::SourceLocationKey;
use relay_schema::build_schema_with_extensions_parallel;
use schema::SDLSchema;

const TEST_SCHEMA_DATA: &str = include_str!("testschema.graphql");
const TEST_SCHEMA_WITH_CUSTOM_ID_DATA: &str = include_str!("testschema_with_custom_id.graphql");

pub static TEST_SCHEMA: LazyLock<Arc<SDLSchema>> = LazyLock::new(|| {
    Arc::new(
        build_schema_with_extensions_parallel::<_, &str>(
            &[(TEST_SCHEMA_DATA, SourceLocationKey::generated())],
            &[],
        )
        .expect("Expected test schema to be valid"),
    )
});

pub static TEST_SCHEMA_WITH_CUSTOM_ID: LazyLock<Arc<SDLSchema>> = LazyLock::new(|| {
    Arc::new(
        build_schema_with_extensions_parallel::<_, &str>(
            &[(
                TEST_SCHEMA_WITH_CUSTOM_ID_DATA,
                SourceLocationKey::generated(),
            )],
            &[],
        )
        .expect("Expected test schema to be valid"),
    )
});

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
        build_schema_with_extensions_parallel(
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
        build_schema_with_extensions_parallel(
            &[(
                TEST_SCHEMA_WITH_CUSTOM_ID_DATA,
                SourceLocationKey::generated(),
            )],
            &[(extensions_sdl, SourceLocationKey::generated())],
        )
        .expect("Expected test schema (and extensions) to be valid"),
    )
}
