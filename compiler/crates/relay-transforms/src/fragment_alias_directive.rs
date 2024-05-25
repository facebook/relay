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
use common::Location;
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
use crate::ValidationMessage; // Import the Named trait

lazy_static! {
    pub static ref FRAGMENT_ALIAS_DIRECTIVE_NAME: DirectiveName = DirectiveName("alias".intern());
    pub static ref FRAGMENT_ALIAS_ARGUMENT_NAME: ArgumentName = ArgumentName("as".intern());
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct FragmentAliasMetadata {
    pub alias: WithLocation<StringKey>,
    pub type_condition: Option<Type>,
    pub non_nullable: bool,
    pub selection_type: Type,
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

struct FragmentAliasTransform<'program> {
    program: &'program Program,
    is_enabled: bool,
    is_enforced: bool,
    document_name: Option<StringKey>,
    parent_type: Option<Type>,
    is_condition: Option<Location>,
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
            is_condition: None,
            errors: Vec::new(),
        }
    }

    fn will_always_match(&self, type_condition: Option<Type>) -> bool {
        if self.is_condition.is_some() {
            return false;
        }
        match type_condition {
            Some(type_condition) => {
                let parent_type = self
                    .parent_type
                    .expect("Selection should be within a parent type.");

                println!(
                    "parent_type: {:?}",
                    self.program.schema.get_type_name(parent_type)
                );
                println!(
                    "type_condition: {:?}",
                    self.program.schema.get_type_name(type_condition)
                );
                self.program
                    .schema
                    .is_named_type_subtype_of(parent_type, type_condition)
            }
            None => true,
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
        self.is_condition = Some(condition.location);
        let selections = transform_list(&condition.selections, |selection| {
            self.transform_selection(selection)
        });
        self.is_condition = None;
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
        self.is_condition = None;
        transform_list(selections, |selection| self.transform_selection(selection))
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        let previous_parent_type = self.parent_type;

        // Note: This must be called before we set self.parent_type
        let will_always_match = self.will_always_match(fragment.type_condition);

        if let Some(type_condition) = fragment.type_condition {
            self.parent_type = Some(type_condition);
        }

        let transformed = match fragment.alias(&self.program.schema) {
            Ok(Some(alias)) => {
                if !self.is_enabled {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::FragmentAliasDirectiveDisabled,
                        alias.location,
                    ));
                    self.default_transform_inline_fragment(fragment);
                }
                let alias_metadata = FragmentAliasMetadata {
                    alias,
                    type_condition: fragment.type_condition,
                    non_nullable: will_always_match,
                    selection_type: self
                        .parent_type
                        .expect("Selection should be within a parent type."),
                };

                let mut directives = fragment.directives.clone();
                directives.push(alias_metadata.into());

                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    directives,
                    type_condition: fragment.type_condition,
                    selections: self
                        .transform_selections(&fragment.selections)
                        .replace_or_else(|| fragment.selections.clone()),
                    spread_location: fragment.spread_location,
                })))
            }
            Ok(None) => self.default_transform_inline_fragment(fragment),
            Err(diagnostics) => {
                self.errors.extend(diagnostics);
                self.default_transform_inline_fragment(fragment)
            }
        };

        self.parent_type = previous_parent_type;
        transformed
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        let type_condition = Some(
            self.program
                .fragment(spread.fragment.item)
                .expect("I believe we have already validated that all fragments exist")
                .type_condition,
        );

        let fragment = self
            .program
            .fragment(spread.fragment.item)
            .expect("I believe we have already validated that all fragments exist");

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
                };

                let mut directives = spread.directives.clone();
                directives.push(alias_metadata.into());

                Transformed::Replace(Selection::FragmentSpread(Arc::new(FragmentSpread {
                    fragment: spread.fragment,
                    arguments: spread.arguments.clone(),
                    directives,
                })))
            }
            Ok(None) => {
                if self.is_enforced && !self.will_always_match(Some(fragment.type_condition)) {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::PotentiallyNotMatchingFragmentRequiresAlias,
                        spread.fragment.location,
                    ));
                }
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

        self.parent_type = Some(
            self.program
                .schema
                .field(field.definition.item)
                .type_
                .inner(),
        );

        let transformed = self.default_transform_linked_field(field);

        self.parent_type = previous_parent_type;

        transformed
    }
}
