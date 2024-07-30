/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::associated_data_impl;
use graphql_ir::transform_list;
use graphql_ir::Condition;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::TransformedValue;
use graphql_ir::Transformer;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use schema::Schema;
use schema::Type;

use crate::RelayDirective;
use crate::ValidationMessage;
use crate::ValidationMessageWithData;
use crate::MATCH_CONSTANTS;

lazy_static! {
    pub static ref FRAGMENT_ALIAS_DIRECTIVE_NAME: DirectiveName = DirectiveName("alias".intern());
    pub static ref FRAGMENT_DANGEROUSLY_UNALIAS_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("dangerously_unaliased_fixme".intern());
    pub static ref FRAGMENT_ALIAS_ARGUMENT_NAME: ArgumentName = ArgumentName("as".intern());
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct FragmentAliasMetadata {
    pub alias: WithLocation<StringKey>,
    pub type_condition: Option<Type>,
    pub non_nullable: bool,
    pub selection_type: Type,
    pub wraps_spread: bool,
}
associated_data_impl!(FragmentAliasMetadata);

pub fn fragment_alias_directive(
    program: &Program,
    is_enabled: bool,
    is_enforced: bool,
) -> DiagnosticsResult<Program> {
    let mut transform = FragmentAliasTransform::new(program, is_enabled, is_enforced);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());
    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

pub fn remove_aliased_inline_fragments(program: &Program) -> Program {
    let mut transform = AliasedInlineFragmentRemovalTransform {};
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct AliasedInlineFragmentRemovalTransform {}

impl Transformer for AliasedInlineFragmentRemovalTransform {
    const NAME: &'static str = "AliasedInlineFragmentRemovalTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        if let Some(metadata) = FragmentAliasMetadata::find(&fragment.directives) {
            let selections = self
                .transform_selections(&fragment.selections)
                .replace_or_else(|| fragment.selections.clone());
            if metadata.wraps_spread {
                if selections.len() != 1 {
                    panic!(
                        "Expected exactly one selection in an aliased inline fragment wrapping a spread. This is a bug in Relay."
                    );
                }
                Transformed::Replace(selections[0].clone())
            } else {
                let directives = fragment
                    .directives
                    .iter()
                    .filter(|directive| {
                        directive.name.item != FragmentAliasMetadata::directive_name()
                    })
                    .cloned()
                    .collect();
                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    directives,
                    type_condition: fragment.type_condition,
                    selections,
                    spread_location: fragment.spread_location,
                })))
            }
        } else {
            self.default_transform_inline_fragment(fragment)
        }
    }
}

struct FragmentAliasTransform<'program> {
    program: &'program Program,
    is_enabled: bool,
    is_enforced: bool,
    document_name: Option<StringKey>,
    parent_type: Option<Type>,
    within_inline_fragment_type_condition: bool,
    maybe_condition: Option<Condition>,
    errors: Vec<Diagnostic>,
}

impl<'program> FragmentAliasTransform<'program> {
    fn new(program: &'program Program, enabled: bool, enforced: bool) -> Self {
        Self {
            program,
            is_enabled: enabled,
            is_enforced: enforced,
            document_name: None,
            parent_type: None,
            within_inline_fragment_type_condition: false,
            maybe_condition: None,
            errors: Vec::new(),
        }
    }

    fn will_always_match(&self, type_condition: Option<Type>) -> bool {
        if self.maybe_condition.is_some() {
            return false;
        }
        match type_condition {
            Some(type_condition) => {
                let parent_type = self
                    .parent_type
                    .expect("Selection should be within a parent type.");

                self.program
                    .schema
                    .is_named_type_subtype_of(parent_type, type_condition)
            }
            None => true,
        }
    }

