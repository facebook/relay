/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::{Directive, FragmentSpread, InlineFragment, LinkedField, Selection};

/// A trait for implementating finding if a directive exists in an IR.
/// Returns `true` if the directive is found.
/// We can make it more general, if there are more similar use cases
pub trait DirectiveFinder {
    fn find(&mut self, mut to_visit: Vec<&Selection>) -> bool {
        while let Some(selection) = to_visit.pop() {
            match selection {
                Selection::FragmentSpread(f) => {
                    if self.visit_fragment_spread(f) {
                        return true;
                    }
                }
                Selection::InlineFragment(f) => {
                    if self.visit_inline_fragment(&mut to_visit, f) {
                        return true;
                    }
                }
                Selection::LinkedField(f) => {
                    if self.visit_linked_field(&mut to_visit, f) {
                        return true;
                    }
                }
                Selection::ScalarField(f) => {
                    if self.visit_directives(&f.directives) {
                        return true;
                    }
                }
                Selection::Condition(c) => {
                    to_visit.extend(c.selections.iter());
                }
            }
        }
        false
    }

    fn visit_directive(&self, directive: &Directive) -> bool;

    fn visit_directives(&self, directives: &[Directive]) -> bool {
        directives.iter().any(|d| self.visit_directive(d))
    }

    fn visit_fragment_spread(&mut self, _fragment_spread: &FragmentSpread) -> bool;

    fn visit_inline_fragment<'a>(
        &mut self,
        to_visit: &mut Vec<&'a Selection>,
        fragment: &'a InlineFragment,
    ) -> bool {
        if self.visit_directives(&fragment.directives) {
            return true;
        }
        to_visit.extend(fragment.selections.iter());
        false
    }

    fn visit_linked_field<'a>(
        &mut self,
        to_visit: &mut Vec<&'a Selection>,
        field: &'a LinkedField,
    ) -> bool {
        if self.visit_directives(&field.directives) {
            return true;
        }
        to_visit.extend(field.selections.iter());
        false
    }
}
