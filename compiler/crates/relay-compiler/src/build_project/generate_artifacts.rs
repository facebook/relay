/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::apply_transforms::Programs;
use crate::config::ConfigProject;
use crate::errors::BuildProjectError;
use graphql_ir::FragmentDefinition;
use graphql_text_printer::print_full_operation;
use interner::StringKey;
use persist_query::persist;
use signedsource::{sign_file, SIGNING_TOKEN};

/// Represents a generated output artifact.
pub struct Artifact {
    pub name: StringKey,
    pub content: String,
}

pub async fn generate_artifacts(
    project_config: &ConfigProject,
    programs: &Programs<'_>,
) -> Result<Vec<Artifact>, BuildProjectError> {
    let mut artifacts = Vec::new();
    for node in programs.normalization.operations() {
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
        artifacts.push(Artifact {
            name,
            content: sign_file(&format!(
                "// {}\n\n/*\n{}\n*/\n\nvar node/*: ConcreteRequest*/ = {};\n\nconst id = '{}';\n",
                SIGNING_TOKEN,
                text,
                relay_codegen::print_request_deduped(
                    programs.normalization.schema(),
                    node,
                    &operation_fragment,
                ),
                id,
            )),
        });
    }
    for node in programs.reader.fragments() {
        artifacts.push(Artifact {
            name: node.name.item,
            content: sign_file(&format!(
                "// {}\n\nconst fragment = {};\n",
                SIGNING_TOKEN,
                relay_codegen::print_fragment_deduped(programs.normalization.schema(), node),
            )),
        });
    }

    Ok(artifacts)
}
