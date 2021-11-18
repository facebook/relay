/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::config::{Config, ProjectConfig};
use common::{NamedItem, SourceLocationKey};
use graphql_ir::{Directive, FragmentDefinition, OperationDefinition};
use graphql_syntax::OperationKind;
use relay_codegen::{build_request_params, Printer, QueryID};
use relay_transforms::{
    is_operation_preloadable, ReactFlightLocalComponentsMetadata, RefetchableMetadata,
    RelayClientComponentMetadata, DATA_DRIVEN_DEPENDENCY_METADATA_KEY, INLINE_DIRECTIVE_NAME,
};
use relay_typegen::{
    generate_fragment_type, has_raw_response_type_directive, TypegenConfig, TypegenLanguage,
};
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
        id_and_text_hash: Option<QueryID>,
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
    flight_local_components_metadata: &ReactFlightLocalComponentsMetadata,
) -> Result {
    for item in &flight_local_components_metadata.components {
        writeln!(content, "// @ReactFlightServerDependency {}", item)?;
    }
    writeln!(content)?;
    Ok(())
}

fn write_react_flight_client_annotation(
    content: &mut String,
    relay_client_component_metadata: &RelayClientComponentMetadata,
) -> Result {
    for value in &relay_client_component_metadata.split_operation_filenames {
        writeln!(content, "// @ReactFlightClientDependency {}", value)?;
    }
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
    id_and_text_hash: &Option<QueryID>,
    skip_types: bool,
) -> Vec<u8> {
    let mut request_parameters = build_request_params(normalization_operation);
    if id_and_text_hash.is_some() {
        request_parameters.id = id_and_text_hash;
    } else {
        request_parameters.text = Some(text.into());
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

    if let Some(QueryID::Persisted { text_hash, .. }) = id_and_text_hash {
        writeln!(content, " * @relayHash {}", text_hash).unwrap();
    };

    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(content, " * @flow").unwrap();
    }
    writeln!(content, " * @lightSyntaxTransform").unwrap();
    writeln!(content, " * @nogrep").unwrap();
    if let Some(codegen_command) = &config.codegen_command {
        writeln!(content, " * @codegen-command: {}", codegen_command).unwrap();
    }
    writeln!(content, " */\n").unwrap();

    write_disable_lint_header(&project_config.typegen_config.language, &mut content).unwrap();
    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(content, "'use strict';\n").unwrap();
    }

    if let Some(QueryID::Persisted { id, .. }) = &request_parameters.id {
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
    if let Some(flight_metadata) =
        ReactFlightLocalComponentsMetadata::find(&operation_fragment.directives)
    {
        write_react_flight_server_annotation(&mut content, flight_metadata).unwrap();
    }
    let relay_client_component_metadata =
        RelayClientComponentMetadata::find(&operation_fragment.directives);
    if let Some(relay_client_component_metadata) = relay_client_component_metadata {
        write_react_flight_client_annotation(&mut content, relay_client_component_metadata)
            .unwrap();
    }

    if request_parameters.id.is_some() || data_driven_dependency_metadata.is_some() {
        writeln!(content).unwrap();
    }
    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(content, "/*::").unwrap();
    }

    let operation_flow_type = match normalization_operation.kind {
        OperationKind::Query => "Query",
        OperationKind::Mutation => "Mutation",
        OperationKind::Subscription => "GraphQLSubscription",
    };

    if skip_types {
        write_import_type_from(
            &project_config.typegen_config.language,
            &mut content,
            "ConcreteRequest",
            "relay-runtime",
        )
        .unwrap()
    } else {
        write_import_type_from(
            &project_config.typegen_config.language,
            &mut content,
            &format!("ConcreteRequest, {}", operation_flow_type),
            "relay-runtime",
        )
        .unwrap()
    }


    if !skip_types {
        write!(
            content,
            "{}",
            relay_typegen::generate_operation_type(
                typegen_operation,
                normalization_operation,
                schema,
                project_config.js_module_format,
                &project_config.typegen_config,
            )
        )
        .unwrap();
    }
    match project_config.typegen_config.language {
        TypegenLanguage::Flow => {
            writeln!(content, "*/\n").unwrap();
        }
        TypegenLanguage::TypeScript => {
            writeln!(content).unwrap();
        }
    }

    write_variable_value_with_type(
        &project_config.typegen_config.language,
        &mut content,
        "node",
        "ConcreteRequest",
        &printer.print_request(
            schema,
            normalization_operation,
            &operation_fragment,
            request_parameters,
        ),
    )
    .unwrap();

    write_source_hash(
        config,
        &project_config.typegen_config.language,
        &mut content,
        &source_hash,
    )
    .unwrap();

    if is_operation_preloadable(normalization_operation) && id_and_text_hash.is_some() {
        writeln!(
            content,
            "require('relay-runtime').PreloadableQueryRegistry.set((node.params/*: any*/).id, node);\n",
        )
        .unwrap();
    }

    let node_type = if skip_types {
        None
    } else {
        Some(
            if has_raw_response_type_directive(normalization_operation) {
                format!(
                    "{type}<\n  {name}$variables,\n  {name}$data,\n  {name}$rawResponse,\n>",
                    type = operation_flow_type,
                    name = normalization_operation.name.item
                )
            } else {
                format!(
                    "{type}<\n  {name}$variables,\n  {name}$data,\n>",
                    type = operation_flow_type,
                    name = normalization_operation.name.item
                )
            },
        )
    };

    write_export_generated_node(
        &project_config.typegen_config,
        &mut content,
        "node",
        node_type,
    )
    .unwrap();

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
    let mut content = get_content_start(config);
    writeln!(content, " * {}", SIGNING_TOKEN).unwrap();
    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(content, " * @flow").unwrap();
    }
    writeln!(content, " * @lightSyntaxTransform").unwrap();
    writeln!(content, " * @nogrep").unwrap();
    if let Some(codegen_command) = &config.codegen_command {
        writeln!(content, " * @codegen-command: {}", codegen_command).unwrap();
    }
    writeln!(content, " */\n").unwrap();
    write_disable_lint_header(&project_config.typegen_config.language, &mut content).unwrap();
    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(content, "'use strict';\n").unwrap();
        writeln!(content, "/*::").unwrap();
    }

    write_import_type_from(
        &project_config.typegen_config.language,
        &mut content,
        "NormalizationSplitOperation",
        "relay-runtime",
    )
    .unwrap();
    writeln!(content,).unwrap();

    if let Some(typegen_operation) = typegen_operation {
        writeln!(
            content,
            "{}",
            relay_typegen::generate_split_operation_type(
                typegen_operation,
                normalization_operation,
                schema,
                project_config.js_module_format,
                &project_config.typegen_config,
            )
        )
        .unwrap();
    }
    match project_config.typegen_config.language {
        TypegenLanguage::Flow => {
            writeln!(content, "*/\n").unwrap();
        }
        TypegenLanguage::TypeScript => {
            writeln!(content).unwrap();
        }
    }

    write_variable_value_with_type(
        &project_config.typegen_config.language,
        &mut content,
        "node",
        "NormalizationSplitOperation",
        &printer.print_operation(schema, normalization_operation),
    )
    .unwrap();
    write_source_hash(
        config,
        &project_config.typegen_config.language,
        &mut content,
        source_hash,
    )
    .unwrap();
    write_export_generated_node(&project_config.typegen_config, &mut content, "node", None)
        .unwrap();

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
    let mut content = get_content_start(config);
    writeln!(content, " * {}", SIGNING_TOKEN).unwrap();
    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(content, " * @flow").unwrap();
    }
    writeln!(content, " * @lightSyntaxTransform").unwrap();
    writeln!(content, " * @nogrep").unwrap();
    if let Some(codegen_command) = &config.codegen_command {
        writeln!(content, " * @codegen-command: {}", codegen_command).unwrap();
    }
    writeln!(content, " */\n").unwrap();
    write_disable_lint_header(&project_config.typegen_config.language, &mut content).unwrap();
    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(content, "'use strict';\n").unwrap();
    }

    let data_driven_dependency_metadata = reader_fragment
        .directives
        .named(*DATA_DRIVEN_DEPENDENCY_METADATA_KEY);
    if let Some(data_driven_dependency_metadata) = data_driven_dependency_metadata {
        write_data_driven_dependency_annotation(&mut content, data_driven_dependency_metadata)
            .unwrap();

        writeln!(content).unwrap();
    }
    if let Some(flight_metadata) =
        ReactFlightLocalComponentsMetadata::find(&reader_fragment.directives)
    {
        write_react_flight_server_annotation(&mut content, flight_metadata).unwrap();
    }
    let relay_client_component_metadata =
        RelayClientComponentMetadata::find(&reader_fragment.directives);
    if let Some(relay_client_component_metadata) = relay_client_component_metadata {
        write_react_flight_client_annotation(&mut content, relay_client_component_metadata)
            .unwrap();
    }

    let is_inline_data_fragment = reader_fragment
        .directives
        .named(*INLINE_DIRECTIVE_NAME)
        .is_some();

    let (imported_types, reader_node_flow_type, node_type) = if skip_types {
        if is_inline_data_fragment {
            ("ReaderInlineDataFragment", "ReaderInlineDataFragment", None)
        } else {
            ("ReaderFragment", "ReaderFragment", None)
        }
    } else if is_inline_data_fragment {
        (
            "InlineFragment, ReaderInlineDataFragment",
            "ReaderInlineDataFragment",
            Some(format!(
                "InlineFragment<\n  {name}$fragmentType,\n  {name}$data,\n>",
                name = typegen_fragment.name.item
            )),
        )
    } else if let Some(refetchable_metadata) =
        RefetchableMetadata::find(&typegen_fragment.directives)
    {
        (
            "ReaderFragment, RefetchableFragment",
            "ReaderFragment",
            Some(format!(
                "RefetchableFragment<\n  {name}$fragmentType,\n  {name}$data,\n  {refetchable_name}$variables,\n>",
                name = typegen_fragment.name.item,
                refetchable_name = refetchable_metadata.operation_name
            )),
        )
    } else {
        (
            "Fragment, ReaderFragment",
            "ReaderFragment",
            Some(format!(
                "Fragment<\n  {name}$fragmentType,\n  {name}$data,\n>",
                name = typegen_fragment.name.item
            )),
        )
    };

    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(content, "/*::").unwrap();
    }

    write_import_type_from(
        &project_config.typegen_config.language,
        &mut content,
        imported_types,
        "relay-runtime",
    )
    .unwrap();

    if !skip_types {
        write!(
            content,
            "{}",
            generate_fragment_type(
                typegen_fragment,
                schema,
                project_config.js_module_format,
                &project_config.typegen_config
            )
        )
        .unwrap();
    }
    match project_config.typegen_config.language {
        TypegenLanguage::Flow => writeln!(content, "*/\n").unwrap(),
        TypegenLanguage::TypeScript => writeln!(content).unwrap(),
    }

    write_variable_value_with_type(
        &project_config.typegen_config.language,
        &mut content,
        "node",
        reader_node_flow_type,
        &printer.print_fragment(schema, reader_fragment),
    )
    .unwrap();

    write_source_hash(
        config,
        &project_config.typegen_config.language,
        &mut content,
        source_hash,
    )
    .unwrap();


    write_export_generated_node(
        &project_config.typegen_config,
        &mut content,
        "node",
        node_type,
    )
    .unwrap();

    sign_file(&content).into_bytes()
}

