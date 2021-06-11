/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::NO_INLINE_DIRECTIVE_NAME;
use common::NamedItem;
use fnv::FnvHashSet;
use graphql_ir::{FragmentDefinition, FragmentSpread, Program, Visitor};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    static ref RAW_RESPONSE_TYPE_DIRECTIVE_NAME: StringKey = "raw_response_type".intern();
}

/// To generate full raw response types, we need to also generate raw response types in the
/// no_inline fragment normalization files and reference them in queries with @raw_response_type.
/// This function traverses operations with @raw_response_type, and returns the names of
/// @no_inline fragments that are used in queries with @raw_response_type.
pub fn get_no_inline_fragments_with_raw_response_type(program: &Program) -> FnvHashSet<StringKey> {
    let mut visitor = NoInlineRawResponseTypeVisitor::new(program);
    visitor.visit_program(program);
    visitor.no_inline_with_raw_response
}

struct NoInlineRawResponseTypeVisitor<'a> {
    no_inline_with_raw_response: FnvHashSet<StringKey>,
    visited: FnvHashSet<StringKey>,
    program: &'a Program,
}

impl<'a> NoInlineRawResponseTypeVisitor<'a> {
    fn new(program: &'a Program) -> Self {
        Self {
            no_inline_with_raw_response: Default::default(),
            visited: Default::default(),
            program,
        }
    }
}

impl<'a> Visitor for NoInlineRawResponseTypeVisitor<'a> {
    const NAME: &'static str = "NoInlineRawResponseTypeVisitor";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_program(&mut self, program: &Program) {
        for operation in program.operations() {
            if operation
                .directives
                .named(*RAW_RESPONSE_TYPE_DIRECTIVE_NAME)
                .is_some()
            {
                self.default_visit_operation(operation);
            }
        }
    }

    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        if fragment
            .directives
            .named(*NO_INLINE_DIRECTIVE_NAME)
            .is_some()
        {
            self.no_inline_with_raw_response.insert(fragment.name.item);
        }
        self.default_visit_fragment(fragment);
    }

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if self.visited.contains(&spread.fragment.item) {
            return;
        }
        self.visited.insert(spread.fragment.item);
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        self.visit_fragment(fragment);
    }
}
