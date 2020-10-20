/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::handle_fields::{HANDLER_ARG_NAME, KEY_ARG_NAME};
use crate::match_::MATCH_CONSTANTS;
use crate::util::{
    is_relay_custom_inline_fragment_directive, PointerAddress, CUSTOM_METADATA_DIRECTIVES,
};
use graphql_ir::{
    Condition, Directive, FragmentDefinition, InlineFragment, LinkedField, OperationDefinition,
    Program, ScalarField, Selection, ValidationMessage,
};
use schema::Type;

use crate::node_identifier::{LocationAgnosticPartialEq, NodeIdentifier};
use common::{Diagnostic, DiagnosticsResult, NamedItem};
use fnv::FnvHashMap;
use parking_lot::{Mutex, RwLock};
use rayon::prelude::*;
use schema::Schema;
use std::sync::Arc;

type SeenLinkedFields = Arc<RwLock<FnvHashMap<PointerAddress, Arc<LinkedField>>>>;
type SeenInlineFragments = Arc<RwLock<FnvHashMap<(PointerAddress, Type), Arc<InlineFragment>>>>;

///
/// Transform that flattens inline fragments, fragment spreads, merges linked fields selections.
///
/// Inline fragments are inlined (replaced with their selections) when:
/// - The fragment type matches the type of its parent, and it `is_for_codegen`,
///   or the inline fragment doesn't have directives .
///
/// with the exception that it never flattens the inline fragment with relay
/// directives (@defer, @__clientExtensions).
///
pub fn flatten(program: &Program, is_for_codegen: bool) -> DiagnosticsResult<Program> {
    let next_program = Arc::new(RwLock::new(Program::new(Arc::clone(&program.schema))));
    let transform = FlattenTransform::new(program, is_for_codegen);
    let errors = Arc::new(Mutex::new(Vec::new()));

    program.par_operations().for_each(|operation| {
        let operation = transform.transform_operation(operation);
        match operation {
            Err(err) => {
                errors.lock().extend(err.into_iter());
            }
            Ok(operation) => {
                let mut next_program = next_program.write();
                next_program.insert_operation(Arc::new(operation));
            }
        }
    });
    program.par_fragments().for_each(|fragment| {
        let fragment = transform.transform_fragment(fragment);
        match fragment {
            Err(err) => {
                errors.lock().extend(err.into_iter());
            }
            Ok(fragment) => {
                let mut next_program = next_program.write();
                next_program.insert_fragment(Arc::new(fragment));
            }
        }
    });
    let is_errors_empty = { errors.lock().is_empty() };
    if is_errors_empty {
        Ok(Arc::try_unwrap(next_program).unwrap().into_inner())
    } else {
        Err(Arc::try_unwrap(errors).unwrap().into_inner())
    }
}

struct FlattenTransform {
    schema: Arc<Schema>,
    is_for_codegen: bool,
    seen_linked_fields: SeenLinkedFields,
    seen_inline_fragments: SeenInlineFragments,
}

impl FlattenTransform {
    fn new(program: &'_ Program, is_for_codegen: bool) -> Self {
        Self {
            schema: Arc::clone(&program.schema),
            is_for_codegen,
            seen_linked_fields: Default::default(),
            seen_inline_fragments: Default::default(),
        }
    }

    fn transform_operation(
        &self,
        operation: &OperationDefinition,
    ) -> DiagnosticsResult<OperationDefinition> {
        Ok(OperationDefinition {
            kind: operation.kind,
            name: operation.name,
            type_: operation.type_,
            directives: operation.directives.clone(),
            variable_definitions: operation.variable_definitions.clone(),
            selections: self.tranform_selections(&operation.selections, operation.type_)?,
        })
    }

    fn transform_fragment(
        &self,
        fragment: &FragmentDefinition,
    ) -> DiagnosticsResult<FragmentDefinition> {
        Ok(FragmentDefinition {
            name: fragment.name,
            type_condition: fragment.type_condition,
            directives: fragment.directives.clone(),
            variable_definitions: fragment.variable_definitions.clone(),
            used_global_variables: fragment.used_global_variables.clone(),
            selections: self.tranform_selections(&fragment.selections, fragment.type_condition)?,
        })
    }

