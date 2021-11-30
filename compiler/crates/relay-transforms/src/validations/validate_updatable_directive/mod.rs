/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use super::validate_assignable_directive::ASSIGNABLE_DIRECTIVE_NAME;
use common::{Diagnostic, DiagnosticsResult, Location, NamedItem};
use errors::{validate, validate_map};
use graphql_ir::{
    Condition, Directive, Field, FragmentDefinition, FragmentSpread, InlineFragment, LinkedField,
    OperationDefinition, Program, Selection, ValidationMessage, Validator,
};
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::Schema;

lazy_static! {
    pub static ref UPDATABLE_DIRECTIVE_NAME: StringKey = "updatable".intern();
    static ref ALLOW_LISTED_DIRECTIVES: Vec<StringKey> = vec![
        *UPDATABLE_DIRECTIVE_NAME,
        // TODO have a global list of directives...?
        "fb_owner".intern(),
    ];
}

pub fn validate_updatable_directive(program: &Program) -> DiagnosticsResult<()> {
    UpdatableDirective::new(program).validate_program(program)
}

#[derive(Copy, Clone)]
struct ExecutableDefinitionInfo {
    name: StringKey,
    location: Location,
    type_plural: &'static str,
}

struct UpdatableDirective<'a> {
    executable_definition_info: Option<ExecutableDefinitionInfo>,
    program: &'a Program,
}

impl<'a> UpdatableDirective<'a> {
    fn new(program: &'a Program) -> Self {
        Self {
            program,
            executable_definition_info: None,
        }
    }
}

fn filter_fragment_spreads<'a>(
    selections: impl Iterator<Item = &'a Selection>,
) -> impl Iterator<Item = &'a FragmentSpread> {
    selections.filter_map(|selection| {
        if let Selection::FragmentSpread(fragment_spread) = selection {
            Some(fragment_spread.as_ref())
        } else {
            None
        }
    })
}

fn filter_inline_fragments<'a>(
    selections: impl Iterator<Item = &'a Selection>,
) -> impl Iterator<Item = &'a InlineFragment> {
    selections.filter_map(|selection| {
        if let Selection::InlineFragment(inline_fragment) = selection {
            Some(inline_fragment.as_ref())
        } else {
            None
        }
    })
}

impl<'a> UpdatableDirective<'a> {
    fn validate_fragment_spreads_with_parent(
        &self,
        parent_field: &LinkedField,
        fragment_spreads: impl Iterator<Item = &'a FragmentSpread>,
    ) -> DiagnosticsResult<()> {
        let parent_field_id = parent_field.definition.item;
        let parent_named_type = self.program.schema.field(parent_field_id).type_.inner();
        validate_map(fragment_spreads, |fragment_spread| {
            let mut errors = vec![];

            if let Some(fragment) = self.program.fragments.get(&fragment_spread.fragment.item) {
                // Only fragments which are assignable can be spread.
                if fragment
                    .directives
                    .named(*ASSIGNABLE_DIRECTIVE_NAME)
                    .is_none()
                {
                    errors.push(Diagnostic::error(
                        ValidationMessage::UpdatableOnlyAssignableFragmentSpreads {
                            outer_type_plural: self.executable_definition_info.unwrap().type_plural,
                            fragment_name: fragment_spread.fragment.item,
                        },
                        fragment_spread.fragment.location,
                    ));
                }

                // Only fragment spreads whose type is equal to or a subtype of the parent field's type
                // are allowed. In other words, you can spread a fragment on User on a Node field,
                // because a User is always assignable to a Node, but you cannot spread a fragment
                // on Node on a User field, because a Node may not be assignable to a User.
                // Or, you can spread a Node on a Node.
                let fragment_type = fragment.type_condition;
                if !self
                    .program
                    .schema
                    .is_named_type_subtype_of(fragment_type, parent_named_type)
                {
                    errors.push(Diagnostic::error(
                        ValidationMessage::UpdatableSpreadOfAssignableFragmentMustBeEqualToOrSubtypeOfOuterField {
                            outer_type_plural: self.executable_definition_info.unwrap().type_plural,
                            fragment_type: self.program.schema.get_type_name(fragment_type),
                            field_type: self.program.schema.get_type_name(parent_named_type)
                        },
                        fragment_spread.fragment.location
                    ));
                }
            }
            // Note: if the fragment is not found, another validator will surface the error.

            // Assignable fragments cannot have arguments. This is checked in the assignable
            // validator.

            if errors.is_empty() {
                Ok(())
            } else {
                Err(errors)
            }
        })
    }

