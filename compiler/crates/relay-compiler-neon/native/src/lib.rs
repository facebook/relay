/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{ConsoleLogger, Location, SourceLocationKey};
use graphql_ir::{build, Program};
use graphql_syntax::{
    parse, Document, ExecutableDefinition, SyntaxError, SyntaxErrorKind, SyntaxResult,
};
use graphql_transforms::{ConnectionInterface, FeatureFlags};
use interner::Intern;
use neon::prelude::*;
use relay_codegen::Printer;
use relay_compiler::{
    apply_transforms,
    config::{Config, ProjectConfig, SchemaLocation},
    generate_artifacts, ArtifactFileWriter, SourceHashes,
};
use schema::build_schema;
use std::str;
use std::sync::Arc;

/// Parse JS input to get list of executable definitions (ASTs)
fn build_definitions_from_js_input(
    input: Vec<Handle<JsValue>>,
) -> Result<Vec<ExecutableDefinition>, Vec<SyntaxError>> {
    let mut documents: Vec<SyntaxResult<Document>> = Vec::with_capacity(input.len());
    let mut errors: Vec<SyntaxError> = vec![];
    for js_value in input {
        if let Ok(value) = js_value.downcast::<JsString>() {
            documents.push(parse(&value.value(), SourceLocationKey::Generated));
        } else {
            // This is not technically correct - it should be JS syntax/parse error, not graphql
            // TODO: Replace with correct error
            errors.push(SyntaxError::new(
                SyntaxErrorKind::UnsupportedCharacter,
                Location::generated(),
            ));
        }
    }
    if !errors.is_empty() {
        return Err(errors);
    }

    let mut definitions: Vec<ExecutableDefinition> = vec![];
    for document in documents {
        match document {
            Ok(document) => {
                for definition in document.definitions {
                    definitions.push(definition);
                }
            }
            Err(syntax_errors) => {
                errors.extend(syntax_errors);
            }
        }
    }

    if errors.is_empty() {
        Ok(definitions)
    } else {
        Err(errors)
    }
}

/// This will create instances of compiler and project configs
/// we may handle JS inputs here, later
fn create_configs() -> (Config, ProjectConfig) {
    // TODO: Handle configuration from JS
    let project_config = ProjectConfig {
        name: "relay_compiler".intern(),
        base: None,
        output: None,
        extra_artifacts_output: None,
        shard_output: false,
        shard_strip_regex: None,
        extensions: vec![],
        enabled: true,
        schema_location: SchemaLocation::File(Default::default()),
        typegen_config: Default::default(),
        persist: None,
    };

    let config = Config {
        artifact_writer: Box::new(ArtifactFileWriter),
        codegen_command: None,
        excludes: vec![],
        full_build: false,
        generate_extra_operation_artifacts: None,
        header: vec![],
        load_saved_state_file: None,
        projects: Default::default(),
        root_dir: Default::default(),
        sources: Default::default(),
        saved_state_config: None,
        saved_state_loader: None,
        connection_interface: Default::default(),
        feature_flags: FeatureFlags::default(),
    };

    (config, project_config)
}

fn compile(mut cx: FunctionContext) -> JsResult<JsObject> {
    let schema_text = cx.argument::<JsString>(0)?.value();
    let documents = cx.argument::<JsArray>(1)?.to_vec(&mut cx)?;

    let schema = build_schema(&schema_text).expect("Invalid schema");
    let definitions = build_definitions_from_js_input(documents).expect("Invalid documents");

    let (config, project_config) = create_configs();
    let mut printer = Printer::default();

    let source_hashes = SourceHashes::from_definitions(&definitions);
    let ir = build(&schema, &definitions).expect("Unable to build Relay IR");
    let schema_arc = Arc::new(schema);
    let program = Program::from_definitions(schema_arc, ir);

    let programs = apply_transforms(
        project_config.name,
        Arc::new(program),
        Arc::new(Default::default()),
        &ConnectionInterface::default(),
        &FeatureFlags::default(),
        Arc::new(ConsoleLogger),
    )
    .expect("Unable to apply transforms");

    let artifacts = generate_artifacts(&project_config, &programs, Arc::new(source_hashes))
        .expect("Unable to generate artifacts");

    let generated_artifacts = JsArray::new(&mut cx, artifacts.len() as u32);

    for (i, artifact) in artifacts.iter().enumerate() {
        let artifact_object = JsObject::new(&mut cx);
        let content = artifact.content.as_bytes(
            &config,
            &project_config,
            &mut printer,
            &programs.normalization.schema,
        );
        let name = cx.string(artifact.source_definition_name.lookup().to_string());
        let path = cx.string(artifact.path.to_string_lossy());
        let content = cx.string(str::from_utf8(&content).unwrap().to_string());
        artifact_object.set(&mut cx, "name", name).unwrap();
        artifact_object.set(&mut cx, "path", path).unwrap();
        artifact_object.set(&mut cx, "content", content).unwrap();

        generated_artifacts
            .set(&mut cx, i as u32, artifact_object)
            .unwrap();
    }

    let object = JsObject::new(&mut cx);
    object
        .set(&mut cx, "artifacts", generated_artifacts)
        .unwrap();

    Ok(object)
}

register_module!(mut cx, { cx.export_function("compile", compile) });
