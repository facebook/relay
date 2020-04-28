/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::match_::MATCH_CONSTANTS;
use common::Location;
use errors::{validate, validate_map};
use fnv::FnvHashMap;
use graphql_ir::{
    LinkedField, NamedItem, Program, Selection, ValidationError, ValidationMessage,
    ValidationResult, Validator,
};
use schema::Type;

/// Validate that after flattening, there are no @module selections on the same type, and
/// under the same linked field, but have different arguments.
pub fn validate_module_conflicts<'s>(program: &Program<'s>) -> ValidationResult<()> {
    let mut validator = ValidateModuleConflicts {};
    validator.validate_program(program)
}

type SeenTypes = FnvHashMap<Type, Location>;
struct ValidateModuleConflicts;

impl Validator for ValidateModuleConflicts {
    const NAME: &'static str = "ValidateModuleConflicts";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    /// ModuleImport should be in InlineFragment selections in a LinkedField.
    /// If the @module have the same input, they would have been flattened into one
    /// inline fragment selection of the same type. So this validation checks for
    /// multiple inline fragment with @module on the same type.
    fn validate_linked_field(&mut self, field: &LinkedField) -> ValidationResult<()> {
        if field.selections.len() > 1 {
            let mut seen_type = SeenTypes::default();
            validate!(
                validate_map(&field.selections, |selection| {
                    validate_selection(selection, &mut seen_type)
                }),
                self.default_validate_linked_field(field)
            )
        } else {
            self.default_validate_linked_field(field)
        }
    }
}

fn validate_selection(selection: &Selection, seen_types: &mut SeenTypes) -> ValidationResult<()> {
    if let Selection::InlineFragment(inline_frag) = selection {
        if let Some(type_) = inline_frag.type_condition {
            if let Some(module_directive) = inline_frag
                .directives
                .named(MATCH_CONSTANTS.custom_module_directive_name)
            {
                if let Some(location) = seen_types.get(&type_) {
                    let error = ValidationError::new(
                        ValidationMessage::ConflictingModuleSelections,
                        vec![module_directive.name.location, *location],
                    );
                    return Err(vec![error]);
                } else {
                    seen_types.insert(type_, module_directive.name.location);
                }
            }
        }
    }
    Ok(())
}
