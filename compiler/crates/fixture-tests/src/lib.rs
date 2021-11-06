/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

//! This crate aims to make it easy to write integration tests for any function
//! that transforms an input string to some output string.
//!
//! To write a test for a set of input files for some crate example-crate we
//! need the following parts:
//!
//! ```ignore
//! example-crate/
//!   src/ # typical source
//!   tests/ # directory of integration tests
//!     first_transform_test.rs # generated (see below)
//!     first_transform/
//!       mod.rs # exports the transform to test
//!       fixtures/
//!         fixture_one.txt
//!         fixture_one.expected
//!         fixture_two.txt
//!         fixture_two.expected
//! ```
//!
//! `tests/first_transform/mod.rs` exports the transform to test, for example:
//!
//! ```ignore
//! pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
//!   Ok(fixture.to_uppercase())
//! }
//! ```
//!
//! Once the fixtures are in place or new ones are added, `fixture-tests` can
//! be run as a binary to update the fixtures.
//!
//! ```ignore
//! cargo run -p fixture-tests "example-create/tests/first_transform"
//! ```
//!
//! *FB-internal: see `scripts/generate_fixture_tests.sh` to generate all.*
//
//! *FB-internal: use buck run //relay/oss/crates/fixture-tests:fixture-tests-bin -- <path to tests dir>
//! *FB-internal: if you don't want to use cargo run. This is useful for development on a dev-server or
//! *FB-internal: or machines w/o cargo installed.

mod print_diff;

use lazy_static::lazy_static;
use parking_lot::Mutex;
use std::env;
use std::fs::File;
use std::io::prelude::*;
use std::sync::Arc;

use signedsource as _; // used in main.rs, cargo only
use structopt as _; // used in main.rs, cargo only

lazy_static! {
    static ref LOCK: Arc<Mutex<usize>> = Arc::new(Mutex::new(0));
}

/// Passed to the `transform_fixture` from the test as the input to transform.
pub struct Fixture<'a> {
    /// File name that can be used if the transform needs it to print error messages, etc.
    pub file_name: &'a str,
    /// The text content of the fixture.
    pub content: &'a str,
}

/// This is an internal function and is typically called from generated code
/// containing one test per fixture.
pub fn test_fixture<T, U, V>(
    transform: T,
    input_file_name: &str,
    expected_file_name: &str,
    input: &str,
    expected: &str,
) where
    T: FnOnce(&Fixture<'_>) -> Result<U, V>,
    U: std::fmt::Display,
    V: std::fmt::Display,
{
    let fixture = Fixture {
        file_name: input_file_name,
        content: input,
    };
    let expect_ok = !input.contains("expected-to-throw");
    let actual_result: Result<U, V>;
    {
        let _guard = LOCK.lock();
        colored::control::set_override(false);
        actual_result = transform(&fixture);
        colored::control::unset_override();
    }

    let actual = match &actual_result {
        Ok(output) => format!(
            "==================================== INPUT ====================================
{}
==================================== OUTPUT ===================================
{}
",
            &fixture.content.trim(),
            output,
        ),
        Err(output) => format!(
            "==================================== INPUT ====================================
{}
==================================== ERROR ====================================
{}
",
            fixture.content.trim(),
            output
        ),
    };

    match actual_result {
        Ok(_) if !expect_ok => {
            panic!(
                "Expected transform to error but it succeeded, remove 'expected-to-throw' if this is expected"
            );
        }
        Err(error) if expect_ok => {
            panic!(
                "Expected transform to succeed but it failed with, use 'expected-to-throw' if this is expected. Error:
#############################################################################
{}
#############################################################################
",
                error
            );
        }
        _ => {}
    };

    let actual = format!("{}\n", actual.trim_end());
    if actual != expected {
        {
            let _guard = LOCK.lock();
            print_diff::print_diff(expected, &actual);
        }

        if env::var_os("UPDATE_SNAPSHOTS").is_some() {
            let file_name = format!("tests/{}", expected_file_name);
            File::create(&file_name)
                .unwrap_or_else(|_| {
                    panic!(
                        "Unable to create {}/{}",
                        env::current_dir().unwrap().to_str().unwrap(),
                        file_name
                    )
                })
                .write_all(actual.as_bytes())
                .unwrap();
        } else {
            panic!("Snapshot did not match. Run with UPDATE_SNAPSHOTS=1 to update.");
        }
    }
}
