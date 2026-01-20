/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DirectiveName;
use common::WithLocation;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinitionNameSet;
use graphql_ir::InlineFragment;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::TransformedValue;
use graphql_ir::Transformer;
use graphql_syntax::OperationKind;
use intern::string_key::Intern;
use intern::string_key::StringKeyMap;
use schema::Schema;

use super::MATCH_CONSTANTS;
use super::SplitOperationMetadata;
use crate::ModuleMetadata;
use crate::util::get_normalization_operation_name;

pub fn split_module_import(
    program: &Program,
    base_fragment_names: &FragmentDefinitionNameSet,
) -> Program {
    let mut transform = SplitModuleImportTransform::new(program, base_fragment_names);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

pub struct SplitModuleImportTransform<'program, 'base_fragment_names> {
    program: &'program Program,
    split_operations: StringKeyMap<(SplitOperationMetadata, OperationDefinition)>,
    base_fragment_names: &'base_fragment_names FragmentDefinitionNameSet,
}

impl<'program, 'base_fragment_names> SplitModuleImportTransform<'program, 'base_fragment_names> {
    fn new(
        program: &'program Program,
        base_fragment_names: &'base_fragment_names FragmentDefinitionNameSet,
    ) -> Self {
        Self {
            program,
            split_operations: Default::default(),
            base_fragment_names,
        }
    }

    fn inline_module_metadata<'a>(
        &self,
        fragment: &'a InlineFragment,
    ) -> Option<&'a ModuleMetadata> {
        if fragment.directives.len() == 1
            && let Some(module_metadata) = ModuleMetadata::find(&fragment.directives)
            && !module_metadata.no_inline
        {
            return Some(module_metadata);
        }
        None
    }
}

impl Transformer<'_> for SplitModuleImportTransform<'_, '_> {
    const NAME: &'static str = "SplitModuleImportTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_program(&mut self, program: &Program) -> TransformedValue<Program> {
        for operation in program.operations() {
            self.transform_operation(operation);
        }
        for fragment in program.fragments() {
            self.transform_fragment(fragment);
        }

        if self.split_operations.is_empty() {
            TransformedValue::Keep
        } else {
            let mut next_program = program.clone();
            for (_, (metadata, mut operation)) in self.split_operations.drain() {
                operation.directives.push(metadata.into());
                next_program.insert_operation(Arc::new(operation))
            }
            TransformedValue::Replace(next_program)
        }
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        if let Some(module_metadata) = self.inline_module_metadata(fragment) {
            // We do not need to to write normalization files for base fragments.
            // This is because when we process the base project, the normalization fragment will
            // be written, and we do not want to emit multiple normalization fragments with
            // the same name. If we did, Haste would complain about a duplicate module definition.
            if self
                .base_fragment_names
                .contains(&module_metadata.fragment_name)
            {
                return self.default_transform_inline_fragment(fragment);
            }

            let parent_type = fragment
                .type_condition
                .expect("Expect the module import inline fragment to have a type");

            let normalization_name =
                get_normalization_operation_name(module_metadata.fragment_name.0).intern();
            let schema = &self.program.schema;
            let created_split_operation = self
                .split_operations
                .entry(normalization_name)
                .or_insert_with(|| {
                    // Exclude `__module_operation/__module_component: js` field selections from `SplitOperation`
                    let next_selections = fragment
                        .selections
                        .iter()
                        .filter(|selection| match selection {
                            Selection::ScalarField(field) => {
                                field.alias.is_none()
                                    || schema.field(field.definition.item).name.item
                                        != MATCH_CONSTANTS.js_field_name
                            }
                            _ => true,
                        })
                        .cloned()
                        .collect();
                    let operation_directives: Vec<Directive> =
                        if module_metadata.read_time_resolvers {
                            vec![Directive {
                                name: WithLocation::new(
                                    module_metadata.fragment_source_location,
                                    DirectiveName("exec_time_resolvers".intern()),
                                ),
                                arguments: vec![],
                                data: None,
                                location: module_metadata.fragment_source_location,
                            }]
                        } else {
                            vec![]
                        };
                    (
                        SplitOperationMetadata {
                            derived_from: Some(module_metadata.fragment_name),
                            location: module_metadata.fragment_source_location,
                            parent_documents: Default::default(),
                            raw_response_type_generation_mode: None,
                        },
                        OperationDefinition {
                            name: WithLocation::new(
                                module_metadata.fragment_source_location,
                                OperationDefinitionName(normalization_name),
                            ),
                            type_: parent_type,
                            variable_definitions: vec![],
                            directives: operation_directives,
                            selections: next_selections,
                            kind: OperationKind::Query,
                        },
                    )
                });
            created_split_operation
                .0
                .parent_documents
                .insert(module_metadata.source_document_name);
        }
        self.default_transform_inline_fragment(fragment)
    }
}
