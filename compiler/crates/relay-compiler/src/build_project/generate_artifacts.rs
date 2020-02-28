/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::apply_transforms::Programs;
use graphql_text_printer::OperationPrinter;
use interner::StringKey;
use signedsource::{sign_file, SIGNING_TOKEN};

/// Represents a generated output artifact.
pub struct Artifact {
    pub name: StringKey,
    pub content: String,
}

pub fn generate_artifacts(programs: &Programs<'_>) -> Vec<Artifact> {
    let mut printer = OperationPrinter::new(&programs.operation_text);

    let mut artifacts = Vec::new();
    for node in programs.normalization.operations() {
        let name = node.name.item;
        let print_operation_node = programs
            .operation_text
            .operation(name)
            .expect("a query text operation should be generated for this operation");
        let text = printer.print(print_operation_node);
        let operation_fragment = programs
            .reader
            .operation(name)
            .expect("a reader fragment should be generated for this operation");
        artifacts.push(Artifact {
            name,
            content: sign_file(&format!(
                "// {}\noperation: {:#?}\n\noperation fragment: {:#?}\n\ntext: {}\n",
                SIGNING_TOKEN, node, operation_fragment, text
            )),
        });
    }
    for node in programs.reader.fragments() {
        artifacts.push(Artifact {
            name: node.name.item,
            content: sign_file(&format!("// {}\nfragment: {:#?}\n", SIGNING_TOKEN, node)),
        });
    }
    artifacts
}
