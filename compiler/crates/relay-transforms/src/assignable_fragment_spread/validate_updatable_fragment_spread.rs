/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use graphql_ir::Condition;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::Validator;
use schema::Schema;
use schema::Type;
use schema::TypeReference;

use super::ValidationMessage;
use super::ensure_discriminated_union_is_created;
use crate::UPDATABLE_DIRECTIVE;
use crate::fragment_alias_directive::FRAGMENT_DANGEROUSLY_UNALIAS_DIRECTIVE_NAME;

pub fn validate_updatable_fragment_spread(program: &Program) -> DiagnosticsResult<()> {
    UpdatableFragmentSpread {
        program,
        path: vec![],
    }
    .validate_program(program)
}

/// An enum that keeps track of the path we have taken to get to a given
/// updatable fragment spread. We then iterate this path in reverse and check things like:
/// * is this fragment spread top level?
/// * is there a condition between the fragment spread and a linked field?
/// * are there multiple inline fragments between the fragment spread and the linked field?
///
/// If a single inline fragment is found, that linked field is marked (via setting
/// LinkedFieldPathItem.should_ensure_discriminated_union_is_created to true) as requiring
/// additional validation that ensures that a discriminated union is created.
enum PathItem {
    InlineFragment,
    LinkedField(LinkedFieldPathItem),
    Condition,
}

struct LinkedFieldPathItem {
    type_reference: TypeReference<Type>,
    should_ensure_discriminated_union_is_created: bool,
}

struct UpdatableFragmentSpread<'a> {
    program: &'a Program,
    path: Vec<PathItem>,
}

impl UpdatableFragmentSpread<'_> {
    /// Validate many conditions for spreads of updatable fragments:
    /// * the fragment spread contains no directives
    /// * there is no @if or @skip between the linked field and the fragment spread
    /// * the fragment spread is not at the top level
    /// * the fragment's type is a superset or equal to the outer type
    ///   * this ensures that if we read this fragment with readUpdatableFragment,
    ///     the result is guaranteed to be valid, i.e. the concrete type is guaranteed
    ///     to be updatable as that fragment type.
    ///   * So, `node { ...updatable_user }` is disallowed, but
    ///     `user { ...updatable_node }` and `node { ...updatable_node }` are allowed.
    ///   * "outer type" means the type of the enclosing linked field **or** the type of
    ///     the one (and only one) inline fragment, which must have a type condition
    ///
    /// If we encountered a type refinement between the enclosing linked field and the
    /// fragment spread:
    /// * ensure that we encountered only one. Later, we check that it refined to a
    ///   concrete type. In other words, it is **currently impossible** to refine from
    ///   an interface type to another interface type and use updatable fragments.
    /// * Later, we validate that the enclosing linked field has an abstract type and
    ///   contains only inline fragments which each refine to a unique concrete type
    ///   and which contain no directives, and each inline fragment contains an
    ///   unaliased __typename selection with no directives.
    ///   * this ensures that a discriminated union is created by the typegen
    /// * updatable fragments/queries must conform to a very similar requirement
    fn validate_fragment_spread_and_mark_enclosing_linked_field(
        &mut self,
        fragment_spread: &FragmentSpread,
        fragment_definition: &FragmentDefinition,
    ) -> DiagnosticsResult<()> {
        let mut errors = vec![];

        let invalid_directive = fragment_spread
            .directives
            .iter()
            .find(|directive| directive.name.item != *FRAGMENT_DANGEROUSLY_UNALIAS_DIRECTIVE_NAME);

        if let Some(directive) = invalid_directive {
            errors.push(Diagnostic::error(
                ValidationMessage::UpdatableFragmentSpreadNoDirectives,
                directive.location,
            ));
        }

        let mut encountered_inline_fragment = false;
        let mut encountered_linked_field = false;
        for mut item in self.path.iter_mut().rev() {
            match &mut item {
                PathItem::InlineFragment => {
                    if encountered_inline_fragment {
                        errors.push(Diagnostic::error(
                            ValidationMessage::UpdatableFragmentSpreadContainingInlineFragmentSingleNesting,
                            fragment_spread.fragment.location
                        ));
                    }
                    encountered_inline_fragment = true;
                }
                PathItem::LinkedField(linked_field_path_item) => {
                    encountered_linked_field = true;

                    if !encountered_inline_fragment {
                        // The fragment definition's type must be a superset or equal to the linked field's type.
                        // In other words, in `foo { ...Fragment_Y }`, foo must always be a Y.
                        //
                        // We want to prevent developers from writing
                        // node { ...Fragment_user } and modifying a given Node as if
                        // it was a User, regardless of whether its concrete type was "User"
                        //
                        // Note that we are comparing named, inner types. So users { ...Fragment_node }
                        // should not produce an error, for example.
                        //
                        // Note also that if the linked field has a concrete type and the updatable fragment spread
                        // does not match, we wouldn't get here - earlier validations would catch that the fragment
                        // can never occur on that type. Note also that  inline fragments are enforced to refine to a
                        // concrete type. Therefore, this check isn't necessary for inline fragments.
                        if !self.program.schema.is_type_subtype_of(
                            &TypeReference::Named(linked_field_path_item.type_reference.inner()),
                            &TypeReference::Named(fragment_definition.type_condition),
                        ) {
                            errors.push(Diagnostic::error(
                                ValidationMessage::UpdatableFragmentSpreadSubtypeOrEqualLinkedField {
                                    updatable_fragment_type: self
                                        .program
                                        .schema
                                        .get_type_name(fragment_definition.type_condition),
                                    linked_field_inner_type: self
                                        .program
                                        .schema
                                        .get_type_name(linked_field_path_item.type_reference.inner()),
                                    linked_field_type: self
                                        .program
                                        .schema
                                        .get_type_string(&linked_field_path_item.type_reference),
                                },
                                fragment_spread.fragment.location,
                            ));
                        }
                    } else {
                        // Since we've encountered an updatable fragment spread in an inline fragment, this
                        // linked field result in an a discriminated union.
                        //
                        // Mutate the linked_field_path_item. It would be ideal for linked_field_path_item to
                        // contain &'a LinkedField and to do the validation here, but the lifetimes currently
                        // don't line up in the Validator trait. Instead, do the validation afterward in
                        // validate_linked_field.
                        linked_field_path_item.should_ensure_discriminated_union_is_created = true;
                    }

                    break;
                }
                PathItem::Condition => errors.push(Diagnostic::error(
                    ValidationMessage::UpdatableFragmentSpreadNoCondition,
                    fragment_spread.fragment.location,
                )),
            }
        }

        if !encountered_linked_field {
            errors.push(Diagnostic::error(
                ValidationMessage::UpdatableFragmentTopLevel,
                fragment_spread.fragment.location,
            ));
        }

        if !errors.is_empty() {
            Err(errors)
        } else {
            Ok(())
        }
    }
}

