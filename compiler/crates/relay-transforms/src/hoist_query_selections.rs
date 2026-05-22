/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use graphql_ir::Condition;
use graphql_ir::ConditionValue;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_syntax::OperationKind;
use rustc_hash::FxHashMap;
use rustc_hash::FxHashSet;
use schema::FieldID;
use schema::Schema;

use crate::errors::ValidationMessage;

pub fn hoist_query_selections(program: &Program) -> DiagnosticsResult<Program> {
    let query_field_id = program.schema.query_selection_field();
    let mut transformer = HoistQuerySelections {
        program,
        query_field_id,
        fragment_info: FxHashMap::default(),
        fragment_transitive_hoisted: FxHashMap::default(),
        fragment_resolve_state: FxHashMap::default(),
        errors: Vec::new(),
    };
    let next_program = transformer.transform();
    if transformer.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transformer.errors)
    }
}

#[derive(Clone, Copy, PartialEq)]
enum ResolveState {
    Visiting,
    Visited,
}

/// A fragment spread with the conditions that were on the path to reach it.
#[derive(Clone)]
struct ConditionalSpread {
    name: FragmentDefinitionName,
    conditions: Vec<ConditionInfo>,
}

/// The data needed to reconstruct a Condition wrapper, without the selections.
#[derive(Clone)]
struct ConditionInfo {
    value: ConditionValue,
    passing_value: bool,
    location: common::Location,
}

impl ConditionInfo {
    fn from_condition(c: &Condition) -> Self {
        Self {
            value: c.value.clone(),
            passing_value: c.passing_value,
            location: c.location,
        }
    }

    fn wrap(&self, selections: Vec<Selection>) -> Selection {
        Selection::Condition(Arc::new(Condition {
            selections,
            value: self.value.clone(),
            passing_value: self.passing_value,
            location: self.location,
        }))
    }
}

struct FragmentExtraction {
    hoisted: Vec<Selection>,
    spreads: Vec<ConditionalSpread>,
}

struct HoistQuerySelections<'s> {
    program: &'s Program,
    query_field_id: FieldID,
    fragment_info: FxHashMap<FragmentDefinitionName, FragmentExtraction>,
    fragment_transitive_hoisted: FxHashMap<FragmentDefinitionName, Vec<Selection>>,
    fragment_resolve_state: FxHashMap<FragmentDefinitionName, ResolveState>,
    errors: Vec<Diagnostic>,
}

struct ExtractResult {
    selections: Vec<Selection>,
    hoisted: Vec<Selection>,
    spreads: Vec<ConditionalSpread>,
    changed: bool,
}

impl<'s> HoistQuerySelections<'s> {
    fn transform(&mut self) -> Program {
        let mut next_program = Program::new(Arc::clone(&self.program.schema));

        // Phase 1a: Process each fragment exactly once — extract direct __query
        // selections and collect spreads with their condition context.
        let fragment_names: Vec<_> = self
            .program
            .fragments()
            .map(|f| f.name.item)
            .collect();

        for &name in &fragment_names {
            let fragment = self.program.fragment(name).unwrap();
            let mut condition_stack = Vec::new();
            let result =
                self.extract_from_selections(&fragment.selections, &mut condition_stack);
            self.fragment_info.insert(
                name,
                FragmentExtraction {
                    hoisted: result.hoisted,
                    spreads: result.spreads,
                },
            );
            if result.changed {
                let mut next_fragment = fragment.as_ref().clone();
                next_fragment.selections = result.selections;
                next_program.insert_fragment(Arc::new(next_fragment));
            } else {
                next_program.insert_fragment(Arc::clone(fragment));
            }
        }

        // Phase 1b: Resolve transitive hoisted selections per fragment.
        for &name in &fragment_names {
            self.resolve_transitive_hoisted(name);
        }

        // Phase 2: Process operations — extract direct __query, then look up
        // cached transitive hoisted from all spread fragments.
        for operation in self.program.operations() {
            let mut condition_stack = Vec::new();
            let result =
                self.extract_from_selections(&operation.selections, &mut condition_stack);

            let mut all_hoisted = result.hoisted;

            let mut seen_fragments = FxHashSet::default();
            for spread in &result.spreads {
                if seen_fragments.insert(spread.name) {
                    if let Some(transitive) =
                        self.fragment_transitive_hoisted.get(&spread.name)
                    {
                        all_hoisted
                            .extend(wrap_in_conditions(transitive.clone(), &spread.conditions));
                    }
                }
            }

            if !all_hoisted.is_empty() && operation.kind != OperationKind::Query {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::QueryFieldNotAllowedInOperation {
                        operation_kind: operation.kind,
                    },
                    operation.name.location,
                ));
                next_program.insert_operation(Arc::clone(operation));
                continue;
            }

