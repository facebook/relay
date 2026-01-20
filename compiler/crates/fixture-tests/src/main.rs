/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(clippy::all)]

use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;
use std::path::PathBuf;

use clap::Parser;
use colored::Colorize;
use signedsource::SIGNING_TOKEN;
use signedsource::sign_file;

#[derive(Debug, Parser)]
#[clap(name = "fixture-tests", about = "Generates fixture tests.")]
struct Options {
    /// List of directories, each should contain a `/fixtures` subdirectory
    /// from which a test file will be generated
    #[clap(name = "DIR")]
    dirs: Vec<PathBuf>,

    #[clap(long)]
    customized_header: Option<String>,

    #[clap(long)]
    customized_snapshot_fixer: Option<String>,
}
#[derive(Debug)]
struct TestCase {
    name: String,
    input: Option<PathBuf>,
    expected: Option<PathBuf>,
}

const EXPECTED_EXTENSION: &str = "expected";

fn main() {
    let opt = Options::parse();

    for dir in opt.dirs {
        let test_name = dir.file_name().unwrap().to_str().unwrap();
        let fixtures_dir = dir.join("fixtures");
        let paths = fs::read_dir(&fixtures_dir)
            .unwrap_or_else(|_| panic!("Fixtures dir does not exist: {:?}", &fixtures_dir));
        let mut test_cases: HashMap<String, TestCase> = HashMap::new();
        for dir_entry in paths {
            let path = dir_entry.unwrap().path();
            if path.extension().is_none() {
                continue;
            }
            let name = sanitize_identifier(path.file_stem().unwrap().to_str().unwrap());
            let test_case = test_cases.entry(name.clone()).or_insert_with(|| TestCase {
                name,
                input: None,
                expected: None,
            });
            if path.extension().unwrap() == EXPECTED_EXTENSION {
                if let Some(ref previous) = test_case.expected {
                    panic!("Conflicting fixture name, {previous:?} and {path:?}");
                }
                test_case.expected = Some(path);
            } else {
                if let Some(ref previous) = test_case.input {
                    panic!("Conflicting fixture name, {previous:?} and {path:?}");
                }
                test_case.input = Some(path);
            }
        }
        for test_case in test_cases.values_mut() {
            if test_case.expected.is_none()
                && let Some(ref input) = test_case.input
            {
                let mut expected = input.clone();
                expected.set_extension(EXPECTED_EXTENSION);
                let fixer = match &opt.customized_snapshot_fixer {
                        Some(customized) => customized.as_str().as_bytes(),
                        None => {
                            "\x40nocommit\nRun snapshot tests with UPDATE_SNAPSHOTS=1 to update this new file.\n".as_bytes()
                        }
                    };
                File::create(&expected).unwrap().write_all(fixer).unwrap();
                test_case.expected = Some(expected);
            }
        }
        let mut test_cases: Vec<(_, _)> = test_cases.into_iter().collect();
        test_cases.sort_by_key(|entry| entry.0.to_owned());

        let test_cases = test_cases
            .into_iter()
            .map(|(_, test_case)| {
                let test_case_name = &test_case.name;
                format!(
                    r#"#[tokio::test]
async fn {0}() {{
    let input = include_str!("{1}/fixtures/{2}");
    let expected = include_str!("{1}/fixtures/{3}");
    test_fixture(transform_fixture, file!(), "{2}", "{1}/fixtures/{3}", input, expected).await;
}}"#,
                    test_case.name,
                    &test_name,
                    test_case
                        .input
                        .unwrap_or_else(|| panic!(
                            "Expected input for test {test_case_name:?} to exist"
                        ))
                        .file_name()
                        .and_then(|x| x.to_str())
                        .unwrap(),
                    test_case
                        .expected
                        .unwrap_or_else(|| panic!(
                            "Expected output for test {test_case_name:?} to exist"
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

        // Slightly hacky way to find out if these fixture tests are in the OSS
        // directory. This test should work on GitHub and in the internal repo.
        let is_oss = dir
            .components()
            .any(|comp| comp == std::path::Component::Normal("crates".as_ref()));

        let header = if is_oss {
            format!(
                "/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * {SIGNING_TOKEN}
 */
",
            )
        } else if let Some(customized_header) = &opt.customized_header {
            format!("// {SIGNING_TOKEN}\n// {customized_header}\n")
        } else {
            format!(
                "// {signing_token}
// Generated by $ cargo run -p fixture-tests -- {dir_name}
",
                signing_token = SIGNING_TOKEN,
                dir_name = dir.display(),
            )
        };

        let content = format!(
            "{header}
mod {test_name};

use {test_name}::transform_fixture;
use fixture_tests::test_fixture;

{test_cases}
",
            header = header,
            test_name = &test_name,
            test_cases = test_cases,
        );
        file.write_all(sign_file(&content).as_bytes()).unwrap();
        check_targets_file(&dir);
    }
}

fn check_targets_file(test_dir: &Path) {
    let targets_path = test_dir.parent().unwrap().parent().unwrap().join("TARGETS");
    let targets_content = match std::fs::read_to_string(&targets_path) {
        Ok(content) => content,
        Err(_) => return,
    };

    let expected_substr = format!(
        "\"tests/{}_test.rs\"",
        test_dir.file_stem().unwrap().to_str().unwrap()
    );

    if !targets_content.contains(&expected_substr) {
        eprintln!(
            "{}",
            format!("WARNING: expected {targets_path:?} to contain substring {expected_substr}")
                .yellow()
        );
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
