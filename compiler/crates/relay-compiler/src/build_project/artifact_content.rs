/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::config::{Config, ProjectConfig};
use common::NamedItem;
use graphql_ir::{FragmentDefinition, OperationDefinition};
use graphql_transforms::INLINE_DATA_CONSTANTS;
use relay_codegen::{build_request_params, Printer};
use relay_typegen::generate_fragment_type;
use schema::Schema;
use signedsource::{sign_file, SIGNING_TOKEN};
use std::fmt::Write;

pub enum ArtifactContent<'a> {
    Operation {
        normalization_operation: &'a OperationDefinition,
        reader_operation: &'a OperationDefinition,
        typegen_operation: &'a OperationDefinition,
        source_hash: String,
        text: String,
        id_and_text_hash: Option<(String, String)>,
    },
    Fragment {
        reader_fragment: &'a FragmentDefinition,
        typegen_fragment: &'a FragmentDefinition,
        source_hash: String,
    },
    SplitOperation {
        normalization_operation: &'a OperationDefinition,
        source_hash: String,
    },
    Generic {
        content: Vec<u8>,
    },
}

impl<'a> ArtifactContent<'a> {
    pub fn as_bytes(
        &self,
        config: &Config,
        project_config: &ProjectConfig,
        printer: &mut Printer,
        schema: &Schema,
    ) -> Vec<u8> {
        match self {
            ArtifactContent::Operation {
                normalization_operation,
                reader_operation,
                typegen_operation,
                source_hash,
                text,
                id_and_text_hash,
            } => generate_operation(
                config,
                project_config,
                printer,
                schema,
                normalization_operation,
                reader_operation,
                typegen_operation,
                source_hash.into(),
                text,
                id_and_text_hash,
            ),
            ArtifactContent::SplitOperation {
                normalization_operation,
                source_hash,
            } => generate_split_operation(
                config,
                printer,
                schema,
                normalization_operation,
                source_hash,
            ),
            ArtifactContent::Fragment {
                reader_fragment,
                typegen_fragment,
                source_hash,
            } => generate_fragment(
                config,
                project_config,
                printer,
                schema,
                reader_fragment,
                typegen_fragment,
                source_hash,
            ),
            ArtifactContent::Generic { content } => content.clone(),
        }
    }
}

fn generate_operation(
    config: &Config,
    project_config: &ProjectConfig,
    printer: &mut Printer,
    schema: &Schema,
    normalization_operation: &OperationDefinition,
    reader_operation: &OperationDefinition,
    typegen_operation: &OperationDefinition,
    source_hash: String,
    text: &str,
    id_and_text_hash: &Option<(String, String)>,
) -> Vec<u8> {
    let mut request_parameters = build_request_params(&normalization_operation);
    let operation_hash: Option<String> = if let Some((id, text_hash)) = id_and_text_hash {
        request_parameters.id = Some(id.clone());
        Some(text_hash.clone())
    } else {
        request_parameters.text = Some(text.into());
        None
    };
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
    if let Some(operation_hash) = operation_hash {
        writeln!(content, " * @relayHash {}", operation_hash).unwrap();
    }
    writeln!(content, " * @flow").unwrap();
    writeln!(content, " * @lightSyntaxTransform").unwrap();
    writeln!(content, " * @nogrep").unwrap();
    if let Some(codegen_command) = &config.codegen_command {
        writeln!(content, " * @codegen-command: {}", codegen_command).unwrap();
    }
    writeln!(content, " */\n").unwrap();
    writeln!(content, "/* eslint-disable */\n").unwrap();
    writeln!(content, "'use strict';\n").unwrap();
    if let Some(id) = &request_parameters.id {
        writeln!(content, "// @relayRequestID {}\n", id).unwrap();
    }
    writeln!(
        content,
        "/*::\nimport type {{ ConcreteRequest }} from 'relay-runtime';\n{}*/\n",
        relay_typegen::generate_operation_type(
            typegen_operation,
            normalization_operation,
            schema,
            &project_config.enum_module_suffix,
            &project_config.optional_input_fields
        )
    )
    .unwrap();
    writeln!(content, "/*\n{}*/\n", text).unwrap();
    writeln!(
        content,
        "var node/*: ConcreteRequest*/ = {};\n",
        printer.print_request_deduped(
            schema,
            normalization_operation,
            &operation_fragment,
            request_parameters,
        )
    )
    .unwrap();
    writeln!(content, "if (__DEV__) {{").unwrap();
    writeln!(content, "  (node/*: any*/).hash = \"{}\";", source_hash).unwrap();
    writeln!(content, "}}\n").unwrap();
    writeln!(content, "module.exports = node;").unwrap();
    sign_file(&content).into_bytes()
}

fn generate_split_operation(
    config: &Config,
    printer: &mut Printer,
    schema: &Schema,
    node: &OperationDefinition,
    source_hash: &str,
) -> Vec<u8> {
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
    writeln!(
        content,
        "/*::\nimport type {{ NormalizationSplitOperation }} from 'relay-runtime';\n\n*/\n"
    )
    .unwrap();
    writeln!(
        content,
        "var node/*: NormalizationSplitOperation*/ = {};\n",
        printer.print_operation_deduped(schema, node)
    )
    .unwrap();
    writeln!(content, "if (__DEV__) {{").unwrap();
    writeln!(content, "  (node/*: any*/).hash = \"{}\";", source_hash).unwrap();
    writeln!(content, "}}\n").unwrap();
    writeln!(content, "module.exports = node;").unwrap();
    sign_file(&content).into_bytes()
}

fn generate_fragment(
    config: &Config,
    project_config: &ProjectConfig,
    printer: &mut Printer,
    schema: &Schema,
    reader_fragment: &FragmentDefinition,
    typegen_fragment: &FragmentDefinition,
    source_hash: &str,
) -> Vec<u8> {
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
    let reader_node_flow_type = if reader_fragment
        .directives
        .named(INLINE_DATA_CONSTANTS.directive_name)
        .is_some()
    {
        "ReaderInlineDataFragment"
    } else {
        "ReaderFragment"
    };
    writeln!(
        content,
        "/*::\nimport type {{ {} }} from 'relay-runtime';\n{}*/\n",
        reader_node_flow_type,
        generate_fragment_type(
            typegen_fragment,
            schema,
            &project_config.enum_module_suffix,
            &project_config.optional_input_fields
        )
    )
    .unwrap();
    writeln!(
        content,
        "var node/*: {}*/ = {};\n",
        reader_node_flow_type,
        printer.print_fragment_deduped(schema, reader_fragment)
    )
    .unwrap();
    writeln!(content, "if (__DEV__) {{").unwrap();
    writeln!(content, "  (node/*: any*/).hash = \"{}\";", source_hash).unwrap();
    writeln!(content, "}}\n").unwrap();
    writeln!(content, "module.exports = node;").unwrap();
    sign_file(&content).into_bytes()
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
