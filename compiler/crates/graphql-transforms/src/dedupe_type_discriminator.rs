/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::util::{is_relay_custom_inline_fragment_directive, PointerAddress};
use crate::TYPE_DISCRIMINATOR_DIRECTIVE_NAME;
use common::NamedItem;
use fnv::FnvHashMap;
use graphql_ir::{InlineFragment, Program, Selection, Transformed, TransformedValue, Transformer};
use std::sync::Arc;

/// Maintain a few invariants:
/// - InlineFragment (and `selections` arrays generally) cannot be empty
/// - Don't emit a TypeDiscriminator under an InlineFragment unless it has
///   a different abstractKey
/// This means we have to handle two cases:
/// - The inline fragment only contains a TypeDiscriminator with the same
///   abstractKey: replace the Fragment w the Discriminator
/// - The inline fragment contains other selections: return all the selections
///   minus any Discriminators w the same key
pub fn dedupe_type_discriminator(program: &Program) -> Program {
    let mut transform = DedupeTypeDiscriminator::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

type Seen = FnvHashMap<PointerAddress, Transformed<Selection>>;

struct DedupeTypeDiscriminator<'program> {
    seen: Seen,
    program: &'program Program,
}

impl<'program> DedupeTypeDiscriminator<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            seen: Default::default(),
        }
    }

    fn dedupe_on_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        let is_abstract_inline_fragment = !fragment
            .directives
            .iter()
            .any(is_relay_custom_inline_fragment_directive)
            && if let Some(type_condition) = fragment.type_condition {
                self.program.schema.is_abstract_type(type_condition)
            } else {
                false
            };
        if is_abstract_inline_fragment {
            let type_discriminator_index = fragment.selections.iter().position(|selection| {
                if let Selection::ScalarField(selection) = selection {
                    selection
                        .directives
                        .named(*TYPE_DISCRIMINATOR_DIRECTIVE_NAME)
                        .is_some()
                } else {
                    false
                }
            });
            if let Some(type_discriminator_index) = type_discriminator_index {
                if fragment.selections.len() == 1 {
                    Transformed::Replace(fragment.selections[0].clone())
                } else {
                    let selections = self.transform_selections(&fragment.selections);
                    let next_selections = match selections {
                        TransformedValue::Keep => {
                            let mut next_selections =
                                Vec::with_capacity(fragment.selections.len() - 1);
                            next_selections.extend(
                                fragment.selections[0..type_discriminator_index]
                                    .iter()
                                    .cloned(),
                            );
                            next_selections.extend(
                                fragment.selections[type_discriminator_index + 1..]
                                    .iter()
                                    .cloned(),
                            );
                            next_selections
                        }
                        TransformedValue::Replace(mut selections) => {
                            selections.remove(type_discriminator_index);
                            selections
                        }
                    };
                    Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                        selections: next_selections,
                        ..fragment.clone()
                    })))
                }
            } else {
                self.default_transform_inline_fragment(fragment)
            }
        } else {
            self.default_transform_inline_fragment(fragment)
        }
    }
}

impl<'program> Transformer for DedupeTypeDiscriminator<'program> {
    const NAME: &'static str = "DedupeTypeDiscriminator";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        let key = PointerAddress::new(fragment);
        if let Some(prev) = self.seen.get(&key) {
            prev.clone()
        } else {
            let result = self.dedupe_on_inline_fragment(fragment);
            self.seen.insert(key, result.clone());
            result
        }
    }
}
