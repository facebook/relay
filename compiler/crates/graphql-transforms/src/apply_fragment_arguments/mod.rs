/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod hash_arguments;
mod scope;

use common::WithLocation;
use fnv::FnvHashMap;
use graphql_ir::{
    Condition, ConditionValue, ConstantValue, FragmentDefinition, FragmentSpread,
    OperationDefinition, Program, Selection, Transformed, TransformedMulti, TransformedValue,
    Transformer, ValidationError, ValidationMessage, ValidationResult, Value,
};
use interner::{Intern, StringKey};
use scope::Scope;
use std::sync::Arc;

/// A transform that converts a set of documents containing fragments/fragment
/// spreads *with* arguments to one where all arguments have been inlined. This
/// is effectively static currying of functions. Nodes are changed as follows:
/// - Fragment spreads with arguments are replaced with references to an inlined
///   version of the referenced fragment.
/// - Fragments with argument definitions are cloned once per unique set of
///   arguments, with the name changed to original name + hash and all nested
///   variable references changed to the value of that variable given its
///   arguments.
/// - Field & directive argument variables are replaced with the value of those
///   variables in context.
/// - All nodes are cloned with updated children.
///
/// The transform also handles statically passing/failing Condition nodes:
/// - Literal Conditions with a passing value are elided and their selections
///   inlined in their parent.
/// - Literal Conditions with a failing value are removed.
/// - Nodes that would become empty as a result of the above are removed.
///
/// Note that unreferenced fragments are not added to the output.
pub fn apply_fragment_arguments<'schema>(
    program: &Program<'schema>,
) -> ValidationResult<Program<'schema>> {
    let mut transform = ApplyFragmentArgumentsTransform {
        program,
        fragments: Default::default(),
        scope: Default::default(),
        errors: Vec::new(),
    };

    let mut next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    for (fragment_name, used_fragment) in transform.fragments {
        match used_fragment {
            PendingFragment::Resolved(Some(fragment)) => next_program.insert_fragment(fragment),
            PendingFragment::Resolved(None) => {
                // The fragment ended up empty, do not add to result Program.
            }
            PendingFragment::Pending => panic!("Unexpected case, {}", fragment_name),
        }
    }

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

#[derive(Debug)]
enum PendingFragment {
    Pending,
    Resolved(Option<Arc<FragmentDefinition>>),
}

struct ApplyFragmentArgumentsTransform<'schema> {
    program: &'schema Program<'schema>,
    fragments: FnvHashMap<StringKey, PendingFragment>,
    scope: Scope,
    errors: Vec<ValidationError>,
}

impl<'schema> Transformer for ApplyFragmentArgumentsTransform<'schema> {
    const NAME: &'static str = "ApplyFragmentArgumentsTransform";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = true;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.scope = Scope::root_scope();
        self.default_transform_operation(operation)
    }

    fn transform_fragment(
        &mut self,
        _fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        // Fragments are included where referenced.
        // Unreferenced fragments are not included.
        Transformed::Delete
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        if let Some(applied_fragment) = self.apply_fragment(spread) {
            let directives = self
                .transform_directives(&spread.directives)
                .replace_or_else(|| spread.directives.clone());
            Transformed::Replace(Selection::FragmentSpread(Arc::new(FragmentSpread {
                fragment: applied_fragment.name,
                arguments: Vec::new(),
                directives,
            })))
        } else {
            Transformed::Delete
        }
    }

    fn transform_selections(
        &mut self,
        selections: &[Selection],
    ) -> TransformedValue<Vec<Selection>> {
        self.transform_list_multi(selections, Self::transform_selection_multi)
    }

    fn transform_value(&mut self, value: &Value) -> TransformedValue<Value> {
        match value {
            Value::Variable(variable) => {
                if let Some(scope_value) = self.scope.get(variable.name.item) {
                    TransformedValue::Replace(scope_value.clone())
                } else {
                    // Assume a global variable if the variable has no local
                    // bindings.
                    TransformedValue::Keep
                }
            }
            Value::Constant(_) => TransformedValue::Keep,
            Value::List(items) => self
                .transform_list(items, Self::transform_value)
                .map(Value::List),
            Value::Object(arguments) => self.transform_arguments(arguments).map(Value::Object),
        }
    }

    fn transform_condition_value(
        &mut self,
        condition_value: &ConditionValue,
    ) -> TransformedValue<ConditionValue> {
        match condition_value {
            ConditionValue::Variable(variable) => {
                match self.scope.get(variable.name.item) {
                    Some(Value::Variable(variable_name)) => {
                        TransformedValue::Replace(ConditionValue::Variable(variable_name.clone()))
                    }
                    Some(Value::Constant(ConstantValue::Boolean(constant_value))) => {
                        TransformedValue::Replace(ConditionValue::Constant(*constant_value))
                    }
                    None => {
                        // Assume a global variable if the variable has no local
                        // bindings.
                        TransformedValue::Keep
                    }
                    Some(other_binding) => {
                        panic!("Invalid variable value for condition: {:?}", other_binding);
                    }
                }
            }
            ConditionValue::Constant(_) => TransformedValue::Keep,
        }
    }
}

