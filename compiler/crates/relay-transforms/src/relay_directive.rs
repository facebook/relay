/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::NamedItem;
use graphql_ir::*;
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref RELAY_DIRECTIVE_NAME: StringKey = "relay".intern();
    pub static ref PLURAL_ARG_NAME: StringKey = "plural".intern();
    pub static ref MASK_ARG_NAME: StringKey = "mask".intern();
}

/// Easy access to the arguments of the @relay directive.
///
///   directive @relay(
///     mask: Boolean
///     plural: Boolean
///   ) on FRAGMENT_DEFINITION | FRAGMENT_SPREAD
pub struct RelayDirective {
    /// Note: this is the negated value of the directive as it makes more sense
    /// to default to false.
    pub unmask: bool,
    pub plural: bool,
}

impl RelayDirective {
    /// Returns true for a fragment spread that should not be masked, i.e.:
    /// ...User @relay(mask: false)
    pub fn is_unmasked_fragment_spread(fragment_spread: &FragmentSpread) -> bool {
        Self::has_unmasked_directive(&fragment_spread.directives)
    }

    pub fn is_unmasked_fragment_definition(fragment_definition: &FragmentDefinition) -> bool {
        Self::has_unmasked_directive(&fragment_definition.directives)
    }

    /// Tries to find a @relay directive and parses the directive into a struct.
    /// Panics on unknown @relay arguments or arguments with invalid values.
    /// Validation should happen on the IR before.
    pub fn find(directives: &[Directive]) -> Option<Self> {
        if let Some(relay_directive) = directives.named(*RELAY_DIRECTIVE_NAME) {
            let mut unmask = false;
            let mut plural = false;
            for arg in &relay_directive.arguments {
                if arg.name.item == *MASK_ARG_NAME {
                    if let Value::Constant(ConstantValue::Boolean(arg_value)) = arg.value.item {
                        unmask = !arg_value;
                    } else {
                        panic!("Invalid @relay(mask: ...) directive argument: {:?}", arg);
                    }
                } else if arg.name.item == *PLURAL_ARG_NAME {
                    if let Value::Constant(ConstantValue::Boolean(arg_value)) = arg.value.item {
                        plural = arg_value;
                    } else {
                        panic!("Invalid @relay(plural: ...) directive argument: {:?}", arg);
                    }
                } else {
                    panic!("Invalid @relay directive argument: {:?}", arg);
                }
            }
            Some(RelayDirective { unmask, plural })
        } else {
            None
        }
    }

    fn has_unmasked_directive(directives: &[Directive]) -> bool {
        if let Some(relay_directive) = directives.named(*RELAY_DIRECTIVE_NAME) {
            if let Some(mask_arg) = relay_directive.arguments.named(*MASK_ARG_NAME) {
                if let Value::Constant(ConstantValue::Boolean(arg_value)) = mask_arg.value.item {
                    return !arg_value;
                } else {
                    panic!(
                        "Invalid @relay(mask: ...) directive argument: {:?}",
                        mask_arg
                    );
                }
            }
        }
        false
    }
}
