/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::util::PointerAddress;
use common::WithLocation;
use graphql_ir::{
    FragmentSpread, InlineFragment, LinkedField, Program, ScalarField, Selection, Transformed,
    TransformedValue, Transformer,
};
use schema::{Schema, Type};
use std::collections::HashMap;
use std::sync::Arc;

/// Transform to add the `__typename` field to any LinkedField that both a) returns an
/// abstract type and b) does not already directly query `__typename`.
pub fn generate_typename<'s>(program: &Program<'s>) -> Program<'s> {
    let mut transform = GenerateTypenameTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

// Note on correctness: the PointerAddress here is calculated from addresses of the input
// context. Because those value are still referenced, that memory cannot be freed/
// reused for the lifetime of the transform.
type Seen = HashMap<PointerAddress, Transformed<Selection>>;

struct GenerateTypenameTransform<'s> {
    program: &'s Program<'s>,
    seen: Seen,
}

impl<'s> GenerateTypenameTransform<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self {
            program,
            seen: Default::default(),
        }
    }
}

impl<'s> Transformer for GenerateTypenameTransform<'s> {
    const NAME: &'static str = "GenerateTypenameTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let schema = self.program.schema();
        let selections = self.transform_selections(&field.selections);
        let field_definition = schema.field(field.definition.item);
        let is_abstract = match field_definition.type_.inner() {
            Type::Interface(_) => true,
            Type::Union(_) => true,
            Type::Object(_) => false,
            _ => unreachable!("Parent type of a field must be an interface, union, or object"),
        };
        let selections = if is_abstract && !has_typename_field(schema, &field.selections) {
            let mut next_selections = Vec::with_capacity(field.selections.len() + 1);
            next_selections.push(Selection::ScalarField(Arc::new(ScalarField {
                alias: None,
                definition: WithLocation::new(field.definition.location, schema.typename_field()),
                arguments: Default::default(),
                directives: Default::default(),
            })));
            if let TransformedValue::Replace(selections) = selections {
                next_selections.extend(selections.into_iter())
            } else {
                next_selections.extend(field.selections.iter().cloned());
            }
            TransformedValue::Replace(next_selections)
        } else {
            selections
        };
        match selections {
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

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        let key = PointerAddress::new(fragment);
        if let Some(prev) = self.seen.get(&key) {
            return prev.clone();
        }
        self.seen.insert(key, Transformed::Delete);
        let selections = self.transform_selections(&fragment.selections);
        let result = match selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => {
                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    type_condition: fragment.type_condition,
                    directives: fragment.directives.clone(),
                    selections,
                })))
            }
        };
        self.seen.insert(key, result.clone());
        result
    }

    fn transform_scalar_field(&mut self, _field: &ScalarField) -> Transformed<Selection> {
        Transformed::Keep
    }

    fn transform_fragment_spread(&mut self, _spread: &FragmentSpread) -> Transformed<Selection> {
        Transformed::Keep
    }
}

fn has_typename_field(schema: &Schema, selections: &[Selection]) -> bool {
    let typename_field = schema.typename_field();
    selections.iter().any(|x| match x {
        Selection::ScalarField(child) => {
            child.alias.is_none() && child.definition.item == typename_field
        }
        _ => false,
    })
}
