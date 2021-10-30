/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use env_logger::Env;
use log::{error, info};
use relay_compiler::{
    compiler::Compiler,
    config::{Config, SingleProjectConfigFile, TypegenLanguage},
    FileSourceKind, RemotePersister,
};
use std::{env::current_dir, path::PathBuf, sync::Arc};
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

    /// Compile using this config file. If not provided, searches for a config in
    /// package.json under the `relay` key or `relay.config.json` files among other up
    /// from the current working directory.
    config: Option<PathBuf>,

    #[structopt(flatten)]
    cli_config: CliConfig,
}

#[derive(StructOpt)]
#[structopt(rename_all = "camel_case")]
pub struct CliConfig {
    /// Path for the directory where to search for source code
    #[structopt(long)]
    pub src: Option<PathBuf>,
    /// Path to schema file
    #[structopt(long)]
    pub schema: Option<PathBuf>,
    /// Path to a directory, where the compiler should write artifacts
    #[structopt(long)]
    pub artifact_directory: Option<PathBuf>,
}

impl CliConfig {
    pub fn is_defined(&self) -> bool {
        self.src.is_some() || self.schema.is_some() || self.artifact_directory.is_some()
    }
}

impl From<CliConfig> for SingleProjectConfigFile {
    fn from(cli_config: CliConfig) -> Self {
        SingleProjectConfigFile {
            schema: cli_config.schema.expect("schema is required."),
            artifact_directory: cli_config.artifact_directory,
            src: cli_config.src.unwrap_or_else(|| PathBuf::from("./")),
            language: Some(TypegenLanguage::TypeScript),
            ..Default::default()
        }
    }
}

#[tokio::main]
async fn main() {
    env_logger::from_env(Env::default().default_filter_or("info")).init();

    let opt = Opt::from_args();

    let config_result = if let Some(config_path) = opt.config {
        Config::load(config_path)
    } else if opt.cli_config.is_defined() {
        Ok(Config::from(SingleProjectConfigFile::from(opt.cli_config)))
    } else {
        Config::search(&current_dir().expect("Unable to get current working directory."))
    };

    let mut config = config_result.unwrap_or_else(|err| {
        error!("{}", err);
        std::process::exit(1);
    });
    config.operation_persister = Some(Box::new(RemotePersister));
    // TODO: Check if watchman is available
    config.file_source_config = FileSourceKind::Glob;

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