fn write_variable_value_with_type(
    language: &TypegenLanguage,
    content: &mut String,
    variable_name: &str,
    type_: &str,
    value: &str,
) -> Result {
    match language {
        TypegenLanguage::Flow => writeln!(
            content,
            "var {}/*: {}*/ = {};\n",
            variable_name, type_, value
        ),
        TypegenLanguage::TypeScript => {
            writeln!(content, "const {}: {} = {};\n", variable_name, type_, value)
        }
    }
}

fn write_disable_lint_header(language: &TypegenLanguage, content: &mut String) -> Result {
    match language {
        TypegenLanguage::TypeScript => {
            writeln!(content, "/* tslint:disable */")?;
            writeln!(content, "/* eslint-disable */")?;
            writeln!(content, "// @ts-nocheck\n")
        }
        TypegenLanguage::Flow => {
            writeln!(content, "/* eslint-disable */\n")
        }
    }
}

fn write_import_type_from(
    language: &TypegenLanguage,
    content: &mut String,
    type_: &str,
    from: &str,
) -> Result {
    match language {
        TypegenLanguage::Flow => writeln!(content, "import type {{ {} }} from '{}';", type_, from),
        TypegenLanguage::TypeScript => writeln!(content, "import {{ {} }} from '{}';", type_, from),
    }
}

