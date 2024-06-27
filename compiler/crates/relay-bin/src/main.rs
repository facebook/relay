/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::env;
use std::env::current_dir;
use std::path::PathBuf;
use std::process::Command;
use std::sync::Arc;

use clap::ArgEnum;
use clap::Parser;
use common::ConsoleLogger;
use intern::string_key::Intern;
use log::error;
use log::info;
use relay_compiler::build_project::artifact_writer::ArtifactValidationWriter;
use relay_compiler::build_project::generate_extra_artifacts::default_generate_extra_artifacts_fn;
use relay_compiler::compiler::Compiler;
use relay_compiler::config::Config;
use relay_compiler::errors::Error as CompilerError;
use relay_compiler::FileSourceKind;
use relay_compiler::LocalPersister;
use relay_compiler::OperationPersister;
use relay_compiler::PersistConfig;
use relay_compiler::ProjectName;
use relay_compiler::RemotePersister;
use relay_lsp::start_language_server;
use relay_lsp::DummyExtraDataProvider;
use relay_lsp::FieldDefinitionSourceInfo;
use relay_lsp::FieldSchemaInfo;
use relay_lsp::LSPExtraDataProvider;
use schema::SDLSchema;
use schema_documentation::SchemaDocumentationLoader;
use simplelog::ColorChoice;
use simplelog::ConfigBuilder as SimpleLogConfigBuilder;
use simplelog::LevelFilter;
use simplelog::TermLogger;
use simplelog::TerminalMode;

mod errors;

use errors::Error;

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
    // Only write files for the current directory pass as `--writeCurrentDirOnly` flag
    // This is helpful when you do not want the compiler to write outside of the current folder
    // It will read files across the project but only write files for the current directory.
    #[clap(long)]
    write_current_dir_only: bool,

    /// Compile and watch for changes
    #[clap(long, short)]
    watch: bool,

    /// Compile only this project. You can pass this argument multiple times.
    /// to compile multiple projects. If excluded, all projects will be compiled.
    #[clap(name = "project", long, short)]
    projects: Vec<String>,

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
#[clap(
    about = "Run the language server. Used by IDEs.",
    rename_all = "camel_case"
)]
struct LspCommand {
    /// Run the LSP using this config file. If not provided, searches for a config in
    /// package.json under the `relay` key or `relay.config.json` files among other up
    /// from the current working directory.
    config: Option<PathBuf>,

    /// Verbosity level
    #[clap(long, arg_enum, default_value = "quiet-with-errors")]
    output: OutputKind,

