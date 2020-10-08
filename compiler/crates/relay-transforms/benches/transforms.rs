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
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use graphql_ir::{build, Program};
use graphql_syntax::parse_executable;
use relay_transforms::{
    generate_id_field, generate_typename, inline_fragments, skip_client_extensions, sort_selections,
};
use std::env;
use std::fs;
use test_schema::{get_test_schema, get_test_schema_with_extensions};

pub fn criterion_benchmark(c: &mut Criterion) {
    let mut path = env::current_dir().unwrap();
    path.push("benches");
    path.push("fixtures");

    for entry in fs::read_dir(&path).unwrap() {
        let file_path = entry.unwrap().path();
        if file_path.is_dir() {
            continue;
        }
        let file_name = file_path.file_stem().unwrap().to_str().unwrap();
        let source_location = SourceLocationKey::standalone(file_name);
        let file_data = fs::read_to_string(&file_path).unwrap();
        let parts: Vec<_> = file_data.split("%extensions%").collect();
        let (source, schema) = match parts.as_slice() {
            [source, extensions] => (source, get_test_schema_with_extensions(extensions)),
            [source] => (source, get_test_schema()),
            _ => panic!("Expected at most one %extensions% separator."),
        };
        let ast = parse_executable(source, source_location)
            .unwrap_or_else(|error| panic!("failed to parse: {}: {:?}", file_name, error));
        let ir = build(&schema, &ast.definitions)
            .unwrap_or_else(|error| panic!("failed to build ir: {}: {:?}", file_name, error));
        let program = Program::from_definitions(schema, ir);

        c.bench_function(&format!("inline_fragments::{}", file_name), |b| {
            b.iter(|| {
                let program = inline_fragments(black_box(&program));
                black_box(&program);
            })
        });
        c.bench_function(&format!("generate_typename::{}", file_name), |b| {
            b.iter(|| {
                let program = generate_typename(black_box(&program), false);
                black_box(&program);
            })
        });
        c.bench_function(&format!("sort_selections::{}", file_name), |b| {
            b.iter(|| {
                let program = sort_selections(black_box(&program));
                black_box(&program);
            })
        });
        c.bench_function(&format!("skip_client_extensions::{}", file_name), |b| {
            b.iter(|| {
                let program = skip_client_extensions(black_box(&program));
                black_box(&program);
            })
        });
        c.bench_function(&format!("generate_id_field::{}", file_name), |b| {
            b.iter(|| {
                let program = generate_id_field(black_box(&program));
                black_box(&program);
            })
        });
        c.bench_function(&format!("combined::{}", file_name), |b| {
            b.iter(|| {
                let program = generate_id_field(black_box(&program));
                let program = inline_fragments(black_box(&program));
                let program = generate_typename(black_box(&program), false);
                let program = sort_selections(black_box(&program));
                let program = skip_client_extensions(black_box(&program));
                black_box(&program);
            })
        });
    }
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
