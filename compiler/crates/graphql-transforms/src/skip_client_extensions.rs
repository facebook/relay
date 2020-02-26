/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::{
    FragmentDefinition, FragmentSpread, InlineFragment, LinkedField, Program, ScalarField,
    Transformed, Transformer,
};
use std::sync::Arc;

/// Transform to skip IR nodes if they are extensions
pub fn skip_client_extensions<'s>(program: &Program<'s>) -> Program<'s> {
    let mut transform = SkipClientExtensionsTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct SkipClientExtensionsTransform<'s> {
    program: &'s Program<'s>,
}

impl<'s> SkipClientExtensionsTransform<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self { program }
    }
}

impl<'s> Transformer for SkipClientExtensionsTransform<'s> {
    const NAME: &'static str = "SkipClientExtensionsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if self
            .program
            .schema()
            .is_extension_type(fragment.type_condition)
        {
            Transformed::Delete
        } else {
            self.default_transform_fragment(fragment)
        }
    }

    fn transform_fragment_spread(
        &mut self,
        spread: &FragmentSpread,
    ) -> Transformed<Arc<FragmentSpread>> {
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        if self
            .program
            .schema()
            .is_extension_type(fragment.type_condition)
        {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &InlineFragment,
    ) -> Transformed<Arc<InlineFragment>> {
        if let Some(type_condition) = fragment.type_condition {
            if self.program.schema().is_extension_type(type_condition) {
                return Transformed::Delete;
            }
        }
        self.default_transform_inline_fragment(fragment)
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Arc<LinkedField>> {
        if self
            .program
            .schema()
            .field(field.definition.item)
            .is_extension
        {
            Transformed::Delete
        } else {
            self.default_transform_linked_field(field)
        }
    }

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Arc<ScalarField>> {
        if self
            .program
            .schema()
            .field(field.definition.item)
            .is_extension
        {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }
}
