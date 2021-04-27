/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::is_operation_preloadable;
use crate::config::{Config, ProjectConfig};
use common::{NamedItem, SourceLocationKey};
use graphql_ir::{Directive, FragmentDefinition, OperationDefinition};
use relay_codegen::{build_request_params, Printer};
use relay_transforms::{
    DATA_DRIVEN_DEPENDENCY_METADATA_KEY, INLINE_DATA_CONSTANTS,
    REACT_FLIGHT_LOCAL_COMPONENTS_METADATA_ARG_KEY, REACT_FLIGHT_LOCAL_COMPONENTS_METADATA_KEY,
    RELAY_CLIENT_COMPONENT_METADATA_KEY, RELAY_CLIENT_COMPONENT_METADATA_SPLIT_OPERATION_ARG_KEY,
};
use relay_typegen::{generate_fragment_type, TypegenLanguage};
use schema::SDLSchema;
use signedsource::{sign_file, SIGNING_TOKEN};
use std::fmt::{Result, Write};
use std::sync::Arc;

pub enum ArtifactContent {
    Operation {
        normalization_operation: Arc<OperationDefinition>,
        reader_operation: Arc<OperationDefinition>,
        typegen_operation: Arc<OperationDefinition>,
        source_hash: String,
        text: String,
        id_and_text_hash: Option<(String, String)>,
    },
    Fragment {
        reader_fragment: Arc<FragmentDefinition>,
        typegen_fragment: Arc<FragmentDefinition>,
        source_hash: String,
    },
    SplitOperation {
        normalization_operation: Arc<OperationDefinition>,
        typegen_operation: Option<Arc<OperationDefinition>>,
        source_hash: String,
    },
    Generic {
        content: Vec<u8>,
    },
}

impl ArtifactContent {
    pub fn as_bytes(
        &self,
        config: &Config,
        project_config: &ProjectConfig,
        printer: &mut Printer,
        schema: &SDLSchema,
        source_file: SourceLocationKey,
    ) -> Vec<u8> {
        let skip_types = project_config
            .skip_types_for_artifact
            .as_ref()
            .map_or(false, |skip_types_fn| skip_types_fn(source_file));
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
                skip_types,
            ),
            ArtifactContent::SplitOperation {
                normalization_operation,
                typegen_operation,
                source_hash,
            } => generate_split_operation(
                config,
                project_config,
                printer,
                schema,
                normalization_operation,
                typegen_operation,
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
                skip_types,
            ),
            ArtifactContent::Generic { content } => content.clone(),
        }
    }
}

fn write_data_driven_dependency_annotation(
    content: &mut String,
    data_driven_dependency_directive: &Directive,
) -> Result {
    for arg in &data_driven_dependency_directive.arguments {
        let value = match arg.value.item {
            graphql_ir::Value::Constant(graphql_ir::ConstantValue::String(value)) => value,
            _ => panic!("Unexpected argument value for @__dataDrivenDependencyMetadata directive"),
        };
        writeln!(
            content,
            "// @dataDrivenDependency {} {}",
            arg.name.item, value
        )?;
    }

    Ok(())
}

fn write_react_flight_server_annotation(
    content: &mut String,
    flight_directive: &Directive,
) -> Result {
    let arg = flight_directive
        .arguments
        .named(*REACT_FLIGHT_LOCAL_COMPONENTS_METADATA_ARG_KEY)
        .unwrap();
    match &arg.value.item {
        graphql_ir::Value::Constant(graphql_ir::ConstantValue::List(value)) => {
            for item in value {
                match item {
                    graphql_ir::ConstantValue::String(value) => {
                        writeln!(content, "// @ReactFlightServerDependency {}", value)?;
                    }
                    _ => panic!(
                        "Unexpected item value for @__ReactFlightMetadata directive: {:?}",
                        item
                    ),
                }
            }
        }
        _ => panic!(
            "Unexpected argument value for @__ReactFlightMetadata directive: {:?}",
            &arg.value.item
        ),
    };
    writeln!(content)?;
    Ok(())
}

