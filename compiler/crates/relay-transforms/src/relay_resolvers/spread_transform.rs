/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Directive;
use graphql_ir::Field as IrField;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::VariableName;
use schema::Schema;

use super::RelayResolverFieldMetadata;
use super::RelayResolverMetadata;
use crate::ClientEdgeMetadata;

/// Convert fields with attached Relay Resolver metadata into the fragment
/// spread of their data dependencies (root fragment). Their
/// `RelayResolverMetadata` IR directive is left attached to this fragment
/// spread.
///
/// For resolvers without a fragment (for example @live resolvers that read from
/// an external source, or resolvers which are simply a function of their
/// arguments) the field is transformed into a `__id` field with the
/// `RelayResolverMetadata` IR directive attached.
pub(super) fn relay_resolvers_spread_transform(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = RelayResolverSpreadTransform::new(program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct RelayResolverSpreadTransform<'program> {
    program: &'program Program,
    errors: Vec<Diagnostic>,
}

impl<'program> RelayResolverSpreadTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            errors: Default::default(),
        }
    }

    fn transformed_field(&self, field: &impl IrField) -> Option<Selection> {
        RelayResolverFieldMetadata::find(field.directives()).map(|field_metadata| {
            let fragment_definition = field_metadata.fragment_name.map(|fragment_name| {
                self.program
                    .fragment(fragment_name)
                    .expect("Previous validation passes ensured this exists.")
            });

            let (fragment_arguments, field_arguments) =
                field.arguments().iter().cloned().partition(|arg| {
                    if let Some(fragment_definition) = fragment_definition {
                        fragment_definition
                            .variable_definitions
                            .named(VariableName(arg.name.item.0))
                            .is_some()
                    } else {
                        false
                    }
                });

            let resolver_metadata = RelayResolverMetadata {
                import_path: field_metadata.import_path,
                import_name: field_metadata.import_name,
                field_alias: field.alias().map(|field_alias| field_alias.item),
                field_path: field_metadata.field_path,
                field_id: field.definition().item,
                field_arguments,
                fragment_arguments: fragment_arguments.clone(),
                live: field_metadata.live,
                output_type_info: field_metadata.output_type_info.clone(),
                fragment_data_injection_mode: field_metadata
                    .fragment_data_injection_mode
                    .as_ref()
                    .map(|injection_mode| {
                        (
                            self.program
                                .fragment(
                                    field_metadata
                                        .fragment_name
                                        .expect("Expected to have a fragment name."),
                                )
                                .expect("Expect to have a fragment node.")
                                .name,
                            *injection_mode,
                        )
                    }),
                type_confirmed: field_metadata.type_confirmed,
                resolver_type: field_metadata.resolver_type,
                return_fragment: field_metadata.return_fragment,
            };

            let mut new_directives: Vec<Directive> = vec![resolver_metadata.into()];

            for directive in field.directives() {
                if directive.name.item != RelayResolverFieldMetadata::directive_name() {
                    new_directives.push(directive.clone())
                }
            }
            if let Some(fragment_definition) = fragment_definition {
                Selection::FragmentSpread(Arc::new(FragmentSpread {
                    fragment: fragment_definition.name,
                    arguments: fragment_arguments,
                    signature: Some(fragment_definition.as_ref().into()),
                    directives: new_directives,
                }))
            } else {
                Selection::ScalarField(Arc::new(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(self.program.schema.clientid_field()),
                    arguments: vec![],
                    directives: new_directives,
                }))
            }
        })
    }
}

impl Transformer<'_> for RelayResolverSpreadTransform<'_> {
    const NAME: &'static str = "RelayResolversSpreadTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        match self.transformed_field(field) {
            Some(selection) => Transformed::Replace(selection),
            None => Transformed::Keep,
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        match self.transformed_field(field) {
            Some(selection) => Transformed::Replace(selection),
            None => self.default_transform_linked_field(field),
        }
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &graphql_ir::InlineFragment,
    ) -> Transformed<Selection> {
        match ClientEdgeMetadata::find(fragment) {
            Some(client_edge_metadata) => {
                let backing_id_field = self
                    .transform_selection(client_edge_metadata.backing_field)
                    .unwrap_or_else(|| client_edge_metadata.backing_field.clone());

                let selections_field = self
                    .default_transform_linked_field(client_edge_metadata.linked_field)
                    .unwrap_or_else(|| {
                        Selection::LinkedField(Arc::new(client_edge_metadata.linked_field.clone()))
                    });

                let selections = vec![backing_id_field, selections_field];

                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    selections,
                    ..fragment.clone()
                })))
            }
            None => self.default_transform_inline_fragment(fragment),
        }
    }
}