    fn validate_unaliased_fragment_spread(
        &mut self,
        type_condition: Option<Type>,
        spread: &FragmentSpread,
    ) {
        if !self.is_enforced {
            return;
        }
        if spread
            .directives
            .named(*FRAGMENT_DANGEROUSLY_UNALIAS_DIRECTIVE_NAME)
            .is_some()
        {
            // We allow users to add `@dangerously_unaliaed_fixme` to suppress
            // this error as a migration strategy.
            return;
        }
        if spread
            .directives
            .named(MATCH_CONSTANTS.module_directive_name)
            .is_some()
        {
            // Fragments that have `@module` are likely going to be accessed with a
            // MatchContainer which should handle the possibility that this fragment
            // will not match.
            return;
        }
        if let Some(condition) = &self.maybe_condition {
            self.errors.push(Diagnostic::error_with_data(
                ValidationMessageWithData::ExpectedAliasOnConditionalFragmentSpread {
                    condition_name: condition.directive_name().to_string(),
                },
                condition.location,
            ));
            return;
        }
        if let Some(type_condition) = type_condition {
            let parent_type = self
                .parent_type
                .expect("Selection should be within a parent type.");

            if !self
                .program
                .schema
                .is_named_type_subtype_of(parent_type, type_condition)
            {
                let fragment_type_name = self.program.schema.get_type_name(type_condition);
                let selection_type_name = self.program.schema.get_type_name(parent_type);
                let diagnostic = if self.within_inline_fragment_type_condition {
                    ValidationMessageWithData::ExpectedAliasOnNonSubtypeSpreadWithinTypedInlineFragment {
                        fragment_name: spread.fragment.item,
                        fragment_type_name,
                        selection_type_name,
                    }
                } else {
                    ValidationMessageWithData::ExpectedAliasOnNonSubtypeSpread {
                        fragment_name: spread.fragment.item,
                        fragment_type_name,
                        selection_type_name,
                    }
                };
                self.errors.push(Diagnostic::error_with_data(
                    diagnostic,
                    spread.fragment.location,
                ))
            }
        }
    }
}

