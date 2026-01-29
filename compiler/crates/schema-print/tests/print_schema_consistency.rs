/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use diff::lines;
use fixture_tests::Fixture;
use intern::string_key::Intern;
use schema::build_schema;
use schema_print::print_types_directives_as_shards;
use schema_print::print_types_directives_as_shards_in_parallel;

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let schema = build_schema(fixture.content).unwrap();
    let mut type_shard_count = fnv::FnvHashMap::default();
    type_shard_count.insert("Query".intern(), 2);
    let sep = "\n=======Shard=======\n\n";
    let seq_sdl = print_types_directives_as_shards(&schema, 4, type_shard_count.clone()).join(sep);
    let mut par_shard_map =
        print_types_directives_as_shards_in_parallel(&schema, 4, type_shard_count.clone())
            .into_iter()
            .collect::<Vec<_>>();
    par_shard_map.sort_by_key(|(shard_key, _shard_content)| *shard_key);
    let par_sdl = par_shard_map
        .into_iter()
        .map(|(_, shard_content)| shard_content)
        .collect::<Vec<_>>()
        .join(sep);

    if seq_sdl != par_sdl {
        return Err(format!(
            "Sequential and parallel printing are inconsistent!\n\nDiff view\n\n{}",
            lines(&seq_sdl, &par_sdl)
                .iter()
                .map(|l| match l {
                    diff::Result::Left(l) => format!("seq: + {}\n", l),
                    diff::Result::Right(r) => format!("par: + {}\n", r),
                    diff::Result::Both(_l, _r) => "".to_string(),
                })
                .collect::<Vec<_>>()
                .join("")
        ));
    }
    Ok("SEQUENTIAL AND PARALLEL PRINTING ARE CONSISTENT".to_string())
}
