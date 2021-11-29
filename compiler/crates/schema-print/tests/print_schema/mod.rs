/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fixture_tests::Fixture;
use intern::string_key::Intern;
use schema::build_schema;
use schema_print::{print_directives, print_types_directives_as_shards};

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let schema = build_schema(fixture.content).unwrap();
    let mut type_shard_count = fnv::FnvHashMap::default();
    type_shard_count.insert("Query".intern(), 2);
    let directives = print_directives(&schema);
    let types = print_types_directives_as_shards(&schema, 4, type_shard_count)
        .join("\n=======Shard=======\n\n");
    Ok(format!("{}{}", directives, types))
}