fn write_react_flight_client_annotation(
    content: &mut String,
    relay_client_component_metadata: &Directive,
) -> Result {
    let arg = relay_client_component_metadata
        .arguments
        .named(*RELAY_CLIENT_COMPONENT_METADATA_SPLIT_OPERATION_ARG_KEY)
        .unwrap();
    match &arg.value.item {
        graphql_ir::Value::Constant(graphql_ir::ConstantValue::List(value)) => {
            for item in value {
                match item {
                    graphql_ir::ConstantValue::String(value) => {
                        writeln!(content, "// @ReactFlightClientDependency {}", value)?;
                    }
                    _ => panic!(
                        "Unexpected item value for @__RelayClientComponent directive: {:?}",
                        item
                    ),
                }
            }
        }
        _ => panic!(
            "Unexpected argument value for @__RelayClientComponent directive: {:?}",
            &arg.value.item
        ),
    };
    writeln!(content)?;
    Ok(())
}

#[allow(clippy::too_many_arguments)]
fn generate_operation(
    config: &Config,
    project_config: &ProjectConfig,
    printer: &mut Printer,
    schema: &SDLSchema,
    normalization_operation: &OperationDefinition,
    reader_operation: &OperationDefinition,
    typegen_operation: &OperationDefinition,
    source_hash: String,
    text: &str,
    id_and_text_hash: &Option<(String, String)>,
    skip_types: bool,
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
    let mut content = get_content_start(config, project_config);
    writeln!(content, " * {}", SIGNING_TOKEN).unwrap();
    if let Some(operation_hash) = operation_hash {
        writeln!(content, " * @relayHash {}", operation_hash).unwrap();
    }
    if let TypegenLanguage::Flow = project_config.typegen_config.language {
        writeln!(content, " * @flow").unwrap();
        writeln!(content, " * @lightSyntaxTransform").unwrap();
        writeln!(content, " * @nogrep").unwrap();
    }
    if let Some(codegen_command) = &config.codegen_command {
        writeln!(content, " * @codegen-command: {}", codegen_command).unwrap();
    }
    writeln!(content, " */\n").unwrap();
    writeln!(content, "/* eslint-disable */\n").unwrap();
    writeln!(content, "'use strict';\n").unwrap();
    if let Some(id) = &request_parameters.id {
        writeln!(content, "// @relayRequestID {}", id).unwrap();
    }
    if project_config.variable_names_comment {
        write!(content, "// @relayVariables").unwrap();
        for variable_definition in &normalization_operation.variable_definitions {
            write!(content, " {}", variable_definition.name.item).unwrap();
        }
        writeln!(content).unwrap();
    }
    let data_driven_dependency_metadata = operation_fragment
        .directives
        .named(*DATA_DRIVEN_DEPENDENCY_METADATA_KEY);
    if let Some(data_driven_dependency_metadata) = data_driven_dependency_metadata {
        write_data_driven_dependency_annotation(&mut content, data_driven_dependency_metadata)
            .unwrap();
    }
    let flight_metadata = operation_fragment
        .directives
        .named(*REACT_FLIGHT_LOCAL_COMPONENTS_METADATA_KEY);
    if let Some(flight_metadata) = flight_metadata {
        write_react_flight_server_annotation(&mut content, flight_metadata).unwrap();
    }
    let relay_client_component_metadata = operation_fragment
        .directives
        .named(*RELAY_CLIENT_COMPONENT_METADATA_KEY);
    if let Some(relay_client_component_metadata) = relay_client_component_metadata {
        write_react_flight_client_annotation(&mut content, relay_client_component_metadata)
            .unwrap();
    }

    if request_parameters.id.is_some() || data_driven_dependency_metadata.is_some() {
        writeln!(content).unwrap();
    }

    let type_syntax = if project_config.typegen_config.use_import_type_syntax {
        "type "
    }  else {
        ""
    };
    if let TypegenLanguage::Flow = project_config.typegen_config.language { 
        writeln!(
            content,
            "/*::\n",
        )
        .unwrap();
    }

    writeln!(
        content,
        "import {}{{ ConcreteRequest }} from 'relay-runtime';",
        type_syntax
    )
    .unwrap();

    if !skip_types {
        write!(
            content,
            "{}",
            relay_typegen::generate_operation_type(
                typegen_operation,
                normalization_operation,
                schema,
                &project_config.typegen_config,
            )
        )
        .unwrap();
    }

    let node_request = printer.print_request(
        schema,
        normalization_operation,
        &operation_fragment,
        request_parameters,
    );

    if let TypegenLanguage::Flow = project_config.typegen_config.language { 
        writeln!(content, "*/\n").unwrap();
        writeln!(
            content,
            "var node/*: ConcreteRequest*/ = {};\n",
            node_request
        )
        .unwrap();
    } else {
        writeln!(content, "\n").unwrap();
        writeln!(
            content,
            "var node: ConcreteRequest = {};\n",
            node_request
        )
        .unwrap();
    }
    
    write_source_hash(config, project_config, &mut content, &source_hash).unwrap();
    // TODO: T67052528 - revisit this, once we move fb-specific transforms under the feature flag
    if is_operation_preloadable(normalization_operation) {
        writeln!(
              content,
              "if (node.params.id != null) {{\n  require('relay-runtime').PreloadableQueryRegistry.set(node.params.id, node);\n}}\n",
          )
          .unwrap();
    }
    writeln!(content, "module.exports = node;").unwrap();
    sign_file(&content).into_bytes()
}

