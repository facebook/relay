/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::util::format_provided_variable_name;
use common::{Diagnostic, DiagnosticsResult, Named, NamedItem, WithLocation};
use fnv::FnvHashMap;
use graphql_ir::{
    FragmentDefinition, Program, ProvidedVariableMetadata, Transformed, TransformedValue,
    Transformer, Variable, VariableDefinition,
};
use intern::string_key::StringKey;
use itertools::Itertools;

/// This transform applies provided variables in each fragment.
///  - Rename all uses of provided variables (in values)
///     [provided_variable_name] --> __pv__[module_name]
///  - Remove provided variables from (local) argument definitions
///  - Add provided variables to list of used global variables
/// apply_fragment_arguments depends on provide_variable_fragment_transform
pub fn provided_variable_fragment_transform(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = ProvidedVariableFragmentTransform::new();
    let program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());
    if !transform.errors.is_empty() {
        Err(transform.errors)
    } else {
        Ok(program)
    }
}

struct ProvidedVariableFragmentTransform {
    errors: Vec<Diagnostic>,
    // fragment local identifier --> transformed_identifier
    in_scope_providers: FnvHashMap<StringKey, StringKey>,
}

impl ProvidedVariableFragmentTransform {
    fn new() -> Self {
        ProvidedVariableFragmentTransform {
            errors: Vec::new(),
            in_scope_providers: Default::default(),
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
            let transformed_name = self.in_scope_providers.get(&def.name())?;
            Some(VariableDefinition {
                name: WithLocation {
                    item: *transformed_name,
                    location: def.name.location,
                },
                ..def.clone()
            })
        }));
        new_globals
    }
}

impl<'s> Transformer for ProvidedVariableFragmentTransform {
    const NAME: &'static str = "ApplyFragmentProvidedVariables";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_variable(&mut self, variable: &Variable) -> TransformedValue<Variable> {
        if let Some(transformed_name) = self.in_scope_providers.get(&variable.name.item) {
            TransformedValue::Replace(Variable {
                name: WithLocation {
                    location: variable.name.location,
                    item: *transformed_name,
                },
                type_: variable.type_.clone(),
            })
        } else {
            TransformedValue::Keep
        }
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        debug_assert!(self.in_scope_providers.is_empty());
        for def in fragment.variable_definitions.iter() {
            if let Some(metadata) = ProvidedVariableMetadata::find(&def.directives) {
                let transformed_name = format_provided_variable_name(metadata.module_name);
                self.in_scope_providers.insert(def.name(), transformed_name);
            }
        }

        if self.in_scope_providers.is_empty() {
            Transformed::Keep
        } else {
            let selections = self.transform_selections(&fragment.selections);
            let new_fragment = FragmentDefinition {
                name: fragment.name,
                variable_definitions: self.get_variable_definitions(fragment),
                used_global_variables: self.get_global_variables(fragment),
                type_condition: fragment.type_condition,
                directives: fragment.directives.clone(),
                selections: selections.replace_or_else(|| fragment.selections.clone()),
            };
            self.in_scope_providers.clear();
            Transformed::Replace(new_fragment)
        }
    }
}
