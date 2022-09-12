/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Span;
use graphql_ir::reexport::StringKey;
use graphql_ir::FragmentDefinitionName;
use relay_docblock::DocblockIr;
use relay_docblock::On;

use crate::LSPRuntimeError;
use crate::LSPRuntimeResult;

pub enum DocblockResolutionInfo {
    OnType(StringKey),
    OnInterface(StringKey),
    RootFragment(FragmentDefinitionName),
    FieldName(StringKey),
    OutputType(StringKey),
    Deprecated,
}

pub fn create_docblock_resolution_info(
    docblock_ir: &DocblockIr,
    position_span: Span,
) -> LSPRuntimeResult<DocblockResolutionInfo> {
    match docblock_ir {
        DocblockIr::RelayResolver(resolver_ir) => {
            match resolver_ir.on {
                On::Type(on_type) => {
                    if on_type.value.location.contains(position_span) {
                        return Ok(DocblockResolutionInfo::OnType(on_type.value.item));
                    }
                }
                On::Interface(on_interface) => {
                    if on_interface.value.location.contains(position_span) {
                        return Ok(DocblockResolutionInfo::OnInterface(on_interface.value.item));
                    }
                }
            };
            if let Some(root_fragment) = resolver_ir.root_fragment {
                if root_fragment.location.contains(position_span) {
                    return Ok(DocblockResolutionInfo::RootFragment(root_fragment.item));
                }
            }

            if resolver_ir.field.name.span.contains(position_span) {
                return Ok(DocblockResolutionInfo::FieldName(
                    resolver_ir.field.name.value,
                ));
            }

            if let Some(output_type) = &resolver_ir.output_type {
                if output_type.inner().location.contains(position_span) {
                    return Ok(DocblockResolutionInfo::OutputType(
                        output_type.inner().item.inner().name.value,
                    ));
                }
            }

            if let Some(deprecated) = resolver_ir.deprecated {
                if deprecated.key_location.contains(position_span) {
                    return Ok(DocblockResolutionInfo::Deprecated);
                }
            }

            Err(LSPRuntimeError::ExpectedError)
        }
    }
}
