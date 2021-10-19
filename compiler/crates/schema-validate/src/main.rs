/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticsResult;
use schema::{build_schema, SDLSchema};
use schema_validate_lib::validate;
use std::fs;
use std::path::Path;
use structopt::StructOpt;

#[derive(StructOpt)]
#[structopt(name = "schema-validate", about = "Binary to Validate GraphQL Schema.")]
struct Opt {
    /// Path to Schema SDL. If schema is sharded, this is directory.
    #[structopt(long)]
    schema_path: String,
}

pub fn main() {
    let opt = Opt::from_args();
    match build_schema_from_file(&opt.schema_path) {
        Ok(schema) => {
            let validation_context = validate(&schema);
            if !validation_context.errors.lock().unwrap().is_empty() {
                eprintln!(
                    "Schema failed validation with below errors:\n{}",
                    validation_context.print_errors()
                );
                std::process::exit(1);
            }
        }
        Err(error) => {
            eprintln!("Failed to parse schema:\n{:?}", error);
            std::process::exit(1);
        }
    }
}

fn build_schema_from_file(schema_file: &str) -> DiagnosticsResult<SDLSchema> {
    let path = Path::new(schema_file);
    let data = if path.is_file() {
        fs::read_to_string(path).unwrap()
    } else {
        let mut buffer = String::new();
        for entry in path.read_dir().unwrap() {
            buffer.push_str(&fs::read_to_string(entry.unwrap().path()).unwrap());
        }
        buffer
    };
    build_schema(&data)
}
