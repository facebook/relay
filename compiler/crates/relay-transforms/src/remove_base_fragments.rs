/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionNameSet;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Transformed;
use graphql_ir::Transformer;

/// This transform removes the given list of base fragments from the Program.
/// This is useful if earlier steps need access to fragments from some base
/// project, but we don't want to write output files for them and can skip over
/// some transform steps.
pub fn remove_base_fragments(
    program: &Program,
    base_fragment_names: &FragmentDefinitionNameSet,
) -> Program {
    if base_fragment_names.is_empty() {
        // Nothing to remove.
        return program.clone();
    }
    let mut transform = StripBaseFragmentsTransform {
        base_fragment_names: &base_fragment_names,
    };
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct StripBaseFragmentsTransform<'a> {
    base_fragment_names: &'a FragmentDefinitionNameSet,
}

impl<'a> Transformer for StripBaseFragmentsTransform<'a> {
    const NAME: &'static str = "StripBaseFragmentsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        _operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        Transformed::Keep
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if self.base_fragment_names.contains(&fragment.name.item) {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }
}
