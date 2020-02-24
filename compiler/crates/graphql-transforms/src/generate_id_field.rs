/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Location, WithLocation};
use graphql_ir::{
    FragmentSpread, InlineFragment, LinkedField, Program, ScalarField, Selection, Transformed,
    TransformedValue, Transformer,
};

use interner::{Intern, StringKey};
use schema::{FieldID, InterfaceID, ObjectID, Type};
use std::collections::HashMap;
use std::sync::Arc;
///
/// A transform that adds an `id` field on any type that has an id field but
/// where there is no unaliased `id` selection.
///
pub fn generate_id_field<'s>(program: &'s Program<'s>) -> Program<'s> {
    let mut transform = GenerateIDFieldTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct GenerateIDFieldTransform<'s> {
    program: &'s Program<'s>,
    id_name: StringKey,
    node_interface_id: InterfaceID,
    cache: HashMap<Type, Option<FieldID>>,
    node_id_field_id: FieldID,
}

impl<'s> Transformer for GenerateIDFieldTransform<'s> {
    const NAME: &'static str = "GenerateIDFieldTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Arc<LinkedField>> {
        let selections = self.transform_selections(&field.selections);

        let next_selections = if self.has_unaliased_id_field(&field.selections) {
            selections
        } else {
            let schema = self.program.schema();
            let type_ = self
                .program
                .schema()
                .field(field.definition.item)
                .type_
                .inner();
            match type_ {
                Type::Object(id) => {
                    let object = schema.object(id);
                    if let Some(id_field_id) = self.get_id_field_id(type_, &object.fields) {
                        let mut next_selections =
                            selections.replace_or_else(|| field.selections.clone());
                        next_selections.push(Selection::ScalarField(
                            self.create_id_field(field.definition.location, id_field_id),
                        ));
                        TransformedValue::Replace(next_selections)
                    } else {
                        selections
                    }
                }
                Type::Interface(id) => {
                    let interface = schema.interface(id);
                    if let Some(id_field_id) = self.get_id_field_id(type_, &interface.fields) {
                        let mut next_selections =
                            selections.replace_or_else(|| field.selections.clone());
                        next_selections.push(Selection::ScalarField(
                            self.create_id_field(field.definition.location, id_field_id),
                        ));
                        TransformedValue::Replace(next_selections)
                    } else {
                        let mut inline_fragments = self.create_id_inline_fragments(
                            field.definition.location,
                            &interface.implementors,
                        );
                        if inline_fragments.is_empty() {
                            selections
                        } else {
                            if let TransformedValue::Replace(selections) = selections {
                                inline_fragments.extend(selections.into_iter())
                            } else {
                                inline_fragments.extend(field.selections.iter().cloned());
                            }
                            TransformedValue::Replace(inline_fragments)
                        }
                    }
                }
                Type::Union(id) => {
                    let union = schema.union(id);
                    let mut inline_fragments =
                        self.create_id_inline_fragments(field.definition.location, &union.members);

                    if inline_fragments.is_empty() {
                        selections
                    } else {
                        if let TransformedValue::Replace(selections) = selections {
                            inline_fragments.extend(selections.into_iter())
                        } else {
                            inline_fragments.extend(field.selections.iter().cloned());
                        }
                        TransformedValue::Replace(inline_fragments)
                    }
                }
                _ => selections,
            }
        };
        match next_selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => Transformed::Replace(Arc::new(LinkedField {
                alias: field.alias,
                definition: field.definition,
                arguments: field.arguments.clone(),
                directives: field.directives.clone(),
                selections,
            })),
        }
    }

    fn transform_fragment_spread(
        &mut self,
        _spread: &FragmentSpread,
    ) -> Transformed<Arc<FragmentSpread>> {
        Transformed::Keep
    }

    fn transform_scalar_field(&mut self, _field: &ScalarField) -> Transformed<Arc<ScalarField>> {
        Transformed::Keep
    }
}

impl<'s> GenerateIDFieldTransform<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        let schema = program.schema();
        let node_interface_id = match schema.get_type("Node".intern()) {
            Some(Type::Interface(id)) => id,
            _ => panic!("Expected the schema to contain an interface named `Node`."),
        };
        let node_interface = schema.interface(node_interface_id);
        let id_key = "id".intern();
        let node_id_field_id = *node_interface
            .fields
            .iter()
            .find(|&&id| schema.field(id).name == id_key)
            .expect("Expected `Node` to contain a field named `id`.");
        Self {
            program,
            id_name: schema.field(node_id_field_id).name,
            node_interface_id,
            cache: Default::default(),
            node_id_field_id,
        }
    }

    fn has_unaliased_id_field(&self, selections: &[Selection]) -> bool {
        selections.iter().any(|x| match x {
            Selection::ScalarField(child) => {
                child.alias.is_none()
                    && self.program.schema().field(child.definition.item).name == self.id_name
            }
            _ => false,
        })
    }

    fn get_id_field_id(&mut self, type_: Type, fields: &[FieldID]) -> Option<FieldID> {
        match self.cache.get(&type_) {
            Some(result) => *result,
            None => {
                for id in fields {
                    let field = self.program.schema().field(*id);
                    if field.name == self.id_name
                        && self.program.schema().is_id(field.type_.inner())
                    {
                        let result = Some(*id);
                        self.cache.insert(type_, result);
                        return result;
                    }
                }
                self.cache.insert(type_, None);
                None
            }
        }
    }

    /// For interfaces and unions: generate a `... on Node { id }`
    /// fragment if *any* concrete type implements Node. Then generate a
    /// `... on PossibleType { id }` for every concrete type that does *not*
    /// implement `Node`
    fn create_id_inline_fragments(
        &mut self,
        location: Location,
        concrete_ids: &[ObjectID],
    ) -> Vec<Selection> {
        let mut next_selections = vec![];
        let mut should_generate_node = false;

        for object_id in concrete_ids {
            let object = self.program.schema().object(*object_id);
            let implements_node = object
                .interfaces
                .iter()
                .any(|interface_id| interface_id == &self.node_interface_id);
            if implements_node {
                should_generate_node = true;
            } else if let Some(id_field_id) =
                self.get_id_field_id(Type::Object(*object_id), &object.fields)
            {
                next_selections.push(Selection::InlineFragment(self.create_inline_id_fragment(
                    location,
                    Type::Object(*object_id),
                    id_field_id,
                )));
            }
        }

        if should_generate_node {
            next_selections.push(Selection::InlineFragment(self.create_inline_id_fragment(
                location,
                Type::Interface(self.node_interface_id),
                self.node_id_field_id,
            )));
        }

        next_selections
    }

    fn create_id_field(&self, location: Location, id_field_id: FieldID) -> Arc<ScalarField> {
        Arc::new(ScalarField {
            alias: None,
            definition: WithLocation::new(location, id_field_id),
            arguments: Default::default(),
            directives: Default::default(),
        })
    }

    fn create_inline_id_fragment(
        &self,
        location: Location,
        type_: Type,
        id_field_id: FieldID,
    ) -> Arc<InlineFragment> {
        Arc::new(InlineFragment {
            type_condition: Some(type_),
            directives: Default::default(),
            selections: vec![Selection::ScalarField(
                self.create_id_field(location, id_field_id),
            )],
        })
    }
}
