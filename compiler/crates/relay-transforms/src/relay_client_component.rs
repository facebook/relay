/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::ValidationMessage;
use crate::match_::SplitOperationMetadata;
use crate::util::{get_fragment_filename, get_normalization_operation_name};
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use fnv::FnvHashMap;
use graphql_ir::{
    Argument, ConstantValue, Directive, FragmentSpread, OperationDefinition, Program, Selection,
    Transformed, Transformer, Value,
};
use graphql_syntax::OperationKind;
use indexmap::IndexSet;
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::Schema;
use std::sync::Arc;

lazy_static! {
    pub static ref RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME: StringKey =
        "relay_client_component_server".intern();
    pub static ref RELAY_CLIENT_COMPONENT_MODULE_ID_ARGUMENT_NAME: StringKey = "module_id".intern();
    static ref RELAY_CLIENT_COMPONENT_DIRECTIVE_NAME: StringKey = "relay_client_component".intern();
    static ref STRING_TYPE: StringKey = "String".intern();
    static ref DIRECTIVE_COMPATIBILITY_ALLOWLIST: IndexSet<StringKey> = IndexSet::new();
}

pub fn relay_client_component(program: &Program) -> DiagnosticsResult<Program> {
    // Noop, the @relay_client_component_server directive is not defined in the schema
    if program
        .schema
        .get_directive(*RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME)
        .is_none()
    {
        return Ok(program.clone());
    }

    let mut transform = RelayClientComponentTransform::new(program);
    let mut next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

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

struct RelayClientComponentTransform<'program> {
    program: &'program Program,
    errors: Vec<Diagnostic>,
    split_operations: FnvHashMap<StringKey, (SplitOperationMetadata, OperationDefinition)>,
}

impl<'program> RelayClientComponentTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            errors: Default::default(),
            split_operations: Default::default(),
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

        // Generate a SplitOperation AST
        let normalization_name = get_normalization_operation_name(spread.fragment.item).intern();
        let fragment = self
            .program
            .fragment(spread.fragment.item)
            .unwrap_or_else(|| panic!("Expected to find fragment `{}`", spread.fragment.item));
        let created_split_operation = self
            .split_operations
            .entry(spread.fragment.item)
            .or_insert_with(|| {
                (
                    SplitOperationMetadata {
                        derived_from: spread.fragment.item,
                        parent_sources: Default::default(),
                        raw_response_type: false,
                    },
                    OperationDefinition {
                        name: WithLocation::new(spread.fragment.location, normalization_name),
                        type_: fragment.type_condition,
                        kind: OperationKind::Query,
                        variable_definitions: fragment.variable_definitions.clone(),
                        directives: fragment.directives.clone(),
                        selections: fragment.selections.clone(),
                    },
                )
            });
        created_split_operation
            .0
            .parent_sources
            .insert(spread.fragment.item);

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
            };
        }
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
                if !(directive.name.item == *RELAY_CLIENT_COMPONENT_DIRECTIVE_NAME
                    || DIRECTIVE_COMPATIBILITY_ALLOWLIST.contains(&directive.name.item))
                {
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
}

impl<'program> Transformer for RelayClientComponentTransform<'program> {
    const NAME: &'static str = "RelayClientComponentTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

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
