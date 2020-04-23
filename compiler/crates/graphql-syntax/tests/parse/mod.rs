/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::FileKey;
use fixture_tests::Fixture;
use graphql_syntax::{parse, GraphQLSource};

pub fn transform_fixture(fixture: &Fixture) -> Result<String, String> {
    parse(fixture.content, FileKey::new(fixture.file_name))
        .map(|x| format!("{:#?}", x))
        .map_err(|errors| {
            errors
                .into_iter()
                .map(|error| error.print(&GraphQLSource::new(fixture.content, 0, 0)))
                .collect::<Vec<_>>()
                .join("\n\n")
        })
}
