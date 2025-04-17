/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FeatureFlags;
use fixture_tests::Fixture;
use graphql_test_helpers::apply_transform_for_test;
use relay_config::DeferStreamInterface;
use relay_config::ModuleImportConfig;
use relay_config::ModuleProvider;
use relay_config::Surface;
use relay_transforms::transform_match;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let flags = FeatureFlags::default();
    let module_import_config = ModuleImportConfig {
        dynamic_module_provider: Some(ModuleProvider::JSResource),
        operation_module_provider: None,
        surface: Some(Surface::All),
    };
    let defer_stream_interface = DeferStreamInterface::default();
    apply_transform_for_test(fixture, |program| {
        transform_match(
            program,
            &flags,
            module_import_config,
            defer_stream_interface,
        )
    })
}
