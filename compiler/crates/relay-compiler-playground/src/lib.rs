/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::FeatureFlags;
use common::NoopPerfLogger;
use common::SourceLocationKey;
use common::SourceLocationKey::Generated;
use common::TextSource;
use graphql_ir::Program;
use graphql_text_printer::PrinterOptions;
use intern::string_key::Intern;
use relay_codegen::print_fragment;
use relay_codegen::print_operation;
use relay_codegen::print_provided_variables;
use relay_config::ProjectConfig;
use relay_schema::build_schema_with_extensions;
use relay_transforms::Programs;
use relay_transforms::apply_transforms;
use relay_typegen::FragmentLocations;
use relay_typegen::TypegenConfig;
use relay_typegen::generate_fragment_type_exports_section;
use relay_typegen::generate_operation_type_exports_section;
use schema::SDLSchema;
use serde::Serialize;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Serialize, Debug)]
pub struct WasmDiagnostic {
    message: String,
    line_start: u32,
    line_end: u32,
    column_start: u32,
    column_end: u32,
}

enum InputType<'a> {
    Schema(&'a str),
    Document(&'a str),
}

impl<'a> InputType<'a> {
    fn source(&self) -> &'a str {
        match self {
            Self::Schema(source) => source,
            Self::Document(source) => source,
        }
    }
}

#[derive(Serialize, Debug)]
pub enum PlaygroundError {
    DocumentDiagnostics(Vec<WasmDiagnostic>),
    SchemaDiagnostics(Vec<WasmDiagnostic>),
    ConfigError(String),
    TypegenConfigError(String),
}

pub type PlaygroundResult = Result<String, PlaygroundError>;

#[wasm_bindgen]
pub fn parse_to_ast(document_text: &str) -> String {
    serialize_result(parse_to_ast_impl(document_text))
}

pub fn parse_to_ast_impl(document_text: &str) -> PlaygroundResult {
    let serialized_document = graphql_syntax::parse_executable(document_text, Generated)
        .map(|document| format!("{:?}", document))
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Document(document_text)))?;

    Ok(serialized_document)
}

#[wasm_bindgen]
pub fn parse_to_ir(schema_text: &str, document_text: &str) -> String {
    serialize_result(parse_to_ir_impl(schema_text, document_text))
}

pub fn parse_to_ir_impl(schema_text: &str, document_text: &str) -> PlaygroundResult {
    let document = graphql_syntax::parse_executable(document_text, Generated)
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Document(document_text)))?;

    let schema = Arc::new(
        build_schema_with_extensions(
            &[(schema_text, SourceLocationKey::generated())],
            &Vec::<(&str, SourceLocationKey)>::new(),
        )
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Schema(schema_text)))?,
    );

    let ir = graphql_ir::build(&schema, &document.definitions)
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Document(document_text)))?;

    Ok(ir
        .iter()
        .map(|definition| format!("{:?}", definition))
        .collect::<Vec<String>>()
        .join("\n"))
}

#[wasm_bindgen]
pub fn parse_to_reader_ast(
    feature_flags_json: &str,
    schema_text: &str,
    document_text: &str,
) -> String {
    serialize_result(parse_to_reader_ast_impl(
        feature_flags_json,
        schema_text,
        document_text,
    ))
}

pub fn parse_to_reader_ast_impl(
    feature_flags_json: &str,
    schema_text: &str,
    document_text: &str,
) -> PlaygroundResult {
    let schema = Arc::new(
        build_schema_with_extensions(
            &[(schema_text, SourceLocationKey::Generated)],
            &Vec::<(&str, SourceLocationKey)>::new(),
        )
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Schema(schema_text)))?,
    );
    let project_config = get_project_config(feature_flags_json, None)?;
    let programs = get_programs(&schema, &project_config, document_text)?;

    let reader_ast_string = programs
        .reader
        .fragments()
        .map(|def| {
            let mut import_statements = Default::default();
            let fragment = print_fragment(&schema, def, &project_config, &mut import_statements);
            format!("{}{}", import_statements, fragment)
        })
        .chain(programs.reader.operations().map(|def| {
            let mut import_statements = Default::default();
            let operation = print_operation(&schema, def, &project_config, &mut import_statements);
            format!("{}{}", import_statements, operation)
        }))
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(reader_ast_string)
}

#[wasm_bindgen]
pub fn parse_to_normalization_ast(
    feature_flags_json: &str,
    schema_text: &str,
    document_text: &str,
) -> String {
    serialize_result(parse_to_normalization_ast_impl(
        feature_flags_json,
        schema_text,
        document_text,
    ))
}

pub fn parse_to_normalization_ast_impl(
    feature_flags_json: &str,
    schema_text: &str,
    document_text: &str,
) -> PlaygroundResult {
    let schema = Arc::new(
        build_schema_with_extensions(
            &[(schema_text, SourceLocationKey::Generated)],
            &Vec::<(&str, SourceLocationKey)>::new(),
        )
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Schema(schema_text)))?,
    );
    let project_config = get_project_config(feature_flags_json, None)?;
    let programs = get_programs(&schema, &project_config, document_text)?;

    let normalization_ast_string = programs
        .normalization
        .operations()
        .map(|def| {
            let mut import_statements = Default::default();
            let operation = print_operation(&schema, def, &project_config, &mut import_statements);

            format!("{}{}", import_statements, operation)
        })
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(normalization_ast_string)
}