impl Transformer for FragmentAliasTransform<'_> {
    const NAME: &'static str = "NamedFragmentSpreadsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.document_name = Some(fragment.name.item.0);
        self.parent_type = Some(fragment.type_condition);
        let transformed = self.default_transform_fragment(fragment);
        self.parent_type = None;
        self.document_name = None;
        transformed
    }

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.document_name = Some(operation.name.item.0);
        self.parent_type = Some(operation.type_);
        let transformed = self.default_transform_operation(operation);
        self.parent_type = None;
        self.document_name = None;
        transformed
    }

    fn transform_condition(&mut self, condition: &Condition) -> Transformed<Selection> {
        let parent_condition =
            std::mem::replace(&mut self.maybe_condition, Some(condition.clone()));
        let selections = self.transform_selections(&condition.selections);
        self.maybe_condition = parent_condition;
        if let TransformedValue::Replace(selections) = &selections {
            if !Self::RETAIN_EMPTY_SELECTION_SETS && selections.is_empty() {
                return Transformed::Delete;
            }
        }
        let condition_value = self.transform_condition_value(&condition.value);
        if selections.should_keep() && condition_value.should_keep() {
            Transformed::Keep
        } else {
            Transformed::Replace(Selection::Condition(Arc::new(Condition {
                value: condition_value.replace_or_else(|| condition.value.clone()),
                selections: selections.replace_or_else(|| condition.selections.clone()),
                ..condition.clone()
            })))
        }
    }

    fn transform_selections(
        &mut self,
        selections: &[Selection],
    ) -> TransformedValue<Vec<Selection>> {
        transform_list(selections, |selection| self.transform_selection(selection))
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        let previous_parent_type = self.parent_type;
        let previous_within_inline_fragment_type_condition =
            self.within_inline_fragment_type_condition;

        self.within_inline_fragment_type_condition = fragment.type_condition.is_some();

        let transformed = match fragment.alias(&self.program.schema) {
            Ok(Some(alias)) => {
                if !self.is_enabled {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::FragmentAliasDirectiveDisabled,
                        alias.location,
                    ));
                    self.default_transform_inline_fragment(fragment)
                } else {
                    // Note: This must be called before we set self.parent_type
                    let will_always_match = self.will_always_match(fragment.type_condition);

                    if let Some(type_condition) = fragment.type_condition {
                        self.parent_type = Some(type_condition);
                    }

                    let alias_metadata = FragmentAliasMetadata {
                        alias,
                        type_condition: fragment.type_condition,
                        non_nullable: will_always_match,
                        selection_type: self
                            .parent_type
                            .expect("Selection should be within a parent type."),
                        wraps_spread: false,
                    };

                    let mut directives = fragment.directives.clone();
                    directives.push(alias_metadata.into());

                    // An aliased inline fragment creates its own name, and so we can reset any
                    // conditionality created by `@skip` or `@include` directives.
                    let parent_maybe_condition = self.maybe_condition.take();

                    let selections = self
                        .transform_selections(&fragment.selections)
                        .replace_or_else(|| fragment.selections.clone());

                    self.maybe_condition = parent_maybe_condition;

                    Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                        directives,
                        type_condition: fragment.type_condition,
                        selections,
                        spread_location: fragment.spread_location,
                    })))
                }
            }
            Ok(None) => {
                // Note: We intentionally don't set self.parent_type here, even if we
                // have at type conditions. This is because Relay does not always accurately model
                // inline fragment type refinements as discriminated unions in its
                // Flow/TypeScript types. This means the inline fragment might not actually result
                // in a spread that can only be accessed when the type condition has
                // been set.
                //
                // By leaving the parent selection's parent type we will require
                // `@alias` on any spread that could fail to match with its top level
                // selection set type.
                self.default_transform_inline_fragment(fragment)
            }
            Err(diagnostics) => {
                self.errors.extend(diagnostics);
                self.default_transform_inline_fragment(fragment)
            }
        };

        self.parent_type = previous_parent_type;
        self.within_inline_fragment_type_condition = previous_within_inline_fragment_type_condition;
        transformed
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        let fragment = self
            .program
            .fragment(spread.fragment.item)
            .expect("I believe we have already validated that all fragments exist");

        let type_condition = Some(fragment.type_condition);

        match spread.alias() {
            Ok(Some(alias)) => {
                if !self.is_enabled {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::FragmentAliasDirectiveDisabled,
                        alias.location,
                    ));
                }

                let is_plural = RelayDirective::find(&fragment.directives)
                    .map_or(false, |directive| directive.plural);

                if is_plural {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::PluralFragmentAliasNotSupported,
                        alias.location,
                    ));
                }

                let alias_metadata = FragmentAliasMetadata {
                    alias,
                    type_condition,
                    non_nullable: self.will_always_match(type_condition),
                    selection_type: self
                        .parent_type
                        .expect("Selection should be within a parent type."),
                    wraps_spread: true,
                };

                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    type_condition,
                    selections: vec![Selection::FragmentSpread(Arc::new(spread.clone()))],
                    directives: vec![alias_metadata.into()],
                    spread_location: alias.location,
                })))
            }
            Ok(None) => {
                self.validate_unaliased_fragment_spread(type_condition, spread);
                self.default_transform_fragment_spread(spread)
            }
            Err(diagnostics) => {
                self.errors.extend(diagnostics);
                self.default_transform_fragment_spread(spread)
            }
        }
    }
    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let previous_parent_type = self.parent_type;
        // Linked fields create a new namespace. Any conditionality created by `@skip` or `@include`
        // does not apply to the selections within the linked field.
        let parent_condition = self.maybe_condition.take();

        self.parent_type = Some(
            self.program
                .schema
                .field(field.definition.item)
                .type_
                .inner(),
        );

        let transformed = self.default_transform_linked_field(field);

        self.maybe_condition = parent_condition;
        self.parent_type = previous_parent_type;

        transformed
    }
}
