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
use ::intern::Lookup;
use common::Diagnostic;
use common::DiagnosticDisplay;
use common::DiagnosticsResult;
use common::Location;
use common::WithLocation;
use errors::ExtractError;
use hermes_estree::FlowTypeAnnotation;
use hermes_estree::Function;
use hermes_estree::GenericTypeAnnotation;
use hermes_estree::ObjectTypeAnnotation;
use hermes_estree::ObjectTypePropertyKey;
use hermes_estree::ObjectTypePropertyType;
use hermes_estree::Pattern;
use hermes_estree::Range;
use hermes_estree::TypeAlias;
use hermes_estree::TypeAnnotation as HermesTypeAnnotation;
use hermes_estree::TypeAnnotationEnum;
use hermes_estree::TypeIdentifier;
use rustc_hash::FxHashMap;

pub static LIVE_FLOW_TYPE_NAME: &str = "LiveState";

/**
 * Reprensents a subset of supported Flow type definitions
 */
#[derive(Debug)]
pub enum ResolverFlowData {
    Strong(FieldData), // strong object or field on an object
    Weak(WeakObjectData),
}

#[derive(Debug)]
pub struct FieldData {
    pub field_name: WithLocation<StringKey>,
    pub return_type: FlowTypeAnnotation,
    pub entity_type: FlowTypeAnnotation,
    pub is_live: Option<Location>,
    // TODO: args
}

#[derive(Debug)]
pub struct WeakObjectData {
    pub field_name: WithLocation<StringKey>,
    pub type_alias: FlowTypeAnnotation,
}

pub trait SchemaExtractor {
    fn to_location<T: Range>(&self, node: &T) -> Location;

    fn error_result<T: Range, Any, M: 'static + DiagnosticDisplay>(
        &self,
        message: M,
        node: &T,
    ) -> DiagnosticsResult<Any> {
        Err(vec![Diagnostic::error(message, self.to_location(node))])
    }

    fn extract_function(&self, node: &Function) -> DiagnosticsResult<ResolverFlowData> {
        let ident = node.id.as_ref().ok_or_else(|| {
            Diagnostic::error(ExtractError::MissingFunctionName, self.to_location(node))
        })?;
        let field_name = WithLocation {
            item: (&ident.name).intern(),
            location: self.to_location(ident),
        };

        let return_type_annotation = node.return_type.as_ref().ok_or_else(|| {
            Diagnostic::error(ExtractError::MissingReturnType, self.to_location(node))
        })?;
        let flow_return_type = self.unwrap_annotation_enum(return_type_annotation)?;
        let (return_type_with_live, is_optional) = unwrap_nullable_type(flow_return_type);

        // unwrap is_live from the return type
        let (return_type, is_live) = match return_type_with_live {
            FlowTypeAnnotation::GenericTypeAnnotation(type_node) => {
                let name = get_identifier_for_flow_generic(WithLocation {
                    item: type_node,
                    location: self.to_location(type_node.as_ref()),
                })?;
                if let Some(type_param) = &type_node.type_parameters {
                    match type_param.params.as_slice() {
                        [param] => {
                            if name.item.lookup() == LIVE_FLOW_TYPE_NAME {
                                if is_optional {
                                    return Err(vec![Diagnostic::error(
                                        ExtractError::NoOptionalLiveType,
                                        name.location,
                                    )]);
                                }
                                (param, Some(name.location))
                            } else {
                                (flow_return_type, None)
                            }
                        }
                        _ => {
                            // Does not support multiple type params for now
                            return self
                                .error_result(ExtractError::UnsupportedType, type_node.as_ref());
                        }
                    }
                } else {
                    (flow_return_type, None)
                }
            }
            FlowTypeAnnotation::StringTypeAnnotation(_) => (flow_return_type, None),
            FlowTypeAnnotation::NumberTypeAnnotation(_) => (flow_return_type, None),
            _ => {
                // Only support named types in function returns
                return self.error_result(ExtractError::UnsupportedType, flow_return_type);
            }
        };

        if node.params.is_empty() {
            return self.error_result(ExtractError::MissingFunctionParam, node);
        }
        let param = &node.params[0];
        let entity_type = if let Pattern::Identifier(identifier) = param {
            let type_annotation = identifier.type_annotation.as_ref().ok_or_else(|| {
                Diagnostic::error(ExtractError::MissingParamType, self.to_location(param))
            })?;
            if let TypeAnnotationEnum::FlowTypeAnnotation(type_) = &type_annotation.type_annotation
            {
                type_
            } else {
                return self.error_result(ExtractError::UnsupportedType, param);
            }
        } else {
            return self.error_result(ExtractError::UnsupportedType, param);
        };

        Ok(ResolverFlowData::Strong(FieldData {
            field_name,
            return_type: return_type.clone(),
            entity_type: entity_type.clone(),
            is_live,
        }))
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

    fn extract_type_alias(&self, node: &TypeAlias) -> DiagnosticsResult<WeakObjectData> {
        let field_name = WithLocation {
            item: (&node.id.name).intern(),
            location: self.to_location(&node.id),
        };
        Ok(WeakObjectData {
            field_name,
            type_alias: node.right.clone(),
        })
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
