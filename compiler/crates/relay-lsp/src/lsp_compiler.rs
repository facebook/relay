/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! An LSP-specific Compiler interface

use crate::lsp::{Connection, LSPBridgeMessage};

use relay_compiler::compiler_state::{CompilerState, ProjectName};
use relay_compiler::config::Config;
use relay_compiler::errors::Error as CompilerError;
use relay_compiler::errors::Result as CompilerResult;
use relay_compiler::{build_schema, check_project, parse_sources};
use relay_compiler::{FileSource, FileSourceSubscription};
use schema::Schema;

use common::{PerfLogEvent, PerfLogger};

use crate::completion::{get_completion_path, GraphQLSourceCache};

use crate::error_reporting::{report_build_project_errors, report_syntax_errors};
use crate::state::ServerState;
use crate::text_documents::{
    on_did_change_text_document, on_did_close_text_document, on_did_open_text_document,
};
// use crate::state::ServerState;

use common::ConsoleLogger;
use std::collections::HashMap;
use tokio::sync::mpsc::Receiver;

use tokio::select;

type SchemaMap = HashMap<ProjectName, Schema>;

pub struct LSPCompiler<'a> {
    lsp_rx: Receiver<LSPBridgeMessage>,
    schemas: SchemaMap,
    config: &'a Config,
    subscription: FileSourceSubscription<'a>,
    compiler_state: CompilerState,
    connection: Connection,
    synced_graphql_documents: GraphQLSourceCache,
    server_state: ServerState,
}

impl<'a> LSPCompiler<'a> {
    pub async fn new(
        config: &'a Config,
        lsp_rx: Receiver<LSPBridgeMessage>,
        connection: Connection,
    ) -> CompilerResult<LSPCompiler<'a>> {
        let root_dir = config.root_dir.clone();
        let server_state = ServerState::new(root_dir);
        let setup_event = ConsoleLogger.create_event("lsp_compiler_setup");
        let file_source = FileSource::connect(&config, &setup_event).await?;
        let (compiler_state, subscription) =
            file_source.subscribe(&setup_event, &ConsoleLogger).await?;
        let schemas = LSPCompiler::build_schemas(&config, &compiler_state, &setup_event);
        Ok(LSPCompiler {
            lsp_rx,
            config,
            schemas,
            subscription,
            compiler_state,
            connection,
            synced_graphql_documents: HashMap::new(),
            server_state,
        })
    }

    async fn check_projects_and_report_errors(&mut self, event: &impl PerfLogEvent) {
        match self.check_projects(event).await {
            Ok(_) => {
                // Clear out any existing diagnostics
                self.server_state.clear_diagnostics(&self.connection);
            }
            Err(err) => {
                match err {
                    CompilerError::SyntaxErrors { errors } => {
                        report_syntax_errors(errors, &self.connection, &mut self.server_state)
                    }
                    CompilerError::BuildProjectsErrors { errors } => report_build_project_errors(
                        errors,
                        &self.connection,
                        &mut self.server_state,
                    ),
                    // Ignore the rest of these errors for now
                    CompilerError::ConfigFileRead { .. } => {}
                    CompilerError::ConfigFileParse { .. } => {}
                    CompilerError::ConfigFileValidation { .. } => {}
                    CompilerError::ReadFileError { .. } => {}
                    CompilerError::WriteFileError { .. } => {}
                    CompilerError::SerializationError { .. } => {}
                    CompilerError::DeserializationError { .. } => {}
                    CompilerError::CanonicalizeRoot { .. } => {}
                    CompilerError::Watchman { .. } => {}
                    CompilerError::EmptyQueryResult => {}
                    CompilerError::FileRead { .. } => {}
                    CompilerError::Syntax { .. } => {}
                }
            }
        }
    }

    pub async fn watch(&mut self) -> CompilerResult<()> {
        loop {
            select! {
                changes = self.subscription.next_change() => {
                    if let Ok(file_source_changes) = changes {
                        let file_source_changes = file_source_changes.unwrap();
                        let incremental_check_event =
                        ConsoleLogger.create_event("incremental_check_event");
                    let incremental_check_time =
                        incremental_check_event.start("incremental_check_time");
                    let had_new_changes = self.compiler_state.add_pending_file_source_changes(
                        &self.config,
                        &file_source_changes,
                        &incremental_check_event,
                        &ConsoleLogger,
                    )?;

                    if had_new_changes {
                        self.check_projects_and_report_errors(&incremental_check_event).await;
                    }

                    incremental_check_event.stop(incremental_check_time);
                    ConsoleLogger.complete_event(incremental_check_event);
                    // We probably don't want the messages queue to grow indefinitely
                    // and we need to flush then, as the check/build is completed
                    ConsoleLogger.flush();

                    }
                }
                message = self.lsp_rx.recv() => {
                    if let Some(message) = message {
                      self.on_lsp_bridge_message(message);
                    }
                }
            }
        }
    }

    fn on_lsp_bridge_message(&mut self, message: LSPBridgeMessage) {
        match message {
            // Completion request
            LSPBridgeMessage::CompletionRequest { params, .. } => {
                if let Some(_completion_path) =
                    get_completion_path(params, &self.synced_graphql_documents)
                {
                    // TODO(brandondail) implement completion
                }
            }
            LSPBridgeMessage::DidOpenTextDocument(params) => {
                on_did_open_text_document(params, &mut self.synced_graphql_documents);
            }
            LSPBridgeMessage::DidChangeTextDocument(params) => {
                on_did_change_text_document(params, &mut self.synced_graphql_documents);
            }
            LSPBridgeMessage::DidCloseTextDocument(params) => {
                on_did_close_text_document(params, &mut self.synced_graphql_documents);
            }
        }
    }

    fn build_schemas(
        config: &Config,
        compiler_state: &CompilerState,
        setup_event: &impl PerfLogEvent,
    ) -> SchemaMap {
        let timer = setup_event.start("build_schemas");
        let mut schemas = HashMap::new();
        config.for_each_project(|project_config| {
            let schema = build_schema(compiler_state, project_config);
            schemas.insert(project_config.name, schema);
        });
        setup_event.stop(timer);
        schemas
    }

    async fn check_projects(&self, setup_event: &impl PerfLogEvent) -> CompilerResult<()> {
        let graphql_asts =
            setup_event.time("parse_sources_time", || parse_sources(&self.compiler_state))?;
        let mut check_project_errors = vec![];
        match self.config.only_project {
            Some(project_key) => {
                let project_config =
                    self.config.projects.get(&project_key).unwrap_or_else(|| {
                        panic!("Expected the project {} to exist", &project_key)
                    });
                let schema = self.schemas.get(&project_config.name).unwrap();
                check_project(
                    project_config,
                    &self.compiler_state,
                    &graphql_asts,
                    schema,
                    &ConsoleLogger,
                )
                .await
                .map_err(|err| {
                    check_project_errors.push(err);
                })
                .ok();
            }
            None => {
                for project_config in self.config.projects.values() {
                    if self
                        .compiler_state
                        .project_has_pending_changes(project_config.name)
                    {
                        let schema = self.schemas.get(&project_config.name).unwrap();
                        // TODO: consider running all projects in parallel
                        check_project(
                            project_config,
                            &self.compiler_state,
                            &graphql_asts,
                            schema,
                            &ConsoleLogger,
                        )
                        .await
                        .map_err(|err| {
                            check_project_errors.push(err);
                        })
                        .ok();
                    }
                }
            }
        }

        if check_project_errors.is_empty() {
            Ok(())
        } else {
            Err(CompilerError::BuildProjectsErrors {
                errors: check_project_errors,
            })
        }
    }
}