    fn validate_inline_fragments_with_parent(
        &self,
        parent_field: &LinkedField,
        // Cannot accept an iterator here because we need the length of the vec!
        fragment_spreads: Vec<&'a InlineFragment>,
    ) -> DiagnosticsResult<()> {
        // If we have no fragment spreads, return early
        if fragment_spreads.is_empty() {
            return Ok(());
        }

        // If a linked field contains inline fragments, it must *only* contain inline fragments.
        // This is because there exists a limitation of our typegen: if there are fields within
        // inline fragments with type refinements, and at the top-level, the parent field is not
        // emitted as a disjoint union where the key is the __typename field. Instead, the union
        // is flattened and every field is optional. This breaks type safety for updatable fragments,
        // as users would be able to assign to scalar fields that are not present on a given type.
        let mut errors = vec![];
        if parent_field.selections.len() != fragment_spreads.len() {
            errors.push(Diagnostic::error(
                ValidationMessage::UpdatableOnlyInlineFragments {
                    outer_type_plural: self.executable_definition_info.unwrap().type_plural,
                },
                parent_field.definition.location,
            ));
        }

        // Furthermore, inline fragments are only allowed if the parent type is an interface or union
        let parent_field_id = parent_field.definition.item;
        let parent_named_type = self.program.schema.field(parent_field_id).type_.inner();
        if !parent_named_type.is_abstract_type() {
            errors.push(Diagnostic::error(
                ValidationMessage::UpdatableInlineFragmentsOnlyOnInterfacesOrUnions {
                    outer_type_plural: self.executable_definition_info.unwrap().type_plural,
                },
                parent_field.definition.location,
            ));
        }

        let mut previously_encountered_concrete_types = HashSet::new();
        for fragment_spread in fragment_spreads.into_iter() {
            // A fragment spread on a linked field is valid iff:
            // - it contains a type condition
            // - that type condition is for a concrete type
            // - that concrete type has not occurred before
            // - it contains a typename field with no alias

            match fragment_spread.type_condition {
                None => errors.push(Diagnostic::error(
                    ValidationMessage::UpdatableInlineFragmentsRequireTypeConditions {
                        outer_type_plural: self.executable_definition_info.unwrap().type_plural,
                        parent_field_type: self.program.schema.get_type_name(parent_named_type),
                    },
                    parent_field.definition.location,
                )),
                Some(type_condition) => {
                    let type_condition_name = self.program.schema.get_type_name(type_condition);
                    if type_condition.is_abstract_type() {
                        errors.push(Diagnostic::error(
                            ValidationMessage::UpdatableInlineFragmentsTypeConditionsMustBeConcrete {
                                outer_type_plural: self.executable_definition_info.unwrap().type_plural,
                                type_condition: type_condition_name,
                            },
                            parent_field.definition.location,
                        ))
                    }

                    if previously_encountered_concrete_types.contains(&type_condition_name) {
                        errors.push(Diagnostic::error(
                            ValidationMessage::UpdatablePreviouslyEncounteredTypeCondition {
                                outer_type_plural: self
                                    .executable_definition_info
                                    .unwrap()
                                    .type_plural,
                                type_condition: type_condition_name,
                                parent_field_alias_or_name: parent_field
                                    .alias_or_name(&self.program.schema),
                            },
                            parent_field.definition.location,
                        ));
                    } else {
                        previously_encountered_concrete_types.insert(type_condition_name);
                    }
                }
            }

            // Attempt to find a typename field with no alias, in order to guarantee that
            // the linked field (parent_field) with fragment spreads is written by
            // relay-typegen as a disjoint union.
            if !fragment_spread.selections.iter().any(|selection| {
                if let Selection::ScalarField(scalar_field) = selection {
                    scalar_field.definition.item == self.program.schema.typename_field()
                        && scalar_field.alias.is_none()
                } else {
                    false
                }
            }) {
                errors.push(Diagnostic::error(
                    ValidationMessage::UpdatableInlineFragmentsMustHaveTypenameFields {
                        outer_type_plural: self.executable_definition_info.unwrap().type_plural,
                        parent_field_alias_or_name: parent_field
                            .alias_or_name(&self.program.schema),
                    },
                    parent_field.definition.location,
                ))
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }
}

impl<'a> Validator for UpdatableDirective<'a> {
    const NAME: &'static str = "UpdatableDirective";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = true;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        if operation
            .directives
            .named(*UPDATABLE_DIRECTIVE_NAME)
            .is_some()
        {
            self.executable_definition_info = Some(ExecutableDefinitionInfo {
                name: operation.name.item,
                location: operation.name.location,
                type_plural: "operations",
            });
            self.default_validate_operation(operation)
        } else {
            Ok(())
        }
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        if let Some(updatable_directive) = fragment.directives.named(*UPDATABLE_DIRECTIVE_NAME) {
            Err(vec![Diagnostic::error(
                ValidationMessage::UpdatableNotAllowedOnFragments,
                updatable_directive.name.location,
            )])
        } else {
            Ok(())
        }
    }

    fn validate_directive(&mut self, directive: &Directive) -> DiagnosticsResult<()> {
        if !ALLOW_LISTED_DIRECTIVES.contains(&directive.name.item) {
            Err(vec![Diagnostic::error(
                ValidationMessage::UpdatableDisallowOtherDirectives {
                    disallowed_directive_name: directive.name.item,
                    outer_type_plural: self.executable_definition_info.unwrap().type_plural,
                },
                directive.name.location,
            )])
        } else {
            Ok(())
        }
    }

    fn validate_linked_field(&mut self, linked_field: &LinkedField) -> DiagnosticsResult<()> {
        let fragment_spreads = filter_fragment_spreads(linked_field.selections.iter());
        let inline_fragments = filter_inline_fragments(linked_field.selections.iter());

        validate!(
            self.validate_fragment_spreads_with_parent(linked_field, fragment_spreads),
            self.validate_inline_fragments_with_parent(linked_field, inline_fragments.collect()),
            self.validate_selections(&linked_field.selections),
            self.validate_directives(&linked_field.directives)
        )
    }

    fn validate_inline_fragment(
        &mut self,
        inline_fragment: &InlineFragment,
    ) -> DiagnosticsResult<()> {
        let no_immediately_nested_fragments = {
            let mut errors = vec![];

            for selection in &inline_fragment.selections {
                if matches!(selection, Selection::InlineFragment(_)) {
                    errors.push(Diagnostic::error(
                        ValidationMessage::UpdatableNoNestedInlineFragments {
                            outer_type_plural: self.executable_definition_info.unwrap().type_plural,
                            operation_or_fragment_name: self
                                .executable_definition_info
                                .unwrap()
                                .name,
                        },
                        self.executable_definition_info.unwrap().location,
                    ));
                }
            }

            if errors.is_empty() {
                Ok(())
            } else {
                Err(errors)
            }
        };
        validate!(
            self.validate_selections(&inline_fragment.selections),
            self.validate_directives(&inline_fragment.directives),
            no_immediately_nested_fragments
        )
    }

    fn validate_condition(&mut self, _condition: &Condition) -> DiagnosticsResult<()> {
        Err(vec![Diagnostic::error(
            ValidationMessage::UpdatableNoConditions {
                outer_type_plural: self.executable_definition_info.unwrap().type_plural,
                operation_or_fragment_name: self.executable_definition_info.unwrap().name,
            },
            self.executable_definition_info.unwrap().location,
        )])
    }
}
