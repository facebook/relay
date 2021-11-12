/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

pub trait EarlyReturnVisitor {
    fn visit(selections: &[Selection]) {
        let mut to_visit = Vec::from(selections);
        while let Some(selection) = to_visit.pop() {
            match selection {
                Selection::FragmentSpread(s) => {}
                Selection::InlineFragment(_) => todo!(),
                Selection::LinkedField(_) => todo!(),
                Selection::ScalarField(_) => todo!(),
                Selection::Condition(_) => todo!(),
            }
        }
    }

    fn visit_fragment(
        &mut self,
        to_visit: &mut Vec<&Selection>,
        fragment: &FragmentDefinition,
    ) -> bool {
        to_visit.push(fragment.selections);
        false
    }

    fn visit_inline_fragment(
        &mut self,
        to_visit: &mut Vec<&Selection>,
        fragment: &InlineFragment,
    ) -> bool {
        to_visit.push(fragment.selections);
    }

    fn visit_linkedField(
        &mut self,
        to_visit: &mut Vec<&Selection>,
        fragment: &InlineFragment,
    ) -> bool {
        to_visit.push(fragment.selections);
    }
}
