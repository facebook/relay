/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use errors::validate;
use fnv::FnvHashMap;
use graphql_ir::FragmentSpread;
use graphql_ir::{
    ConstantValue, Directive, FragmentDefinition, OperationDefinition, Program, ValidationError,
    ValidationMessage, ValidationResult, Validator, Value, VariableDefinition,
};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;

pub fn validate_relay_directives<'s>(program: &Program<'s>) -> ValidationResult<()> {
    let mut validator = RelayDirectiveValidation::new(program);
    validator.validate_program(program)
}

enum ArgumentDefinition<'ir> {
    Global(&'ir VariableDefinition),
    Local(&'ir VariableDefinition),
}

// This validtes both @relay(plural) and @relay(mask) usages
struct RelayDirectiveValidation<'s> {
    program: &'s Program<'s>,
    // TODO(T63626938): This assumes that each document is processed serially (not in parallel or concurrently)
    current_reachable_arguments: Vec<&'s VariableDefinition>,
}

pub struct RelayDirectiveConstants {
    pub relay_directive_name: StringKey,
    pub plural_arg_name: StringKey,
    pub mask_arg_name: StringKey,
}

impl Default for RelayDirectiveConstants {
    fn default() -> Self {
        Self {
            relay_directive_name: "relay".intern(),
            plural_arg_name: "plural".intern(),
            mask_arg_name: "mask".intern(),
        }
    }
}

lazy_static! {
    pub static ref RELAY_DIRECTIVE_CONSTANTS: RelayDirectiveConstants = Default::default();
}

pub fn extract_relay_directive(directives: &'_ [Directive]) -> Option<&'_ Directive> {
    directives
        .iter()
        .find(|directive| directive.name.item == RELAY_DIRECTIVE_CONSTANTS.relay_directive_name)
}

impl<'s> RelayDirectiveValidation<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self {
            program,
            current_reachable_arguments: Default::default(),
        }
    }

    /// For ...Fragment @relay(mask:false), disallow fragments with directives or local variables
    fn validate_unmask_fragment_spread(&mut self, spread: &FragmentSpread) -> ValidationResult<()> {
        let mut errs = vec![];
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        if !(fragment.directives.is_empty()
            || fragment.directives.len() == 1
                && fragment.directives[0].name.item
                    == RELAY_DIRECTIVE_CONSTANTS.relay_directive_name)
        {
            errs.push(ValidationError::new(
                ValidationMessage::InvalidUnmaskOnFragmentWithDirectives(),
                vec![spread.fragment.location, fragment.name.location],
            ))
        }
        if !fragment.variable_definitions.is_empty() {
            errs.push(ValidationError::new(
                ValidationMessage::InvalidUnmaskOnFragmentWithArguments(),
                vec![spread.fragment.location, fragment.name.location],
            ))
        }
        self.current_reachable_arguments
            .extend(&fragment.used_global_variables);
        if errs.is_empty() {
            Ok(())
        } else {
            Err(errs)
        }
    }

    /// For all reachable arguments in the unmaksed fragments, validate that for the variables with the same name:
    /// 1. They are either all global argument or all local arguments
    /// 2. Their types should be same, or one is the subset of the
    fn validate_reachable_arguments(
        &self,
        map: &mut FnvHashMap<StringKey, ArgumentDefinition<'s>>,
    ) -> ValidationResult<()> {
        let mut errs = vec![];
        for arg in &self.current_reachable_arguments {
            if let Some(prev_arg) = map.get(&arg.name.item) {
                match prev_arg {
                    ArgumentDefinition::Local(prev_arg) => errs.push(ValidationError::new(
                        ValidationMessage::InvalidUnmaskOnLocalAndGloablVariablesWithSameName(),
                        vec![prev_arg.name.location, arg.name.location],
                    )),
                    ArgumentDefinition::Global(prev_arg) => {
                        if !self
                            .program
                            .schema()
                            .is_type_subtype_of(&prev_arg.type_, &arg.type_)
                            && !self
                                .program
                                .schema()
                                .is_type_subtype_of(&arg.type_, &prev_arg.type_)
                        {
                            errs.push(ValidationError::new(
                                ValidationMessage::InvalidUnmaskOnVariablesOfIncompatibleTypesWithSameName{
                                    prev_arg_type: self.program.schema().get_type_string(&prev_arg.type_),
                                    next_arg_type: self.program.schema().get_type_string(&arg.type_),
                                },
                                vec![prev_arg.name.location, arg.name.location],
                            ))
                        }
                    }
                }
            } else {
                map.insert(arg.name.item, ArgumentDefinition::Global(arg));
            }
        }
        if errs.is_empty() {
            Ok(())
        } else {
            Err(errs)
        }
    }

    fn validate_relay_directives(&self, directives: &[Directive]) -> ValidationResult<()> {
        let mut errs = vec![];
        if let Some(directive) = extract_relay_directive(directives) {
            for arg in &directive.arguments {
                if arg.name.item == RELAY_DIRECTIVE_CONSTANTS.plural_arg_name
                    || arg.name.item == RELAY_DIRECTIVE_CONSTANTS.mask_arg_name
                {
                    match arg.value.item {
                        Value::Constant(ConstantValue::Boolean(_))
                        | Value::Constant(ConstantValue::Null()) => {}
                        _ => errs.push(ValidationError::new(
                            ValidationMessage::InvalidRelayDirectiveArg(arg.name.item),
                            vec![arg.value.location],
                        )),
                    }
                }
            }
        }
        if errs.is_empty() {
            Ok(())
        } else {
            Err(errs)
        }
    }
}

impl<'s> Validator for RelayDirectiveValidation<'s> {
    const NAME: &'static str = "RelayDirectiveValidation";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> ValidationResult<()> {
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

    fn validate_operation(&mut self, operation: &OperationDefinition) -> ValidationResult<()> {
        // Initialize arguments state for @relay(mask: false),
        self.current_reachable_arguments = Default::default();
        validate!(
            self.default_validate_operation(&operation),
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

    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> ValidationResult<()> {
        validate!(
            if let Some(directive) = extract_relay_directive(&spread.directives) {
                let mask_argument = directive
                    .arguments
                    .iter()
                    .find(|arg| arg.name.item == RELAY_DIRECTIVE_CONSTANTS.mask_arg_name);
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
                        _ => Err(vec![ValidationError::new(
                            ValidationMessage::InvalidRelayDirectiveArg(arg.name.item),
                            vec![spread.fragment.location, arg.value.location],
                        )]),
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