fn generate_split_operation(
    config: &Config,
    project_config: &ProjectConfig,
    printer: &mut Printer,
    schema: &SDLSchema,
    normalization_operation: &OperationDefinition,
    typegen_operation: &Option<Arc<OperationDefinition>>,
    source_hash: &str,
) -> Vec<u8> {
    let mut content = get_content_start(config, project_config);
    writeln!(content, " * {}", SIGNING_TOKEN).unwrap();

    if let TypegenLanguage::Flow = project_config.typegen_config.language {
        writeln!(content, " * @flow").unwrap();
        writeln!(content, " * @lightSyntaxTransform").unwrap();
        writeln!(content, " * @nogrep").unwrap();
    }

    if let Some(codegen_command) = &config.codegen_command {
        writeln!(content, " * @codegen-command: {}", codegen_command).unwrap();
    }
    writeln!(content, " */\n").unwrap();
    writeln!(content, "/* eslint-disable */\n").unwrap();
    writeln!(content, "'use strict';\n").unwrap();
    let type_syntax = if project_config.typegen_config.use_import_type_syntax {
        "type "
    }  else {
        ""
    };
    if let TypegenLanguage::Flow = project_config.typegen_config.language { 
        writeln!(
            content,
            "/*::\n",
        )
        .unwrap();
    }
    writeln!(
        content,
        "import {}{{ NormalizationSplitOperation }} from 'relay-runtime';\n",
        type_syntax
    )
    .unwrap();
    if let Some(typegen_operation) = typegen_operation {
        writeln!(
            content,
            "{}",
            relay_typegen::generate_split_operation_type(
                typegen_operation,
                normalization_operation,
                schema,
                &project_config.typegen_config,
            )
        )
        .unwrap();
    }
    writeln!(content, "*/\n").unwrap();

    let node_operation = printer.print_operation(schema, normalization_operation);

    if let TypegenLanguage::Flow = project_config.typegen_config.language { 
        writeln!(content, "*/\n").unwrap();
        writeln!(
            content,
            "var node/*: NormalizationSplitOperation*/ = {};\n",
            node_operation
        )
        .unwrap();
    } else {
        writeln!(content, "\n").unwrap();
        writeln!(
            content,
            "var node: NormalizationSplitOperation = {};\n",
            node_operation
        )
        .unwrap();
    }
    
    write_source_hash(config, project_config, &mut content, &source_hash).unwrap();
    writeln!(content, "module.exports = node;").unwrap();
    sign_file(&content).into_bytes()
}

