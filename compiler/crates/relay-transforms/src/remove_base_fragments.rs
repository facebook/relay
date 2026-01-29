/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DirectiveName;
use common::NamedItem;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionNameSet;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use intern::string_key::Intern;
use lazy_static::lazy_static;
use schema::Schema;

lazy_static! {
    pub static ref RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE: DirectiveName =
        DirectiveName("__belongs_to_base_schema".intern());
}
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
        program,
        base_fragment_names,
    };
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct StripBaseFragmentsTransform<'a> {
    program: &'a Program,
    base_fragment_names: &'a FragmentDefinitionNameSet,
}

impl Transformer<'_> for StripBaseFragmentsTransform<'_> {
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
            // For resolvers that belong to the base schema, we don't need to generate fragments.
            // These fragments should be generated during compilation of the base project.
            let is_base_resolver_type =
                fragment
                    .type_condition
                    .get_object_id()
                    .is_some_and(|object_id| {
                        let object = self.program.schema.object(object_id);

                        object.is_extension
                            && object
                                .directives
                                .named(*RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE)
                                .is_some()
                    });
            if is_base_resolver_type {
                Transformed::Delete
            } else {
                Transformed::Keep
            }
        }
    }
}
