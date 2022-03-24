/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use clap::{ArgEnum, Parser};
use common::ConsoleLogger;
use log::{error, info};
use relay_compiler::{
    build_project::artifact_writer::ArtifactValidationWriter,
    compiler::Compiler,
    config::{Config, SingleProjectConfigFile},
    FileSourceKind, LocalPersister, OperationPersister, PersistConfig, RemotePersister,
};
use relay_lsp::{start_language_server, DummyExtraDataProvider};
use schema::SDLSchema;
use schema_documentation::SchemaDocumentationLoader;
use simplelog::{
    ColorChoice, ConfigBuilder as SimpleLogConfigBuilder, LevelFilter, TermLogger, TerminalMode,
    WriteLogger,
};
use std::{
    env::{self, current_dir},
    fs::File,
    path::PathBuf,
    process::Command,
    sync::Arc,
};

#[derive(Parser)]
#[clap(
    name = "Relay Compiler",
    version = option_env!("CARGO_PKG_VERSION").unwrap_or("unknown"),
    about = "Compiles Relay files and writes generated files.",
    rename_all = "camel_case"
)]
struct Opt {
    /// Compile and watch for changes
    #[clap(long, short)]
    watch: bool,

    /// Run the LSP server
    #[clap(long, short)]
    lsp: bool,

    /// Compile using this config file. If not provided, searches for a config in
    /// package.json under the `relay` key or `relay.config.json` files among other up
    /// from the current working directory.
    config: Option<PathBuf>,

    #[clap(flatten)]
    cli_config: CliConfig,

    /// Run the persister even if the query has not changed.
    #[clap(long)]
    repersist: bool,

    /// Verbosity level
    #[clap(long, arg_enum)]
    output: Option<OutputKind>,

    /// Looks for pending changes and exits with non-zero code instead of
    /// writing to disk
    #[clap(long)]
    validate: bool,
}

#[derive(ArgEnum, Clone, Copy)]
enum OutputKind {
    Debug,
    Quiet,
    QuietWithErrors,
    Verbose,
}

#[derive(Parser)]
#[clap(rename_all = "camel_case")]
pub struct CliConfig {
    /// Path for the directory where to search for source code
    #[clap(long)]
    pub src: Option<PathBuf>,
    /// Path to schema file
    #[clap(long)]
    pub schema: Option<PathBuf>,
    /// Path to a directory, where the compiler should write artifacts
    #[clap(long)]
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
            ..Default::default()
        }
    }
}

#[tokio::main]
async fn main() {
    let opt = Opt::parse();

    let log_level = match &opt.output {
        Some(output) => match output {
            OutputKind::Debug => LevelFilter::Debug,
            OutputKind::Quiet => LevelFilter::Off,
            OutputKind::QuietWithErrors => LevelFilter::Error,
            OutputKind::Verbose => LevelFilter::Info,
        },
        None => LevelFilter::Info,
    };

    let log_config = SimpleLogConfigBuilder::new()
        .set_time_level(LevelFilter::Off)
        .set_target_level(LevelFilter::Off)
        .set_location_level(LevelFilter::Off)
        .set_thread_level(LevelFilter::Off)
        .build();

    if opt.lsp {
        // The LSP works by writing responses to stdout.
        // Any of the existing logs writing to stdout cause the LSP client
        // to panic since the client doesn't know how to interpret our arbitrary logs.
        //
        // We also don't want to litter existing projects with a relay_lsp.log file
        // Let's only write out to a file if the LSP client specified an output level.
        if opt.output.is_some() {
            WriteLogger::init(
                log_level,
                log_config,
                File::create("relay_lsp.log").unwrap(),
            )
            .unwrap();
        }
    } else {
        TermLogger::init(
            log_level,
            log_config,
            TerminalMode::Mixed,
            ColorChoice::Auto,
        )
        .unwrap();
    }

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

    if opt.validate {
        config.artifact_writer = Box::new(ArtifactValidationWriter::default());
    }

    config.create_operation_persister = Some(Box::new(|project_config| {
        project_config.persist.as_ref().map(
            |persist_config| -> Box<dyn OperationPersister + Send + Sync> {
                match persist_config {
                    PersistConfig::Remote(remote_config) => {
                        Box::new(RemotePersister::new(remote_config.clone()))
                    }
                    PersistConfig::Local(local_config) => {
                        Box::new(LocalPersister::new(local_config.clone()))
                    }
                }
            },
        )
    }));

    config.file_source_config = if should_use_watchman() {
        FileSourceKind::Watchman
    } else {
        FileSourceKind::WalkDir
    };
    config.repersist_operations = opt.repersist;

    if opt.watch && !matches!(&config.file_source_config, FileSourceKind::Watchman) {
        panic!(
            "Cannot run relay in watch mode if `watchman` is not available (or explicitly disabled)."
        );
    }

    if opt.lsp {
        let perf_logger = Arc::new(ConsoleLogger);
        let extra_data_provider = Box::new(DummyExtraDataProvider::new());
        let schema_documentation_loader: Option<Box<dyn SchemaDocumentationLoader<SDLSchema>>> =
            None;
        let js_language_server = None;

        match start_language_server(
            config,
            perf_logger,
            extra_data_provider,
            schema_documentation_loader,
            js_language_server,
        )
        .await
        {
            Ok(_) => {
                info!("Relay LSP exited successfully.");
            }
            Err(err) => {
                error!("Relay LSP unexpectedly terminated: {:#?}", err);
                std::process::exit(1);
            }
        }
    } else {
        let compiler = Compiler::new(Arc::new(config), Arc::new(ConsoleLogger));

        if opt.watch {
            if let Err(err) = compiler.watch().await {
                error!("Watchman error: {}", err);
                std::process::exit(1);
            }
        } else {
            match compiler.compile().await {
                Ok(_compiler_state) => {
                    info!("Done");
                }
                Err(_err) => {
                    std::process::exit(1);
                }
            }
        }
    }
}

/// Check if `watchman` is available.
/// Additionally, this method is checking for an existence of `FORCE_NO_WATCHMAN`
/// environment variable. If this `FORCE_NO_WATCHMAN` is set, this method will return `false`
/// and compiler will use non-watchman file finder.
fn should_use_watchman() -> bool {
    let check_watchman = Command::new("watchman")
        .args(["list-capabilities"])
        .output();

    check_watchman.is_ok() && env::var("FORCE_NO_WATCHMAN").is_err()
}
