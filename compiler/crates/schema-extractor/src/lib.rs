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

use ::intern::intern;
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
    pub return_type: FlowType,
    pub entity_type: FlowType,
    pub is_live: Option<Location>,
    // TODO: args
}

#[derive(Debug)]
pub struct WeakObjectData {
    pub field_name: WithLocation<StringKey>,
    pub type_alias: FlowType,
}

#[derive(Debug)]
pub enum FlowType {
    NamedType(NamedType),
    GenericType(GenericType),
    PluralType(PluralType),
    ObjectType(ObjectType),
}

#[derive(Debug)]
pub struct NamedType {
    pub identifier: WithLocation<StringKey>,
    pub optional: bool,
}

#[derive(Debug)]
pub struct GenericType {
    pub identifier: WithLocation<StringKey>,
    pub parameter: Box<FlowType>,
    pub optional: bool,
    pub location: Location,
}

#[derive(Debug)]
pub struct PluralType {
    pub inner: Box<FlowType>,
    pub optional: bool,
    pub location: Location,
}

#[derive(Debug)]
pub struct ObjectType {
    pub field_map: Box<FxHashMap<WithLocation<StringKey>, FlowType>>,
    pub location: Location,
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

        let raw_return_type = node.return_type.as_ref().ok_or_else(|| {
            Diagnostic::error(ExtractError::MissingReturnType, self.to_location(node))
        })?;
        let return_type_with_live = self.extract_type(raw_return_type)?;

        let (return_type, is_live) =
            if let FlowType::GenericType(generic_flow_type) = return_type_with_live {
                if generic_flow_type.identifier.item.lookup() == LIVE_FLOW_TYPE_NAME {
                    if generic_flow_type.optional {
                        return Err(vec![Diagnostic::error(
                            ExtractError::NoOptionalLiveType,
                            generic_flow_type.location,
                        )]);
                    }
                    (
                        *generic_flow_type.parameter,
                        Some(generic_flow_type.identifier.location),
                    )
                } else {
                    (FlowType::GenericType(generic_flow_type), None)
                }
            } else {
                (return_type_with_live, None)
            };

        if node.params.is_empty() {
            return self.error_result(ExtractError::MissingFunctionParam, node);
        }
        let param = &node.params[0];
        let entity_type = if let Pattern::Identifier(identifier) = param {
            let raw_type = identifier.type_annotation.as_ref().ok_or_else(|| {
                Diagnostic::error(ExtractError::MissingParamType, self.to_location(param))
            })?;
            self.extract_type(raw_type)?
        } else {
            return self.error_result(ExtractError::UnsupportedType, param);
        };

        Ok(ResolverFlowData::Strong(FieldData {
            field_name,
            return_type,
            entity_type,
            is_live,
        }))
    }

    fn extract_type(&self, type_annotation: &HermesTypeAnnotation) -> DiagnosticsResult<FlowType> {
        if let TypeAnnotationEnum::FlowTypeAnnotation(type_) = &type_annotation.type_annotation {
            self.extract_flow_type(type_, false)
        } else {
            self.error_result(ExtractError::UnsupportedType, type_annotation)
        }
    }

    fn extract_flow_type(
        &self,
        type_annotation: &FlowTypeAnnotation,
        optional: bool,
    ) -> DiagnosticsResult<FlowType> {
        match type_annotation {
            FlowTypeAnnotation::GenericTypeAnnotation(node) => {
                // Extracts type identifier, generics, handles nullables and arrays
                let identifier = match &node.id {
                    TypeIdentifier::Identifier(id) => (&id.name).intern(),
                    TypeIdentifier::QualifiedTypeIdentifier(_)
                    | TypeIdentifier::QualifiedTypeofIdentifier(_) => {
                        return self.error_result(ExtractError::UnsupportedType, node.as_ref());
                    }
                };

                if let Some(type_param) = &node.type_parameters {
                    match type_param.params.as_slice() {
                        [param] => {
                            let type_: FlowType = self.extract_flow_type(param, false)?;
                            let is_plural = identifier == intern!("Array")
                                || identifier == intern!("$ReadOnlyArray");
                            if is_plural {
                                Ok(FlowType::PluralType(PluralType {
                                    inner: Box::new(type_),
                                    optional,
                                    location: self.to_location(param),
                                }))
                            } else {
                                Ok(FlowType::GenericType(GenericType {
                                    identifier: WithLocation {
                                        item: identifier,
                                        location: self.to_location(node.as_ref()),
                                    },
                                    parameter: Box::new(type_),
                                    optional,
                                    location: self.to_location(param),
                                }))
                            }
                        }
                        _ => {
                            // Does not support multiple type params for now
                            return self.error_result(ExtractError::UnsupportedType, node.as_ref());
                        }
                    }
                } else {
                    Ok(FlowType::NamedType(NamedType {
                        identifier: WithLocation {
                            item: identifier,
                            location: self.to_location(node.as_ref()),
                        },
                        optional,
                    }))
                }
            }
            FlowTypeAnnotation::NumberTypeAnnotation(node) => Ok(FlowType::NamedType(NamedType {
                identifier: WithLocation {
                    item: intern!("Float"),
                    location: self.to_location(node.as_ref()),
                },
                optional,
            })),
            FlowTypeAnnotation::StringTypeAnnotation(node) => Ok(FlowType::NamedType(NamedType {
                identifier: WithLocation {
                    item: intern!("String"),
                    location: self.to_location(node.as_ref()),
                },
                optional,
            })),
            FlowTypeAnnotation::NullableTypeAnnotation(node) => {
                self.extract_flow_type(&node.type_annotation, true)
            }
            FlowTypeAnnotation::ObjectTypeAnnotation(node) => {
                let location = self.to_location(node.as_ref());

                let mut field_map: Box<FxHashMap<WithLocation<StringKey>, FlowType>> =
                    Box::default();
                for property in node.properties.iter() {
                    if let ObjectTypePropertyType::ObjectTypeProperty(prop) = property {
                        if let ObjectTypePropertyKey::Identifier(id) = &prop.key {
                            let value = self.extract_flow_type(&prop.value, false)?;
                            let name = WithLocation {
                                item: (&id.name).intern(),
                                location: self.to_location(node.as_ref()),
                            };
                            field_map.insert(name, value);
                        }
                    }
                }
                Ok(FlowType::ObjectType(ObjectType {
                    field_map,
                    location,
                }))
            }
            _ => self.error_result(ExtractError::UnsupportedType, type_annotation),
        }
    }

    fn extract_type_alias(&self, node: &TypeAlias) -> DiagnosticsResult<WeakObjectData> {
        let field_name = WithLocation {
            item: (&node.id.name).intern(),
            location: self.to_location(&node.id),
        };
        let type_alias = self.extract_flow_type(&node.right, false)?;
        Ok(WeakObjectData {
            field_name,
            type_alias,
        })
    }
}

impl FlowType {
    pub fn location(&self) -> Location {
        match self {
            FlowType::NamedType(t) => t.identifier.location,
            FlowType::GenericType(t) => t.location,
            FlowType::PluralType(t) => t.location,
            FlowType::ObjectType(t) => t.location,
        }
    }
}
