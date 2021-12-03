/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod scope;

use super::get_applied_fragment_name;
use crate::{
    match_::SplitOperationMetadata,
    no_inline::{is_raw_response_type_enabled, NO_INLINE_DIRECTIVE_NAME, PARENT_DOCUMENTS_ARG},
    util::get_normalization_operation_name,
};
use common::{Diagnostic, DiagnosticsResult, FeatureFlag, NamedItem, WithLocation};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{
    Condition, ConditionValue, ConstantValue, Directive, FragmentDefinition, FragmentSpread,
    InlineFragment, OperationDefinition, Program, ProvidedVariableMetadata, Selection, Transformed,
    TransformedMulti, TransformedValue, Transformer, ValidationMessage, Value, Variable,
    VariableDefinition,
};
use graphql_syntax::OperationKind;
use indexmap::IndexMap;
use intern::string_key::{Intern, StringKey};
use itertools::Itertools;
use scope::{format_local_variable, Scope};
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
/// - Definitions of provided variables are added to the root operation.
/// - All nodes are cloned with updated children.
///
/// The transform also handles statically passing/failing Condition nodes:
/// - Literal Conditions with a passing value are elided and their selections
///   inlined in their parent.
/// - Literal Conditions with a failing value are removed.
/// - Nodes that would become empty as a result of the above are removed.
///
/// Note that unreferenced fragments are not added to the output.
pub fn apply_fragment_arguments(
    program: &Program,
    is_normalization: bool,
    no_inline_feature: &FeatureFlag,
    base_fragment_names: &FnvHashSet<StringKey>,
) -> DiagnosticsResult<Program> {
    let mut transform = ApplyFragmentArgumentsTransform {
        base_fragment_names,
        errors: Vec::new(),
        fragments: Default::default(),
        is_normalization,
        no_inline_feature,
        program,
        provided_variables: Default::default(),
        scope: Default::default(),
        split_operations: Default::default(),
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

    for (_, operation) in transform.split_operations {
        next_program.insert_operation(Arc::new(operation));
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

struct ApplyFragmentArgumentsTransform<'flags, 'program, 'base_fragments> {
    base_fragment_names: &'base_fragments FnvHashSet<StringKey>,
    errors: Vec<Diagnostic>,
    fragments: FnvHashMap<StringKey, PendingFragment>,
    is_normalization: bool,
    no_inline_feature: &'flags FeatureFlag,
    program: &'program Program,
    provided_variables: IndexMap<StringKey, VariableDefinition>,
    scope: Scope,
    split_operations: FnvHashMap<StringKey, OperationDefinition>,
}

impl Transformer for ApplyFragmentArgumentsTransform<'_, '_, '_> {
    const NAME: &'static str = "ApplyFragmentArgumentsTransform";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = true;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.scope = Scope::root_scope();
        self.provided_variables = Default::default();
        let transform_result = self.default_transform_operation(operation);
        if self.provided_variables.is_empty() {
            transform_result
        } else {
            match transform_result {
                Transformed::Keep => {
                    let mut new_operation = operation.clone();
                    new_operation.variable_definitions.append(
                        &mut self
                            .provided_variables
                            .drain(..)
                            .map(|(_, definition)| definition)
                            .collect_vec(),
                    );
                    Transformed::Replace(new_operation)
                }
                Transformed::Replace(mut new_operation) => {
                    new_operation.variable_definitions.append(
                        &mut self
                            .provided_variables
                            .drain(..)
                            .map(|(_, definition)| definition)
                            .collect_vec(),
                    );
                    Transformed::Replace(new_operation)
                }
                Transformed::Delete => Transformed::Delete,
            }
        }
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if self.is_normalization {
            let no_inline_directive = fragment.directives.named(*NO_INLINE_DIRECTIVE_NAME);
            if let Some(no_inline_directive) = no_inline_directive {
                self.transform_no_inline_fragment(fragment, no_inline_directive);
            }
        }
        // Non-inlined fragments are promoted to operations; other fragments are deleted
        // unless they are referenced
        Transformed::Delete
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        let fragment = self
            .program
            .fragment(spread.fragment.item)
            .unwrap_or_else(|| {
                panic!(
                    "Tried to spread missing fragment: `{}`.",
                    spread.fragment.item
                );
            });
        if self.is_normalization {
            if let Some(directive) = fragment.directives.named(*NO_INLINE_DIRECTIVE_NAME) {
                let transformed_arguments = spread
                    .arguments
                    .iter()
                    .map(|arg| {
                        let mut arg = self.transform_argument(arg).unwrap_or_else(|| arg.clone());
                        arg.name.item = format_local_variable(fragment.name.item, arg.name.item);
                        arg
                    })
                    .collect();
                let mut directives = Vec::with_capacity(spread.directives.len() + 1);
                directives.extend(spread.directives.iter().cloned());
                directives.push(directive.clone());
                let normalization_name =
                    get_normalization_operation_name(fragment.name.item).intern();
                let next_spread = Selection::FragmentSpread(Arc::new(FragmentSpread {
                    arguments: transformed_arguments,
                    directives,
                    fragment: WithLocation::new(fragment.name.location, normalization_name),
                }));
                // If the fragment type is abstract, we need to ensure that it's only evaluated at runtime if the
                // type of the object matches the fragment's type condition. Rather than reimplement type refinement
                // for fragment spreads, we wrap the fragment spread in an inlinefragment (which may be inlined away)
                // that ensures it will go through type-refinement at runtime.
                return if fragment.type_condition.is_abstract_type() {
                    Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                        directives: Default::default(),
                        selections: vec![next_spread],
                        type_condition: Some(fragment.type_condition),
                    })))
                } else {
                    Transformed::Replace(next_spread)
                };
            }
        }
        if let Some(applied_fragment) = self.apply_fragment(spread, fragment) {
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
            Value::Variable(prev_variable) => {
                if let Some(scope_value) = self.scope.get(prev_variable.name.item) {
                    match scope_value {
                        Value::Variable(replacement_variable) => {
                            TransformedValue::Replace(Value::Variable(Variable {
                                // Update the name/location to the applied variable name
                                name: replacement_variable.name,
                                // But keep the type of the previous variable, which reflects the type
                                // expected at this location
                                type_: prev_variable.type_.clone(),
                            }))
                        }
                        _ => TransformedValue::Replace(scope_value.clone()),
                    }
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
            ConditionValue::Variable(prev_variable) => {
                match self.scope.get(prev_variable.name.item) {
                    Some(Value::Variable(replacement_variable)) => {
                        TransformedValue::Replace(ConditionValue::Variable(Variable {
                            // Update the name/location to the applied variable name
                            name: replacement_variable.name,
                            // But keep the type of the previous variable, which reflects the type
                            // expected at this location
                            type_: prev_variable.type_.clone(),
                        }))
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

impl ApplyFragmentArgumentsTransform<'_, '_, '_> {
    fn transform_no_inline_fragment(
        &mut self,
        fragment: &FragmentDefinition,
        directive: &Directive,
    ) {
        // We do not need to to write normalization files for base fragments
        if self.base_fragment_names.contains(&fragment.name.item) {
            return;
        }
        if !self.no_inline_feature.is_enabled_for(fragment.name.item) {
            self.errors.push(Diagnostic::error(
                format!(
                    "Invalid usage of @no_inline on fragment '{}': this feature is gated and currently set to: {}",
                    fragment.name.item, self.no_inline_feature
                ),
                directive.name.location,
            ));
        }
        self.scope = no_inline_fragment_scope(fragment);
        let fragment = self
            .default_transform_fragment(fragment)
            .unwrap_or_else(|| fragment.clone());
        let FragmentDefinition {
            name,
            mut directives,
            mut variable_definitions,
            selections,
            type_condition,
            ..
        } = fragment;

        for variable in &mut variable_definitions {
            variable.name.item = format_local_variable(fragment.name.item, variable.name.item);
        }
        let mut metadata = SplitOperationMetadata {
            derived_from: fragment.name.item,
            parent_documents: Default::default(),
            raw_response_type: is_raw_response_type_enabled(directive),
        };
        // - A fragment with user defined @no_inline always produces a $normalization file. The `parent_document` of
        // that file is the fragment itself as it gets deleted iff that fragment is deleted or no longer
        // has the @no_inline directive.
        // - A fragment with @no_inline generated by @module, `parent_documents` also include fragments that
        // spread the current fragment with @module
        metadata.parent_documents.insert(fragment.name.item);
        let parent_documents_arg = directive.arguments.named(*PARENT_DOCUMENTS_ARG);
        if let Some(Value::Constant(ConstantValue::List(parent_documents))) =
            parent_documents_arg.map(|arg| &arg.value.item)
        {
            for val in parent_documents {
                if let ConstantValue::String(name) = val {
                    metadata.parent_documents.insert(*name);
                } else {
                    panic!("Expected item in the parent_documents to be a StringKey.")
                }
            }
        }
        directives.push(metadata.to_directive());
        let normalization_name = get_normalization_operation_name(name.item).intern();
        let operation = OperationDefinition {
            name: WithLocation::new(name.location, normalization_name),
            type_: type_condition,
            variable_definitions,
            directives,
            selections,
            kind: OperationKind::Query,
        };

        if self.program.operation(normalization_name).is_some() {
            self.errors.push(Diagnostic::error(
                format!(
                    "Invalid usage of @no_inline on fragment '{}' - @no_inline is only allowed on allowlisted fragments loaded with @module",
                    fragment.name.item,
                ),
                directive.name.location,
            ));
        }
        self.split_operations.insert(fragment.name.item, operation);
    }

    fn extract_provided_variables(&mut self, fragment: &FragmentDefinition) {
        let provided_arguments =
            fragment
                .used_global_variables
                .iter()
                .filter(|variable_definition| {
                    variable_definition
                        .directives
                        .named(ProvidedVariableMetadata::directive_name())
                        .is_some()
                });
        for definition in provided_arguments {
            self.provided_variables
                .insert(fragment.name.item, definition.clone());
        }
    }

    fn apply_fragment(
        &mut self,
        spread: &FragmentSpread,
        fragment: &FragmentDefinition,
    ) -> Option<Arc<FragmentDefinition>> {
        let transformed_arguments = self
            .transform_arguments(&spread.arguments)
            .replace_or_else(|| spread.arguments.clone());

        let applied_fragment_name =
            get_applied_fragment_name(spread.fragment.item, &transformed_arguments);
        if let Some(applied_fragment) = self.fragments.get(&applied_fragment_name) {
            return match applied_fragment {
                PendingFragment::Resolved(resolved) => resolved.clone(),
                PendingFragment::Pending => {
                    let mut error = Diagnostic::error(
                        ValidationMessage::CircularFragmentReference {
                            fragment_name: spread.fragment.item,
                        },
                        spread.fragment.location,
                    );
                    for location in self.scope.locations() {
                        error = error.annotate("other member of the cycle", location);
                    }
                    self.errors.push(error);
                    None
                }
            };
        }

        self.fragments
            .insert(applied_fragment_name, PendingFragment::Pending);

        self.scope
            .push(spread.fragment.location, &transformed_arguments, fragment);

        self.extract_provided_variables(fragment);

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

fn no_inline_fragment_scope(fragment: &FragmentDefinition) -> Scope {
    let mut bindings = FnvHashMap::with_capacity_and_hasher(
        fragment.variable_definitions.len(),
        Default::default(),
    );
    for variable_definition in &fragment.variable_definitions {
        let variable_name = variable_definition.name.item;
        let scoped_variable_name = format_local_variable(fragment.name.item, variable_name);
        bindings.insert(
            variable_name,
            Value::Variable(Variable {
                name: WithLocation::new(variable_definition.name.location, scoped_variable_name),
                type_: variable_definition.type_.clone(),
            }),
        );
    }
    let mut scope = Scope::root_scope();
    scope.push_bindings(fragment.name.location, bindings);
    scope
}
