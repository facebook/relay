/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::util::ArcAddress;
use graphql_ir::{
    FragmentDefinition, InlineFragment, LinkedField, OperationDefinition, Program, Selection,
};
use graphql_printer::{write_arguments, write_directives};
use schema::{Schema, Type, TypeReference};
use std::fmt::Write;

use std::collections::HashMap;
use std::sync::Arc;

type FlattenedSelectionMap = HashMap<String, Selection>;
type SeenLinkedFields = HashMap<ArcAddress, Arc<LinkedField>>;

///
/// Transform that flattens inline fragments, fragment spreads, merges linked fields selections.
///
/// Inline fragments are inlined (replaced with their selections) when:
/// - The fragment type matches the type of its parent.
/// - The fragment has an abstract type and the `flattenAbstractTypes` option has
/// been set.
///
///
pub fn flatten<'s>(program: &'s Program<'s>, should_flatten_abstract_types: bool) -> Program<'s> {
    let mut next_program = Program::new(program.schema());
    let mut transform = FlattenTransform::new(program, should_flatten_abstract_types);

    for operation in program.operations() {
        next_program.insert_operation(Arc::new(transform.transform_operation(operation)));
    }
    for fragment in program.fragments() {
        next_program.insert_fragment(Arc::new(transform.transform_fragment(fragment)));
    }
    next_program
}

struct FlattenTransform<'s> {
    program: &'s Program<'s>,
    should_flatten_abstract_types: bool,
    seen_linked_fields: SeenLinkedFields,
}

impl<'s> FlattenTransform<'s> {
    fn new(program: &'s Program<'s>, should_flatten_abstract_types: bool) -> Self {
        Self {
            program,
            should_flatten_abstract_types,
            seen_linked_fields: Default::default(),
        }
    }

    fn transform_operation(&mut self, operation: &OperationDefinition) -> OperationDefinition {
        OperationDefinition {
            kind: operation.kind.clone(),
            name: operation.name,
            type_: operation.type_,
            directives: operation.directives.clone(),
            variable_definitions: operation.variable_definitions.clone(),
            selections: self.tranform_selections(
                &operation.selections,
                &TypeReference::Named(operation.type_),
            ),
        }
    }

    fn transform_fragment(&mut self, fragment: &FragmentDefinition) -> FragmentDefinition {
        FragmentDefinition {
            name: fragment.name,
            type_condition: fragment.type_condition,
            directives: fragment.directives.clone(),
            variable_definitions: fragment.variable_definitions.clone(),
            used_global_variables: fragment.used_global_variables.clone(),
            selections: self.tranform_selections(
                &fragment.selections,
                &TypeReference::Named(fragment.type_condition),
            ),
        }
    }

    fn tranform_selections(
        &mut self,
        selections: &[Selection],
        parent_type: &TypeReference,
    ) -> Vec<Selection> {
        let next_selections = selections
            .iter()
            .map(|s| self.transform_selection(s, parent_type))
            .collect::<Vec<_>>();
        let mut flattened_selections_map: FlattenedSelectionMap = Default::default();
        self.flatten_selections(&mut flattened_selections_map, &next_selections, parent_type);

        flattened_selections_map.values().cloned().collect()
    }

    fn transform_linked_field(&mut self, linked_field: &Arc<LinkedField>) -> Arc<LinkedField> {
        let key = ArcAddress::new(linked_field);
        if let Some(prev) = self.seen_linked_fields.get(&key) {
            return Arc::clone(prev);
        }
        let result = Arc::new(LinkedField {
            alias: linked_field.alias,
            definition: linked_field.definition,
            arguments: linked_field.arguments.clone(),
            directives: linked_field.directives.clone(),
            selections: self.tranform_selections(
                &linked_field.selections,
                &self
                    .program
                    .schema()
                    .field(linked_field.definition.item)
                    .type_,
            ),
        });
        self.seen_linked_fields.insert(key, Arc::clone(&result));
        result
    }

    fn transform_selection(
        &mut self,
        selection: &Selection,
        parent_type: &TypeReference,
    ) -> Selection {
        match selection {
            Selection::InlineFragment(node) => {
                let next_parent_type: TypeReference = match node.type_condition {
                    Some(type_condition) => TypeReference::Named(type_condition),
                    None => parent_type.clone(),
                };
                Selection::InlineFragment(Arc::new(InlineFragment {
                    type_condition: node.type_condition,
                    directives: node.directives.clone(),
                    selections: self.tranform_selections(&node.selections, &next_parent_type),
                }))
            }
            Selection::LinkedField(node) => {
                Selection::LinkedField(self.transform_linked_field(node))
            }
            Selection::FragmentSpread(node) => Selection::FragmentSpread(Arc::clone(node)),
            Selection::ScalarField(node) => Selection::ScalarField(Arc::clone(node)),
        }
    }

