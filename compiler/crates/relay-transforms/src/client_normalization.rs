/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Condition;
use graphql_ir::ExecutableDefinitionName;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Variable;
use graphql_ir::VariableName;
use graphql_ir::Visitor;
use graphql_ir::associated_data_impl;
use graphql_syntax::OperationKind;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use rustc_hash::FxHashSet;
use schema::Schema;
use thiserror::Error;

use crate::ClientComponentBoundaryMetadata;
use crate::ClientRscSeamMetadata;
use crate::NoInlineFragmentSpreadMetadata;
use crate::RscSeamMetadata;
use crate::SERVER_DIRECTIVE;
use crate::SplitOperationMetadata;
use crate::rsc_seam_arguments;

const CLIENT_NORMALIZATION_SUFFIX: &str = "$clientNormalization";

/// Compiler-only references required to hydrate a server operation response.
#[derive(Clone, Debug, Eq, Hash, PartialEq)]
pub struct ServerOperationHandoffMetadata {
    /// The reduced normalization operation safe to execute in the client.
    pub client_normalization_operation: OperationDefinitionName,
    /// Reader and normalization artifacts for client fragment boundaries.
    pub client_fragments: Vec<ServerOperationClientFragment>,
}
associated_data_impl!(ServerOperationHandoffMetadata);

/// One client fragment referenced by a server operation handoff.
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct ServerOperationClientFragment {
    /// The Reader fragment exposed to client code.
    pub fragment: FragmentDefinitionName,
    /// The normalization artifact used to publish the fragment's fields.
    pub client_normalization_operation: OperationDefinitionName,
    /// The source location used to resolve both generated artifacts.
    pub fragment_location: Location,
}

/// Generates the client-visible normalization half of every explicit server query.
pub(crate) fn generate_server_operation_handoffs(
    program: &Program,
    node_interface_id_field: StringKey,
) -> DiagnosticsResult<Program> {
    let mut server_operations: Vec<_> = program
        .operations()
        .filter(|operation| operation.directives.named(*SERVER_DIRECTIVE).is_some())
        .cloned()
        .collect();
    if server_operations.is_empty() {
        return Ok(program.clone());
    }
    server_operations.sort_unstable_by_key(|operation| operation.name.item);

    let mut next_program = program.clone();
    let mut projected_operations = Vec::with_capacity(server_operations.len());
    let mut handoffs = Vec::with_capacity(server_operations.len());
    let mut errors = Vec::new();

    for operation in server_operations {
        let mut projector = ClientProjection::new(program, node_interface_id_field);
        let selections = projector.project_selection_set(&operation.selections);
        if !projector.errors.is_empty() {
            errors.append(&mut projector.errors);
            continue;
        }

        projector.client_fragments.sort_unstable();
        projector.client_fragments.dedup();

        let client_normalization_operation = OperationDefinitionName(
            format!("{}{CLIENT_NORMALIZATION_SUFFIX}", operation.name.item.0).intern(),
        );
        if let Some(previous) = program.operation(client_normalization_operation) {
            errors.push(Diagnostic::error(
                ValidationMessage::DuplicateClientNormalizationOperation {
                    operation_name: client_normalization_operation,
                },
                previous.name.location,
            ));
            continue;
        }

        let mut used_variables = UsedVariableCollector::default();
        used_variables.visit_selections(&selections);

        let mut parent_documents = FxHashSet::default();
        parent_documents.insert(ExecutableDefinitionName::OperationDefinitionName(
            operation.name.item,
        ));
        projected_operations.push(Arc::new(OperationDefinition {
            name: WithLocation::new(operation.name.location, client_normalization_operation),
            type_: operation.type_,
            kind: OperationKind::Query,
            variable_definitions: operation
                .variable_definitions
                .iter()
                .filter(|definition| used_variables.names.contains(&definition.name.item))
                .cloned()
                .collect(),
            directives: vec![
                SplitOperationMetadata {
                    derived_from: None,
                    location: operation.name.location,
                    parent_documents,
                    raw_response_type_generation_mode: None,
                }
                .into(),
            ],
            selections,
        }));
        handoffs.push((
            operation.name.item,
            ServerOperationHandoffMetadata {
                client_normalization_operation,
                client_fragments: projector.client_fragments,
            },
        ));
    }

    if !errors.is_empty() {
        return Err(errors);
    }

    for operation in &mut next_program.operations {
        if let Some((_, handoff)) = handoffs
            .iter()
            .find(|(operation_name, _)| *operation_name == operation.name.item)
        {
            Arc::make_mut(operation)
                .directives
                .push(handoff.clone().into());
        }
    }
    next_program.operations.extend(projected_operations);
    Ok(next_program)
}

