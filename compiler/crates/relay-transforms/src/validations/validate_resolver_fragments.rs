/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use docblock_shared::FRAGMENT_KEY_ARGUMENT_NAME;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use docblock_shared::RELAY_RSC_VALUE_SCALAR_NAME;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentDefinitionNameSet;
use graphql_ir::FragmentSpread;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Validator;
use graphql_ir::Variable;
use schema::Schema;

use crate::INLINE_DIRECTIVE_NAME;
use crate::RelayDirective;
use crate::ValidationMessage;
use crate::relay_resolvers::get_argument_value;

pub fn validate_resolver_fragments(program: &Program) -> DiagnosticsResult<()> {
    ValidateResolverFragments::new(program).validate_program(program)
}

struct ValidateResolverFragments<'a> {
    program: &'a Program,
    resolver_fragments: FragmentDefinitionNameSet,
    non_rsc_resolver_fragments: FragmentDefinitionNameSet,
    rsc_resolver_fragments: FragmentDefinitionNameSet,
    current_fragment: Option<FragmentDefinition>,
}

impl<'a> ValidateResolverFragments<'a> {
    fn new(program: &'a Program) -> Self {
        let mut resolver_fragments = FragmentDefinitionNameSet::default();
        let mut non_rsc_resolver_fragments = FragmentDefinitionNameSet::default();
        let mut rsc_resolver_fragments = FragmentDefinitionNameSet::default();
        for field in program.schema.fields() {
            if !field.is_extension {
                continue;
            }
            let Some(fragment_name) = field
                .directives
                .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
                .and_then(|directive| {
                    get_argument_value(
                        &directive.arguments,
                        *FRAGMENT_KEY_ARGUMENT_NAME,
                        field.name.location,
                    )
                    .ok()
                    .map(FragmentDefinitionName)
                })
            else {
                continue;
            };
            resolver_fragments.insert(fragment_name);
            if field
                .type_
                .inner()
                .get_scalar_id()
                .is_some_and(|scalar_id| {
                    program.schema.scalar(scalar_id).name.item == *RELAY_RSC_VALUE_SCALAR_NAME
                })
            {
                rsc_resolver_fragments.insert(fragment_name);
            } else {
                non_rsc_resolver_fragments.insert(fragment_name);
            }
        }
        Self {
            program,
            current_fragment: None,
            non_rsc_resolver_fragments,
            resolver_fragments,
            rsc_resolver_fragments,
        }
    }
}

impl<'a> Validator for ValidateResolverFragments<'a> {
    const NAME: &'static str = "ValidateResolverFragments";
    const VALIDATE_ARGUMENTS: bool = true;
    const VALIDATE_DIRECTIVES: bool = true;

    fn validate_operation(&mut self, _operation: &OperationDefinition) -> DiagnosticsResult<()> {
        Ok(())
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        if self.resolver_fragments.contains(&fragment.name.item) {
            self.current_fragment = Some(fragment.clone());
            let result = self.default_validate_fragment(fragment);
            self.current_fragment = None;

            result
        } else {
            Ok(())
        }
    }

    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> DiagnosticsResult<()> {
        let fragment_definition = self.program.fragment(spread.fragment.item);
        if let Some(fragment_def) = fragment_definition {
            // Resolver-authored RSC fields receive an opaque fragment ref and
            // read it through useServerFragment. Unlike ordinary Relay
            // Resolvers, that execution model intentionally supports masked
            // server/client composition and preserves the fragment boundary
            // needed for an independently suspending @defer child.
            if self.current_fragment.as_ref().is_some_and(|fragment| {
                self.rsc_resolver_fragments.contains(&fragment.name.item)
                    && !self
                        .non_rsc_resolver_fragments
                        .contains(&fragment.name.item)
            }) {
                return Ok(());
            }
            if fragment_def
                .directives
                .named(*INLINE_DIRECTIVE_NAME)
                .is_some()
                || RelayDirective::is_unmasked_fragment_spread(spread)
            {
                return Ok(());
            }

            return Err(vec![
                Diagnostic::error(
                    ValidationMessage::UnsupportedFragmentSpreadInResolverFragment,
                    spread.fragment.location,
                )
                .annotate("Fragment is defined", fragment_def.name.location),
            ]);
        }

        Ok(())
    }

    fn validate_variable(&mut self, variable: &Variable) -> DiagnosticsResult<()> {
        let current_fragment = self.current_fragment.as_ref().unwrap();
        if !current_fragment
            .variable_definitions
            .iter()
            .any(|var| var.name.item == variable.name.item)
        {
            return Err(vec![Diagnostic::error(
                ValidationMessage::UnsupportedGlobalVariablesInResolverFragment {
                    variable_name: variable.name.item,
                    fragment_name: current_fragment.name.item,
                },
                variable.name.location,
            )]);
        }

        Ok(())
    }
}
