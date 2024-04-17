/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fs;
use std::path::Path;

use clap::Parser;
use common::DiagnosticsResult;
use common::Location;
use common::SourceLocationKey;
use common::Span;
use common::TextSource;
use graphql_cli::DiagnosticPrinter;
use intern::Lookup;
use schema::build_schema_with_extensions;
use schema::SDLSchema;
use schema_validate_lib::validate;
use schema_validate_lib::SchemaValidationOptions;

#[derive(Parser)]
#[clap(name = "schema-validate", about = "Binary to Validate GraphQL Schema.")]
struct Opt {
    /// Path to Schema SDL. If schema is sharded, this is directory.
    #[clap(long)]
    schema_path: String,
}

pub fn main() {
    let opt = Opt::parse();
    match build_schema_from_path(&opt.schema_path) {
        Ok((schema, default_location)) => {
            if let Err(diagnostics) = validate(
                &schema,
                default_location,
                SchemaValidationOptions {
                    allow_introspection_names: false,
                },
            ) {
                let printer = DiagnosticPrinter::new(sources);
                println!(
                    "Schema failed validation with below errors:\n{}",
                    printer.diagnostics_to_string(&diagnostics)
                );
                std::process::exit(1);
            }
        }
        Err(diagnostics) => {
            let printer = DiagnosticPrinter::new(sources);
            println!(
                "Failed to parse schema:\n{}",
                printer.diagnostics_to_string(&diagnostics)
            );
            std::process::exit(1);
        }
    }
}

/// Returns a SDLSchema with a default location used for reporting non-location specific errors.
fn build_schema_from_path(schema_file: &str) -> DiagnosticsResult<(SDLSchema, Location)> {
    let path = Path::new(schema_file);
    let extensions: &[(&str, SourceLocationKey)] = &[];

    return if path.is_file() {
        let location_key = SourceLocationKey::standalone(path.to_str().unwrap());
        let schema = build_schema_with_extensions(&[path_to_schema_source(&path)], extensions)?;
        Ok((schema, Location::new(location_key, Span::empty())))
    } else {
        let paths = path
            .read_dir()
            .unwrap()
            .map(|entry| entry.unwrap().path())
            .collect::<Vec<_>>();

        if paths.is_empty() {
            println!("No schema files found in the directory: {}", schema_file);
            std::process::exit(1);
        }

        let default_location = Location::new(
            SourceLocationKey::standalone(paths.first().unwrap().to_str().unwrap()),
            Span::empty(),
        );

        let sdls: Vec<(String, SourceLocationKey)> = paths
            .iter()
            .map(|path| path_to_schema_source(&path))
            .collect();

        let schema = build_schema_with_extensions(&sdls, extensions)?;
        Ok((schema, default_location))
    };
}

fn path_to_schema_source<'a>(path: &Path) -> (String, SourceLocationKey) {
    (
        fs::read_to_string(path.clone()).unwrap(),
        SourceLocationKey::standalone(path.to_str().unwrap()),
    )
}

fn sources(source_key: SourceLocationKey) -> Option<TextSource> {
    match source_key {
        SourceLocationKey::Standalone { path } => Some(TextSource::from_whole_document(
            fs::read_to_string(Path::new(path.lookup())).unwrap(),
        )),
        SourceLocationKey::Embedded { .. } => {
            panic!("Embedded sources are not supported in this context. This should not happen.",)
        }
        SourceLocationKey::Generated => {
            panic!("Generated sources are not supported in this context. This should not happen.")
        }
    }
}
