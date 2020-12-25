/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::SourceLocationKey;
use graphql_syntax::{parse_executable, ExecutableDefinition};
use schema::build_schema;
use std::panic;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn compile(raw_schema: &str, documents: Box<[JsValue]>) -> Result<JsValue, JsValue> {
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let mut definitions: Vec<ExecutableDefinition> = vec![];
    for document in documents.into_iter() {
        if let Some(document) = document.as_string() {
            let doc = parse_executable(&document, SourceLocationKey::Generated).unwrap();
            for definition in doc.definitions {
                definitions.push(definition);
            }
        }
    }

    match build_schema(raw_schema) {
        Err(_) => Err(JsValue::from("Unable to parse schema")),
        Ok(schema) => {
            #[allow(unused_unsafe)]
            unsafe {
                log(&format!("schema {:?}", schema));
            }
            // TODO: Figure out how to make it work with `rayon`.
            // let ir = build(&schema, &definitions);
            Ok(JsValue::from(
                "Thank you for using Relay Compiler (WASM) today!",
            ))
        }
    }
}

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