            if all_hoisted.is_empty() && !result.changed {
                next_program.insert_operation(Arc::clone(operation));
            } else {
                let mut next_operation = operation.as_ref().clone();
                if result.changed {
                    next_operation.selections = result.selections;
                }
                next_operation.selections.extend(all_hoisted);
                next_program.insert_operation(Arc::new(next_operation));
            }
        }

        next_program
    }

    /// Compute transitive hoisted selections for a fragment via DFS.
    /// Each fragment is resolved exactly once. Cycles are broken by
    /// returning empty when a fragment is encountered in "Visiting" state.
    fn resolve_transitive_hoisted(
        &mut self,
        name: FragmentDefinitionName,
    ) -> Vec<Selection> {
        match self.fragment_resolve_state.get(&name) {
            Some(ResolveState::Visited) => {
                return self
                    .fragment_transitive_hoisted
                    .get(&name)
                    .cloned()
                    .unwrap_or_default();
            }
            Some(ResolveState::Visiting) => {
                return Vec::new();
            }
            None => {}
        }

        self.fragment_resolve_state
            .insert(name, ResolveState::Visiting);

        let info = self
            .fragment_info
            .remove(&name)
            .unwrap_or_else(|| FragmentExtraction {
                hoisted: Vec::new(),
                spreads: Vec::new(),
            });

        let mut result = info.hoisted;
        for spread in info.spreads {
            let transitive = self.resolve_transitive_hoisted(spread.name);
            if !transitive.is_empty() {
                result.extend(wrap_in_conditions(transitive, &spread.conditions));
            }
        }

        self.fragment_resolve_state
            .insert(name, ResolveState::Visited);
        self.fragment_transitive_hoisted
            .insert(name, result.clone());
        result
    }

    /// Walk selections, extracting __query LinkedFields and collecting
    /// spread fragment names with their condition context.
    fn extract_from_selections(
        &self,
        selections: &[Selection],
        condition_stack: &mut Vec<ConditionInfo>,
    ) -> ExtractResult {
        let mut result_selections = Vec::with_capacity(selections.len());
        let mut hoisted = Vec::new();
        let mut spreads = Vec::new();
        let mut changed = false;

        for selection in selections {
            match selection {
                Selection::LinkedField(field)
                    if field.definition.item == self.query_field_id =>
                {
                    changed = true;
                    hoisted.extend(wrap_in_conditions(
                        field.selections.clone(),
                        condition_stack,
                    ));
                }
                Selection::LinkedField(field) => {
                    let inner =
                        self.extract_from_selections(&field.selections, condition_stack);
                    hoisted.extend(inner.hoisted);
                    spreads.extend(inner.spreads);
                    if inner.changed {
                        changed = true;
                        if !inner.selections.is_empty() {
                            result_selections.push(Selection::LinkedField(Arc::new(
                                LinkedField {
                                    selections: inner.selections,
                                    ..field.as_ref().clone()
                                },
                            )));
                        }
                    } else {
                        result_selections.push(selection.clone());
                    }
                }
                Selection::InlineFragment(fragment) => {
                    let inner =
                        self.extract_from_selections(&fragment.selections, condition_stack);
                    hoisted.extend(inner.hoisted);
                    spreads.extend(inner.spreads);
                    if inner.changed {
                        changed = true;
                        if !inner.selections.is_empty() {
                            result_selections.push(Selection::InlineFragment(Arc::new(
                                graphql_ir::InlineFragment {
                                    selections: inner.selections,
                                    ..fragment.as_ref().clone()
                                },
                            )));
                        }
                    } else {
                        result_selections.push(selection.clone());
                    }
                }
                Selection::Condition(condition) => {
                    condition_stack.push(ConditionInfo::from_condition(condition));
                    let inner =
                        self.extract_from_selections(&condition.selections, condition_stack);
                    condition_stack.pop();
                    hoisted.extend(inner.hoisted);
                    spreads.extend(inner.spreads);
                    if inner.changed {
                        changed = true;
                        if !inner.selections.is_empty() {
                            result_selections.push(Selection::Condition(Arc::new(Condition {
                                selections: inner.selections,
                                ..condition.as_ref().clone()
                            })));
                        }
                    } else {
                        result_selections.push(selection.clone());
                    }
                }
                Selection::FragmentSpread(spread) => {
                    spreads.push(ConditionalSpread {
                        name: spread.fragment.item,
                        conditions: condition_stack.clone(),
                    });
                    result_selections.push(selection.clone());
                }
                Selection::ScalarField(_) => {
                    result_selections.push(selection.clone());
                }
            }
        }

        ExtractResult {
            selections: result_selections,
            hoisted,
            spreads,
            changed,
        }
    }
}

fn wrap_in_conditions(selections: Vec<Selection>, conditions: &[ConditionInfo]) -> Vec<Selection> {
    if conditions.is_empty() {
        return selections;
    }
    let mut result = selections;
    for condition in conditions.iter().rev() {
        result = vec![condition.wrap(result)];
    }
    result
}
