/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::handle_fields::{HANDLER_ARG_NAME, KEY_ARG_NAME};
use crate::match_::MATCH_CONSTANTS;
use crate::util::{
    is_relay_custom_inline_fragment_directive, CustomMetadataDirectives, PointerAddress,
};
use graphql_ir::{
    Argument, Condition, Directive, FragmentDefinition, InlineFragment, LinkedField,
    OperationDefinition, Program, Selection, TransformedValue, ValidationMessage,
};
use interner::StringKey;
use schema::{Schema, Type};

use crate::node_identifier::{LocationAgnosticPartialEq, NodeIdentifier};
use common::sync::*;
use common::{Diagnostic, DiagnosticsResult, Location, NamedItem};
use fnv::FnvHashMap;
use parking_lot::{Mutex, RwLock};
use schema::SDLSchema;
use std::sync::Arc;

type SeenLinkedFields = Arc<RwLock<FnvHashMap<PointerAddress, TransformedValue<Arc<LinkedField>>>>>;
type SeenInlineFragments =
    Arc<RwLock<FnvHashMap<(PointerAddress, Type), TransformedValue<Arc<InlineFragment>>>>>;

/// Transform that flattens inline fragments, fragment spreads, merges linked fields selections.
///
/// Inline fragments are inlined (replaced with their selections) when:
/// - The fragment type matches the type of its parent, and it `is_for_codegen`,
///   or the inline fragment doesn't have directives .
///
/// with the exception that it never flattens the inline fragment with relay
/// directives (@defer, @__clientExtensions).
pub fn flatten(program: &mut Program, is_for_codegen: bool) -> DiagnosticsResult<()> {
    let transform = FlattenTransform::new(program, is_for_codegen);
    let errors = Arc::new(Mutex::new(Vec::new()));

    par_iter(&mut program.operations).for_each(|operation| {
        if let Err(err) = transform.transform_operation(operation) {
            errors.lock().extend(err.into_iter());
        }
    });
    par_iter(&mut program.fragments).for_each(|(_, fragment)| {
        if let Err(err) = transform.transform_fragment(fragment) {
            errors.lock().extend(err.into_iter());
        }
    });
    let is_errors_empty = { errors.lock().is_empty() };
    if is_errors_empty {
        Ok(())
    } else {
        Err(Arc::try_unwrap(errors).unwrap().into_inner())
    }
}