    /// Script to be called to lookup the actual definition of a GraphQL entity for
    /// implementation-first GraphQL schemas.
    #[clap(long)]
    locate_command: Option<String>,
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

#[tokio::main]
async fn main() {
    let opt = Opt::parse();

    let command = opt.command.unwrap_or(Commands::Compiler(opt.compile));

    let result = match command {
        Commands::Compiler(command) => handle_compiler_command(command).await,
        Commands::Lsp(command) => handle_lsp_command(command).await,
    };

    match result {
        Ok(_) => info!("Done."),
        Err(err) => {
            error!("{}", err);
            std::process::exit(1);
        }
    }
}

fn get_config(config_path: Option<PathBuf>) -> Result<Config, Error> {
    match config_path {
        Some(config_path) => Config::load(config_path).map_err(Error::ConfigError),
        None => Config::search(&current_dir().expect("Unable to get current working directory."))
            .map_err(Error::ConfigError),
    }
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

/// Update Config if the `project` flag is set
fn set_project_flag(config: &mut Config, projects: Vec<String>) -> Result<(), Error> {
    if projects.is_empty() {
        return Ok(());
    }

    for project_config in config.projects.values_mut() {
        project_config.enabled = false;
    }
    for selected_project in projects {
        let selected_project = ProjectName::from(selected_project.intern());

        if let Some(project_config) = config.projects.get_mut(&selected_project) {
            project_config.enabled = true;
        } else {
            return Err(Error::ProjectFilterError {
                details: format!(
                    "Project `{}` not found, available projects: {}.",
                    selected_project,
                    config
                        .projects
                        .keys()
                        .map(|name| name.to_string())
                        .collect::<Vec<_>>()
                        .join(", ")
                ),
            });
        }
    }

    Ok(())
}

fn set_only_write_local(config: &mut Config, only_write_local: bool) -> Result<(), Error> {
    if only_write_local {
        config.write_current_dir_only = true;
    }
    Ok(())
}

async fn handle_compiler_command(command: CompileCommand) -> Result<(), Error> {
    configure_logger(command.output, TerminalMode::Mixed);

    if command.cli_config.is_defined() {
        return Err(Error::ConfigError(CompilerError::ConfigError {
            details: format!(
                "\nPassing Relay compiler configuration is not supported. Please add `relay.config.json` file,\nor \"relay\" section to your `package.json` file.\n\nCompiler configuration JSON:{}",
                command.cli_config.get_config_string(),
            ),
        }));
    }

    let mut config = get_config(command.config)?;

    set_only_write_local(&mut config, command.write_current_dir_only)?;
    set_project_flag(&mut config, command.projects)?;

    if command.validate {
        config.artifact_writer = Box::<ArtifactValidationWriter>::default();
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

    config.generate_extra_artifacts = Some(Box::new(default_generate_extra_artifacts_fn));

    let compiler = Compiler::new(Arc::new(config), Arc::new(ConsoleLogger));

    if command.watch {
        compiler.watch().await.map_err(|err| Error::CompilerError {
            details: format!("{:?}", err),
        })?;
    } else {
        compiler
            .compile()
            .await
            .map_err(|err| Error::CompilerError {
                details: format!("{}", err),
            })?;
    }

    Ok(())
}

struct ExtraDataProvider {
    locate_command: String,
}

impl ExtraDataProvider {
    pub fn new(locate_command: String) -> ExtraDataProvider {
        ExtraDataProvider { locate_command }
    }
}

impl LSPExtraDataProvider for ExtraDataProvider {
    fn fetch_query_stats(&self, _search_token: &str) -> Vec<String> {
        vec![]
    }

    fn resolve_field_definition(
        &self,
        project_name: String,
        parent_type: String,
        field_info: Option<FieldSchemaInfo>,
    ) -> Result<Option<FieldDefinitionSourceInfo>, String> {
        let entity_name = match field_info {
            Some(field_info) => format!("{}.{}", parent_type, field_info.name),
            None => parent_type,
        };
        let result = Command::new(&self.locate_command)
            .arg(project_name)
            .arg(entity_name)
            .output()
            .map_err(|e| format!("Failed to run locate command: {}", e))?;

        let result = String::from_utf8(result.stdout).expect("Failed to parse output");

        // Parse file_path:line_number:column_number
        let result_trimmed = result.trim();
        let result = result_trimmed.split(':').collect::<Vec<_>>();
        if result.len() != 3 {
            return Err(format!(
                "Result '{}' did not match expected format. Please return 'file_path:line_number:column_number'",
                result_trimmed
            ));
        }
        let file_path = result[0];
        let line_number = result[1].parse::<u64>().unwrap() - 1;

        Ok(Some(FieldDefinitionSourceInfo {
            file_path: file_path.to_string(),
            line_number,
            is_local: true,
        }))
    }
}

async fn handle_lsp_command(command: LspCommand) -> Result<(), Error> {
    configure_logger(command.output, TerminalMode::Stderr);

    let config = get_config(command.config)?;

    let extra_data_provider: Box<dyn LSPExtraDataProvider + Send + Sync> =
        match command.locate_command {
            Some(locate_command) => Box::new(ExtraDataProvider::new(locate_command)),
            None => Box::new(DummyExtraDataProvider::new()),
        };

    let perf_logger = Arc::new(ConsoleLogger);
    let schema_documentation_loader: Option<Box<dyn SchemaDocumentationLoader<SDLSchema>>> = None;

    start_language_server(
        config,
        perf_logger,
        extra_data_provider,
        schema_documentation_loader,
    )
    .await
    .map_err(|err| Error::LSPError {
        details: format!("Relay LSP unexpectedly terminated: {:?}", err),
    })?;

    info!("Relay LSP exited successfully.");

    Ok(())
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
