/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::WithLocation;
use graphql_ir::FragmentDefinition;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::TransformedValue;
use graphql_ir::Transformer;
use schema::FieldID;
use schema::Schema;
use schema::Type;

use crate::FragmentAliasMetadata;

/// Adds `__typename` only where it is useful for typegen discrimination
pub fn generate_typename_union(program: &Program) -> Program {
    let mut transform = GenerateTypenameFieldTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct GenerateTypenameFieldTransform<'s> {
    program: &'s Program,
    typename_field: FieldID,
}

impl<'s> GenerateTypenameFieldTransform<'s> {
    fn new(program: &'s Program) -> Self {
        let schema = &program.schema;
        let typename_field = schema.typename_field();

        Self {
            program,
            typename_field,
        }
    }

    fn should_add_typename(&self, type_condition: Type, selections: &[Selection]) -> bool {
        if self.has_typename_field(selections) {
            return false;
        }

        if !type_condition.is_abstract_type() {
            return false;
        }
        self.has_concrete_inline_fragment(selections)
    }

    fn has_concrete_inline_fragment(&self, selections: &[Selection]) -> bool {
        selections.iter().any(|selection| match selection {
            Selection::InlineFragment(inline_fragment) => {
                if FragmentAliasMetadata::find(&inline_fragment.directives).is_some() {
                    false
                } else {
                    inline_fragment
                        .type_condition
                        .is_some_and(|type_condition| !type_condition.is_abstract_type())
                        || self.has_concrete_inline_fragment(&inline_fragment.selections)
                }
            }
            Selection::Condition(condition) => {
                self.has_concrete_inline_fragment(&condition.selections)
            }
            Selection::LinkedField(_)
            | Selection::ScalarField(_)
            | Selection::FragmentSpread(_) => false,
        })
    }

    fn has_typename_field(&self, selections: &[Selection]) -> bool {
        selections.iter().any(|x| match x {
            Selection::ScalarField(child) => child.definition.item == self.typename_field,
            _ => false,
        })
    }

    fn transform_selections_with_typename(
        &mut self,
        parent_type: Type,
        location: common::Location,
        original_selections: &[Selection],
    ) -> TransformedValue<Vec<Selection>> {
        let transformed_selections = self.transform_selections(original_selections);

        let current_selections = match &transformed_selections {
            TransformedValue::Keep => original_selections,
            TransformedValue::Replace(selections) => selections.as_slice(),
        };

        let should_add = self.should_add_typename(parent_type, current_selections);
        if !should_add {
            return transformed_selections;
        }
        let mut next_selections =
            transformed_selections.replace_or_else(|| original_selections.to_vec());
        next_selections.insert(
            0,
            Selection::ScalarField(Arc::new(ScalarField {
                alias: None,
                definition: WithLocation::new(location, self.typename_field),
                arguments: Default::default(),
                directives: Default::default(),
            })),
        );
        TransformedValue::Replace(next_selections)
    }
}

impl Transformer<'_> for GenerateTypenameFieldTransform<'_> {
    const NAME: &'static str = "GenerateTypenameFieldTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let next_selections = self.transform_selections_with_typename(
            fragment.type_condition,
            fragment.name.location,
            &fragment.selections,
        );

        match next_selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => Transformed::Replace(FragmentDefinition {
                name: fragment.name,
                variable_definitions: fragment.variable_definitions.clone(),
                used_global_variables: fragment.used_global_variables.clone(),
                type_condition: fragment.type_condition,
                directives: fragment.directives.clone(),
                selections,
            }),
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let field_def = self.program.schema.field(field.definition.item);
        let field_type = field_def.type_.inner();

        let next_selections = self.transform_selections_with_typename(
            field_type,
            field.definition.location,
            &field.selections,
        );

        match next_selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => {
                Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                    alias: field.alias,
                    definition: field.definition,
                    arguments: field.arguments.clone(),
                    directives: field.directives.clone(),
                    selections,
                })))
            }
        }
    }
}
