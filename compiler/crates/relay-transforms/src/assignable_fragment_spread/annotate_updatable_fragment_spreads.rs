/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DirectiveName;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Directive;
use graphql_ir::FragmentSpread;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use intern::string_key::Intern;
use lazy_static::lazy_static;

use crate::UPDATABLE_DIRECTIVE;

lazy_static! {
    pub static ref UPDATABLE_DIRECTIVE_FOR_TYPEGEN: DirectiveName =
        DirectiveName("__updatable".intern());
}

pub fn annotate_updatable_fragment_spreads(program: &Program) -> Program {
    let mut transform = AnnotateUpdatableFragmentSpreads { program };

    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct AnnotateUpdatableFragmentSpreads<'s> {
    program: &'s Program,
}

impl Transformer<'_> for AnnotateUpdatableFragmentSpreads<'_> {
    const NAME: &'static str = "AnnotateUpdatableFragmentSpreads";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment_spread(
        &mut self,
        fragment_spread: &FragmentSpread,
    ) -> Transformed<Selection> {
        let fragment_definition = self.program.fragment(fragment_spread.fragment.item)
            .expect("The existence of this fragment spread's definition should have been validated beforehand");

        if fragment_definition
            .directives
            .named(*UPDATABLE_DIRECTIVE)
            .is_some()
        {
            let mut fragment_spread = fragment_spread.clone();
            fragment_spread.directives.push(Directive {
                name: WithLocation::generated(*UPDATABLE_DIRECTIVE_FOR_TYPEGEN),
                arguments: vec![],
                data: None,
                location: Location::generated(),
            });
            Transformed::Replace(Selection::FragmentSpread(Arc::new(fragment_spread)))
        } else {
            Transformed::Keep
        }
    }
}
