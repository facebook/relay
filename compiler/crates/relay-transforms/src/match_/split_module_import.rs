/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{SplitOperationMetadata, MATCH_CONSTANTS};
use crate::{util::get_normalization_operation_name, ModuleMetadata};
use common::WithLocation;
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{
    InlineFragment, OperationDefinition, Program, Selection, Transformed, TransformedValue,
    Transformer,
};
use graphql_syntax::OperationKind;
use intern::string_key::{Intern, StringKey};
use schema::Schema;
use std::sync::Arc;

pub fn split_module_import(
    program: &Program,
    base_fragment_names: &FnvHashSet<StringKey>,
) -> Program {
    let mut transform = SplitModuleImportTransform::new(program, base_fragment_names);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

pub struct SplitModuleImportTransform<'program, 'base_fragment_names> {
    program: &'program Program,
    split_operations: FnvHashMap<StringKey, (SplitOperationMetadata, OperationDefinition)>,
    base_fragment_names: &'base_fragment_names FnvHashSet<StringKey>,
}

impl<'program, 'base_fragment_names> SplitModuleImportTransform<'program, 'base_fragment_names> {
    fn new(
        program: &'program Program,
        base_fragment_names: &'base_fragment_names FnvHashSet<StringKey>,
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
        if fragment.directives.len() == 1 {
            if let Some(module_metadata) = ModuleMetadata::find(&fragment.directives) {
                if !module_metadata.no_inline {
                    return Some(module_metadata);
                }
            }
        }
        None
    }
}

impl Transformer for SplitModuleImportTransform<'_, '_> {
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
                operation.directives.push(metadata.to_directive());
                next_program.insert_operation(Arc::new(operation))
            }
            TransformedValue::Replace(next_program)
        }
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        if let Some(module_metadata) = self.inline_module_metadata(fragment) {
            let parent_type = fragment
                .type_condition
                .expect("Expect the module import inline fragment to have a type");

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

            let normalization_name =
                get_normalization_operation_name(module_metadata.fragment_name).intern();
            let schema = &self.program.schema;
            let created_split_operation = self
                .split_operations
                .entry(normalization_name)
                .or_insert_with(|| {
                    // Exclude `__module_operation/__module_component: js` field selections from `SplitOperation`
                    let mut next_selections = Vec::with_capacity(fragment.selections.len() - 2);
                    for selection in &fragment.selections {
                        match selection {
                            Selection::ScalarField(field) => {
                                if field.alias.is_none()
                                    || schema.field(field.definition.item).name.item
                                        != MATCH_CONSTANTS.js_field_name
                                {
                                    next_selections.push(selection.clone())
                                }
                            }
                            _ => next_selections.push(selection.clone()),
                        }
                    }
                    (
                        SplitOperationMetadata {
                            derived_from: module_metadata.fragment_name,
                            parent_documents: Default::default(),
                            raw_response_type: false,
                        },
                        OperationDefinition {
                            name: WithLocation::new(module_metadata.location, normalization_name),
                            type_: parent_type,
                            variable_definitions: vec![],
                            directives: vec![],
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
