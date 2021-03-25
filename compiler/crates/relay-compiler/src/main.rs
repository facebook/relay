/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use env_logger::Env;
use log::{error, info};
use relay_compiler::{compiler::Compiler, config::CliConfig, config::Config};
use std::{path::PathBuf, sync::Arc};
use structopt::StructOpt;

#[derive(StructOpt)]
#[structopt(
    name = "Relay Compiler",
    about = "Compiler to produce Relay generated files.",
    rename_all = "camel_case"
)]
struct Opt {
    /// Compile and watch for changes
    #[structopt(long, short)]
    watch: bool,

    /// Path to the compiler config file
    config: Option<PathBuf>,

    #[structopt(flatten)]
    cli_config: CliConfig,
}

#[tokio::main]
async fn main() {
    env_logger::from_env(Env::default().default_filter_or("info")).init();

    let opt = Opt::from_args();

    let config = if let Some(config_path) = opt.config {
        match Config::load(config_path) {
            Ok(config) => config,
            Err(err) => {
                error!("{}", err);
                std::process::exit(1);
            }
        }
    } else {
        Config::from(opt.cli_config)
    };

    let compiler = Compiler::new(Arc::new(config), Arc::new(common::NoopPerfLogger));

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
            Err(err) => {
                error!("{}", err);
                std::process::exit(1);
            }
        }
    }
}
