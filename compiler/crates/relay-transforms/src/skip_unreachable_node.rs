/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use graphql_ir::Condition;
use graphql_ir::ConditionValue;
use graphql_ir::ConstantValue;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentDefinitionNameMap;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::TransformedMulti;
use graphql_ir::TransformedValue;
use graphql_ir::Transformer;
use graphql_ir::Value;
use graphql_ir::transform_list_multi;
use intern::string_key::StringKey;
use relay_config::DeferStreamInterface;
use thiserror::Error;

use crate::DeferDirective;
use crate::NoInlineFragmentSpreadMetadata;
use crate::StreamDirective;

enum ValidationMode {
    Strict(Vec<Diagnostic>),
    Loose,
}

pub fn skip_unreachable_node_strict(
    program: &Program,
    defer_stream_interface: DeferStreamInterface,
) -> DiagnosticsResult<Program> {
    let errors = vec![];
    let mut validation_mode = ValidationMode::Strict(errors);
    let next_program = skip_unreachable_node(program, &mut validation_mode, defer_stream_interface);

    if let ValidationMode::Strict(errors) = validation_mode
        && !errors.is_empty()
    {
        return Err(errors);
    }
    Ok(next_program)
}

pub fn skip_unreachable_node_loose(
    program: &Program,
    defer_stream_interface: DeferStreamInterface,
) -> Program {
    let mut validation_mode = ValidationMode::Loose;
    skip_unreachable_node(program, &mut validation_mode, defer_stream_interface)
}

fn skip_unreachable_node(
    program: &Program,
    validation_mode: &mut ValidationMode,
    defer_stream_interface: DeferStreamInterface,
) -> Program {
    let mut skip_unreachable_node_transform =
        SkipUnreachableNodeTransform::new(program, validation_mode, defer_stream_interface);
    let transformed = skip_unreachable_node_transform.transform_program(program);

    transformed.replace_or_else(|| program.clone())
}

type VisitedFragments =
    FragmentDefinitionNameMap<(Arc<FragmentDefinition>, Transformed<FragmentDefinition>)>;

pub struct SkipUnreachableNodeTransform<'s> {
    visited_fragments: VisitedFragments,
    program: &'s Program,
    validation_mode: &'s mut ValidationMode,
    defer_stream_interface: DeferStreamInterface,
}

impl Transformer<'_> for SkipUnreachableNodeTransform<'_> {
    const NAME: &'static str = "SkipUnreachableNodeTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_program(&mut self, program: &Program) -> TransformedValue<Program> {
        // Iterate over the operation ASTs. Whenever we encounter a FragmentSpread (by way of
        // fn transform_fragment_spread) look up that the associated FragmentDefinition.
        // Crawl that FragmentDefinition for other FragmentSpreads and repeat.
        // Delete that FragmentSpread if the associated FragmentDefinition was deleted.
        //
        // Throughout, when we encounter a condition node with a constant predicate, either remove
        // it or replace it with its contents.
        //
        // @include(if: false)  => remove
        // @include(if: true)   => replace with contents
        // @skip(if: true)      => remove
        // @skip(if: false)     => replace with contents
        // @defer(if: false)    => replace with contents
        //
        // Removal of a condition or spread can result in a FragmentDefinition being deleted.

        let mut next_program = Program::new(Arc::clone(&program.schema));
        let mut has_changes = false;

        for operation in program.operations() {
            match self.transform_operation(operation) {
                Transformed::Delete => {
                    if let ValidationMode::Strict(errors) = &mut self.validation_mode {
                        errors.push(Diagnostic::error(
                            ValidationMessage::EmptySelectionsInDocument {
                                document: "query",
                                name: operation.name.item.0,
                            },
                            operation.name.location,
                        ));
                    }
                    has_changes = true;
                }
                Transformed::Keep => next_program.insert_operation(Arc::clone(operation)),
                Transformed::Replace(replacement) => {
                    has_changes = true;
                    next_program.insert_operation(Arc::new(replacement))
                }
            }
        }
        for fragment in program.fragments() {
            if let Some(visited_fragment) = self.visited_fragments.get(&fragment.name.item) {
                match visited_fragment {
                    (_, Transformed::Delete) => {
                        has_changes = true;
                    }
                    (fragment, Transformed::Keep) => {
                        next_program.insert_fragment(Arc::clone(fragment));
                    }
                    (_, Transformed::Replace(replacement)) => {
                        next_program.insert_fragment(Arc::new(replacement.clone()));
                        has_changes = true;
                    }
                }
            } else {
                match self.transform_fragment(fragment) {
                    Transformed::Delete => {
                        if let ValidationMode::Strict(errors) = &mut self.validation_mode {
                            errors.push(Diagnostic::error(
                                ValidationMessage::EmptySelectionsInDocument {
                                    document: "fragment",
                                    name: fragment.name.item.0,
                                },
                                fragment.name.location,
                            ));
                        }
                        has_changes = true;
                    }
                    Transformed::Keep => {
                        next_program.insert_fragment(Arc::clone(fragment));
                    }
                    Transformed::Replace(replacement) => {
                        next_program.insert_fragment(Arc::new(replacement.clone()));
                        has_changes = true;
                    }
                }
            }
        }

