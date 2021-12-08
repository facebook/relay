/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{
    relay_directive::{MASK_ARG_NAME, PLURAL_ARG_NAME, RELAY_DIRECTIVE_NAME},
    should_generate_hack_preloader,
};
use common::{Diagnostic, DiagnosticsResult, NamedItem};
use errors::validate;
use fnv::FnvHashMap;
use graphql_ir::{
    ConstantValue, Directive, FragmentDefinition, FragmentSpread, OperationDefinition, Program,
    ValidationMessage, Validator, Value, VariableDefinition,
};
use intern::string_key::StringKey;
use schema::Schema;

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
        if !(fragment.directives.is_empty()
            || fragment.directives.len() == 1
                && fragment.directives[0].name.item == *RELAY_DIRECTIVE_NAME)
        {
            errs.push(
                Diagnostic::error(
                    ValidationMessage::InvalidUnmaskOnFragmentWithDirectives(),
                    spread.fragment.location,
                )
                .annotate("related location", fragment.name.location),
            )
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
        map: &mut FnvHashMap<StringKey, ArgumentDefinition<'program>>,
    ) -> DiagnosticsResult<()> {
        let mut errs = vec![];
        for arg in &self.current_reachable_arguments {
            if let Some(prev_arg) = map.get(&arg.name.item) {
                match prev_arg {
                    ArgumentDefinition::Local(prev_arg) => errs.push(
                        Diagnostic::error(
                            ValidationMessage::InvalidUnmaskOnLocalAndGloablVariablesWithSameName(),
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
                let mut map = FnvHashMap::default();
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
                let mut map = FnvHashMap::default();
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
