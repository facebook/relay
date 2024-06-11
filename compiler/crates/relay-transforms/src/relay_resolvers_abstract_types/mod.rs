/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlags;
use common::Location;
use graphql_ir::FragmentDefinition;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

/// Transform selections on abstract types.
///
/// First we locate fields which are abstract types. Then we convert all of its
/// selections into inline fragments per concrete type with the same
/// selections.
pub fn relay_resolvers_abstract_types(
    program: &Program,
    feature_flags: &FeatureFlags,
) -> DiagnosticsResult<Program> {
    if !feature_flags
        .relay_resolver_enable_interface_output_type
        .is_fully_enabled()
    {
        return Ok(program.clone());
    }
    let mut transform = RelayResolverAbstractTypesTransform::new(program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct RelayResolverAbstractTypesTransform<'program> {
    program: &'program Program,
    errors: Vec<Diagnostic>,
}

impl<'program> RelayResolverAbstractTypesTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            errors: Default::default(),
        }
    }
}

impl Transformer for RelayResolverAbstractTypesTransform<'_> {
    const NAME: &'static str = "RelayResolverAbstractTypesTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if !matches!(fragment.type_condition, Type::Interface(_)) {
            return Transformed::Keep;
        }
        let inline_fragment_selections = create_inline_fragment_selections_for_abstract_type(
            &self.program.schema,
            fragment.type_condition,
            &fragment.selections,
        );
        Transformed::Replace(FragmentDefinition {
            selections: inline_fragment_selections,
            ..fragment.clone()
        })
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let schema = &self.program.schema;
        let field_type = schema.field(field.definition.item);
        let edge_to_type = field_type.type_.inner();
        if !matches!(edge_to_type, Type::Interface(_)) {
            return Transformed::Keep;
        }
        let inline_fragment_selections = create_inline_fragment_selections_for_abstract_type(
            &schema,
            edge_to_type,
            &field.selections,
        );
        Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
            selections: inline_fragment_selections,
            ..field.clone()
        })))
    }
}

fn create_inline_fragment_selections_for_abstract_type(
    schema: &Arc<SDLSchema>,
    abstract_type: Type,
    selections: &[Selection],
) -> Vec<Selection> {
    match abstract_type {
        Type::Interface(interface_id) => {
            let interface = schema.interface(interface_id);
            let implementing_objects =
                interface.recursively_implementing_objects(Arc::as_ref(&schema));
            let mut sorted_implementing_objects =
                implementing_objects.into_iter().collect::<Vec<_>>();
            sorted_implementing_objects.sort();
            sorted_implementing_objects
                .iter()
                .map(|object_id| {
                    Selection::InlineFragment(Arc::new(InlineFragment {
                        type_condition: Some(Type::Object(*object_id)),
                        directives: vec![], // TODO T174693027 do we need directives here?
                        selections: selections.to_vec(),
                        spread_location: Location::generated(),
                    }))
                })
                .collect()
        }
        _ => panic!("Expected abstract type to be an interface"),
    }
}
