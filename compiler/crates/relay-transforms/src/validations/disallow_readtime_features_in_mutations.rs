/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlag;
use common::NamedItem;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use graphql_ir::ConstantValue;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::ValidationMessage;
use graphql_ir::Validator;
use schema::Schema;

use crate::ACTION_ARGUMENT;
use crate::REQUIRED_DIRECTIVE_NAME;
use crate::THROW_ACTION;

/// Some Relay features will cause a field to throw or suspend at read time.
/// These behaviors are incompatible with our mutation APIs.
/// This validator checks that no such features are used in mutations.
pub fn disallow_readtime_features_in_mutations(
    program: &Program,
    allow_resolvers_mutation_response: &FeatureFlag,
    allow_required_in_mutation_response: &FeatureFlag,
    enable_relay_resolver_mutations: bool,
) -> DiagnosticsResult<()> {
    let mut validator = DisallowReadtimeFeaturesInMutations::new(
        program,
        allow_resolvers_mutation_response.clone(),
        allow_required_in_mutation_response.clone(),
        enable_relay_resolver_mutations,
    );
    validator.validate_program(program)
}

struct DisallowReadtimeFeaturesInMutations<'program> {
    program: &'program Program,
    allow_resolvers_mutation_response: FeatureFlag,
    allow_required_in_mutation_response: FeatureFlag,
    enable_relay_resolver_mutations: bool,
    allow_resolvers_for_this_mutation: bool,
    allow_required_for_this_mutation: bool,
}

impl<'program> DisallowReadtimeFeaturesInMutations<'program> {
    fn new(
        program: &'program Program,
        allow_resolvers_mutation_response: FeatureFlag,
        allow_required_in_mutation_response: FeatureFlag,
        enable_relay_resolver_mutations: bool,
    ) -> Self {
        Self {
            program,
            allow_resolvers_mutation_response,
            allow_required_in_mutation_response,
            enable_relay_resolver_mutations,
            allow_resolvers_for_this_mutation: false,
            allow_required_for_this_mutation: false,
        }
    }

    fn validate_field(&self, field: &impl Field) -> DiagnosticsResult<()> {
        if !self.allow_required_for_this_mutation
            && let Some(directive) = field.directives().named(*REQUIRED_DIRECTIVE_NAME)
        {
            let action = directive
                .arguments
                .named(*ACTION_ARGUMENT)
                .and_then(|arg| arg.value.item.get_constant());
            if let Some(ConstantValue::Enum(action)) = action
                && *action == *THROW_ACTION
            {
                return Err(vec![Diagnostic::error(
                    ValidationMessage::RequiredInMutation,
                    directive.location,
                )]);
            }
        }
        if !self.allow_resolvers_for_this_mutation
            && self
                .program
                .schema
                .field(field.definition().item)
                .directives
                .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
                .is_some()
        {
            return Err(vec![Diagnostic::error(
                ValidationMessage::ResolverInMutation,
                field.alias_or_name_location(),
            )]);
        }

        Ok(())
    }
}

impl Validator for DisallowReadtimeFeaturesInMutations<'_> {
    const NAME: &'static str = "disallow_readtime_features_in_mutations";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        if !operation.is_mutation() {
            // No need to traverse into non-mutation operations
            return Ok(());
        }
        self.allow_resolvers_for_this_mutation = self.enable_relay_resolver_mutations
            || self
                .allow_resolvers_mutation_response
                .is_enabled_for(operation.name.item.0);
        self.allow_required_for_this_mutation = self
            .allow_required_in_mutation_response
            .is_enabled_for(operation.name.item.0);
        let result = self.default_validate_operation(operation);

        // Reset state
        self.allow_resolvers_for_this_mutation = false;
        self.allow_required_for_this_mutation = false;

        result
    }

    fn validate_fragment(&mut self, _fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        // We only care about mutations
        Ok(())
    }

    fn validate_fragment_spread(&mut self, _spread: &FragmentSpread) -> DiagnosticsResult<()> {
        // Values nested within fragment spreads are fine since they are not read as part of the
        // mutation response.
        Ok(())
    }

    fn validate_scalar_field(&mut self, field: &ScalarField) -> DiagnosticsResult<()> {
        self.validate_field(field)
    }
    fn validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        self.validate_field(field)?;
        self.default_validate_linked_field(field)
    }
}
