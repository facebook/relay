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
use docblock_shared::RELAY_RESOLVER_MODEL_INSTANCE_FIELD;
use docblock_shared::RELAY_RESOLVER_SOURCE_HASH;
use docblock_shared::RELAY_RESOLVER_SOURCE_HASH_VALUE;
use docblock_shared::ResolverSourceHash;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::associated_data_impl;
use intern::string_key::Intern;
use relay_config::ProjectName;
use relay_config::SchemaConfig;
use schema::Schema;

/// Currently, this is a wrapper of the hash of the resolver source code.
/// But we can change this `ArtifactSourceKeyData` to be an
/// enum and also represent the `fragment` or `operation` names.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ArtifactSourceKeyData(pub ResolverSourceHash);

associated_data_impl!(ArtifactSourceKeyData);

pub fn generate_relay_resolvers_model_fragments(
    project_name: ProjectName,
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
                .named_field(object_type, *RELAY_RESOLVER_MODEL_INSTANCE_FIELD)
                .unwrap_or_else(|| {
                    panic!(
                        "Objects with directive @{} expected to have field `{}`.",
                        *RELAY_RESOLVER_MODEL_DIRECTIVE_NAME, *RELAY_RESOLVER_MODEL_INSTANCE_FIELD
                    )
                });

            let model_fragment_name = FragmentDefinitionName(
                project_name
                    .generate_name_for_object_and_field(
                        object.name.item.0,
                        *RELAY_RESOLVER_MODEL_INSTANCE_FIELD,
                    )
                    .intern(),
            );

            let resolver_field = program.schema.field(model_instance_field_id);
            let fragment_directives = directives_with_artifact_source(resolver_field);
            let fragment_definition = FragmentDefinition {
                name: WithLocation::new(object.name.location, model_fragment_name),
                variable_definitions: vec![],
                used_global_variables: vec![],
                type_condition: object_type,
                directives: fragment_directives,
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
                    project_name
                        .generate_name_for_object_and_field(
                            object.name.item.0,
                            schema_config.node_interface_id_field,
                        )
                        .intern(),
                );

                let id_fragment = FragmentDefinition {
                    name: WithLocation::new(object.name.location, id_fragment_name),
                    variable_definitions: vec![],
                    used_global_variables: vec![],
                    type_condition: object_type,
                    directives: directives_with_artifact_source(resolver_field),
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

pub fn get_resolver_source_hash(field: &schema::Field) -> Option<ResolverSourceHash> {
    field
        .directives
        .named(*RELAY_RESOLVER_SOURCE_HASH)
        .and_then(|directive| directive.arguments.named(*RELAY_RESOLVER_SOURCE_HASH_VALUE))
        .and_then(|source| source.value.get_string_literal())
        .map(ResolverSourceHash::from_raw)
}

pub(crate) fn directives_with_artifact_source(field: &schema::Field) -> Vec<Directive> {
    if let Some(source_hash) = get_resolver_source_hash(field) {
        vec![ArtifactSourceKeyData(source_hash).into()]
    } else {
        vec![]
    }
}