    fn tranform_selections(
        &self,
        selections: &[Selection],
        parent_type: Type,
    ) -> DiagnosticsResult<Vec<Selection>> {
        let mut next_selections = Vec::with_capacity(selections.len());
        for selection in selections {
            next_selections.push(self.transform_selection(selection, parent_type)?);
        }
        let mut flattened_selections = Vec::with_capacity(next_selections.len());
        self.flatten_selections(&mut flattened_selections, &next_selections, parent_type)?;

        Ok(flattened_selections)
    }

    fn transform_linked_field(
        &self,
        linked_field: &Arc<LinkedField>,
    ) -> DiagnosticsResult<Arc<LinkedField>> {
        let should_cache = Arc::strong_count(linked_field) > 1;
        let key = PointerAddress::new(Arc::as_ref(linked_field));
        if should_cache {
            let seen_linked_fields = self.seen_linked_fields.read();
            if let Some(prev) = seen_linked_fields.get(&key) {
                return Ok(Arc::clone(prev));
            }
        }
        let type_ = self
            .schema
            .field(linked_field.definition.item)
            .type_
            .inner();
        let result = Arc::new(LinkedField {
            alias: linked_field.alias,
            definition: linked_field.definition,
            arguments: linked_field.arguments.clone(),
            directives: linked_field.directives.clone(),
            selections: self.tranform_selections(&linked_field.selections, type_)?,
        });
        if should_cache {
            let mut seen_linked_fields = self.seen_linked_fields.write();
            // If another thread computed this in the meantime, use that result
            if let Some(prev) = seen_linked_fields.get(&key) {
                return Ok(Arc::clone(prev));
            }
            seen_linked_fields.insert(key, Arc::clone(&result));
        }
        Ok(result)
    }

    fn transform_inline_fragment(
        &self,
        fragment: &Arc<InlineFragment>,
        parent_type: Type,
    ) -> DiagnosticsResult<Arc<InlineFragment>> {
        let should_cache = Arc::strong_count(fragment) > 1;
        let key = (PointerAddress::new(Arc::as_ref(fragment)), parent_type);
        if should_cache {
            let seen_inline_fragments = self.seen_inline_fragments.read();
            if let Some(prev) = seen_inline_fragments.get(&key) {
                return Ok(Arc::clone(prev));
            }
        }
        let next_parent_type = match fragment.type_condition {
            Some(type_condition) => type_condition,
            None => parent_type,
        };
        let result = Arc::new(InlineFragment {
            type_condition: fragment.type_condition,
            directives: fragment.directives.clone(),
            selections: self.tranform_selections(&fragment.selections, next_parent_type)?,
        });
        if should_cache {
            let mut seen_inline_fragments = self.seen_inline_fragments.write();
            // If another thread computed this in the meantime, use that result
            if let Some(prev) = seen_inline_fragments.get(&key) {
                return Ok(Arc::clone(prev));
            }
            seen_inline_fragments.insert(key, Arc::clone(&result));
        }
        Ok(result)
    }

    fn transform_selection(
        &self,
        selection: &Selection,
        parent_type: Type,
    ) -> DiagnosticsResult<Selection> {
        Ok(match selection {
            Selection::InlineFragment(node) => {
                Selection::InlineFragment(self.transform_inline_fragment(node, parent_type)?)
            }
            Selection::LinkedField(node) => {
                Selection::LinkedField(self.transform_linked_field(node)?)
            }
            Selection::Condition(node) => Selection::Condition(Arc::new(Condition {
                value: node.value.clone(),
                passing_value: node.passing_value,
                selections: self.tranform_selections(&node.selections, parent_type)?,
            })),
            Selection::FragmentSpread(node) => Selection::FragmentSpread(Arc::clone(node)),
            Selection::ScalarField(node) => Selection::ScalarField(Arc::clone(node)),
        })
    }

