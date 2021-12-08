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

use intern::string_key::{Intern, StringKey};
use schema::{FieldID, InterfaceID, ObjectID, Schema, Type};
use std::{
    collections::{hash_map::Entry, HashMap},
    sync::Arc,
};

/// A transform that adds an `id` field on any type that has an id field but
/// where there is no unaliased `id` selection.
pub fn generate_id_field(program: &Program) -> Program {
    let mut transform = GenerateIDFieldTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct GenerateIDFieldTransform<'s> {
    program: &'s Program,
    id_name: StringKey,
    node_interface: Option<NodeInterface>,
    cache: HashMap<Type, Option<FieldID>>,
}

/// If the schema defines a `Node` interface, this contains information on that interface.
struct NodeInterface {
    id: InterfaceID,
    id_field: FieldID,
}

impl<'s> Transformer for GenerateIDFieldTransform<'s> {
    const NAME: &'static str = "GenerateIDFieldTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let selections = self.transform_selections(&field.selections);

        let next_selections = if self.has_unaliased_id_field(&field.selections) {
            selections
        } else {
            let schema = &self.program.schema;
            let type_ = schema.field(field.definition.item).type_.inner();
            match type_ {
                Type::Object(id) => {
                    let object = schema.object(id);
                    if let Some(id_field_id) = self.get_id_field_id(type_, &object.fields) {
                        let mut next_selections =
                            selections.replace_or_else(|| field.selections.clone());
                        next_selections
                            .push(self.create_id_selection(field.definition.location, id_field_id));
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
                        next_selections
                            .push(self.create_id_selection(field.definition.location, id_field_id));
                        TransformedValue::Replace(next_selections)
                    } else {
                        self.get_selections_with_inline_id_fragments(
                            field,
                            selections,
                            &interface.implementing_objects,
                        )
                    }
                }
                Type::Union(id) => {
                    let union = schema.union(id);
                    self.get_selections_with_inline_id_fragments(field, selections, &union.members)
                }
                _ => selections,
            }
        };
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

    fn transform_fragment_spread(&mut self, _spread: &FragmentSpread) -> Transformed<Selection> {
        Transformed::Keep
    }

    fn transform_scalar_field(&mut self, _field: &ScalarField) -> Transformed<Selection> {
        Transformed::Keep
    }
}

impl<'s> GenerateIDFieldTransform<'s> {
    fn new(program: &'s Program) -> Self {
        let id_name = "id".intern();

        let schema = &program.schema;
        let node_interface = match schema.get_type("Node".intern()) {
            Some(Type::Interface(node_interface_id)) => {
                let node_interface = schema.interface(node_interface_id);
                let id_field = *node_interface
                    .fields
                    .iter()
                    .find(|&&id| schema.field(id).name.item == id_name)
                    .expect("Expected `Node` to contain a field named `id`.");

                Some(NodeInterface {
                    id: node_interface_id,
                    id_field,
                })
            }
            _ => None,
        };

        Self {
            program,
            id_name,
            node_interface,
            cache: Default::default(),
        }
    }

    fn has_unaliased_id_field(&self, selections: &[Selection]) -> bool {
        selections.iter().any(|x| match x {
            Selection::ScalarField(child) => {
                child.alias.is_none()
                    && self.program.schema.field(child.definition.item).name.item == self.id_name
            }
            _ => false,
        })
    }

    fn get_id_field_id(&mut self, type_: Type, fields: &[FieldID]) -> Option<FieldID> {
        match self.cache.entry(type_) {
            Entry::Occupied(e) => *e.get(),
            Entry::Vacant(e) => {
                for id in fields {
                    let field = &self.program.schema.field(*id);
                    if field.name.item == self.id_name
                        && self.program.schema.is_id(field.type_.inner())
                    {
                        let result = Some(*id);
                        e.insert(result);
                        return result;
                    }
                }
                e.insert(None);
                None
            }
        }
    }

    /// For interfaces and unions: generate a `... on Node { id }`
    /// fragment if *any* concrete type implements Node. Then generate a
    /// `... on PossibleType { id }` for every concrete type that does *not*
    /// implement `Node`
    fn get_selections_with_inline_id_fragments(
        &mut self,
        field: &LinkedField,
        selections: TransformedValue<Vec<Selection>>,
        concrete_ids: &[ObjectID],
    ) -> TransformedValue<Vec<Selection>> {
        let mut next_selections = vec![];
        let mut should_generate_node = false;

        let mut concrete_types_with_id = Vec::new();
        for object_id in concrete_ids {
            let object = self.program.schema.object(*object_id);
            let implements_node = if let Some(ref node_interface) = self.node_interface {
                object
                    .interfaces
                    .iter()
                    .any(|&interface_id| interface_id == node_interface.id)
            } else {
                false
            };
            if implements_node {
                should_generate_node = true;
            } else if let Some(id_field_id) =
                self.get_id_field_id(Type::Object(*object_id), &object.fields)
            {
                concrete_types_with_id.push((*object_id, id_field_id))
            }
        }

        if concrete_types_with_id.len() > 1 {
            concrete_types_with_id.sort_unstable_by_key(|(concrete_type, _)| {
                self.program.schema.object(*concrete_type).name
            })
        }

        for (object_id, id_field_id) in concrete_types_with_id {
            next_selections.push(Selection::InlineFragment(self.create_inline_id_fragment(
                field.definition.location,
                Type::Object(object_id),
                id_field_id,
            )));
        }

        if next_selections.is_empty() && !should_generate_node {
            return selections;
        }

        let mut result = if let TransformedValue::Replace(selections) = selections {
            selections
        } else {
            field.selections.clone()
        };
        if should_generate_node {
            // This should not happen because we can only set
            // `should_generate_node` to true, if this is Some.
            let node_interface = self.node_interface.as_ref().unwrap();
            result.push(Selection::InlineFragment(self.create_inline_id_fragment(
                field.definition.location,
                Type::Interface(node_interface.id),
                node_interface.id_field,
            )));
        }
        result.extend(next_selections.into_iter());
        TransformedValue::Replace(result)
    }

    fn create_id_selection(&self, location: Location, id_field_id: FieldID) -> Selection {
        Selection::ScalarField(Arc::new(ScalarField {
            alias: None,
            definition: WithLocation::new(location, id_field_id),
            arguments: Default::default(),
            directives: Default::default(),
        }))
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
            selections: vec![self.create_id_selection(location, id_field_id)],
        })
    }
}