impl Validator for UpdatableFragmentSpread<'_> {
    const NAME: &'static str = "UpdatableFragmentSpread";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_linked_field(&mut self, linked_field: &LinkedField) -> DiagnosticsResult<()> {
        let mut errors = vec![];
        self.path.push(PathItem::LinkedField(LinkedFieldPathItem {
            type_reference: self
                .program
                .schema
                .field(linked_field.definition.item)
                .type_
                .clone(),
            should_ensure_discriminated_union_is_created: false,
        }));
        match self.default_validate_linked_field(linked_field) {
            Ok(_) => {}
            Err(e) => errors.extend(e),
        }
        let linked_field_item = match self.path.pop().expect("path should not be empty") {
            PathItem::LinkedField(l) => l,
            _ => panic!("Unexpected path item"),
        };

        if linked_field_item.should_ensure_discriminated_union_is_created
            && let Err(e) = ensure_discriminated_union_is_created(
                &self.program.schema,
                linked_field,
                "an updatable fragment was spread in an inline fragment in this linked field",
            )
        {
            errors.extend(e)
        }

        if !errors.is_empty() {
            Err(errors)
        } else {
            Ok(())
        }
    }

    fn validate_inline_fragment(
        &mut self,
        inline_fragment: &InlineFragment,
    ) -> DiagnosticsResult<()> {
        self.path.push(PathItem::InlineFragment);
        let result = self.default_validate_inline_fragment(inline_fragment);
        self.path.pop().expect("path should not be empty");
        result
    }

    fn validate_fragment_spread(
        &mut self,
        fragment_spread: &FragmentSpread,
    ) -> DiagnosticsResult<()> {
        let fragment_definition = self
            .program
            .fragment(fragment_spread.fragment.item)
            .expect("Fragment definition not found");

        if fragment_definition
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some()
        {
            self.validate_fragment_spread_and_mark_enclosing_linked_field(
                fragment_spread,
                fragment_definition,
            )
        } else {
            Ok(())
        }
    }

    fn validate_condition(&mut self, condition: &Condition) -> DiagnosticsResult<()> {
        self.path.push(PathItem::Condition);
        let result = self.default_validate_condition(condition);
        self.path.pop().expect("path should not be empty");
        result
    }
}
