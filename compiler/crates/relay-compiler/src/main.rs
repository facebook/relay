/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use env_logger::Env;
use log::{error, info};
use relay_compiler::{compiler::Compiler, config::Config};
use std::{path::PathBuf, sync::Arc};
use structopt::StructOpt;

#[derive(StructOpt)]
#[structopt(
    name = "Relay Compiler",
    about = "Compiler to produce Relay generated files."
)]
struct Opt {
    /// Compile and watch for changes
    #[structopt(long, short)]
    watch: bool,

    /// Path to the compiler config file
    config: PathBuf,
}

#[tokio::main]
async fn main() {
    env_logger::from_env(Env::default().default_filter_or("info")).init();

    let opt = Opt::from_args();

    let config = match Config::load(opt.config) {
        Ok(config) => config,
        Err(err) => {
            error!("{}", err);
            std::process::exit(1);
        }
    };

    let compiler = Compiler::new(config, Arc::new(common::NoopPerfLogger));

    if opt.watch {
        if let Err(err) = compiler.watch().await {
            error!("{}", err);
            std::process::exit(1);
        }
    } else {
        match compiler.compile().await {
            Ok(_compiler_state) => {
                info!("Done");
            }
            Err(_) => {
                std::process::exit(1);
            }
        }
    }
}