    fn flatten_selections(
        &mut self,
        flattened_selections_map: &mut FlattenedSelectionMap,
        selections: &[Selection],
        parent_type: &TypeReference,
    ) {
        for selection in selections {
            if let Selection::InlineFragment(inline_fragment) = selection {
                if should_flatten_inline_fragment(
                    self.program.schema(),
                    inline_fragment.type_condition,
                    parent_type,
                    self.should_flatten_abstract_types,
                ) {
                    self.flatten_selections(
                        flattened_selections_map,
                        &inline_fragment.selections,
                        parent_type,
                    );
                    continue;
                }
            }

            let node_identifier = get_identifier_for_selection(self.program.schema(), &selection);
            let flattened_selection_value = flattened_selections_map.get(&node_identifier);

            match flattened_selection_value {
                None => {
                    flattened_selections_map.insert(node_identifier, selection.clone());
                }
                Some(flattened_selection) => match flattened_selection {
                    Selection::InlineFragment(flattened_node) => {
                        let type_condition: TypeReference = match flattened_node.type_condition {
                            Some(type_condition) => TypeReference::Named(type_condition),
                            None => parent_type.clone(),
                        };

                        let node_selections = match selection {
                            Selection::InlineFragment(node) => &node.selections,
                            _ => unreachable!("FlattenTransform: Expected an InlineFragment."),
                        };

                        let next_selection = Selection::InlineFragment(Arc::new(InlineFragment {
                            type_condition: flattened_node.type_condition,
                            directives: flattened_node.directives.clone(),
                            selections: self.merge_selections(
                                &node_selections,
                                &flattened_node.selections,
                                &type_condition,
                            ),
                        }));
                        flattened_selections_map.insert(node_identifier, next_selection);
                    }
                    Selection::LinkedField(flattened_node) => {
                        let node_selections = match selection {
                            Selection::LinkedField(node) => &node.selections,
                            _ => unreachable!("FlattenTransform: Expected a LinkedField."),
                        };
                        let next_selection = Selection::LinkedField(Arc::new(LinkedField {
                            alias: flattened_node.alias,
                            definition: flattened_node.definition,
                            arguments: flattened_node.arguments.clone(),
                            directives: flattened_node.directives.clone(),
                            selections: self.merge_selections(
                                &node_selections,
                                &flattened_node.selections,
                                &self
                                    .program
                                    .schema()
                                    .field(flattened_node.definition.item)
                                    .type_,
                            ),
                        }));
                        flattened_selections_map.insert(node_identifier, next_selection);
                    }
                    Selection::ScalarField(node) => {
                        let next_selection = Selection::ScalarField(Arc::clone(node));
                        flattened_selections_map.insert(node_identifier, next_selection);
                    }
                    Selection::FragmentSpread(node) => {
                        let next_selection = Selection::FragmentSpread(Arc::clone(node));
                        flattened_selections_map.insert(node_identifier, next_selection);
                    }
                },
            }
        }
    }

    fn merge_selections(
        &mut self,
        selections_a: &[Selection],
        selections_b: &[Selection],
        parent_type: &TypeReference,
    ) -> Vec<Selection> {
        let mut flattened_selections_map: FlattenedSelectionMap = Default::default();
        self.flatten_selections(&mut flattened_selections_map, selections_a, parent_type);
        self.flatten_selections(&mut flattened_selections_map, selections_b, parent_type);
        flattened_selections_map.values().cloned().collect()
    }
}

fn get_identifier_for_selection<'s>(schema: &'s Schema, selection: &Selection) -> String {
    let mut writer = String::new();
    match selection {
        Selection::InlineFragment(node) => {
            write!(writer, "InlineFragment:").unwrap();
            if let Some(type_condition) = node.type_condition {
                write!(writer, "{}", schema.get_type_name(type_condition).lookup()).unwrap();
            }
            if !node.directives.is_empty() {
                write_directives(schema, &node.directives, &mut writer).unwrap();
            }
        }
        Selection::LinkedField(node) => {
            write!(writer, "LinkedField:").unwrap();
            match node.alias {
                Some(alias) => write!(writer, "{}", alias.item.lookup()),
                None => write!(
                    writer,
                    "{}",
                    schema.field(node.definition.item).name.lookup()
                ),
            }
            .unwrap();
            if !node.arguments.is_empty() {
                write_arguments(schema, &node.arguments, &mut writer).unwrap();
            }
            if !node.directives.is_empty() {
                write_directives(schema, &node.directives, &mut writer).unwrap();
            }
        }
        Selection::ScalarField(node) => {
            write!(writer, "ScalarField:").unwrap();
            match node.alias {
                Some(alias) => write!(writer, "{}", alias.item.lookup()),
                None => write!(
                    writer,
                    "{}",
                    schema.field(node.definition.item).name.lookup()
                ),
            }
            .unwrap();
            if !node.arguments.is_empty() {
                write_arguments(schema, &node.arguments, &mut writer).unwrap();
            }
            if !node.directives.is_empty() {
                write_directives(schema, &node.directives, &mut writer).unwrap();
            }
        }
        Selection::FragmentSpread(node) => {
            write!(writer, "FragmentSpread: {}", node.fragment.item.lookup()).unwrap();
            if !node.arguments.is_empty() {
                write_arguments(schema, &node.arguments, &mut writer).unwrap();
            }
            if !node.directives.is_empty() {
                write_directives(schema, &node.directives, &mut writer).unwrap();
            }
        }
    };
    writer
}

fn should_flatten_inline_fragment<'s>(
    schema: &'s Schema,
    inline_fragment_type_condition: Option<Type>,
    parent_type: &TypeReference,
    should_flatten_abstract_types: bool,
) -> bool {
    if let Some(type_condition) = inline_fragment_type_condition {
        return (schema.is_abstract_type(type_condition) && should_flatten_abstract_types)
            || &TypeReference::Named(type_condition) == parent_type;
    };
    false
}
