/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::apply_transforms::Programs;
use crate::config::{Config, ConfigProject};
use crate::errors::BuildProjectError;
use graphql_ir::FragmentDefinition;
use graphql_ir::OperationDefinition;
use graphql_text_printer::print_full_operation;
use interner::StringKey;
use persist_query::persist;
use signedsource::{sign_file, SIGNING_TOKEN};
use std::fmt::Write;

/// Represents a generated output artifact.
pub struct Artifact {
    pub name: StringKey,
    pub content: String,
}

pub async fn generate_artifacts(
    config: &Config,
    project_config: &ConfigProject,
    programs: &Programs<'_>,
) -> Result<Vec<Artifact>, BuildProjectError> {
    let mut artifacts = Vec::new();
    for node in programs.normalization.operations() {
        artifacts
            .push(generate_normalization_artifact(config, project_config, programs, node).await?);
    }
    for node in programs.reader.fragments() {
        artifacts.push(generate_reader_artifact(config, programs, node));
    }

    Ok(artifacts)
}

async fn generate_normalization_artifact(
    config: &Config,
    project_config: &ConfigProject,
    programs: &Programs<'_>,
    node: &OperationDefinition,
) -> Result<Artifact, BuildProjectError> {
    let name = node.name.item;
    let print_operation_node = programs
        .operation_text
        .operation(name)
        .expect("a query text operation should be generated for this operation");
    let text = print_full_operation(&programs.operation_text, print_operation_node);
    let id = if let Some(ref persist_config) = project_config.persist {
        persist(&text, &persist_config.url, &persist_config.params)
            .await
            .map_err(BuildProjectError::PersistError)?
    } else {
        "null".to_string()
    };
    let reader_operation = programs
        .reader
        .operation(name)
        .expect("a reader fragment should be generated for this operation");
    let operation_fragment = FragmentDefinition {
        name: reader_operation.name,
        variable_definitions: reader_operation.variable_definitions.clone(),
        selections: reader_operation.selections.clone(),
        used_global_variables: Default::default(),
        directives: reader_operation.directives.clone(),
        type_condition: reader_operation.type_,
    };
    let mut content = get_content_start(config);
    writeln!(content, " * {}", SIGNING_TOKEN).unwrap();
    writeln!(content, " * @relayHash TODO").unwrap();
    writeln!(content, " * @flow").unwrap();
    writeln!(content, " * @lightSyntaxTransform").unwrap();
    writeln!(content, " * @nogrep").unwrap();
    if let Some(codegen_command) = &config.codegen_command {
        writeln!(content, " * @codegen-command: {}", codegen_command).unwrap();
    }
    writeln!(content, " */\n").unwrap();
    writeln!(content, "/* eslint-disable */\n").unwrap();
    writeln!(content, "'use strict';\n").unwrap();
    writeln!(content, "// @relayRequestParams TODO\n").unwrap();
    writeln!(content, "/*::\nTODO flow\n*/\n").unwrap();
    writeln!(content, "/*\n{}\n*/\n", text).unwrap();
    writeln!(
        content,
        "var node/*: ConcreteRequest*/ = {};\n",
        relay_codegen::print_request_deduped(
            programs.normalization.schema(),
            node,
            &operation_fragment,
        )
    )
    .unwrap();
    writeln!(content, "// id: {}\n", id).unwrap();
    writeln!(content, "if (__DEV__) {{").unwrap();
    writeln!(content, "  (node/*: any*/).hash = \"TODO\";").unwrap();
    writeln!(content, "}}\n").unwrap();
    writeln!(content, "module.exports = node;").unwrap();

    Ok(Artifact {
        name: node.name.item,
        content: sign_file(&content),
    })
}

fn generate_reader_artifact(
    config: &Config,
    programs: &Programs<'_>,
    node: &FragmentDefinition,
) -> Artifact {
    let mut content = get_content_start(config);
    writeln!(content, " * {}", SIGNING_TOKEN).unwrap();
    writeln!(content, " * @flow").unwrap();
    writeln!(content, " * @lightSyntaxTransform").unwrap();
    writeln!(content, " * @nogrep").unwrap();
    if let Some(codegen_command) = &config.codegen_command {
        writeln!(content, " * @codegen-command: {}", codegen_command).unwrap();
    }
    writeln!(content, " */\n").unwrap();
    writeln!(content, "/* eslint-disable */\n").unwrap();
    writeln!(content, "'use strict';\n").unwrap();
    writeln!(content, "/*::\nTODO flow\n*/\n").unwrap();
    writeln!(
        content,
        "var node/*: ReaderFragment*/ = {};\n",
        relay_codegen::print_fragment_deduped(programs.normalization.schema(), node)
    )
    .unwrap();
    writeln!(content, "if (__DEV__) {{").unwrap();
    writeln!(content, "  (node/*: any*/).hash = \"TODO\";").unwrap();
    writeln!(content, "}}\n").unwrap();
    writeln!(content, "module.exports = node;").unwrap();

    Artifact {
        name: node.name.item,
        content: sign_file(&content),
    }
}

fn get_content_start(config: &Config) -> String {
    let mut content = String::new();
    writeln!(content, "/**").unwrap();
    if !config.header.is_empty() {
        for header_line in &config.header {
            writeln!(content, " * {}", header_line).unwrap();
        }
        writeln!(content, " *").unwrap();
    }
    content
}
