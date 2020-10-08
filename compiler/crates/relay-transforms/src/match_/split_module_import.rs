/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::match_::{get_normalization_operation_name, MATCH_CONSTANTS};
use common::{NamedItem, WithLocation};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{
    Argument, ConstantValue, Directive, InlineFragment, OperationDefinition, Program, Selection,
    Transformed, TransformedValue, Transformer, Value,
};
use graphql_syntax::OperationKind;

use interner::{Intern, StringKey};
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

pub struct SplitOperationMetaData {
    pub derived_from: StringKey,
    pub parent_sources: FnvHashSet<StringKey>,
}

impl From<&Directive> for SplitOperationMetaData {
    fn from(directive: &Directive) -> Self {
        debug_assert!(directive.name.item == MATCH_CONSTANTS.custom_module_directive_name);
        let derived_from_arg = directive
            .arguments
            .named(MATCH_CONSTANTS.derived_from_arg)
            .expect("Expected derived_from arg to exist");
        let derived_from = derived_from_arg.value.item.expect_string_literal();
        let parent_sources_arg = directive
            .arguments
            .named(MATCH_CONSTANTS.parent_sources_arg)
            .expect("Expected parent_sources arg to exist");
        if let Value::Constant(ConstantValue::List(source_definition_names)) =
            &parent_sources_arg.value.item
        {
            let parent_sources = source_definition_names
                .iter()
                .map(|val| {
                    if let ConstantValue::String(name) = val {
                        name
                    } else {
                        panic!("Expected item in the parent sources to be a StringKey.")
                    }
                })
                .cloned()
                .collect();
            Self {
                derived_from,
                parent_sources,
            }
        } else {
            panic!("Expected parent sources to be a constant of list.");
        }
    }
}

type SplitOperations = FnvHashMap<StringKey, (SplitOperationMetaData, OperationDefinition)>;

pub struct SplitModuleImportTransform<'program, 'base_fragment_names> {
    program: &'program Program,
    split_operations: SplitOperations,
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
                attach_split_operation_metadata(&mut operation, metadata);
                next_program.insert_operation(Arc::new(operation))
            }
            TransformedValue::Replace(next_program)
        }
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        if fragment.directives.len() == 1
            && fragment.directives[0].name.item == MATCH_CONSTANTS.custom_module_directive_name
        {
            let directive = &fragment.directives[0];
            let parent_type = fragment
                .type_condition
                .expect("Expect the module import inline fragment to have a type");
            let name = directive
                .arguments
                .named(MATCH_CONSTANTS.name_arg)
                .unwrap()
                .value
                .item
                .expect_string_literal();

            // We do not need to to write normalization files for base fragments
            if self.base_fragment_names.contains(&name) {
                return self.default_transform_inline_fragment(fragment);
            }

            let source_document = directive
                .arguments
                .named(MATCH_CONSTANTS.source_document_arg)
                .unwrap()
                .value
                .item
                .expect_string_literal();
            let mut normalization_name_string = String::new();
            get_normalization_operation_name(&mut normalization_name_string, name);
            let normalization_name = normalization_name_string.intern();
            let schema = &self.program.schema;
            let created_split_operation = self
                .split_operations
                .entry(normalization_name)
                .or_insert_with(|| {
                    // Exclude `__module_operation/module: js` field selections from `SplitOperation`
                    let mut next_selections = Vec::with_capacity(fragment.selections.len() - 2);
                    for selection in &fragment.selections {
                        match selection {
                            Selection::ScalarField(field) => {
                                if field.alias.is_none()
                                    || schema.field(field.definition.item).name
                                        != MATCH_CONSTANTS.js_field_name
                                {
                                    next_selections.push(selection.clone())
                                }
                            }
                            _ => next_selections.push(selection.clone()),
                        }
                    }
                    (
                        SplitOperationMetaData {
                            derived_from: name,
                            parent_sources: Default::default(),
                        },
                        OperationDefinition {
                            name: WithLocation::new(
                                directive.arguments[0].name.location,
                                normalization_name,
                            ),
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
                .parent_sources
                .insert(source_document);
        }
        self.default_transform_inline_fragment(fragment)
    }
}

fn attach_split_operation_metadata(
    operation: &mut OperationDefinition,
    mut metadata: SplitOperationMetaData,
) {
    let arguments = vec![
        Argument {
            name: WithLocation::new(operation.name.location, MATCH_CONSTANTS.derived_from_arg),
            value: WithLocation::new(
                operation.name.location,
                Value::Constant(ConstantValue::String(metadata.derived_from)),
            ),
        },
        Argument {
            name: WithLocation::new(operation.name.location, MATCH_CONSTANTS.parent_sources_arg),
            value: WithLocation::new(
                operation.name.location,
                Value::Constant(ConstantValue::List(
                    metadata
                        .parent_sources
                        .drain()
                        .map(ConstantValue::String)
                        .collect(),
                )),
            ),
        },
    ];
    operation.directives.push(Directive {
        name: WithLocation::new(
            operation.name.location,
            MATCH_CONSTANTS.custom_module_directive_name,
        ),
        arguments,
    });
}