struct ClientProjection<'program> {
    program: &'program Program,
    node_interface_id_field: StringKey,
    client_fragments: Vec<ServerOperationClientFragment>,
    errors: Vec<Diagnostic>,
}

impl<'program> ClientProjection<'program> {
    fn new(program: &'program Program, node_interface_id_field: StringKey) -> Self {
        Self {
            program,
            node_interface_id_field,
            client_fragments: Vec::new(),
            errors: Vec::new(),
        }
    }

    fn project_selection_set(&mut self, selections: &[Selection]) -> Vec<Selection> {
        let mut spine = Vec::new();
        let mut kept = Vec::new();

        for selection in selections {
            match selection {
                Selection::ScalarField(field) => {
                    if self.is_spine_field(field) {
                        spine.push(selection.clone());
                    }
                }
                Selection::LinkedField(field) => {
                    let projected = self.project_selection_set(&field.selections);
                    if !projected.is_empty() {
                        kept.push(Selection::LinkedField(Arc::new(LinkedField {
                            selections: projected,
                            ..(**field).clone()
                        })));
                    }
                }
                Selection::InlineFragment(fragment) => {
                    let projected = self.project_selection_set(&fragment.selections);
                    if !projected.is_empty() {
                        kept.push(Selection::InlineFragment(Arc::new(InlineFragment {
                            selections: projected,
                            ..(**fragment).clone()
                        })));
                    }
                }
                Selection::Condition(condition) => {
                    let projected = self.project_selection_set(&condition.selections);
                    if !projected.is_empty() {
                        kept.push(Selection::Condition(Arc::new(Condition {
                            selections: projected,
                            ..(**condition).clone()
                        })));
                    }
                }
                Selection::FragmentSpread(spread) => {
                    self.project_fragment_spread(spread, &mut kept);
                }
            }
        }

        if kept.is_empty() {
            Vec::new()
        } else {
            spine.extend(kept);
            spine
        }
    }

    fn project_fragment_spread(&mut self, spread: &FragmentSpread, kept: &mut Vec<Selection>) {
        if let Some(seam) = RscSeamMetadata::find(&spread.directives) {
            let mut directives = spread.directives.clone();
            directives.push(ClientRscSeamMetadata.into());
            kept.push(Selection::FragmentSpread(Arc::new(FragmentSpread {
                arguments: rsc_seam_arguments(spread, seam),
                directives,
                ..spread.clone()
            })));
            return;
        }

        if let Some(boundary) = ClientComponentBoundaryMetadata::find(&spread.directives) {
            self.client_fragments.push(ServerOperationClientFragment {
                fragment: boundary.fragment,
                client_normalization_operation: boundary.normalization_operation,
                fragment_location: boundary.fragment_location,
            });
            kept.push(Selection::FragmentSpread(Arc::new(spread.clone())));
            return;
        }

        if NoInlineFragmentSpreadMetadata::find(&spread.directives).is_some() {
            self.errors.push(Diagnostic::error(
                ValidationMessage::NoInlineFragmentUnsupported {
                    fragment_name: spread.fragment.item,
                },
                spread.fragment.location,
            ));
            return;
        }

        self.errors.push(Diagnostic::error(
            ValidationMessage::UnexpectedFragmentSpread {
                fragment_name: spread.fragment.item,
            },
            spread.fragment.location,
        ));
    }

    fn is_spine_field(&self, field: &ScalarField) -> bool {
        let field_name = self.program.schema.field(field.definition.item).name.item;
        field_name == "__typename".intern()
            || (field.alias.is_none() && field_name == self.node_interface_id_field)
    }
}

#[derive(Default)]
struct UsedVariableCollector {
    names: FxHashSet<VariableName>,
}

impl Visitor for UsedVariableCollector {
    const NAME: &'static str = "UsedVariableCollector";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = true;

    fn visit_variable(&mut self, variable: &Variable) {
        self.names.insert(variable.name.item);
    }
}

#[derive(
    Clone,
    Debug,
    Eq,
    Error,
    Hash,
    Ord,
    PartialEq,
    PartialOrd,
    serde::Serialize
)]
#[serde(tag = "type")]
enum ValidationMessage {
    #[error(
        "Server-owned operation client projection does not yet support non-inlined fragment `{fragment_name}`."
    )]
    NoInlineFragmentUnsupported {
        fragment_name: FragmentDefinitionName,
    },
    #[error(
        "Unexpected inlined fragment `{fragment_name}` remained while deriving a server operation client projection."
    )]
    UnexpectedFragmentSpread {
        fragment_name: FragmentDefinitionName,
    },
    #[error("Client normalization operation `{operation_name}` already exists.")]
    DuplicateClientNormalizationOperation {
        operation_name: OperationDefinitionName,
    },
}
