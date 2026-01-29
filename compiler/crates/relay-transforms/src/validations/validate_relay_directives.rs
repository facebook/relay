/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use errors::validate;
use graphql_ir::ConstantValue;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ValidationMessage;
use graphql_ir::Validator;
use graphql_ir::Value;
use graphql_ir::VariableDefinition;
use graphql_ir::VariableName;
use schema::Schema;

use crate::generate_relay_resolvers_root_fragment_split_operation::IsResolverRootFragment;
use crate::relay_directive::MASK_ARG_NAME;
use crate::relay_directive::PLURAL_ARG_NAME;
use crate::relay_directive::RELAY_DIRECTIVE_NAME;
use crate::should_generate_hack_preloader;

pub fn validate_relay_directives(program: &Program) -> DiagnosticsResult<()> {
    let mut validator = RelayDirectiveValidation::new(program);
    validator.validate_program(program)
}

enum ArgumentDefinition<'ir> {
    Global(&'ir VariableDefinition),
    Local(&'ir VariableDefinition),
}

// This validates both @relay(plural) and @relay(mask) usages
struct RelayDirectiveValidation<'program> {
    program: &'program Program,
    // TODO(T63626938): This assumes that each document is processed serially (not in parallel or concurrently)
    current_reachable_arguments: Vec<&'program VariableDefinition>,
}

fn find_relay_directive(directives: &[Directive]) -> Option<&Directive> {
    directives.named(*RELAY_DIRECTIVE_NAME)
}

impl<'program> RelayDirectiveValidation<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            current_reachable_arguments: Default::default(),
        }
    }

    /// For ...Fragment @relay(mask:false), disallow fragments with directives or local variables
    fn validate_unmask_fragment_spread(
        &mut self,
        spread: &FragmentSpread,
    ) -> DiagnosticsResult<()> {
        let mut errs = vec![];
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        let incompatible_directives = fragment
            .directives
            .iter()
            .filter(|directive| {
                directive.name.item != *RELAY_DIRECTIVE_NAME
                    && directive.name.item != IsResolverRootFragment::directive_name()
            })
            .collect::<Vec<_>>();

        if !incompatible_directives.is_empty() {
            let mut error = Diagnostic::error(
                ValidationMessage::InvalidUnmaskOnFragmentWithDirectives,
                spread.fragment.location,
            );
            for directive in incompatible_directives {
                error = error.annotate(
                    format!("related '{}' directive", directive.name.item),
                    directive.name.location,
                );
            }
            errs.push(error)
        }

        self.current_reachable_arguments
            .extend(&fragment.used_global_variables);
        if errs.is_empty() { Ok(()) } else { Err(errs) }
    }

    /// For all reachable arguments in the unmaksed fragments, validate that for the variables with the same name:
    /// 1. They are either all global argument or all local arguments
    /// 2. Their types should be same, or one is the subset of the
    fn validate_reachable_arguments(
        &self,
        map: &mut HashMap<VariableName, ArgumentDefinition<'program>>,
    ) -> DiagnosticsResult<()> {
        let mut errs = vec![];
        for arg in &self.current_reachable_arguments {
            if let Some(prev_arg) = map.get(&arg.name.item) {
                match prev_arg {
                    ArgumentDefinition::Local(prev_arg) => errs.push(
                        Diagnostic::error(
                            ValidationMessage::InvalidUnmaskOnLocalAndGloablVariablesWithSameName,
                            prev_arg.name.location,
                        )
                        .annotate("related location", arg.name.location),
                    ),
                    ArgumentDefinition::Global(prev_arg) => {
                        if !self
                            .program
                            .schema
                            .is_type_subtype_of(&prev_arg.type_, &arg.type_)
                            && !self
                                .program
                                .schema
                                .is_type_subtype_of(&arg.type_, &prev_arg.type_)
                        {
                            errs.push(Diagnostic::error(
                                ValidationMessage::InvalidUnmaskOnVariablesOfIncompatibleTypesWithSameName{
                                    prev_arg_type: self.program.schema.get_type_string(&prev_arg.type_),
                                    next_arg_type: self.program.schema.get_type_string(&arg.type_),
                                },
                                prev_arg.name.location,
                            ).annotate("related location", arg.name.location))
                        }
                    }
                }
            } else {
                map.insert(arg.name.item, ArgumentDefinition::Global(arg));
            }
        }
        if errs.is_empty() { Ok(()) } else { Err(errs) }
    }

    fn validate_relay_directives(&self, directives: &[Directive]) -> DiagnosticsResult<()> {
        let mut errs = vec![];
        if let Some(directive) = find_relay_directive(directives) {
            for arg in &directive.arguments {
                if arg.name.item == *PLURAL_ARG_NAME || arg.name.item == *MASK_ARG_NAME {
                    match arg.value.item {
                        Value::Constant(ConstantValue::Boolean(_))
                        | Value::Constant(ConstantValue::Null()) => {}
                        _ => errs.push(Diagnostic::error(
                            ValidationMessage::InvalidRelayDirectiveArg(arg.name.item),
                            arg.value.location,
                        )),
                    }
                }
            }
        }
        if errs.is_empty() { Ok(()) } else { Err(errs) }
    }
}

impl Validator for RelayDirectiveValidation<'_> {
    const NAME: &'static str = "RelayDirectiveValidation";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        // Initialize arguments state for @relay(mask: false),
        self.current_reachable_arguments = Default::default();
        validate!(
            self.default_validate_fragment(fragment),
            self.validate_relay_directives(&fragment.directives),
            if self.current_reachable_arguments.is_empty() {
                Ok(())
            } else {
                let mut map: HashMap<VariableName, _> = Default::default();
                for variable in &fragment.used_global_variables {
                    map.insert(variable.name.item, ArgumentDefinition::Global(variable));
                }
                for variable in &fragment.variable_definitions {
                    map.insert(variable.name.item, ArgumentDefinition::Local(variable));
                }
                self.validate_reachable_arguments(&mut map)
            }
        )
    }

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        // Initialize arguments state for @relay(mask: false),
        self.current_reachable_arguments = Default::default();
        validate!(
            self.default_validate_operation(operation),
            should_generate_hack_preloader(operation).map(|_| ()),
            if self.current_reachable_arguments.is_empty() {
                Ok(())
            } else {
                let mut map: HashMap<VariableName, _> = Default::default();
                for variable in &operation.variable_definitions {
                    map.insert(variable.name.item, ArgumentDefinition::Global(variable));
                }
                self.validate_reachable_arguments(&mut map)
            }
        )
    }

    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> DiagnosticsResult<()> {
        validate!(
            if let Some(directive) = find_relay_directive(&spread.directives) {
                let mask_argument = directive.arguments.named(*MASK_ARG_NAME);
                if let Some(arg) = mask_argument {
                    match arg.value.item {
                        Value::Constant(ConstantValue::Boolean(val)) => {
                            if val {
                                Ok(())
                            } else {
                                self.validate_unmask_fragment_spread(spread)
                            }
                        }
                        Value::Constant(ConstantValue::Null()) => Ok(()),
                        _ => Err(vec![
                            Diagnostic::error(
                                ValidationMessage::InvalidRelayDirectiveArg(arg.name.item),
                                spread.fragment.location,
                            )
                            .annotate("related location", arg.value.location),
                        ]),
                    }
                } else {
                    Ok(())
                }
            } else {
                Ok(())
            },
            self.default_validate_fragment_spread(spread)
        )
    }
}
