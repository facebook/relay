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
use graphql_ir::associated_data_impl;
use graphql_ir::ExecutableDefinition;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_syntax::OperationKind;
use intern::string_key::Intern;
use rustc_hash::FxHashSet;
use schema::SDLSchema;

use crate::get_normalization_operation_name;
use crate::get_resolver_fragment_dependency_name;
use crate::SplitOperationMetadata;
use crate::RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE;

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
struct IsResolverRootFragment();
associated_data_impl!(IsResolverRootFragment);

pub fn generate_relay_resolvers_root_fragment_split_operation(
    program: &Program,
) -> DiagnosticsResult<Program> {
    let mut operations = vec![];
    for fragment in program.fragments() {
        if IsResolverRootFragment::find(&fragment.directives).is_some() {
            operations.push(Arc::new(OperationDefinition {
                name: fragment.name.map(|name| {
                    OperationDefinitionName(get_normalization_operation_name(name.0).intern())
                }),
                type_: fragment.type_condition,
                variable_definitions: fragment.variable_definitions.clone(),
                directives: vec![
                    SplitOperationMetadata {
                        location: fragment.name.location,
                        parent_documents: FxHashSet::from_iter([fragment.name.item.into()]),
                        derived_from: Some(fragment.name.item),
                        raw_response_type_generation_mode: None,
                    }
                    .into(),
                ],
                selections: fragment.selections.clone(),
                kind: OperationKind::Query,
            }));
        }
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

fn get_resolver_root_fragment_names(schema: &SDLSchema) -> FxHashSet<FragmentDefinitionName> {
    let mut names = FxHashSet::default();
    for field in schema.get_fields() {
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

        if let Some(root_fragment_name) = get_resolver_fragment_dependency_name(field) {
            names.insert(root_fragment_name);
        }
    }
    names
}

/// Adds a directive on all `FragmentDefinition`s in IR that are marked as a `@rootFragment`
/// for any resolver backed field in the schema (but not base schema)
pub fn annotate_resolver_root_fragments(
    schema: &SDLSchema,
    ir: Vec<ExecutableDefinition>,
) -> Vec<ExecutableDefinition> {
    let resolver_root_fragment_names = get_resolver_root_fragment_names(schema);
    ir.into_iter()
        .map(|def| {
            if let ExecutableDefinition::Fragment(ref fragment) = def {
                return if resolver_root_fragment_names.contains(&fragment.name.item) {
                    ExecutableDefinition::Fragment(FragmentDefinition {
                        directives: fragment
                            .directives
                            .iter()
                            .cloned()
                            .chain(vec![IsResolverRootFragment().into()])
                            .collect(),
                        ..fragment.clone()
                    })
                } else {
                    def
                };
            }
            def
        })
        .collect()
}