fn write_export_generated_node(
    typegen_config: &TypegenConfig,
    content: &mut String,
    variable_node: &str,
    forced_type: Option<String>,
) -> Result {
    if typegen_config.eager_es_modules {
        writeln!(content, "export default {};", variable_node)
    } else {
        match (typegen_config.language, forced_type) {
            (TypegenLanguage::Flow, None) => {
                writeln!(content, "module.exports = {};", variable_node)
            }
            (TypegenLanguage::Flow, Some(forced_type)) => writeln!(
                content,
                "module.exports = (({}/*: any*/)/*: {}*/);",
                variable_node, forced_type
            ),
            (TypegenLanguage::TypeScript, _) => {
                writeln!(content, "export default {};", variable_node)
            }
        }
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

fn write_source_hash(
    config: &Config,
    language: &TypegenLanguage,
    content: &mut String,
    source_hash: &str,
) -> Result {
    if let Some(is_dev_variable_name) = &config.is_dev_variable_name {
        writeln!(content, "if ({}) {{", is_dev_variable_name)?;
        match language {
            TypegenLanguage::Flow => {
                writeln!(content, "  (node/*: any*/).hash = \"{}\";", source_hash)?
            }
            TypegenLanguage::TypeScript => {
                writeln!(content, "  (node as any).hash = \"{}\";", source_hash)?
            }
        };
        writeln!(content, "}}\n")?;
    } else {
        match language {
            TypegenLanguage::Flow => {
                writeln!(content, "(node/*: any*/).hash = \"{}\";\n", source_hash)?
            }
            TypegenLanguage::TypeScript => {
                writeln!(content, "(node as any).hash = \"{}\";\n", source_hash)?
            }
        };
    }

    Ok(())
}
