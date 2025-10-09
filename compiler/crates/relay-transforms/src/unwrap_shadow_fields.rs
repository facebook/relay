/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Unwrap Shadow Fields Transform
//!
//! This transform unwraps shadow field inline fragments for the reader variant.
//! Shadow field inline fragments contain conditional selections with aliased fields.
//! This transform:
//! 1. Finds inline fragments with ShadowFieldMetadata
//! 2. Unwraps them by promoting their conditional selections to the parent level
//! 3. Adds aliases to the inner fields to match the original field name from metadata

use common::WithLocation;
use graphql_ir::Condition;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use std::sync::Arc;

use crate::ShadowFieldMetadata;

/// Transform to unwrap shadow field inline fragments in the reader variant.
/// This makes shadow fields appear as regular conditional fields with proper aliases.
pub fn unwrap_shadow_fields(program: &Program) -> Program {
    let mut transform = UnwrapShadowFieldsTransform::new();
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct UnwrapShadowFieldsTransform;

impl UnwrapShadowFieldsTransform {
    fn new() -> Self {
        Self
    }
}

impl<'a> Transformer<'a> for UnwrapShadowFieldsTransform {
    const NAME: &'static str = "UnwrapShadowFieldsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        // Check if this inline fragment has shadow field metadata
        if let Some(shadow_field_metadata) = ShadowFieldMetadata::find(&fragment.directives) {
            // Shadow field inline fragments contain conditional selections,
            // each with exactly one field (scalar or linked)
            let transformed_selections: Vec<Selection> = fragment
                .selections
                .iter()
                .map(|selection| {
                    match selection {
                        Selection::Condition(condition) => {
                            // Assert exactly one selection in the condition
                            assert_eq!(
                                condition.selections.len(),
                                1,
                                "Expected exactly one selection in shadow field condition, found {}",
                                condition.selections.len()
                            );

                            let inner_selection = &condition.selections[0];

                            // Clone the condition with the aliased inner field
                            let aliased_inner = match inner_selection {
                                Selection::ScalarField(field) => {
                                    Selection::ScalarField(Arc::new(ScalarField {
                                        alias: Some(WithLocation::generated(
                                            shadow_field_metadata.original_field_name,
                                        )),
                                        definition: field.definition,
                                        arguments: field.arguments.clone(),
                                        directives: field.directives.clone(),
                                    }))
                                }
                                Selection::LinkedField(field) => {
                                    // Recursively transform the nested selections
                                    let transformed_field = self.default_transform_linked_field(field);
                                    let transformed_field_arc = match transformed_field {
                                        Transformed::Keep => field.clone(),
                                        Transformed::Replace(Selection::LinkedField(f)) => f,
                                        _ => panic!("Expected linked field transformation to return linked field"),
                                    };
                                    
                                    Selection::LinkedField(Arc::new(LinkedField {
                                        alias: Some(WithLocation::generated(
                                            shadow_field_metadata.original_field_name,
                                        )),
                                        definition: transformed_field_arc.definition,
                                        arguments: transformed_field_arc.arguments.clone(),
                                        directives: transformed_field_arc.directives.clone(),
                                        selections: transformed_field_arc.selections.clone(),
                                    }))
                                }
                                _ => panic!(
                                    "Expected scalar or linked field in shadow field condition, got: {:?}",
                                    inner_selection
                                ),
                            };

                            Selection::Condition(Arc::new(Condition {
                                selections: vec![aliased_inner],
                                value: condition.value.clone(),
                                passing_value: condition.passing_value,
                                location: condition.location,
                            }))
                        }
                        _ => panic!(
                            "Expected Condition selection in shadow field inline fragment, got: {:?}",
                            selection
                        ),
                    }
                })
                .collect();

            // Return the transformed selections as a replacement, effectively unwrapping the inline fragment
            Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                type_condition: None, // Remove type condition when unwrapping
                directives: vec![],   // Remove metadata directive
                selections: transformed_selections,
                spread_location: fragment.spread_location,
            })))
        } else {
            // Not a shadow field inline fragment, use default transformation
            self.default_transform_inline_fragment(fragment)
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_unwrap_shadow_fields_transform() {
        // Basic test to ensure the transform compiles
        // More comprehensive tests would be in fixture tests
    }
}
