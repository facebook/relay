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
use graphql_ir::TransformedValue;
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

    fn transform_inline_fragment(
        &mut self,
        inline_fragment: &InlineFragment,
    ) -> Transformed<Selection> {
        let selections = self.transform_selections(&inline_fragment.selections);
        // If our child selections had no changes, do not copy them until we have to replace them
        let selections_to_transform = match &selections {
            TransformedValue::Keep => &inline_fragment.selections,
            TransformedValue::Replace(replaced_selections) => replaced_selections,
        };
        let transformed_selections = transform_selections_given_parent_type(
            inline_fragment.type_condition,
            &self.program.schema,
            selections_to_transform,
        );
        match transformed_selections {
            TransformedValue::Keep => {
                if !selections.should_keep() {
                    Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                        selections: selections_to_transform.to_vec(),
                        ..inline_fragment.clone()
                    })))
                } else {
                    Transformed::Keep
                }
            }
            TransformedValue::Replace(transformed_selections) => {
                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    selections: transformed_selections,
                    ..inline_fragment.clone()
                })))
            }
        }
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        let selections = self.transform_selections(&fragment.selections);
        let selections_to_transform = match &selections {
            TransformedValue::Keep => &fragment.selections,
            TransformedValue::Replace(replaced_selections) => replaced_selections,
        };
        let transformed_selections = transform_selections_given_parent_type(
            Some(fragment.type_condition),
            &self.program.schema,
            selections_to_transform,
        );
        match transformed_selections {
            TransformedValue::Keep => {
                if !selections.should_keep() {
                    Transformed::Replace(FragmentDefinition {
                        selections: selections_to_transform.to_vec(),
                        ..fragment.clone()
                    })
                } else {
                    Transformed::Keep
                }
            }
            TransformedValue::Replace(transformed_selections) => {
                Transformed::Replace(FragmentDefinition {
                    selections: transformed_selections,
                    ..fragment.clone()
                })
            }
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let selections = self.transform_selections(&field.selections);
        let selections_to_transform = match &selections {
            TransformedValue::Keep => &field.selections,
            TransformedValue::Replace(replaced_selections) => replaced_selections,
        };
        let schema = &self.program.schema;
        let field_type = schema.field(field.definition.item);
        let edge_to_type = field_type.type_.inner();
        let transformed_selections = transform_selections_given_parent_type(
            Some(edge_to_type),
            &self.program.schema,
            selections_to_transform,
        );
        match transformed_selections {
            TransformedValue::Keep => {
                if !selections.should_keep() {
                    Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                        selections: selections_to_transform.to_vec(),
                        ..field.clone()
                    })))
                } else {
                    Transformed::Keep
                }
            }
            TransformedValue::Replace(transformed_selections) => {
                Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                    selections: transformed_selections,
                    ..field.clone()
                })))
            }
        }
    }
}

// Transform selections on an abstract type.
fn transform_selections_given_parent_type(
    entry_type: Option<Type>,
    schema: &Arc<SDLSchema>,
    selections: &Vec<Selection>,
) -> TransformedValue<Vec<Selection>> {
    if let Some(entry_type) = entry_type {
        if entry_type.is_abstract_type() {
            let (selections_to_copy, mut selections_to_keep) =
                partition_selections_to_copy_and_keep(selections, entry_type);
            if selections_to_copy.is_empty() {
                TransformedValue::Keep
            } else {
                selections_to_keep.append(
                    &mut create_inline_fragment_selections_for_abstract_type(
                        schema,
                        entry_type,
                        &selections_to_copy,
                    ),
                );
                TransformedValue::Replace(selections_to_keep)
            }
        } else {
            // If the type is not an abstract type, skip transform
            TransformedValue::Keep
        }
    } else {
        // If no parent type is provided, skip transform
        TransformedValue::Keep
    }
}

// Partition selections on an abstract type to copy to inline fragments
// on concrete types and to keep as is.
// Selections that should be copied are those that have different implementations
// across concrete types on the abstract type (e.g. resolver field defined differently
// per concrete type.)
// Selections that should be kept are those that have the same implementations
// across concrete types (e.g. fields defined directly on the abstract type, or on server)
// or inline fragments that are on a concrete type.
fn partition_selections_to_copy_and_keep(
    selections: &[Selection],
    abstract_type: Type,
) -> (Vec<Selection>, Vec<Selection>) {
    // TODO T174693027 don't copy resolver fields on abstract type or defined on server
    assert!(
        abstract_type.is_abstract_type(),
        "Type should be known as abstract type"
    );
    // True means selection should be copied
    selections
        .iter()
        .cloned()
        .partition(|selection| match selection {
            Selection::InlineFragment(inline_fragment) => inline_fragment.type_condition.is_none(),
            Selection::FragmentSpread(_) => false,
            _ => true,
        })
}

fn create_inline_fragment_selections_for_abstract_type(
    schema: &Arc<SDLSchema>,
    abstract_type: Type,
    selections: &Vec<Selection>,
) -> Vec<Selection> {
    assert!(
        !selections.is_empty(),
        "Expected selections to be non-empty when copying to inline fragments on concrete type"
    );
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
                        directives: vec![], // Directives not necessary here
                        selections: selections.to_vec(),
                        spread_location: Location::generated(),
                    }))
                })
                .collect()
        }
        Type::Union(_union_id) => selections.clone(), // TODO T174693027 implement unions
        _ => panic!("Expected abstract type"),
    }
}