struct FlattenTransform {
    schema: Arc<SDLSchema>,
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
        operation: &mut Arc<OperationDefinition>,
    ) -> DiagnosticsResult<()> {
        let next_selections = self.transform_selections(&operation.selections, operation.type_)?;
        if let TransformedValue::Replace(next_selections) = next_selections {
            Arc::make_mut(operation).selections = next_selections
        };
        Ok(())
    }

    fn transform_fragment(&self, fragment: &mut Arc<FragmentDefinition>) -> DiagnosticsResult<()> {
        let next_selections =
            self.transform_selections(&fragment.selections, fragment.type_condition)?;
        if let TransformedValue::Replace(next_selections) = next_selections {
            Arc::make_mut(fragment).selections = next_selections
        };
        Ok(())
    }

    fn transform_selections(
        &self,
        selections: &[Selection],
        parent_type: Type,
    ) -> DiagnosticsResult<TransformedValue<Vec<Selection>>> {
        let mut next_selections = Vec::new();
        let mut has_changes = false;
        for (index, selection) in selections.iter().enumerate() {
            let next_selection = self.transform_selection(selection, parent_type)?;
            if let TransformedValue::Replace(next_selection) = next_selection {
                if !has_changes {
                    has_changes = true;
                    next_selections.reserve(selections.len());
                    next_selections.extend(selections.iter().take(index).cloned())
                }
                next_selections.push(next_selection);
            } else if has_changes {
                next_selections.push(selection.clone());
            }
        }
        let mut flattened_selections = Vec::with_capacity(selections.len());
        has_changes = self.flatten_selections(
            &mut flattened_selections,
            if has_changes {
                &next_selections
            } else {
                selections
            },
            parent_type,
        )? || has_changes;

        Ok(if has_changes {
            TransformedValue::Replace(flattened_selections)
        } else {
            TransformedValue::Keep
        })
    }

    fn transform_linked_field(
        &self,
        linked_field: &Arc<LinkedField>,
    ) -> DiagnosticsResult<TransformedValue<Arc<LinkedField>>> {
        let should_cache = Arc::strong_count(linked_field) > 1;
        let key = PointerAddress::new(Arc::as_ref(linked_field));
        if should_cache {
            let seen_linked_fields = self.seen_linked_fields.read();
            if let Some(prev) = seen_linked_fields.get(&key) {
                return Ok(prev.clone());
            }
        }
        let type_ = self
            .schema
            .field(linked_field.definition.item)
            .type_
            .inner();
        let result = self
            .transform_selections(&linked_field.selections, type_)?
            .map(|next_selections| {
                Arc::new(LinkedField {
                    alias: linked_field.alias,
                    definition: linked_field.definition,
                    arguments: linked_field.arguments.clone(),
                    directives: linked_field.directives.clone(),
                    selections: next_selections,
                })
            });
        if should_cache {
            let mut seen_linked_fields = self.seen_linked_fields.write();
            // If another thread computed this in the meantime, use that result
            if let Some(prev) = seen_linked_fields.get(&key) {
                return Ok(prev.clone());
            }
            seen_linked_fields.insert(key, result.clone());
        }
        Ok(result)
    }

    fn transform_inline_fragment(
        &self,
        fragment: &Arc<InlineFragment>,
        parent_type: Type,
    ) -> DiagnosticsResult<TransformedValue<Arc<InlineFragment>>> {
        let should_cache = Arc::strong_count(fragment) > 1;
        let key = (PointerAddress::new(Arc::as_ref(fragment)), parent_type);
        if should_cache {
            let seen_inline_fragments = self.seen_inline_fragments.read();
            if let Some(prev) = seen_inline_fragments.get(&key) {
                return Ok(prev.clone());
            }
        }
        let next_parent_type = match fragment.type_condition {
            Some(type_condition) => type_condition,
            None => parent_type,
        };
        let result = self
            .transform_selections(&fragment.selections, next_parent_type)?
            .map(|next_selections| {
                Arc::new(InlineFragment {
                    type_condition: fragment.type_condition,
                    directives: fragment.directives.clone(),
                    selections: next_selections,
                })
            });
        if should_cache {
            let mut seen_inline_fragments = self.seen_inline_fragments.write();
            // If another thread computed this in the meantime, use that result
            if let Some(prev) = seen_inline_fragments.get(&key) {
                return Ok(prev.clone());
            }
            seen_inline_fragments.insert(key, result.clone());
        }
        Ok(result)
    }

    fn transform_selection(
        &self,
        selection: &Selection,
        parent_type: Type,
    ) -> DiagnosticsResult<TransformedValue<Selection>> {
        Ok(match selection {
            Selection::InlineFragment(node) => self
                .transform_inline_fragment(node, parent_type)?
                .map(Selection::InlineFragment),
            Selection::LinkedField(node) => self
                .transform_linked_field(node)?
                .map(Selection::LinkedField),
            Selection::Condition(node) => self
                .transform_selections(&node.selections, parent_type)?
                .map(|next_selections| {
                    Selection::Condition(Arc::new(Condition {
                        value: node.value.clone(),
                        passing_value: node.passing_value,
                        selections: next_selections,
                    }))
                }),
            Selection::FragmentSpread(_) | Selection::ScalarField(_) => TransformedValue::Keep,
        })
    }

    fn flatten_selections(
        &self,
        flattened_selections: &mut Vec<Selection>,
        selections: &[Selection],
        parent_type: Type,
    ) -> DiagnosticsResult<bool> {
        let mut has_changes = false;
        for selection in selections {
            if let Selection::InlineFragment(inline_fragment) = selection {
                if should_flatten_inline_fragment(inline_fragment, parent_type, self.is_for_codegen)
                {
                    has_changes = true;
                    self.flatten_selections(
                        flattened_selections,
                        &inline_fragment.selections,
                        parent_type,
                    )?;
                    continue;
                }
            }

            let flattened_selection = flattened_selections.iter_mut().find(|sel| {
                sel.ptr_eq(selection) || NodeIdentifier::are_equal(&self.schema, sel, selection)
            });

            match flattened_selection {
                None => {
                    flattened_selections.push(selection.clone());
                }
                Some(flattened_selection) => {
                    has_changes = true;
                    if flattened_selection.ptr_eq(selection) {
                        continue;
                    }
                    match flattened_selection {
                        Selection::InlineFragment(flattened_node) => {
                            let node = match selection {
                                Selection::InlineFragment(node) => node,
                                _ => unreachable!("FlattenTransform: Expected an InlineFragment."),
                            };

                            let type_condition =
                                flattened_node.type_condition.unwrap_or(parent_type);
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

                            let flattened_node = Arc::make_mut(flattened_node);
                            self.flatten_selections(
                                &mut flattened_node.selections,
                                &node.selections,
                                type_condition,
                            )?;
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
                                return Err(vec![self.create_conflicting_fields_error(
                                    node.alias_or_name(&self.schema),
                                    flattened_node.definition.location,
                                    &flattened_node.arguments,
                                    node.definition.location,
                                    &node.arguments,
                                )]);
                            }
                            let type_ = self
                                .schema
                                .field(flattened_node.definition.item)
                                .type_
                                .inner();
                            let should_merge_handles = selection.directives().iter().any(|d| {
                                CustomMetadataDirectives::is_handle_field_directive(d.name.item)
                            });

                            let flattened_node = Arc::make_mut(flattened_node);
                            if should_merge_handles {
                                flattened_node.directives = merge_handle_directives(
                                    &flattened_node.directives,
                                    selection.directives(),
                                )
                            };
                            self.flatten_selections(
                                &mut flattened_node.selections,
                                &node.selections,
                                type_,
                            )?;
                        }
                        Selection::Condition(flattened_node) => {
                            let node = match selection {
                                Selection::Condition(node) => node,
                                _ => unreachable!("FlattenTransform: Expected a Condition."),
                            };

                            let flattened_node = Arc::make_mut(flattened_node);
                            self.flatten_selections(
                                &mut flattened_node.selections,
                                &node.selections,
                                parent_type,
                            )?;
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
                                return Err(vec![self.create_conflicting_fields_error(
                                    node.alias_or_name(&self.schema),
                                    flattened_node.definition.location,
                                    &flattened_node.arguments,
                                    node.definition.location,
                                    &node.arguments,
                                )]);
                            }
                            let should_merge_handles = node.directives.iter().any(|d| {
                                CustomMetadataDirectives::is_handle_field_directive(d.name.item)
                            });
                            if should_merge_handles {
                                let flattened_node = Arc::make_mut(flattened_node);
                                flattened_node.directives = merge_handle_directives(
                                    &flattened_node.directives,
                                    selection.directives(),
                                );
                            }
                        }
                        Selection::FragmentSpread(_) => {}
                    };
                }
            }
        }
        Ok(has_changes)
    }

    fn create_conflicting_fields_error(
        &self,
        field_name: StringKey,
        location_a: Location,
        arguments_a: &[Argument],
        location_b: Location,
        arguments_b: &[Argument],
    ) -> Diagnostic {
        Diagnostic::error(
            ValidationMessage::InvalidSameFieldWithDifferentArguments {
                field_name,
                arguments_a: graphql_text_printer::print_arguments(
                    &self.schema,
                    &arguments_a,
                    graphql_text_printer::PrinterOptions::default(),
                ),
            },
            location_a,
        )
        .annotate(
            format!(
                "which conflicts with this field with applied argument values {}",
                graphql_text_printer::print_arguments(
                    &self.schema,
                    &arguments_b,
                    graphql_text_printer::PrinterOptions::default()
                ),
            ),
            location_b,
        )
    }
}

fn should_flatten_inline_fragment(
    inline_fragment: &InlineFragment,
    parent_type: Type,
    is_for_codegen: bool,
) -> bool {
    if let Some(type_condition) = inline_fragment.type_condition {
        if type_condition != parent_type {
            return false;
        }
    }
    if is_for_codegen {
        !inline_fragment
            .directives
            .iter()
            .any(is_relay_custom_inline_fragment_directive)
    } else {
        inline_fragment.directives.is_empty()
    }
}

fn merge_handle_directives(
    directives_a: &[Directive],
    directives_b: &[Directive],
) -> Vec<Directive> {
    let (mut handles, mut directives): (Vec<_>, Vec<_>) =
        directives_a.iter().cloned().partition(|directive| {
            CustomMetadataDirectives::is_handle_field_directive(directive.name.item)
        });
    for directive in directives_b {
        if CustomMetadataDirectives::is_handle_field_directive(directive.name.item) {
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
