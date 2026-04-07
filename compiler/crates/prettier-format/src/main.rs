/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! CLI entry point for the prettier-format tool.
//!
//! This binary provides a command-line interface to format GraphQL files
//! and JavaScript files containing graphql template literals using
//! the Rust prettier-style printing utilities.

use std::fs;
use std::io::Read;
use std::io::Write;

use anyhow::Result;
use clap::Parser;
use prettier_format_lib::format_graphql_source;
use prettier_format_lib::format_js_file;

#[derive(Parser)]
#[clap(
    name = "prettier-format",
    about = "Format GraphQL using prettier-compatible output"
)]
struct Opt {
    /// Input file path (.graphql or .js/.tsx/.ts)
    #[clap(long)]
    file: Option<String>,

    /// Treat input as raw GraphQL (default: auto-detect from extension)
    #[clap(long)]
    graphql: bool,

    /// Treat input as JavaScript with graphql tags
    #[clap(long)]
    js: bool,
}

fn main() -> Result<()> {
    let opt = Opt::parse();

    let (source, is_graphql) = match &opt.file {
        Some(path) => {
            let content = fs::read_to_string(path)?;
            let is_gql = opt.graphql
                || (!opt.js
                    && (path.ends_with(".graphql")
                        || path.ends_with(".gql")
                        || path.ends_with(".sdl")));
            (content, is_gql)
        }
        None => {
            let mut content = String::new();
            std::io::stdin().read_to_string(&mut content)?;
            (content, opt.graphql)
        }
    };

    let formatted = if is_graphql {
        format_graphql_source(&source)?
    } else {
        format_js_file(&source)?
    };

    std::io::stdout().write_all(formatted.as_bytes())?;
    Ok(())
}
