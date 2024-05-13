/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod errors;

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::Diagnostic;
use common::DiagnosticDisplay;
use common::DiagnosticsResult;
use common::Location;
use common::WithLocation;
use errors::ExtractError;
use hermes_estree::FlowTypeAnnotation;
use hermes_estree::GenericTypeAnnotation;
use hermes_estree::ObjectTypeAnnotation;
use hermes_estree::ObjectTypePropertyKey;
use hermes_estree::ObjectTypePropertyType;
use hermes_estree::Range;
use hermes_estree::TypeAnnotation as HermesTypeAnnotation;
use hermes_estree::TypeAnnotationEnum;
use hermes_estree::TypeIdentifier;
use rustc_hash::FxHashMap;

pub trait SchemaExtractor {
    fn to_location<T: Range>(&self, node: &T) -> Location;

    fn error_result<T: Range, Any, M: 'static + DiagnosticDisplay>(
        &self,
        message: M,
        node: &T,
    ) -> DiagnosticsResult<Any> {
        Err(vec![Diagnostic::error(message, self.to_location(node))])
    }

    fn unwrap_annotation_enum<'a>(
        &self,
        node: &'a HermesTypeAnnotation,
    ) -> DiagnosticsResult<&'a FlowTypeAnnotation> {
        if let TypeAnnotationEnum::FlowTypeAnnotation(type_) = &node.type_annotation {
            Ok(type_)
        } else {
            self.error_result(ExtractError::UnsupportedType, node)
        }
    }

    fn get_object_fields<'a>(
        &self,
        node: &'a ObjectTypeAnnotation,
    ) -> DiagnosticsResult<Box<FxHashMap<WithLocation<StringKey>, &'a FlowTypeAnnotation>>> {
        let mut field_map: Box<FxHashMap<WithLocation<StringKey>, &FlowTypeAnnotation>> =
            Box::default();
        for property in node.properties.iter() {
            if let ObjectTypePropertyType::ObjectTypeProperty(prop) = property {
                let location = self.to_location(&prop.key);
                if let ObjectTypePropertyKey::Identifier(id) = &prop.key {
                    let name = WithLocation {
                        item: (&id.name).intern(),
                        location,
                    };
                    field_map.insert(name, &prop.value);
                }
            }
        }
        Ok(field_map)
    }
}

pub fn unwrap_nullable_type(node: &FlowTypeAnnotation) -> (&FlowTypeAnnotation, bool) {
    if let FlowTypeAnnotation::NullableTypeAnnotation(type_) = node {
        (&type_.type_annotation, true)
    } else {
        (node, false)
    }
}

pub fn get_identifier_for_flow_generic(
    node: WithLocation<&GenericTypeAnnotation>,
) -> DiagnosticsResult<WithLocation<StringKey>> {
    match &node.item.id {
        TypeIdentifier::Identifier(id) => Ok(WithLocation {
            item: (&id.name).intern(),
            location: node.location,
        }),
        TypeIdentifier::QualifiedTypeIdentifier(_)
        | TypeIdentifier::QualifiedTypeofIdentifier(_) => Err(vec![Diagnostic::error(
            ExtractError::UnsupportedType,
            node.location,
        )]),
    }
}