    fn flatten_selections(
        &self,
        flattened_selections: &mut Vec<Selection>,
        selections: &[Selection],
        parent_type: Type,
    ) -> DiagnosticsResult<()> {
        for selection in selections {
            if let Selection::InlineFragment(inline_fragment) = selection {
                if should_flatten_inline_fragment(inline_fragment, parent_type, self.is_for_codegen)
                {
                    self.flatten_selections(
                        flattened_selections,
                        &inline_fragment.selections,
                        parent_type,
                    )?;
                    continue;
                }
            }

            let flattened_selection = flattened_selections
                .iter_mut()
                .find(|sel| NodeIdentifier::are_equal(&self.schema, sel, selection));

            match flattened_selection {
                None => {
                    flattened_selections.push(selection.clone());
                }
                Some(flattened_selection) => {
                    match flattened_selection {
                        Selection::InlineFragment(flattened_node) => {
                            let type_condition = match flattened_node.type_condition {
                                Some(type_condition) => type_condition,
                                None => parent_type,
                            };

                            let node = match selection {
                                Selection::InlineFragment(node) => node,
                                _ => unreachable!("FlattenTransform: Expected an InlineFragment."),
                            };
                            let node_selections = &node.selections;

                            if let Some(flattened_module_directive) = flattened_node
                                .directives
                                .named(MATCH_CONSTANTS.custom_module_directive_name)
                            {
                                if let Some(module_directive) = node
                                    .directives
                                    .named(MATCH_CONSTANTS.custom_module_directive_name)
                                {
                                    if !flattened_module_directive.arguments[0].location_agnostic_eq(&module_directive.arguments[0]) || // key
                                        !flattened_module_directive.arguments[2].location_agnostic_eq(&module_directive.arguments[2]) || // module
                                        !flattened_module_directive.arguments[4].location_agnostic_eq(&module_directive.arguments[4])
                                    // name
                                    {
                                        let error = Diagnostic::error(
                                            ValidationMessage::ConflictingModuleSelections,
                                            module_directive.name.location,
                                        )
                                        .annotate(
                                            "conflicts with",
                                            flattened_module_directive.name.location,
                                        );
                                        return Err(vec![error]);
                                    }
                                }
                            }

                            *flattened_selection =
                                Selection::InlineFragment(Arc::new(InlineFragment {
                                    type_condition: flattened_node.type_condition,
                                    directives: flattened_node.directives.clone(),
                                    selections: self.merge_selections(
                                        &flattened_node.selections,
                                        &node_selections,
                                        type_condition,
                                    )?,
                                }));
                        }
                        Selection::LinkedField(flattened_node) => {
                            let node = match selection {
                                Selection::LinkedField(node) => node,
                                _ => unreachable!("FlattenTransform: Expected a LinkedField."),
                            };
                            if !ignoring_type_and_location::arguments_equals(
                                &node.arguments,
                                &flattened_node.arguments,
                            ) {
                                let error = Diagnostic::error(
                                    ValidationMessage::InvalidSameFieldWithDifferentArguments {
                                        field_name: node.alias_or_name(&self.schema),
                                    },
                                    node.definition.location,
                                )
                                .annotate("conflicting field", flattened_node.definition.location);
                                return Err(vec![error]);
                            }
                            let type_ = self
                                .schema
                                .field(flattened_node.definition.item)
                                .type_
                                .inner();
                            let should_merge_handles = selection.directives().iter().any(|d| {
                                CUSTOM_METADATA_DIRECTIVES.is_handle_field_directive(d.name.item)
                            });
                            let next_directives = if should_merge_handles {
                                merge_handle_directives(
                                    &flattened_node.directives,
                                    selection.directives(),
                                )
                            } else {
                                flattened_node.directives.clone()
                            };
                            *flattened_selection = Selection::LinkedField(Arc::new(LinkedField {
                                alias: flattened_node.alias,
                                definition: flattened_node.definition,
                                arguments: flattened_node.arguments.clone(),
                                directives: next_directives,
                                selections: self.merge_selections(
                                    &flattened_node.selections,
                                    &node.selections,
                                    type_,
                                )?,
                            }));
                        }
                        Selection::Condition(flattened_node) => {
                            let node_selections = match selection {
                                Selection::Condition(node) => &node.selections,
                                _ => unreachable!("FlattenTransform: Expected a Condition."),
                            };

                            *flattened_selection = Selection::Condition(Arc::new(Condition {
                                value: flattened_node.value.clone(),
                                passing_value: flattened_node.passing_value,
                                selections: self.merge_selections(
                                    &flattened_node.selections,
                                    &node_selections,
                                    parent_type,
                                )?,
                            }));
                        }
                        Selection::ScalarField(flattened_node) => {
                            let node = match selection {
                                Selection::ScalarField(node) => node,
                                _ => unreachable!("FlattenTransform: Expected a ScalarField."),
                            };
                            if !ignoring_type_and_location::arguments_equals(
                                &node.arguments,
                                &flattened_node.arguments,
                            ) {
                                let error = Diagnostic::error(
                                    ValidationMessage::InvalidSameFieldWithDifferentArguments {
                                        field_name: node.alias_or_name(&self.schema),
                                    },
                                    flattened_node.definition.location,
                                )
                                .annotate("conflicts with", node.definition.location);
                                return Err(vec![error]);
                            }
                            let should_merge_handles = node.directives.iter().any(|d| {
                                CUSTOM_METADATA_DIRECTIVES.is_handle_field_directive(d.name.item)
                            });
                            if should_merge_handles {
                                *flattened_selection =
                                    Selection::ScalarField(Arc::new(ScalarField {
                                        alias: flattened_node.alias,
                                        definition: flattened_node.definition,
                                        arguments: flattened_node.arguments.clone(),
                                        directives: merge_handle_directives(
                                            &flattened_node.directives,
                                            selection.directives(),
                                        ),
                                    }))
                            }
                        }
                        Selection::FragmentSpread(_) => {}
                    };
                }
            }
        }
        Ok(())
    }