impl<'schema> ApplyFragmentArgumentsTransform<'schema> {
    fn apply_fragment(&mut self, spread: &FragmentSpread) -> Option<Arc<FragmentDefinition>> {
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        let transformed_arguments = self
            .transform_arguments(&spread.arguments)
            .replace_or_else(|| spread.arguments.clone());

        let arguments_hash = hash_arguments::hash_arguments(&transformed_arguments);
        let applied_fragment_name = match arguments_hash {
            Some(hash) => format!("{}_{}", spread.fragment.item, hash).intern(),
            None => spread.fragment.item,
        };
        if let Some(applied_fragment) = self.fragments.get(&applied_fragment_name) {
            return match applied_fragment {
                PendingFragment::Resolved(resolved) => resolved.clone(),
                PendingFragment::Pending => {
                    let mut locations = self.scope.locations();
                    locations.push(spread.fragment.location);
                    self.errors.push(ValidationError::new(
                        ValidationMessage::CircularFragmentReference {
                            fragment_name: spread.fragment.item,
                        },
                        locations,
                    ));
                    None
                }
            };
        }

        self.fragments
            .insert(applied_fragment_name, PendingFragment::Pending);

        self.scope
            .push(spread.fragment.location, &transformed_arguments, fragment);

        let selections = self
            .transform_selections(&fragment.selections)
            .replace_or_else(|| fragment.selections.clone());

        let transformed_fragment = if selections.is_empty() {
            None
        } else {
            Some(Arc::new(FragmentDefinition {
                name: WithLocation::new(fragment.name.location, applied_fragment_name),
                variable_definitions: Vec::new(),
                type_condition: fragment.type_condition,
                // TODO update globals
                used_global_variables: Vec::new(),
                directives: fragment.directives.clone(),
                selections,
            }))
        };

        self.fragments.insert(
            applied_fragment_name,
            PendingFragment::Resolved(transformed_fragment.clone()),
        );

        self.scope.pop();

        transformed_fragment
    }

    fn transform_selection_multi(&mut self, selection: &Selection) -> TransformedMulti<Selection> {
        match selection {
            Selection::FragmentSpread(selection) => {
                self.transform_fragment_spread(selection).into()
            }
            Selection::InlineFragment(selection) => {
                self.transform_inline_fragment(selection).into()
            }
            Selection::LinkedField(selection) => self.transform_linked_field(selection).into(),
            Selection::ScalarField(selection) => self.transform_scalar_field(selection).into(),
            Selection::Condition(selection) => self.transform_condition_multi(selection),
        }
    }

    fn transform_condition_multi(&mut self, condition: &Condition) -> TransformedMulti<Selection> {
        let condition_value = self.transform_condition_value(&condition.value);

        // If we replace with a constant condition, remove the condition node.
        if let TransformedValue::Replace(ConditionValue::Constant(const_condition_value)) =
            condition_value
        {
            return if const_condition_value == condition.passing_value {
                let selections = self
                    .transform_selections(&condition.selections)
                    .replace_or_else(|| condition.selections.clone());
                TransformedMulti::ReplaceMultiple(selections)
            } else {
                TransformedMulti::Delete
            };
        }

        // If selections are empty, delete
        let selections = self.transform_selections(&condition.selections);
        if let TransformedValue::Replace(selections) = &selections {
            if selections.is_empty() {
                return TransformedMulti::Delete;
            }
        }

        if selections.should_keep() && condition_value.should_keep() {
            TransformedMulti::Keep
        } else {
            TransformedMulti::Replace(Selection::Condition(Arc::new(Condition {
                value: condition_value.replace_or_else(|| condition.value.clone()),
                selections: selections.replace_or_else(|| condition.selections.clone()),
                ..condition.clone()
            })))
        }
    }
}
