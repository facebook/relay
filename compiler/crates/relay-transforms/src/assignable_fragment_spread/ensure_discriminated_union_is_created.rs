/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use common::{Diagnostic, DiagnosticsResult, Location};
use graphql_ir::{InlineFragment, LinkedField, Selection};
use schema::{SDLSchema, Schema, Type};

use super::errors::ValidationMessage;

/// Ensure that a discriminated union is created by ensuring that
/// * the linked field has an abstract type
/// * the linked field only contains inline fragments with no directives,
///   which refine the type to a unique concrete type and contain an unaliased
///   __typename field with no directives.
pub(super) fn ensure_discriminated_union_is_created(
    schema: &SDLSchema,
    linked_field: &LinkedField,
    reason_message: &'static str,
) -> DiagnosticsResult<()> {
    let mut errors = vec![];
    let type_reference = &schema.field(linked_field.definition.item).type_;

    if !type_reference.inner().is_abstract_type() {
        errors.push(Diagnostic::error(
            ValidationMessage::EnsureDiscriminatedUnionConcreteOuterLinkedField {
                reason_message,
                linked_field_type: schema.get_type_name(type_reference.inner()),
                linked_field_type_variant: match type_reference.inner() {
                    Type::Enum(_) => "Enum",
                    Type::InputObject(_) => "InputObject",
                    Type::Interface(_) => "Interface",
                    Type::Object(_) => "Object",
                    Type::Scalar(_) => "Scalar",
                    Type::Union(_) => "Union",
                }
                .to_string(),
            },
            linked_field.definition.location,
        ));
    }

    let mut encountered_type_conditions = HashSet::new();
    for selection in linked_field.selections.iter() {
        match selection {
            Selection::InlineFragment(inline_fragment) => {
                if let Err(e) = ensure_inline_fragment_is_valid(
                    schema,
                    inline_fragment,
                    linked_field.definition.location,
                    &mut encountered_type_conditions,
                    reason_message,
                ) {
                    errors.extend(e.into_iter());
                }
            }
            _ => errors.push(Diagnostic::error(
                ValidationMessage::EnsureDiscriminatedUnionNonInlineFragment { reason_message },
                linked_field.definition.location,
            )),
        }
    }

    if !errors.is_empty() {
        Err(errors)
    } else {
        Ok(())
    }
}

/// Ensure that the given inline fragment has a concrete type condition and contains an unaliased
/// __typename field with no directives, and that the inline fragment has no directives. Ensure
/// that no concrete type conditions are repeated.
fn ensure_inline_fragment_is_valid(
    schema: &SDLSchema,
    inline_fragment: &InlineFragment,
    linked_field_location: Location,
    encountered_type_conditions: &mut HashSet<Type>,
    reason_message: &'static str,
) -> DiagnosticsResult<()> {
    let mut errors = vec![];

    // All inline fragments must have type conditions refining to a distinct concrete type
    if let Some(type_condition) = inline_fragment.type_condition {
        if type_condition.is_abstract_type() {
            errors.push(Diagnostic::error(
                ValidationMessage::EnsureDiscriminatedUnionInlineFragmentNotRefineToConcreteType {
                    reason_message,
                },
                linked_field_location,
            ));
        } else {
            if encountered_type_conditions.contains(&type_condition) {
                errors.push(Diagnostic::error(
                        ValidationMessage::EnsureDiscriminatedUnionInlineFragmentDuplicateConcreteTypeRefinement {
							reason_message,
                            concrete_type: schema.get_type_name(type_condition),
                        },
                        linked_field_location
                    ))
            }
            encountered_type_conditions.insert(type_condition);
        }
    } else {
        errors.push(Diagnostic::error(
            ValidationMessage::EnsureDiscriminatedUnionInlineFragmentNotRefineToConcreteType {
                reason_message,
            },
            linked_field_location,
        ));
    }

    // If we don't find an unaliased __typename field with no directives, emit an error
    if !inline_fragment
        .selections
        .iter()
        .any(|selection| match selection {
            Selection::ScalarField(scalar_field) => {
                scalar_field.alias.is_none()
                    && scalar_field.definition.item == schema.typename_field()
                    && scalar_field.directives.is_empty()
            }
            _ => false,
        })
    {
        errors.push(Diagnostic::error(
            ValidationMessage::EnsureDiscriminatedUnionInlineFragmentNoValidTypename {
                reason_message,
            },
            linked_field_location,
        ));
    }

    if !inline_fragment.directives.is_empty() {
        errors.push(Diagnostic::error(
            ValidationMessage::EnsureDiscriminatedUnionNoInlineFragmentWithDirectives {
                reason_message,
            },
            linked_field_location,
        ));
    }

    if !errors.is_empty() {
        Err(errors)
    } else {
        Ok(())
    }
}
