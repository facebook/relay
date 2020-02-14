/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

use criterion::{black_box, criterion_group, criterion_main, Criterion};
use graphql_ir::{build, Program};
use graphql_syntax::parse;
use graphql_transforms::{generate_typename, inline_fragments, sort_selections};
use std::env;
use std::fs;
use test_schema::TEST_SCHEMA;

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

        let file_data = fs::read_to_string(&file_path).unwrap();
        let ast = parse(&file_data, file_name)
            .unwrap_or_else(|error| panic!("failed to parse: {}: {:?}", file_name, error));
        let ir = build(&TEST_SCHEMA, &ast.definitions)
            .unwrap_or_else(|error| panic!("failed to build ir: {}: {:?}", file_name, error));

        let program = Program::from_definitions(&TEST_SCHEMA, ir);

        c.bench_function(&format!("inline_fragments::{}", file_name), |b| {
            b.iter(|| {
                let program = inline_fragments(black_box(&program));
                black_box(&program);
            })
        });
        c.bench_function(&format!("generate_typename::{}", file_name), |b| {
            b.iter(|| {
                let program = generate_typename(black_box(&program));
                black_box(&program);
            })
        });
        c.bench_function(&format!("sort_selections::{}", file_name), |b| {
            b.iter(|| {
                let program = sort_selections(black_box(&program));
                black_box(&program);
            })
        });
        c.bench_function(&format!("combined::{}", file_name), |b| {
            b.iter(|| {
                let program = inline_fragments(black_box(&program));
                let program = generate_typename(black_box(&program));
                let program = sort_selections(black_box(&program));
                black_box(&program);
            })
        });
    }
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
