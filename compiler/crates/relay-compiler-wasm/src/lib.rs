/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

extern crate console_error_panic_hook;
use common::{Diagnostic, SourceLocationKey};
use graphql_syntax::{parse_executable, ExecutableDefinition};
use schema::build_schema;
use std::panic;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn compile(raw_schema: &str, documents: Box<[JsValue]>) -> Result<JsValue, JsValue> {
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let mut definitions: Vec<ExecutableDefinition> = vec![];
    let mut errors: Vec<Diagnostic> = vec![];

    for document in documents.into_iter() {
        if let Some(document) = document.as_string() {
            let doc = parse_executable(&document, SourceLocationKey::Generated);
            match doc {
                Ok(document) => {
                    for definition in document.definitions {
                        definitions.push(definition);
                    }
                }
                Err(mut err) => {
                    errors.append(&mut err);
                }
            }
        }
    }

    if !errors.is_empty() {
        return Err(JsValue::from("Unable to parse GraphQL documents."))
    }

    match build_schema(raw_schema) {
        Err(_) => Err(JsValue::from("Unable to parse schema")),
        Ok(_schema) => {
            // TODO: Figure out how to make it work with `rayon`.
            // let ir = build(&schema, &definitions);
            Ok(JsValue::from(
                "Thank you for using Relay Compiler (WASM) today!",
            ))
        }
    }
}
