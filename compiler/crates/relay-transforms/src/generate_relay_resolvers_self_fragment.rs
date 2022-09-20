/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::sync::Arc;

use common::ArgumentName;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use schema::Schema;

use crate::relay_resolvers::get_argument_value;
use crate::relay_resolvers::RELAY_RESOLVER_DIRECTIVE_NAME;

lazy_static! {
    pub static ref SELF_FRAGMENT_NAME_ARG: ArgumentName =
        ArgumentName("self_fragment_name".intern());
    pub static ref SELF_FIELD_NAME: StringKey = "__self".intern();
}

pub fn generate_relay_resolvers_self_fragment(program: &Program) -> Program {
    let mut fragments = HashMap::<FragmentDefinitionName, Arc<FragmentDefinition>>::new();
    for field in program.schema.get_fields() {
        if !field.is_extension {
            continue;
        }

        if field.name.item != *SELF_FIELD_NAME {
            continue;
        }

        if let Some(directive) = field.directives.named(*RELAY_RESOLVER_DIRECTIVE_NAME) {
            let self_fragment_name = get_argument_value(
                &directive.arguments,
                *SELF_FRAGMENT_NAME_ARG,
                field.name.location,
            )
            .map(FragmentDefinitionName)
            .unwrap();

            let parent_type = field.parent_type.unwrap_or_else(|| {
                panic!("`__self` field parent type is not defined. {:?}", field)
            });
            assert!(parent_type.is_object());
            if fragments.contains_key(&self_fragment_name) {
                panic!(
                    "Duplicate definition of the `__self` fragment `{}` on type `{}`.",
                    self_fragment_name,
                    program.schema.get_type_name(parent_type)
                )
            }

            assert!(field.type_.inner().is_scalar());

            let self_field_id = program
                .schema
                .named_field(parent_type, *SELF_FIELD_NAME)
                .unwrap_or_else(|| {
                    panic!(
                        "Expect to have client-only `__self` field defined on the type `{}`.",
                        program.schema.get_type_name(parent_type)
                    )
                });

            let fragment_definition = Arc::new(FragmentDefinition {
                name: WithLocation::new(field.name.location, self_fragment_name),
                variable_definitions: vec![],
                used_global_variables: vec![],
                type_condition: parent_type,
                directives: vec![],
                selections: vec![Selection::ScalarField(Arc::new(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(self_field_id),
                    arguments: vec![],
                    directives: vec![],
                }))],
            });

            fragments.insert(self_fragment_name, fragment_definition);
        } else {
            // TODO: Maybe panic if the field `__self` don't have a @relay_resolver directive
        }
    }

    let mut next_program = program.clone();
    for fragment in fragments.values() {
        next_program.insert_fragment(Arc::clone(fragment))
    }

    next_program
}
