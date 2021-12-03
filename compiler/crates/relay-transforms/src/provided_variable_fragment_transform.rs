/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::util::format_provided_variable_name;
use common::{NamedItem, WithLocation};
use fnv::FnvHashSet;
use graphql_ir::{
    FragmentDefinition, Program, ProvidedVariableMetadata, Transformed, TransformedValue,
    Transformer, Variable, VariableDefinition,
};
use intern::string_key::StringKey;
use itertools::Itertools;

/// This transform applies provided variables in each fragment.
///  - Rename all uses of provided variables (in values)
///     [provided_variable_name] --> __[fragment_name]__[provided_variable_name]
///  - Remove provided variables from (local) argument definitions
///  - Add provided variables to list of used global variables
pub fn provided_variable_fragment_transform(program: &Program) -> Program {
    let mut transform = ProvidedVariableFragmentTransform::new();
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct ProvidedVariableFragmentTransform {
    // stack of (fragment_name: string, provider_names: set<string>)
    in_scope_providers: Option<(StringKey, FnvHashSet<StringKey>)>,
}

impl ProvidedVariableFragmentTransform {
    fn new() -> Self {
        ProvidedVariableFragmentTransform {
            in_scope_providers: None,
        }
    }

    fn get_variable_definitions(&self, fragment: &FragmentDefinition) -> Vec<VariableDefinition> {
        fragment
            .variable_definitions
            .iter()
            .filter(|def| {
                def.directives
                    .named(ProvidedVariableMetadata::directive_name())
                    .is_none()
            })
            .cloned()
            .collect_vec()
    }

    fn get_global_variables(&self, fragment: &FragmentDefinition) -> Vec<VariableDefinition> {
        let mut new_globals = fragment.used_global_variables.clone();
        new_globals.extend(fragment.variable_definitions.iter().filter_map(|def| {
            if def
                .directives
                .named(ProvidedVariableMetadata::directive_name())
                .is_some()
            {
                Some(VariableDefinition {
                    name: WithLocation {
                        item: format_provided_variable_name(fragment.name.item, def.name.item),
                        location: def.name.location,
                    },
                    ..def.clone()
                })
            } else {
                None
            }
        }));
        new_globals
    }
}

impl<'s> Transformer for ProvidedVariableFragmentTransform {
    const NAME: &'static str = "ApplyFragmentProvidedVariables";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_variable(&mut self, variable: &Variable) -> TransformedValue<Variable> {
        if let Some((fragment_name, current_fragment_scope)) = &self.in_scope_providers {
            if current_fragment_scope.contains(&variable.name.item) {
                TransformedValue::Replace(Variable {
                    name: WithLocation {
                        location: variable.name.location,
                        item: format_provided_variable_name(*fragment_name, variable.name.item),
                    },
                    type_: variable.type_.clone(),
                })
            } else {
                TransformedValue::Keep
            }
        } else {
            TransformedValue::Keep
        }
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let provided_variable_names =
            FnvHashSet::from_iter(fragment.variable_definitions.iter().filter_map(|def| {
                if def
                    .directives
                    .named(ProvidedVariableMetadata::directive_name())
                    .is_some()
                {
                    Some(def.name.item)
                } else {
                    None
                }
            }));

        debug_assert!(self.in_scope_providers.is_none());
        if provided_variable_names.is_empty() {
            Transformed::Keep
        } else {
            self.in_scope_providers = Some((fragment.name.item, provided_variable_names));

            let selections = self.transform_selections(&fragment.selections);
            let new_fragment = FragmentDefinition {
                name: fragment.name,
                variable_definitions: self.get_variable_definitions(fragment),
                used_global_variables: self.get_global_variables(fragment),
                type_condition: fragment.type_condition,
                directives: fragment.directives.clone(),
                selections: selections.replace_or_else(|| fragment.selections.clone()),
            };
            self.in_scope_providers = None;
            Transformed::Replace(new_fragment)
        }
    }
}