        if has_changes {
            TransformedValue::Replace(next_program)
        } else {
            TransformedValue::Keep
        }
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        // Remove the fragment with empty selections
        let selections = self.transform_selections(&fragment.selections);
        if let TransformedValue::Replace(selections) = &selections
            && selections.is_empty()
        {
            return Transformed::Delete;
        }
        let directives = self.transform_directives(&fragment.directives);
        if selections.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(FragmentDefinition {
            directives: directives.replace_or_else(|| fragment.directives.clone()),
            selections: selections.replace_or_else(|| fragment.selections.clone()),
            ..fragment.clone()
        })
    }

    fn transform_selections(
        &mut self,
        selections: &[Selection],
    ) -> TransformedValue<Vec<Selection>> {
        transform_list_multi(selections, |selection| self.map_selection_multi(selection))
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        if spread
            .directives
            .named(NoInlineFragmentSpreadMetadata::directive_name())
            .is_some()
        {
            return Transformed::Keep;
        }
        if self.should_delete_fragment_definition(spread.fragment.item) {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let transformed_field = self.default_transform_linked_field(field);
        if let Some(directive) = field
            .directives
            .named(self.defer_stream_interface.stream_name)
            && let Some(if_arg) =
                StreamDirective::from(directive, &self.defer_stream_interface).if_arg
            && let Value::Constant(ConstantValue::Boolean(false)) = &if_arg.value.item
        {
            let mut next_field = match transformed_field {
                Transformed::Delete => return Transformed::Delete,
                Transformed::Keep => Arc::new(field.clone()),
                Transformed::Replace(Selection::LinkedField(replacement)) => replacement,
                Transformed::Replace(other) => {
                    panic!("unexpected replacement: {other:?}")
                }
            };
            let previous_directive_len = next_field.directives.len();
            Arc::make_mut(&mut next_field)
                .directives
                .retain(|directive| directive.name.item != self.defer_stream_interface.stream_name);
            assert_eq!(
                previous_directive_len,
                next_field.directives.len() + 1,
                "should have removed exactly one directive"
            );
            return Transformed::Replace(Selection::LinkedField(next_field));
        }
        transformed_field
    }
}

impl<'s> SkipUnreachableNodeTransform<'s> {
    fn new(
        program: &'s Program,
        validation_mode: &'s mut ValidationMode,
        defer_stream_interface: DeferStreamInterface,
    ) -> Self {
        Self {
            visited_fragments: Default::default(),
            program,
            validation_mode,
            defer_stream_interface,
        }
    }

    // Visit the fragment definition and return true if it should be deleted
    fn should_delete_fragment_definition(&mut self, key: FragmentDefinitionName) -> bool {
        if let Some((_, transformed)) = self.visited_fragments.get(&key) {
            return matches!(transformed, Transformed::Delete);
        }
        if let Some(fragment) = self.program.fragment(key) {
            self.visited_fragments
                .insert(key, (Arc::clone(fragment), Transformed::Keep));
            let transformed = self.transform_fragment(fragment);
            let should_delete = matches!(transformed, Transformed::Delete);

            // N.B. we must call self.visited_fragments.get* twice, because we cannot have
            // a reference to visited_opt and call transform_segment, which requires an
            // exclusive reference to self.
            let (_, visited_opt) = self.visited_fragments.get_mut(&key).unwrap();
            *visited_opt = transformed;
            should_delete
        } else {
            true
        }
    }

    fn map_selection_multi(&mut self, selection: &Selection) -> TransformedMulti<Selection> {
        match selection {
            Selection::FragmentSpread(selection) => {
                self.transform_fragment_spread(selection).into()
            }
            Selection::InlineFragment(selection) => self.transform_inline_fragment_multi(selection),
            Selection::LinkedField(selection) => self.transform_linked_field(selection).into(),
            Selection::ScalarField(selection) => self.transform_scalar_field(selection).into(),
            Selection::Condition(condition) => self.transform_constant_conditions(condition),
        }
    }

    fn transform_inline_fragment_multi(
        &mut self,
        inline_fragment: &InlineFragment,
    ) -> TransformedMulti<Selection> {
        if let Some(directive) = inline_fragment
            .directives
            .named(self.defer_stream_interface.defer_name)
        {
            assert!(inline_fragment.directives.len() == 1);
            if let Some(if_arg) =
                DeferDirective::from(directive, &self.defer_stream_interface).if_arg
                && let Value::Constant(ConstantValue::Boolean(false)) = &if_arg.value.item
            {
                return TransformedMulti::ReplaceMultiple(
                    self.transform_selections(&inline_fragment.selections)
                        .replace_or_else(|| inline_fragment.selections.clone()),
                );
            }
        };
        self.default_transform_inline_fragment(inline_fragment)
            .into()
    }

    fn transform_constant_conditions(
        &mut self,
        condition: &Condition,
    ) -> TransformedMulti<Selection> {
        if let ConditionValue::Constant(b) = condition.value {
            // passing_value == "what the value needs to be in order to include the contents"
            // in other words, @skip has passing_value of false
            // and @include has passing_value of true
            //
            // so, b == condition.passing_value implies that the condition is redundant,
            // and b != condition.passing_value implies that the whole node can be removed
            let keep_contents = b == condition.passing_value;
            if keep_contents {
                // @include(if: true) or @skip(if: false)
                let contents = match self.transform_selections(&condition.selections) {
                    TransformedValue::Keep => &condition.selections,
                    TransformedValue::Replace(ref t) => t,
                }
                .clone();
                TransformedMulti::ReplaceMultiple(contents)
            } else {
                // @include(if: false) or @skip(if: true)
                TransformedMulti::Delete
            }
        } else {
            self.transform_condition(condition).into()
        }
    }
}

#[derive(
    Clone,
    Debug,
    Error,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    serde::Serialize
)]
#[serde(tag = "type")]
enum ValidationMessage {
    #[error(
        "After applying transforms to the {document} `{name}` selections of \
        the `{name}` that would be sent to the server are empty. \
        This is likely due to the use of `@skip`/`@include` directives with \
        constant values that remove all selections in the {document}. "
    )]
    EmptySelectionsInDocument {
        name: StringKey,
        document: &'static str,
    },
}
