/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Span;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::reexport::StringKey;
use relay_docblock::DocblockIr;
use relay_docblock::On;
use relay_docblock::ResolverFieldDocblockIr;
use relay_docblock::ResolverTypeDocblockIr;

pub enum DocblockResolutionInfo {
    Type(StringKey),
    RootFragment(FragmentDefinitionName),
    FieldName(StringKey),
    FieldArgumentName,
    Deprecated,
}

pub fn create_docblock_resolution_info(
    docblock_ir: &DocblockIr,
    position_span: Span,
) -> Option<DocblockResolutionInfo> {
    match docblock_ir {
        DocblockIr::Field(ResolverFieldDocblockIr::LegacyVerboseResolver(resolver_ir)) => {
            match resolver_ir.on {
                On::Type(on_type) => {
                    if on_type.value.location.contains(position_span) {
                        return Some(DocblockResolutionInfo::Type(on_type.value.item));
                    }
                }
                On::Interface(on_interface) => {
                    if on_interface.value.location.contains(position_span) {
                        return Some(DocblockResolutionInfo::Type(on_interface.value.item));
                    }
                }
            };

            // Root fragment
            if let Some(root_fragment) = resolver_ir.root_fragment
                && root_fragment.location.contains(position_span)
            {
                return Some(DocblockResolutionInfo::RootFragment(root_fragment.item));
            }

            // Field name
            if resolver_ir.field.name.span.contains(position_span) {
                return Some(DocblockResolutionInfo::FieldName(
                    resolver_ir.field.name.value,
                ));
            }

            // Field arguments
            if let Some(field_arguments) = &resolver_ir.field.arguments {
                for field_argument in &field_arguments.items {
                    if field_argument.name.span.contains(position_span) {
                        return Some(DocblockResolutionInfo::FieldArgumentName);
                    }
                }
            }

            // Return type
            if let Some(output_type) = &resolver_ir.output_type
                && output_type.inner().location.contains(position_span)
            {
                return Some(DocblockResolutionInfo::Type(
                    output_type.inner().item.inner().name.value,
                ));
            }

            // @deprecated key
            if let Some(deprecated) = resolver_ir.deprecated
                && deprecated.key_location().contains(position_span)
            {
                return Some(DocblockResolutionInfo::Deprecated);
            }

            None
        }
        DocblockIr::Field(ResolverFieldDocblockIr::TerseRelayResolver(resolver_ir)) => {
            // Parent type
            if resolver_ir.type_.location.contains(position_span) {
                return Some(DocblockResolutionInfo::Type(resolver_ir.type_.item));
            }

            let field_type_location = resolver_ir
                .location
                .with_span(resolver_ir.field.type_.span());

            // Return type
            if field_type_location.contains(position_span) {
                return Some(DocblockResolutionInfo::Type(
                    resolver_ir.field.type_.inner().name.value,
                ));
            }

            // Root fragment
            if let Some(root_fragment) = resolver_ir.root_fragment
                && root_fragment.location.contains(position_span)
            {
                return Some(DocblockResolutionInfo::RootFragment(root_fragment.item));
            }

            // Field name
            if resolver_ir.field.name.span.contains(position_span) {
                return Some(DocblockResolutionInfo::FieldName(
                    resolver_ir.field.name.value,
                ));
            }

            // Field arguments
            if let Some(field_arguments) = &resolver_ir.field.arguments {
                for field_argument in &field_arguments.items {
                    if field_argument.name.span.contains(position_span) {
                        return Some(DocblockResolutionInfo::FieldArgumentName);
                    }
                }
            }

            // @deprecated key
            if let Some(deprecated) = resolver_ir.deprecated
                && deprecated.key_location().contains(position_span)
            {
                return Some(DocblockResolutionInfo::Deprecated);
            }

            None
        }
        DocblockIr::Type(ResolverTypeDocblockIr::StrongObjectResolver(strong_object)) => {
            if strong_object.rhs_location.contains(position_span) {
                return Some(DocblockResolutionInfo::Type(strong_object.type_name.value));
            }

            if let Some(deprecated) = strong_object.deprecated
                && deprecated.key_location().contains(position_span)
            {
                return Some(DocblockResolutionInfo::Deprecated);
            }
            None
        }
        DocblockIr::Type(ResolverTypeDocblockIr::WeakObjectType(weak_type_ir)) => {
            if weak_type_ir.rhs_location.contains(position_span) {
                return Some(DocblockResolutionInfo::Type(weak_type_ir.type_name.value));
            }

            if let Some(deprecated) = weak_type_ir.deprecated
                && deprecated.key_location().contains(position_span)
            {
                return Some(DocblockResolutionInfo::Deprecated);
            }
            // TODO: We could provide location mapping for the @weak docblock attribute
            None
        }
    }
}