#[wasm_bindgen]
pub fn parse_to_types(
    feature_flags_json: &str,
    typegen_config_json: &str,
    schema_text: &str,
    document_text: &str,
) -> String {
    serialize_result(parse_to_types_impl(
        feature_flags_json,
        typegen_config_json,
        schema_text,
        document_text,
    ))
}

pub fn parse_to_types_impl(
    feature_flags_json: &str,
    typegen_config_json: &str,
    schema_text: &str,
    document_text: &str,
) -> PlaygroundResult {
    let schema = Arc::new(
        build_schema_with_extensions(
            &[(schema_text, SourceLocationKey::Generated)],
            &Vec::<(&str, SourceLocationKey)>::new(),
        )
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Schema(schema_text)))?,
    );
    let project_config = get_project_config(feature_flags_json, Some(typegen_config_json))?;
    let programs = get_programs(&schema, &project_config, document_text)?;

    let fragment_locations = FragmentLocations::new(programs.typegen.fragments());
    let types_string = programs
        .typegen
        .fragments()
        .map(|def| {
            generate_fragment_type_exports_section(
                def,
                &schema,
                &project_config,
                &fragment_locations,
            )
        })
        .chain(programs.typegen.operations().map(|typegen_operation| {
            let normalization_operation = programs
                .normalization
                .operation(typegen_operation.name.item)
                .unwrap();

            generate_operation_type_exports_section(
                typegen_operation,
                normalization_operation,
                &schema,
                &project_config,
                &fragment_locations,
                print_provided_variables(&schema, normalization_operation, &project_config),
            )
        }))
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(types_string)
}

#[wasm_bindgen]
pub fn transform(feature_flags_json: &str, schema_text: &str, document_text: &str) -> String {
    serialize_result(transform_impl(
        feature_flags_json,
        schema_text,
        document_text,
    ))
}

fn transform_impl(
    feature_flags_json: &str,
    schema_text: &str,
    document_text: &str,
) -> PlaygroundResult {
    let schema = Arc::new(
        build_schema_with_extensions(
            &[(schema_text, SourceLocationKey::Generated)],
            &Vec::<(&str, SourceLocationKey)>::new(),
        )
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Schema(schema_text)))?,
    );
    let project_config = get_project_config(feature_flags_json, None)?;
    let programs = get_programs(&schema, &project_config, document_text)?;

    let transformed_operations = programs
        .operation_text
        .operations()
        .map(|operation| {
            graphql_text_printer::print_operation(&schema, operation, PrinterOptions::default())
        })
        .collect::<Vec<_>>()
        .join("\n");

    let transformed_fragments = programs
        .operation_text
        .fragments()
        .map(|operation| {
            graphql_text_printer::print_fragment(&schema, operation, PrinterOptions::default())
        })
        .collect::<Vec<_>>()
        .join("\n");

    let output = transformed_operations + "\n\n" + &transformed_fragments;
    Ok(output)
}

fn get_project_config(
    feature_flags_json: &str,
    typegen_config_json: Option<&str>,
) -> Result<ProjectConfig, PlaygroundError> {
    let feature_flags: FeatureFlags = serde_json::from_str(feature_flags_json)
        .map_err(|err| PlaygroundError::ConfigError(format!("{}", err)))?;
    let project_name = "test_project".intern().into();
    let typegen_config: TypegenConfig = typegen_config_json
        .map(|str| {
            serde_json::from_str(str)
                .map_err(|err| PlaygroundError::TypegenConfigError(format!("{}", err)))
        })
        .unwrap_or(Ok(TypegenConfig::default()))?;

    Ok(ProjectConfig {
        name: project_name,
        feature_flags: Arc::new(feature_flags),
        typegen_config,
        ..Default::default()
    })
}

fn get_programs(
    schema: &Arc<SDLSchema>,
    project_config: &ProjectConfig,
    document_text: &str,
) -> Result<Programs, PlaygroundError> {
    let document = graphql_syntax::parse_executable(document_text, Generated)
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Document(document_text)))?;

    let ir = graphql_ir::build(schema, &document.definitions)
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Document(document_text)))?;

    let program = Program::from_definitions(schema.clone(), ir);
    let base_fragment_names = Arc::new(Default::default());

    apply_transforms(
        &project_config,
        Arc::new(program),
        base_fragment_names,
        Arc::new(NoopPerfLogger),
        None,
        None,
        vec![],
    )
    .map_err(|diagnostics: Vec<Diagnostic>| {
        map_diagnostics(diagnostics, &InputType::Document(document_text))
    })
}

fn map_diagnostics(diagnostics: Vec<Diagnostic>, source: &InputType<'_>) -> PlaygroundError {
    let wasm_diagnostics = diagnostics
        .iter()
        .map(|diagnostic| {
            let range = TextSource::from_whole_document(source.source())
                .to_span_range(diagnostic.location().span());
            WasmDiagnostic {
                message: diagnostic.print_without_source(),
                line_start: range.start.line,
                line_end: range.end.line,
                column_start: range.start.character,
                column_end: range.end.character,
            }
        })
        .collect();
    match source {
        InputType::Document(_) => PlaygroundError::DocumentDiagnostics(wasm_diagnostics),
        InputType::Schema(_) => PlaygroundError::SchemaDiagnostics(wasm_diagnostics),
    }
}

fn serialize_result(result: PlaygroundResult) -> String {
    serde_json::to_string(&result).unwrap()
}

#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
}
