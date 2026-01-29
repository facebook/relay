/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the goto definition feature

use std::path::Path;

use common::Location as IRLocation;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentSpread;
use graphql_ir::Program;
use graphql_ir::Visitor;
use intern::string_key::StringKey;
use lsp_types::Location as LSPLocation;
use lsp_types::request::References;
use lsp_types::request::Request;
use relay_docblock::DocblockIr;
use relay_docblock::On;
use relay_docblock::ResolverFieldDocblockIr;
use schema::Schema;

use crate::FeatureResolutionInfo;
use crate::docblock_resolution_info::DocblockResolutionInfo;
use crate::find_field_usages::find_field_locations;
use crate::find_field_usages::get_usages;
use crate::location::transform_relay_location_on_disk_to_lsp_location;
use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;
use crate::node_resolution_info::NodeKind;
use crate::server::GlobalState;

fn get_references_response(
    feature_resolution_info: FeatureResolutionInfo,
    program: &Program,
    root_dir: &Path,
) -> LSPRuntimeResult<Vec<LSPLocation>> {
    match feature_resolution_info {
        FeatureResolutionInfo::GraphqlNode(node_resolution_info) => {
            match node_resolution_info.kind {
                NodeKind::FragmentDefinition(fragment) => {
                    let references =
                        ReferenceFinder::get_references_to_fragment(program, fragment.name.value)
                            .into_iter()
                            .map(|location| {
                                transform_relay_location_on_disk_to_lsp_location(root_dir, location)
                            })
                            .collect::<Result<Vec<_>, LSPRuntimeError>>()?;

                    Ok(references)
                }
                NodeKind::FieldName => {
                    let (type_, field) = node_resolution_info
                        .type_path
                        .resolve_current_field(&program.schema)
                        .ok_or_else(|| {
                            LSPRuntimeError::UnexpectedError(" field not found!".to_string())
                        })?;
                    let type_name = program.schema.get_type_name(type_);
                    let field_name = field.name.item;

                    let lsp_locations =
                        get_usages(program, &program.schema, type_name, field_name)?
                            .into_iter()
                            .map(|(_, ir_location)| {
                                transform_relay_location_on_disk_to_lsp_location(
                                    root_dir,
                                    ir_location,
                                )
                            })
                            .collect::<Result<Vec<_>, LSPRuntimeError>>()?;
                    Ok(lsp_locations)
                }
                _ => Err(LSPRuntimeError::ExpectedError),
            }
        }
        FeatureResolutionInfo::DocblockNode(docblock_node) => {
            if let DocblockResolutionInfo::FieldName(field_name) = docblock_node.resolution_info {
                let type_name = match docblock_node.ir {
                    DocblockIr::Field(ResolverFieldDocblockIr::LegacyVerboseResolver(
                        relay_resolver,
                    )) => match relay_resolver.on {
                        On::Type(type_) => type_.value.item,
                        On::Interface(interface) => interface.value.item,
                    },
                    DocblockIr::Field(ResolverFieldDocblockIr::TerseRelayResolver(
                        terse_resolver,
                    )) => terse_resolver.type_.item,
                    DocblockIr::Type(_) => {
                        // TODO: Implement support for types.
                        return Err(LSPRuntimeError::ExpectedError);
                    }
                };

                let references = find_field_locations(program, field_name, type_name)
                    .ok_or(LSPRuntimeError::ExpectedError)?
                    .into_iter()
                    .map(|location| {
                        transform_relay_location_on_disk_to_lsp_location(root_dir, location)
                    })
                    .collect::<Result<Vec<_>, LSPRuntimeError>>()?;

                Ok(references)
            } else {
                // Go to reference not implemented for other parts of the docblocks yet.
                Err(LSPRuntimeError::ExpectedError)
            }
        }
    }
}

#[derive(Debug, Clone)]
struct ReferenceFinder {
    references: Vec<IRLocation>,
    name: StringKey,
}

impl ReferenceFinder {
    fn get_references_to_fragment(program: &Program, name: StringKey) -> Vec<IRLocation> {
        let mut reference_finder = ReferenceFinder {
            references: vec![],
            name,
        };
        reference_finder.visit_program(program);
        reference_finder.references
    }
}

impl Visitor for ReferenceFinder {
    const NAME: &'static str = "ReferenceFinder";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if spread.fragment.item == FragmentDefinitionName(self.name) {
            self.references.push(spread.fragment.location);
        }
    }
}

pub fn on_references(
    state: &impl GlobalState,
    params: <References as Request>::Params,
) -> LSPRuntimeResult<<References as Request>::Result> {
    let node_resolution_info = state.resolve_node(&params.text_document_position)?;
    let references_response = get_references_response(
        node_resolution_info,
        &state
            .get_program(&state.extract_project_name_from_url(
                &params.text_document_position.text_document.uri,
            )?)?,
        &state.root_dir(),
    )?;
    Ok(Some(references_response))
}
