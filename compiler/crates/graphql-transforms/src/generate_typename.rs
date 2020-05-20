/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::util::{generate_abstract_type_refinement_key, PointerAddress};
use common::{FileKey, Location, Span, WithLocation};
use fnv::FnvHashMap;
use graphql_ir::{
    Directive, FragmentDefinition, FragmentSpread, InlineFragment, LinkedField, Program,
    ScalarField, Selection, Transformed, TransformedValue, Transformer,
};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::{Schema, Type};
use std::sync::Arc;

lazy_static! {
    pub static ref TYPE_DISCRIMINATOR_DIRECTIVE_NAME: StringKey = "__TypeDiscriminator".intern();
    static ref EMPTY_LOCATION: Location = Location::new(FileKey::new(""), Span::new(0, 0));
}

/// Transform to add the `__typename` field to any LinkedField that both a) returns an
/// abstract type and b) does not already directly query `__typename`.
pub fn generate_typename<'s>(program: &Program<'s>, is_for_codegen: bool) -> Program<'s> {
    let mut transform = GenerateTypenameTransform::new(program, is_for_codegen);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

// Note on correctness: the PointerAddress here is calculated from addresses of the input
// context. Because those value are still referenced, that memory cannot be freed/
// reused for the lifetime of the transform.
type Seen = FnvHashMap<PointerAddress, Transformed<Selection>>;

struct GenerateTypenameTransform<'s> {
    program: &'s Program<'s>,
    seen: Seen,
    is_for_codegen: bool,
}

impl<'s> GenerateTypenameTransform<'s> {
    fn new(program: &'s Program<'s>, is_for_codegen: bool) -> Self {
        Self {
            program,
            seen: Default::default(),
            is_for_codegen,
        }
    }
}

impl<'s> Transformer for GenerateTypenameTransform<'s> {
    const NAME: &'static str = "GenerateTypenameTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let schema = self.program.schema();
        let mut selections = self.transform_selections(&fragment.selections);
        let type_ = fragment.type_condition;
        if !schema.is_extension_type(type_) && schema.is_abstract_type(type_) {
            let mut next_selections = Vec::with_capacity(fragment.selections.len() + 1);
            next_selections.push(generate_abstract_key_field(
                schema,
                type_,
                fragment.name.location,
                self.is_for_codegen,
            ));
            if let TransformedValue::Replace(selections) = selections {
                next_selections.extend(selections.into_iter())
            } else {
                next_selections.extend(fragment.selections.iter().cloned())
            };
            selections = TransformedValue::Replace(next_selections);
        }
        match selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => Transformed::Replace(FragmentDefinition {
                selections,
                ..fragment.clone()
            }),
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let schema = self.program.schema();
        let selections = self.transform_selections(&field.selections);
        let field_definition = schema.field(field.definition.item);
        let is_abstract = schema.is_abstract_type(field_definition.type_.inner());
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
        let mut selections = self.transform_selections(&fragment.selections);
        let schema = self.program.schema();
        if let Some(type_) = fragment.type_condition {
            if !schema.is_extension_type(type_) && schema.is_abstract_type(type_) {
                let mut next_selections = Vec::with_capacity(fragment.selections.len() + 1);
                next_selections.push(generate_abstract_key_field(
                    schema,
                    type_,
                    *EMPTY_LOCATION,
                    self.is_for_codegen,
                ));
                if let TransformedValue::Replace(selections) = selections {
                    next_selections.extend(selections.into_iter())
                } else {
                    next_selections.extend(fragment.selections.iter().cloned())
                };
                selections = TransformedValue::Replace(next_selections);
            }
        }
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

fn generate_abstract_key_field(
    schema: &Schema,
    type_: Type,
    location: Location,
    is_for_codegen: bool,
) -> Selection {
    let abstract_key = generate_abstract_type_refinement_key(schema, type_);
    Selection::ScalarField(Arc::new(ScalarField {
        alias: Some(WithLocation::new(location, abstract_key)),
        definition: WithLocation::new(location, schema.typename_field()),
        arguments: vec![],
        directives: if is_for_codegen {
            vec![Directive {
                name: WithLocation::new(location, *TYPE_DISCRIMINATOR_DIRECTIVE_NAME),
                arguments: vec![],
            }]
        } else {
            vec![]
        },
    }))
}
