/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::defer_stream::DEFER_STREAM_CONSTANTS;
use crate::{
    no_inline::NO_INLINE_DIRECTIVE_NAME, DeferDirective, StreamDirective, ValidationMessage,
};
use common::{Diagnostic, DiagnosticsResult, NamedItem};
use fnv::FnvHashMap;
use graphql_ir::{
    Condition, ConditionValue, ConstantValue, FragmentDefinition, FragmentSpread, InlineFragment,
    LinkedField, Program, Selection, Transformed, TransformedMulti, TransformedValue, Transformer,
    Value,
};
use intern::string_key::StringKey;
use std::sync::Arc;

pub fn skip_unreachable_node(program: &Program) -> DiagnosticsResult<Program> {
    let mut skip_unreachable_node_transform = SkipUnreachableNodeTransform::new(program);
    let transformed = skip_unreachable_node_transform.transform_program(program);
    if skip_unreachable_node_transform.errors.is_empty() {
        Ok(transformed.replace_or_else(|| program.clone()))
    } else {
        Err(skip_unreachable_node_transform.errors)
    }
}

type VisitedFragments =
    FnvHashMap<StringKey, (Arc<FragmentDefinition>, Transformed<FragmentDefinition>)>;

pub struct SkipUnreachableNodeTransform<'s> {
    errors: Vec<Diagnostic>,
    visited_fragments: VisitedFragments,
    program: &'s Program,
}

impl<'s> Transformer for SkipUnreachableNodeTransform<'s> {
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
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::EmptyOperationResult {
                            name: operation.name.item,
                        },
                        operation.name.location,
                    ));
                    has_changes = true;
                }
                Transformed::Keep => next_program.insert_operation(Arc::clone(operation)),
                Transformed::Replace(replacement) => {
                    has_changes = true;
                    next_program.insert_operation(Arc::new(replacement))
                }
            }
        }

        for (_, fragment) in self.visited_fragments.drain() {
            match fragment {
                (_, Transformed::Delete) => {
                    has_changes = true;
                }
                (fragment, Transformed::Keep) => {
                    next_program.insert_fragment(fragment);
                }
                (_, Transformed::Replace(replacement)) => {
                    next_program.insert_fragment(Arc::new(replacement));
                    has_changes = true;
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
        if let TransformedValue::Replace(selections) = &selections {
            if selections.is_empty() {
                return Transformed::Delete;
            }
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
        self.transform_list_multi(selections, Self::map_selection_multi)
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        if spread.directives.named(*NO_INLINE_DIRECTIVE_NAME).is_some() {
            return Transformed::Keep;
        }
        if self.should_delete_fragment_definition(spread.fragment.item) {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let tranformed_field = self.default_transform_linked_field(field);
        if let Some(directive) = field.directives.named(DEFER_STREAM_CONSTANTS.stream_name) {
            if let Some(if_arg) = StreamDirective::from(directive).if_arg {
                if let Value::Constant(ConstantValue::Boolean(false)) = &if_arg.value.item {
                    let mut next_field = match tranformed_field {
                        Transformed::Delete => return Transformed::Delete,
                        Transformed::Keep => Arc::new(field.clone()),
                        Transformed::Replace(Selection::LinkedField(replacement)) => replacement,
                        Transformed::Replace(other) => {
                            panic!("unexpected replacement: {:?}", other)
                        }
                    };
                    let previous_directive_len = next_field.directives.len();
                    Arc::make_mut(&mut next_field)
                        .directives
                        .retain(|directive| {
                            directive.name.item != DEFER_STREAM_CONSTANTS.stream_name
                        });
                    assert_eq!(
                        previous_directive_len,
                        next_field.directives.len() + 1,
                        "should have removed exactly one directive"
                    );
                    return Transformed::Replace(Selection::LinkedField(next_field));
                }
            }
        }
        tranformed_field
    }
}

impl<'s> SkipUnreachableNodeTransform<'s> {
    pub fn new(program: &'s Program) -> Self {
        Self {
            errors: Vec::new(),
            visited_fragments: Default::default(),
            program,
        }
    }

    // Visit the fragment definition and return true if it should be deleted
    fn should_delete_fragment_definition(&mut self, key: StringKey) -> bool {
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
            .named(DEFER_STREAM_CONSTANTS.defer_name)
        {
            assert!(inline_fragment.directives.len() == 1);
            if let Some(if_arg) = DeferDirective::from(directive).if_arg {
                if let Value::Constant(ConstantValue::Boolean(false)) = &if_arg.value.item {
                    return TransformedMulti::ReplaceMultiple(
                        self.transform_selections(&inline_fragment.selections)
                            .replace_or_else(|| inline_fragment.selections.clone()),
                    );
                }
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
