/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::ArgumentName;
use common::Location;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::Directive;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use intern::string_key::Intern;

use super::extract_values_from_handle_field_directive;
use crate::extract_handle_field_directives;

/// This transform applies field argument updates for client handle fields:
/// - If filters is not set, existing arguments are removed.
/// - If filters is set, only the arguments in the filter array are kept.
/// - If dynamicKey is set, a new __dynamicKey argument is added.
pub fn handle_field_transform(program: &Program) -> Program {
    let mut transform = HandleFieldTransform;
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct HandleFieldTransform;

impl HandleFieldTransform {
    fn update_arguments(
        &self,
        arguments: &mut Vec<Argument>,
        handle_directive: &Directive,
        location: Location,
    ) {
        let handle_values = extract_values_from_handle_field_directive(handle_directive);
        if let Some(filters) = handle_values.filters {
            arguments.retain(|arg| filters.contains(&arg.name.item.0));
        } else {
            arguments.clear();
        };
        if let Some(dynamic_key) = handle_values.dynamic_key {
            arguments.push(Argument {
                name: WithLocation::new(location, ArgumentName("__dynamicKey".intern())),
                value: WithLocation::new(location, dynamic_key),
            });
        }
    }
}

impl Transformer<'_> for HandleFieldTransform {
    const NAME: &'static str = "HandleFieldTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let transformed_field = self.default_transform_scalar_field(field);
        let mut handle_field_directives = extract_handle_field_directives(&field.directives);
        if let Some(handle_directive) = handle_field_directives.next() {
            if let Some(other_handle_directive) = handle_field_directives.next() {
                panic!(
                    "Expected at most one handle directive, got `{handle_directive:?}` and `{other_handle_directive:?}`."
                );
            }
            let mut transformed_field = match transformed_field {
                Transformed::Replace(Selection::ScalarField(scalar_field)) => {
                    (*scalar_field).clone()
                }
                Transformed::Keep => field.clone(),
                _ => panic!(
                    "HandleFieldTransform got unexpected transform result: `{transformed_field:?}`."
                ),
            };
            self.update_arguments(
                &mut transformed_field.arguments,
                handle_directive,
                transformed_field.definition.location,
            );
            Transformed::Replace(Selection::ScalarField(Arc::new(transformed_field)))
        } else {
            transformed_field
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let transformed_field = self.default_transform_linked_field(field);
        let mut handle_field_directives = extract_handle_field_directives(&field.directives);
        if let Some(handle_directive) = handle_field_directives.next() {
            if let Some(other_handle_directive) = handle_field_directives.next() {
                panic!(
                    "Expected at most one handle directive, got `{handle_directive:?}` and `{other_handle_directive:?}`."
                );
            }
            let mut transformed_field = match transformed_field {
                Transformed::Replace(Selection::LinkedField(linked_field)) => {
                    (*linked_field).clone()
                }
                Transformed::Keep => field.clone(),
                _ => panic!(
                    "HandleFieldTransform got unexpected transform result: `{transformed_field:?}`."
                ),
            };
            self.update_arguments(
                &mut transformed_field.arguments,
                handle_directive,
                transformed_field.definition.location,
            );
            Transformed::Replace(Selection::LinkedField(Arc::new(transformed_field)))
        } else {
            transformed_field
        }
    }
}
