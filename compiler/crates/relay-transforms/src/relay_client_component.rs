/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::ValidationMessage;
use crate::util::{get_fragment_filename, get_normalization_operation_name};
use crate::{
    match_::SplitOperationMetadata,
    no_inline::{attach_no_inline_directives_to_fragments, validate_required_no_inline_directive},
};
use common::{Diagnostic, DiagnosticsResult, FeatureFlag, FeatureFlags, NamedItem, WithLocation};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{
    associated_data_impl, Argument, ConstantValue, Directive, FragmentDefinition, FragmentSpread,
    OperationDefinition, Program, Selection, Transformed, Transformer, Value,
};
use graphql_syntax::OperationKind;
use intern::string_key::{Intern, StringKey};
use itertools::Itertools;
use lazy_static::lazy_static;
use schema::{InterfaceID, Schema, Type};
use std::sync::Arc;

lazy_static! {
    pub static ref RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME: StringKey =
        "relay_client_component_server".intern();
    pub static ref RELAY_CLIENT_COMPONENT_MODULE_ID_ARGUMENT_NAME: StringKey = "module_id".intern();
    pub static ref RELAY_CLIENT_COMPONENT_DIRECTIVE_NAME: StringKey =
        "relay_client_component".intern();
    static ref STRING_TYPE: StringKey = "String".intern();
    static ref ID_FIELD_NAME: StringKey = "id".intern();
    static ref NODE_TYPE_NAME: StringKey = "Node".intern();
    static ref VIEWER_TYPE_NAME: StringKey = "Viewer".intern();
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RelayClientComponentMetadata {
    pub split_operation_filenames: Vec<StringKey>,
}
associated_data_impl!(RelayClientComponentMetadata);

pub fn relay_client_component(
    program: &Program,
    feature_flags: &FeatureFlags,
) -> DiagnosticsResult<Program> {
    // Noop, the @relay_client_component_server directive is not defined in the schema
    if program
        .schema
        .get_directive(*RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME)
        .is_none()
    {
        return Ok(program.clone());
    }
    let node_interface_id = program
        .schema
        .get_type(*NODE_TYPE_NAME)
        .and_then(|type_| {
            if let Type::Interface(id) = type_ {
                Some(id)
            } else {
                None
            }
        })
        .expect("@relay_client_component requires your schema to define the Node interface.");

    let mut transform =
        RelayClientComponentTransform::new(program, node_interface_id, feature_flags);
    let mut next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if !transform.no_inline_fragments.is_empty() {
        validate_required_no_inline_directive(&transform.no_inline_fragments, program)?;
        attach_no_inline_directives_to_fragments(
            &mut transform.no_inline_fragments,
            &mut next_program,
        );
    }
    if !transform.split_operations.is_empty() {
        for (_, (metadata, mut operation)) in transform.split_operations.drain() {
            operation.directives.push(metadata.to_directive());
            if let Some(prev_operation) = next_program.operation(operation.name.item) {
                transform.errors.push(Diagnostic::error(
                    ValidationMessage::DuplicateRelayClientComponentSplitOperation,
                    prev_operation.name.location,
                ));
            } else {
                next_program.insert_operation(Arc::new(operation))
            }
        }
    }

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct RelayClientComponentTransform<'program, 'flag> {
    program: &'program Program,
    errors: Vec<Diagnostic>,
    split_operations: FnvHashMap<StringKey, (SplitOperationMetadata, OperationDefinition)>,
    node_interface_id: InterfaceID,
    /// Name of the document currently being transformed.
    document_name: Option<StringKey>,
    split_operation_filenames: FnvHashSet<StringKey>,
    no_inline_flag: &'flag FeatureFlag,
    // Stores the fragments that should use @no_inline and their parent document name
    no_inline_fragments: FnvHashMap<StringKey, Vec<StringKey>>,
}

impl<'program, 'flag> RelayClientComponentTransform<'program, 'flag> {
    fn new(
        program: &'program Program,
        node_interface_id: InterfaceID,
        feature_flags: &'flag FeatureFlags,
    ) -> Self {
        Self {
            program,
            errors: Default::default(),
            split_operations: Default::default(),
            node_interface_id,
            document_name: None,
            split_operation_filenames: Default::default(),
            no_inline_flag: &feature_flags.no_inline,
            no_inline_fragments: Default::default(),
        }
    }

    fn transform_relay_client_component(
        &mut self,
        spread: &FragmentSpread,
    ) -> Result<Transformed<Selection>, Diagnostic> {
        if let Some(incompatible_directives_diagnostic) =
            self.get_incompatible_directives_diagnostic(spread)
        {
            return Err(incompatible_directives_diagnostic);
        }
        // @relay_client_component does not take arguments (yet)
        if let Some(argument) = spread.arguments.first() {
            return Err(Diagnostic::error(
                ValidationMessage::InvalidRelayClientComponentWithArguments,
                argument.name.location,
            ));
        }

        let fragment = self
            .program
            .fragment(spread.fragment.item)
            .unwrap_or_else(|| panic!("Expected to find fragment `{}`", spread.fragment.item));
        // Validate that the fragment's type condition MUST implement `Node`.
        let node_interface_id = self.node_interface_id;
        let implements_node = match fragment.type_condition {
            // Fragments can be specified on object types, interfaces, and unions.
            // https://spec.graphql.org/June2018/#sec-Type-Conditions
            Type::Interface(id) => {
                id == node_interface_id
                    || self
                        .program
                        .schema
                        .interface(id)
                        .implementing_objects
                        .iter()
                        .all(|&object_id| {
                            self.program
                                .schema
                                .object(object_id)
                                .interfaces
                                .iter()
                                .any(|interface_id| *interface_id == node_interface_id)
                        })
            }
            Type::Object(id) => self
                .program
                .schema
                .object(id)
                .interfaces
                .iter()
                .any(|interface_id| *interface_id == node_interface_id),
            Type::Union(id) => self
                .program
                .schema
                .union(id)
                .members
                .iter()
                .all(|&object_id| {
                    self.program
                        .schema
                        .object(object_id)
                        .interfaces
                        .iter()
                        .any(|interface_id| *interface_id == node_interface_id)
                }),
            _ => false,
        };
        let is_fragment_on_query =
            fragment.type_condition == self.program.schema.query_type().unwrap();
        let is_fragment_on_viewer =
            self.program.schema.get_type_name(fragment.type_condition) == *VIEWER_TYPE_NAME;
        if !implements_node && !is_fragment_on_query && !is_fragment_on_viewer {
            return Err(Diagnostic::error(
                ValidationMessage::InvalidRelayClientComponentNonNodeFragment,
                fragment.name.location,
            ));
        }

        let should_use_no_inline = self.no_inline_flag.is_enabled_for(spread.fragment.item);
        if should_use_no_inline {
            self.no_inline_fragments
                .entry(fragment.name.item)
                .or_insert_with(std::vec::Vec::new)
                .push(self.document_name.unwrap());
        } else {
            // Generate a SplitOperation AST
            let created_split_operation = self
                .split_operations
                .entry(spread.fragment.item)
                .or_insert_with(|| {
                    let normalization_name =
                        get_normalization_operation_name(spread.fragment.item).intern();
                    (
                        SplitOperationMetadata {
                            derived_from: spread.fragment.item,
                            parent_documents: Default::default(),
                            raw_response_type: false,
                        },
                        OperationDefinition {
                            name: WithLocation::new(spread.fragment.location, normalization_name),
                            type_: fragment.type_condition,
                            kind: OperationKind::Query,
                            variable_definitions: fragment.variable_definitions.clone(),
                            directives: fragment.directives.clone(),
                            selections: vec![Selection::FragmentSpread(Arc::new(FragmentSpread {
                                arguments: Default::default(),
                                directives: Default::default(),
                                fragment: spread.fragment,
                            }))],
                        },
                    )
                });
            created_split_operation
                .0
                .parent_documents
                .insert(self.document_name.unwrap());
        }

        // @relay_client_component -> @relay_client_component_server(module_id: "...")
        let module_id = get_fragment_filename(spread.fragment.item);
        let mut next_directives = spread.directives.clone();
        if let Some(relay_client_component_directive) = next_directives
            .iter_mut()
            .find(|directive| directive.name.item == *RELAY_CLIENT_COMPONENT_DIRECTIVE_NAME)
        {
            *relay_client_component_directive = Directive {
                name: WithLocation {
                    item: *RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME,
                    location: relay_client_component_directive.name.location,
                },
                arguments: vec![Argument {
                    name: WithLocation::generated(*RELAY_CLIENT_COMPONENT_MODULE_ID_ARGUMENT_NAME),
                    value: WithLocation::generated(Value::Constant(ConstantValue::String(
                        module_id,
                    ))),
                }],
                data: None,
            };
        }

        // Record the SplitOperation so we can emit metadata later
        self.split_operation_filenames.insert(module_id);

        Ok(Transformed::Replace(Selection::FragmentSpread(Arc::new(
            FragmentSpread {
                directives: next_directives,
                ..spread.clone()
            },
        ))))
    }

    fn get_incompatible_directives_diagnostic(
        &self,
        spread: &FragmentSpread,
    ) -> Option<Diagnostic> {
        let incompatible_directives = spread
            .directives
            .iter()
            .filter_map(|directive| {
                if directive.name.item != *RELAY_CLIENT_COMPONENT_DIRECTIVE_NAME {
                    Some(directive.name.item)
                } else {
                    None
                }
            })
            .collect::<Vec<StringKey>>();
        if !incompatible_directives.is_empty() {
            Some(Diagnostic::error(
                ValidationMessage::IncompatibleRelayClientComponentDirectives {
                    incompatible_directives,
                },
                spread.fragment.location,
            ))
        } else {
            None
        }
    }

    fn generate_relay_client_component_client_metadata_directive(&mut self) -> Directive {
        let split_operation_filenames = self.split_operation_filenames.drain().sorted().collect();
        RelayClientComponentMetadata {
            split_operation_filenames,
        }
        .into()
    }
}

impl<'program, 'flag> Transformer for RelayClientComponentTransform<'program, 'flag> {
    const NAME: &'static str = "RelayClientComponentTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        assert!(self.split_operation_filenames.is_empty());
        self.document_name = Some(operation.name.item);

        let transformed = self.default_transform_operation(operation);
        if self.split_operation_filenames.is_empty() {
            return transformed;
        }

        let mut operation = transformed.unwrap_or_else(|| operation.clone());
        operation.directives.reserve_exact(1);
        operation
            .directives
            .push(self.generate_relay_client_component_client_metadata_directive());
        Transformed::Replace(operation)
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        assert!(self.split_operation_filenames.is_empty());
        self.document_name = Some(fragment.name.item);

        let transformed = self.default_transform_fragment(fragment);
        if self.split_operation_filenames.is_empty() {
            return transformed;
        }

        let mut fragment = transformed.unwrap_or_else(|| fragment.clone());
        fragment.directives.reserve_exact(1);
        fragment
            .directives
            .push(self.generate_relay_client_component_client_metadata_directive());
        Transformed::Replace(fragment)
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        let relay_client_component_directive = spread
            .directives
            .named(*RELAY_CLIENT_COMPONENT_DIRECTIVE_NAME);
        if relay_client_component_directive.is_some() {
            match self.transform_relay_client_component(spread) {
                Ok(transformed) => transformed,
                Err(err) => {
                    self.errors.push(err);
                    self.default_transform_fragment_spread(spread)
                }
            }
        } else {
            self.default_transform_fragment_spread(spread)
        }
    }
}
