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
    build_project::artifact_writer::ArtifactValidationWriter, compiler::Compiler, config::Config,
    errors::Error, FileSourceKind, LocalPersister, OperationPersister, PersistConfig,
    RemotePersister,
};
use relay_lsp::{start_language_server, DummyExtraDataProvider};
use schema::SDLSchema;
use schema_documentation::SchemaDocumentationLoader;
use simplelog::{
    ColorChoice, ConfigBuilder as SimpleLogConfigBuilder, LevelFilter, TermLogger, TerminalMode,
};
use std::{
    env::{self, current_dir},
    path::PathBuf,
    process::Command,
    sync::Arc,
};

#[derive(Parser)]
#[clap(
     name = "Relay Compiler",
     version = option_env!("CARGO_PKG_VERSION").unwrap_or("unknown"),
     about = "Compiles Relay files and writes generated files.",
     rename_all = "camel_case",
     args_conflicts_with_subcommands = true
 )]
struct Opt {
    #[clap(subcommand)]
    command: Option<Commands>,

    #[clap(flatten)]
    compile: CompileCommand,
}

#[derive(Parser)]
#[clap(
    rename_all = "camel_case",
    about = "Compiles Relay files and writes generated files."
)]
struct CompileCommand {
    /// Compile and watch for changes
    #[clap(long, short)]
    watch: bool,

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
    #[clap(long, arg_enum, default_value = "verbose")]
    output: OutputKind,

    /// Looks for pending changes and exits with non-zero code instead of
    /// writing to disk
    #[clap(long)]
    validate: bool,
}

#[derive(Parser)]
#[clap(about = "Run the LSP server")]
struct LspCommand {
    /// Run the LSP using this config file. If not provided, searches for a config in
    /// package.json under the `relay` key or `relay.config.json` files among other up
    /// from the current working directory.
    config: Option<PathBuf>,

    #[clap(flatten)]
    cli_config: CliConfig,

    /// Verbosity level
    #[clap(long, arg_enum, default_value = "verbose")]
    output: OutputKind,
}

#[derive(clap::Subcommand)]
enum Commands {
    Compiler(CompileCommand),
    Lsp(LspCommand),
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
    pub src: Option<String>,
    /// Path to schema file
    #[clap(long)]
    pub schema: Option<String>,
    /// Path to a directory, where the compiler should write artifacts
    #[clap(long)]
    pub artifact_directory: Option<String>,
}

impl CliConfig {
    fn is_defined(&self) -> bool {
        self.src.is_some() || self.schema.is_some() || self.artifact_directory.is_some()
    }

    fn get_config_string(self) -> String {
        let src = self.src.unwrap_or_else(|| "./src".into());
        let schema = self.schema.unwrap_or_else(|| "./path-to-schema".into());
        let artifact_directory = self.artifact_directory.map_or("".to_string(), |a| {
            format!("\n  \"artifactDirectory\": \"{}\",", a)
        });
        format!(
            r#"
 {{
   "src": "{}",
   "schema": "{}",{}
   "language": "javascript"
 }}"#,
            src, schema, artifact_directory
        )
    }
}

fn get_config(config_path: Option<PathBuf>, cli_config: CliConfig) -> Config {
    let config_result = if let Some(config_path) = config_path {
        Config::load(config_path)
    } else if cli_config.is_defined() {
        Err(Error::ConfigError {
            details: format!(
                "\nPassing Relay compiler configuration is not supported. Please add `relay.config.json` file,\nor \"relay\" section to your `package.json` file.\n\nCompiler configuration JSON:{}",
                cli_config.get_config_string(),
            ),
        })
    } else {
        Config::search(&current_dir().expect("Unable to get current working directory."))
    };

    let config = config_result.unwrap_or_else(|err| {
        error!("{}", err);
        std::process::exit(1);
    });

    config
}

fn configure_logger(output: OutputKind, terminal_mode: TerminalMode) {
    let log_level = match output {
        OutputKind::Debug => LevelFilter::Debug,
        OutputKind::Quiet => LevelFilter::Off,
        OutputKind::QuietWithErrors => LevelFilter::Error,
        OutputKind::Verbose => LevelFilter::Info,
    };

    let log_config = SimpleLogConfigBuilder::new()
        .set_time_level(LevelFilter::Off)
        .set_target_level(LevelFilter::Off)
        .set_location_level(LevelFilter::Off)
        .set_thread_level(LevelFilter::Off)
        .build();

    TermLogger::init(log_level, log_config, terminal_mode, ColorChoice::Auto).unwrap();
}

async fn handle_compiler_command(command: CompileCommand) {
    configure_logger(command.output, TerminalMode::Mixed);

    let mut config = get_config(command.config, command.cli_config);

    if command.validate {
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
    config.repersist_operations = command.repersist;

    if command.watch && !matches!(&config.file_source_config, FileSourceKind::Watchman) {
        panic!(
            "Cannot run relay in watch mode if `watchman` is not available (or explicitly disabled)."
        );
    }

    let compiler = Compiler::new(Arc::new(config), Arc::new(ConsoleLogger));

    if command.watch {
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

async fn handle_lsp_command(command: LspCommand) {
    configure_logger(command.output, TerminalMode::Stderr);

    let config = get_config(command.config, command.cli_config);

    let perf_logger = Arc::new(ConsoleLogger);
    let extra_data_provider = Box::new(DummyExtraDataProvider::new());
    let schema_documentation_loader: Option<Box<dyn SchemaDocumentationLoader<SDLSchema>>> = None;
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
}

#[tokio::main]
async fn main() {
    let opt = Opt::parse();

    let command = opt.command.unwrap_or(Commands::Compiler(opt.compile));

    match command {
        Commands::Compiler(command) => {
            handle_compiler_command(command).await;
        }
        Commands::Lsp(command) => {
            handle_lsp_command(command).await;
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
