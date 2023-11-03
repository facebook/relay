/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DiagnosticsResult;
use common::NamedItem;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_syntax::OperationKind;
use intern::string_key::Intern;

use crate::generate_relay_resolvers_model_fragments::directives_with_artifact_source;
use crate::get_normalization_operation_name;
use crate::get_resolver_fragment_dependency_name;
use crate::SplitOperationMetadata;
use crate::RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE;

pub fn generate_relay_resolvers_root_fragment_split_operation(
    program: &Program,
) -> DiagnosticsResult<Program> {
    let mut operations = vec![];
    for field in program.schema.get_fields() {
        if !field.is_extension
            || field
                .directives
                .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
                .is_none()
            || field
                .directives
                .named(*RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE)
                .is_some()
        {
            continue;
        }

        let root_fragment_name = get_resolver_fragment_dependency_name(field);
        if root_fragment_name.is_none() {
            continue;
        }

        let root_fragment = program.fragment(root_fragment_name.unwrap()).unwrap();
        let operation_name = root_fragment
            .name
            .map(|name| OperationDefinitionName(get_normalization_operation_name(name.0).intern()));

        let mut directives = directives_with_artifact_source(field);
        directives.push(
            SplitOperationMetadata {
                location: root_fragment.name.location,
                parent_documents: Default::default(),
                derived_from: Some(root_fragment.name.item),
                raw_response_type_generation_mode: None,
            }
            .into(),
        );
        let operation = OperationDefinition {
            name: operation_name,
            type_: root_fragment.type_condition,
            variable_definitions: root_fragment.variable_definitions.clone(),
            directives,
            selections: root_fragment.selections.clone(),
            kind: OperationKind::Query,
        };

        operations.push(Arc::new(operation))
    }

    if operations.is_empty() {
        Ok(program.clone())
    } else {
        let mut next_program = program.clone();

        for operation in operations {
            next_program.insert_operation(operation)
        }

        Ok(next_program)
    }
}