#[allow(clippy::too_many_arguments)]
fn generate_fragment(
    config: &Config,
    project_config: &ProjectConfig,
    printer: &mut Printer,
    schema: &SDLSchema,
    reader_fragment: &FragmentDefinition,
    typegen_fragment: &FragmentDefinition,
    source_hash: &str,
    skip_types: bool,
) -> Vec<u8> {
    let mut content = get_content_start(config, project_config);
    writeln!(content, " * {}", SIGNING_TOKEN).unwrap();

    if let TypegenLanguage::Flow = project_config.typegen_config.language {
        writeln!(content, " * @flow").unwrap();
        writeln!(content, " * @lightSyntaxTransform").unwrap();
        writeln!(content, " * @nogrep").unwrap();
    }

    if let Some(codegen_command) = &config.codegen_command {
        writeln!(content, " * @codegen-command: {}", codegen_command).unwrap();
    }
    writeln!(content, " */\n").unwrap();
    writeln!(content, "/* eslint-disable */\n").unwrap();
    writeln!(content, "'use strict';\n").unwrap();
    let data_driven_dependency_metadata = reader_fragment
        .directives
        .named(*DATA_DRIVEN_DEPENDENCY_METADATA_KEY);
    if let Some(data_driven_dependency_metadata) = data_driven_dependency_metadata {
        write_data_driven_dependency_annotation(&mut content, data_driven_dependency_metadata)
            .unwrap();

        writeln!(content).unwrap();
    }
    let flight_metadata = reader_fragment
        .directives
        .named(*REACT_FLIGHT_LOCAL_COMPONENTS_METADATA_KEY);
    if let Some(flight_metadata) = flight_metadata {
        write_react_flight_server_annotation(&mut content, flight_metadata).unwrap();
    }
    let relay_client_component_metadata = reader_fragment
        .directives
        .named(*RELAY_CLIENT_COMPONENT_METADATA_KEY);
    if let Some(relay_client_component_metadata) = relay_client_component_metadata {
        write_react_flight_client_annotation(&mut content, relay_client_component_metadata)
            .unwrap();
    }

    let type_syntax = if project_config.typegen_config.use_import_type_syntax {
        "type "
    }  else {
        ""
    };

    let reader_node_flow_type = if reader_fragment
        .directives
        .named(INLINE_DATA_CONSTANTS.directive_name)
        .is_some()
    {
        "ReaderInlineDataFragment"
    } else {
        "ReaderFragment"
    };

    if let TypegenLanguage::Flow = project_config.typegen_config.language { 
        writeln!(
            content,
            "/*::\n",
        )
        .unwrap();
    }

    writeln!(
        content,
        "import {}{{ {} }} from 'relay-runtime';",
        type_syntax,
        reader_node_flow_type
    )
    .unwrap();

    if !skip_types {
        write!(
            content,
            "{}",
            generate_fragment_type(typegen_fragment, schema, &project_config.typegen_config)
        )
        .unwrap();
    }

    let node_fragment = printer.print_fragment(schema, reader_fragment);

    if let TypegenLanguage::Flow = project_config.typegen_config.language { 
        writeln!(content, "*/\n").unwrap();
        writeln!(
            content,
            "var node/*: {}*/ = {};\n",
            reader_node_flow_type,
            node_fragment
        )
        .unwrap();
    } else {
        writeln!(content, "\n").unwrap();
        writeln!(
            content,
            "var node:{} = {};\n",
            reader_node_flow_type,
            node_fragment
        )
        .unwrap();
    }

    write_source_hash(config, project_config, &mut content, &source_hash).unwrap();

    writeln!(content, "module.exports = node;").unwrap();
    sign_file(&content).into_bytes()
}

fn get_content_start(config: &Config, project_config: &ProjectConfig) -> String {
    let mut content = String::new();

    if let TypegenLanguage::TypeScript = project_config.typegen_config.language {
        writeln!(content, "// @ts-nocheck").unwrap();
    }

    writeln!(content, "/**").unwrap();
    if !config.header.is_empty() {
        for header_line in &config.header {
            writeln!(content, " * {}", header_line).unwrap();
        }
        writeln!(content, " *").unwrap();
    }
    content
}

fn write_source_hash(config: &Config, project_config: &ProjectConfig, content: &mut String, source_hash: &str) -> Result {
    let node_type = if let TypegenLanguage::Flow = project_config.typegen_config.language {
        "/*: any*/"
    } else {
        " as any"
    };

    if let Some(is_dev_variable_name) = &config.is_dev_variable_name {
        writeln!(content, "if ({}) {{", is_dev_variable_name)?;
        writeln!(content, "  (node{}).hash = \"{}\";", node_type, source_hash)?;
        writeln!(content, "}}\n")?;
    } else {
        writeln!(content, "(node{}).hash = \"{}\";\n", node_type, source_hash)?;
    }

    Ok(())
}
