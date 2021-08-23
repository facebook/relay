/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, NoopPerfLogger, SourceLocationKey::Generated};
use console_error_panic_hook;
use fnv::FnvHashSet;
use graphql_ir::Program;
use graphql_syntax;
use graphql_text_printer;
use interner::Intern;
use relay_codegen::{print_fragment, print_operation, JsModuleFormat};
use relay_schema::build_schema_with_extensions;
use relay_transforms::{apply_transforms, ConnectionInterface, FeatureFlags, Programs};
use schema::SDLSchema;
use serde::Serialize;
use serde_json;
use std::sync::Arc;

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

    Ok(serialized_document.into())
}

#[wasm_bindgen]
pub fn parse_to_ir(schema_text: &str, document_text: &str) -> String {
    serialize_result(parse_to_ir_impl(schema_text, document_text))
}

pub fn parse_to_ir_impl(schema_text: &str, document_text: &str) -> PlaygroundResult {
    let document = graphql_syntax::parse_executable(document_text, Generated)
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Document(document_text)))?;


    let schema = Arc::new(
        build_schema_with_extensions(&[schema_text], &Vec::<&str>::new())
            .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Schema(schema_text)))?,
    );

    let ir = graphql_ir::build(&schema, &document.definitions)
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Document(document_text)))?;

    Ok(ir
        .iter()
        .map(|definition| format!("{:?}", definition))
        .collect::<Vec<String>>()
        .join("\n")
        .into())
}

#[wasm_bindgen]
pub fn parse_to_reader_ast(schema_text: &str, document_text: &str) -> String {
    serialize_result(parse_to_reader_ast_impl(schema_text, document_text))
}

pub fn parse_to_reader_ast_impl(schema_text: &str, document_text: &str) -> PlaygroundResult {
    let schema = Arc::new(
        build_schema_with_extensions(&[schema_text], &Vec::<&str>::new())
            .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Schema(schema_text)))?,
    );

    let programs = get_programs(&schema, document_text)?;

    let reader_ast_string = programs
        .reader
        .fragments()
        .map(|def| print_fragment(&schema, &def, JsModuleFormat::Haste))
        .chain(
            programs
                .reader
                .operations()
                .map(|def| print_operation(&schema, &def, JsModuleFormat::Haste)),
        )
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(reader_ast_string.into())
}

#[wasm_bindgen]
pub fn transform(schema_text: &str, document_text: &str) -> String {
    serialize_result(transform_impl(schema_text, document_text))
}

fn transform_impl(schema_text: &str, document_text: &str) -> PlaygroundResult {
    let schema = Arc::new(
        build_schema_with_extensions(&[schema_text], &Vec::<&str>::new())
            .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Schema(schema_text)))?,
    );
    let programs = get_programs(&schema, document_text)?;

    let transformed_operations = programs
        .operation_text
        .operations()
        .map(|operation| graphql_text_printer::print_operation(&schema, operation))
        .collect::<Vec<_>>()
        .join("\n");

    let transformed_fragments = programs
        .operation_text
        .fragments()
        .map(|operation| graphql_text_printer::print_fragment(&schema, operation))
        .collect::<Vec<_>>()
        .join("\n");

    let output = transformed_operations + "\n\n" + &transformed_fragments;
    Ok(output.into())
}

fn get_programs(schema: &Arc<SDLSchema>, document_text: &str) -> Result<Programs, PlaygroundError> {
    let document = graphql_syntax::parse_executable(document_text, Generated)
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Document(document_text)))?;


    let ir = graphql_ir::build(&schema, &document.definitions)
        .map_err(|diagnostics| map_diagnostics(diagnostics, &InputType::Document(document_text)))?;

    let program = Program::from_definitions(schema.clone(), ir);

    let project_name = "test_project".intern();
    let base_fragment_names = Arc::new(FnvHashSet::default());
    let connection_interface = ConnectionInterface::default();
    let feature_flags = FeatureFlags::default();
    let perf_logger = NoopPerfLogger;

    apply_transforms(
        project_name,
        Arc::new(program),
        base_fragment_names,
        &connection_interface,
        Arc::new(feature_flags),
        Arc::new(perf_logger),
        None,
    )
    .map_err(|diagnostics: Vec<Diagnostic>| {
        map_diagnostics(diagnostics, &InputType::Document(document_text))
    })
}

fn map_diagnostics(diagnostics: Vec<Diagnostic>, source: &InputType<'_>) -> PlaygroundError {
    let wasm_diagnostics = diagnostics
        .iter()
        .map(|diagnostic| {
            let range = diagnostic.location().span().to_range(source.source(), 0, 0);
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

// #[test]
fn _disable_test() {
    let schema_text = r#"type User {
        name: String
        age: Int
        best_friend: User
      }

      type Query {
        me: User
      }"#;
    let document_text = r#"query MyQuery {
        me {
          name
          ...AgeFragment
          best_friend {
            ...AgeFragment
          }
        }
      }

      fragment AgeFragment on User {
          age
      }"#;
    let result = serialize_result(transform_impl(schema_text, document_text));

    let expected = r#"{"Ok":"query MyQuery {
  me {
    name
    age
    best_friend {
      age
    }
  }
}"}"#;

    assert_eq!(result, expected)
}
