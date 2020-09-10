/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(clippy::all)]

use signedsource::{sign_file, SIGNING_TOKEN};
use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::io::prelude::*;
use std::path::PathBuf;
use structopt::StructOpt;

#[derive(Debug, StructOpt)]
#[structopt(name = "fixture-tests", about = "Fixture tests")]
struct Options {
    #[structopt(name = "DIR", parse(from_os_str))]
    dirs: Vec<PathBuf>,
}

#[derive(Debug)]
struct TestCase {
    name: String,
    input: Option<PathBuf>,
    expected: Option<PathBuf>,
}

const EXPECTED_EXTENSION: &str = "expected";
const TODO: &str = "TODO";

fn main() {
    let opt = Options::from_args();

    for dir in opt.dirs {
        let test_name = dir.file_name().unwrap().to_str().unwrap();
        let fixtures_dir = dir.join("fixtures");
        let paths = fs::read_dir(&fixtures_dir)
            .unwrap_or_else(|_| panic!("Fixtures dir does not exist: {:?}", &fixtures_dir));
        let mut test_cases: HashMap<String, TestCase> = HashMap::new();
        for dir_entry in paths {
            let path = dir_entry.unwrap().path();
            if path
                .extension()
                .unwrap_or_else(|| panic!("unexpected path {:?}", &path))
                == TODO
            {
                continue;
            }
            let name = sanitize_identifier(path.file_stem().unwrap().to_str().unwrap());
            let mut test_case = test_cases.entry(name.clone()).or_insert_with(|| TestCase {
                name,
                input: None,
                expected: None,
            });
            if path.extension().unwrap() == EXPECTED_EXTENSION {
                if let Some(ref previous) = test_case.expected {
                    panic!("Conflicting fixture name, {:?} and {:?}", previous, path);
                }
                test_case.expected = Some(path);
            } else {
                if let Some(ref previous) = test_case.input {
                    panic!("Conflicting fixture name, {:?} and {:?}", previous, path);
                }
                test_case.input = Some(path);
            }
        }
        for mut test_case in test_cases.values_mut() {
            if test_case.expected.is_none() {
                if let Some(ref input) = test_case.input {
                    let mut expected = input.clone();
                    expected.set_extension(EXPECTED_EXTENSION);
                    File::create(&expected)
                        .unwrap()
                        .write_all(
                            "\x40nocommit\nRun snapshot tests with UPDATE_SNAPSHOTS=1 to update this new file.\n"
                            .as_bytes(),
                        )
                        .unwrap();
                    test_case.expected = Some(expected);
                }
            }
        }
        let mut test_cases: Vec<(_, _)> = test_cases.into_iter().collect();
        test_cases.sort_by_key(|entry| entry.0.to_owned());

        let test_cases = test_cases
            .into_iter()
            .map(|(_, test_case)| {
                let test_case_name = &test_case.name;
                format!(
                    r#"#[test]
fn {0}() {{
    let input = include_str!("{1}/fixtures/{2}");
    let expected = include_str!("{1}/fixtures/{3}");
    test_fixture(transform_fixture, "{2}", "{1}/fixtures/{3}", input, expected);
}}"#,
                    test_case.name,
                    &test_name,
                    test_case
                        .input
                        .unwrap_or_else(|| panic!(
                            "Expected input for test {:?} to exist",
                            test_case_name
                        ))
                        .file_name()
                        .and_then(|x| x.to_str())
                        .unwrap(),
                    test_case
                        .expected
                        .unwrap_or_else(|| panic!(
                            "Expected output for test {:?} to exist",
                            test_case_name
                        ))
                        .file_name()
                        .and_then(|x| x.to_str())
                        .unwrap()
                )
            })
            .collect::<Vec<_>>()
            .join("\n\n");

        let mut file = File::create(
            dir.parent()
                .unwrap()
                .join(format!("{}_test.rs", &test_name)),
        )
        .unwrap();
        file.write_all(
            sign_file(&format!(
                "// {0}

mod {1};

use {1}::transform_fixture;
use fixture_tests::test_fixture;

{2}
",
                SIGNING_TOKEN, &test_name, test_cases
            ))
            .as_bytes(),
        )
        .unwrap();
    }
}

fn sanitize_identifier(input: &str) -> String {
    input
        .chars()
        .map(|chr| match chr {
            'a'..='z' | '0'..='9' | '_' => chr,
            'A'..='Z' => chr.to_ascii_lowercase(),
            _ => '_',
        })
        .collect()
}