    fn merge_selections(
        &self,
        selections_a: &[Selection],
        selections_b: &[Selection],
        parent_type: Type,
    ) -> DiagnosticsResult<Vec<Selection>> {
        let mut flattened_selections = Vec::with_capacity(selections_a.len());
        self.flatten_selections(&mut flattened_selections, selections_a, parent_type)?;
        self.flatten_selections(&mut flattened_selections, selections_b, parent_type)?;
        Ok(flattened_selections)
    }
}

fn should_flatten_inline_with_directives(directives: &[Directive], is_for_codegen: bool) -> bool {
    if is_for_codegen {
        !directives
            .iter()
            .any(is_relay_custom_inline_fragment_directive)
    } else {
        directives.is_empty()
    }
}

fn should_flatten_inline_fragment(
    inline_fragment: &InlineFragment,
    parent_type: Type,
    is_for_codegen: bool,
) -> bool {
    match inline_fragment.type_condition {
        None => should_flatten_inline_with_directives(&inline_fragment.directives, is_for_codegen),
        Some(type_condition) => {
            type_condition == parent_type
                && should_flatten_inline_with_directives(
                    &inline_fragment.directives,
                    is_for_codegen,
                )
        }
    }
}

fn merge_handle_directives(
    directives_a: &[Directive],
    directives_b: &[Directive],
) -> Vec<Directive> {
    let (mut handles, mut directives): (Vec<_>, Vec<_>) =
        directives_a.iter().cloned().partition(|directive| {
            CUSTOM_METADATA_DIRECTIVES.is_handle_field_directive(directive.name.item)
        });
    for directive in directives_b {
        if CUSTOM_METADATA_DIRECTIVES.is_handle_field_directive(directive.name.item) {
            if handles.is_empty() {
                handles.push(directive.clone());
            } else {
                let current_handler_arg = directive.arguments.named(*HANDLER_ARG_NAME);
                let current_name_arg = directive.arguments.named(*KEY_ARG_NAME);
                let is_duplicate_handle = handles.iter().any(|handle| {
                    current_handler_arg
                        .location_agnostic_eq(&handle.arguments.named(*HANDLER_ARG_NAME))
                        && current_name_arg
                            .location_agnostic_eq(&handle.arguments.named(*KEY_ARG_NAME))
                });
                if !is_duplicate_handle {
                    handles.push(directive.clone());
                }
            }
        }
    }
    directives.extend(handles.into_iter());
    directives
}

mod ignoring_type_and_location {
    use crate::node_identifier::LocationAgnosticPartialEq;
    use graphql_ir::{Argument, Value};

    /// Verify that two sets of arguments are equivalent - same argument names
    /// and values. Notably, this ignores the types of arguments and values,
    /// which may not always be inferred identically.
    pub fn arguments_equals(a: &[Argument], b: &[Argument]) -> bool {
        slice_equals(a, b, |a, b| {
            a.name.location_agnostic_eq(&b.name) && value_equals(&a.value.item, &b.value.item)
        })
    }

    fn value_equals(a: &Value, b: &Value) -> bool {
        match (a, b) {
            (Value::Constant(a), Value::Constant(b)) => a.location_agnostic_eq(b),
            (Value::Variable(a), Value::Variable(b)) => a.name.location_agnostic_eq(&b.name),
            (Value::List(a), Value::List(b)) => slice_equals(a, b, value_equals),
            (Value::Object(a), Value::Object(b)) => arguments_equals(a, b),
            _ => false,
        }
    }

    fn slice_equals<T, F>(a: &[T], b: &[T], eq: F) -> bool
    where
        F: Fn(&T, &T) -> bool,
    {
        a.len() == b.len() && a.iter().zip(b).all(|(a, b)| eq(a, b))
    }
}
