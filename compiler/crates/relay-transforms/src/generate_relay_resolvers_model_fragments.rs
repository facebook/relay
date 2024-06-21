/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::NamedItem;
use common::WithLocation;
use docblock_shared::RELAY_RESOLVER_MODEL_DIRECTIVE_NAME;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use relay_config::SchemaConfig;
use schema::Schema;

lazy_static! {
    // Using a longer name version for this "special" field
    // help us avoid potential collision with product code (__self, __instance can be used for something else)
    static ref RESOLVER_MODEL_INSTANCE_FIELD_NAME: StringKey =
        "__relay_model_instance".intern();
}

pub fn generate_relay_resolvers_model_fragments(
    program: &Program,
    schema_config: &SchemaConfig,
) -> Program {
    let mut next_program = program.clone();
    for object in program.schema.get_objects() {
        if !object.is_extension {
            continue;
        }

        if object
            .directives
            .named(*RELAY_RESOLVER_MODEL_DIRECTIVE_NAME)
            .is_some()
        {
            let object_type = program.schema.get_type(object.name.item.0).unwrap();

            let model_instance_field_id = program
                .schema
                .named_field(object_type, *RESOLVER_MODEL_INSTANCE_FIELD_NAME)
                .unwrap_or_else(|| {
                    panic!(
                        "Objects with directive @{} expected to have field `{}`.",
                        *RELAY_RESOLVER_MODEL_DIRECTIVE_NAME, *RESOLVER_MODEL_INSTANCE_FIELD_NAME
                    )
                });

            let model_fragment_name = FragmentDefinitionName(
                format!(
                    "{}__{}",
                    object.name.item.0, *RESOLVER_MODEL_INSTANCE_FIELD_NAME
                )
                .intern(),
            );

            let fragment_definition = FragmentDefinition {
                name: WithLocation::new(object.name.location, model_fragment_name),
                variable_definitions: vec![],
                used_global_variables: vec![],
                type_condition: object_type,
                directives: vec![],
                selections: vec![Selection::ScalarField(Arc::new(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(model_instance_field_id),
                    arguments: vec![],
                    directives: vec![],
                }))],
            };

            next_program.insert_fragment(Arc::new(fragment_definition));

            // For "strong" models (with `id` field) we will also
            // generate fragment with `id` field, so we can pass it to the Model
            // resolver function.
            if let Some(id_field_id) = program
                .schema
                .named_field(object_type, schema_config.node_interface_id_field)
            {
                let id_fragment_name = FragmentDefinitionName(
                    format!(
                        "{}__{}",
                        object.name.item.0, schema_config.node_interface_id_field
                    )
                    .intern(),
                );

                let id_fragment = FragmentDefinition {
                    name: WithLocation::new(object.name.location, id_fragment_name),
                    variable_definitions: vec![],
                    used_global_variables: vec![],
                    type_condition: object_type,
                    directives: vec![],
                    selections: vec![Selection::ScalarField(Arc::new(ScalarField {
                        alias: None,
                        definition: WithLocation::generated(id_field_id),
                        arguments: vec![],
                        directives: vec![],
                    }))],
                };

                next_program.insert_fragment(Arc::new(id_fragment));
            }
        }
    }

    next_program
}
