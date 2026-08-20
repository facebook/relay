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

use std::sync::Arc;

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::Diagnostic;
use common::DiagnosticDisplay;
use common::DiagnosticsResult;
use common::Location;
use common::SourceLocationKey;
use common::Span;
use common::WithLocation;
use errors::ExtractError;
use flow_parser::ast::expression::object::Key;
use flow_parser::ast::types::Generic;
use flow_parser::ast::types::Object as ObjectTypeAnnotation;
use flow_parser::ast::types::Type as FlowTypeAnnotation;
use flow_parser::ast::types::TypeInner;
use flow_parser::ast::types::generic::Identifier as TypeIdentifier;
use flow_parser::ast::types::object::Property as ObjectTypeProperty;
use flow_parser::ast::types::object::PropertyValue;
use flow_parser::loc::Loc;
use flow_parser::offset_utils::OffsetTable;
use rustc_hash::FxHashMap;

/// The Flow parser reports positions as line/column pairs while Relay
/// diagnostics are byte offsets, so translating one into the other requires the
/// offset table of the file the node was parsed from.
#[derive(Clone)]
pub struct LocationResolver {
    source_location: SourceLocationKey,
    offsets: Arc<OffsetTable>,
}

impl LocationResolver {
    pub fn new(source_location: SourceLocationKey, offsets: Arc<OffsetTable>) -> Self {
        Self {
            source_location,
            offsets,
        }
    }

    pub fn source_location(&self) -> SourceLocationKey {
        self.source_location
    }

    pub fn to_span(&self, loc: &Loc) -> Span {
        Span::new(self.offset(loc.start), self.offset(loc.end))
    }

    pub fn to_location(&self, loc: &Loc) -> Location {
        Location::new(self.source_location, self.to_span(loc))
    }

    fn offset(&self, position: flow_parser::loc::Position) -> u32 {
        // A lookup only fails for a position that is not in the file the table
        // was built from, which would mean the span is meaningless anyway.
        self.offsets.offset_utf8(position).unwrap_or(0)
    }
}

/// The Flow type of each named field of an object type annotation.
pub type ObjectFields<'a> = FxHashMap<WithLocation<StringKey>, &'a FlowTypeAnnotation<Loc, Loc>>;

pub trait SchemaExtractor {
    fn to_location(&self, loc: &Loc) -> Location;

    fn error_result<Any, M: 'static + DiagnosticDisplay>(
        &self,
        message: M,
        loc: &Loc,
    ) -> DiagnosticsResult<Any> {
        Err(vec![Diagnostic::error(message, self.to_location(loc))])
    }

    fn get_object_fields<'a>(
        &self,
        node: &'a ObjectTypeAnnotation<Loc, Loc>,
    ) -> DiagnosticsResult<Box<ObjectFields<'a>>> {
        let mut field_map: Box<ObjectFields<'a>> = Box::default();
        for property in node.properties.iter() {
            if let ObjectTypeProperty::NormalProperty(prop) = property
                && let Key::Identifier(id) = &prop.key
                && let PropertyValue::Init(Some(value)) = &prop.value
            {
                let name = WithLocation {
                    item: id.name.as_str().intern(),
                    location: self.to_location(&id.loc),
                };
                field_map.insert(name, value);
            }
        }
        Ok(field_map)
    }
}

pub fn unwrap_nullable_type(
    node: &FlowTypeAnnotation<Loc, Loc>,
) -> (&FlowTypeAnnotation<Loc, Loc>, bool) {
    if let TypeInner::Nullable { inner, .. } = &**node {
        (&inner.argument, true)
    } else {
        (node, false)
    }
}

pub fn get_identifier_for_flow_generic(
    node: WithLocation<&Generic<Loc, Loc>>,
) -> DiagnosticsResult<WithLocation<StringKey>> {
    match &node.item.id {
        TypeIdentifier::Unqualified(id) => Ok(WithLocation {
            item: id.name.as_str().intern(),
            location: node.location,
        }),
        TypeIdentifier::Qualified(_) | TypeIdentifier::ImportTypeAnnot(_) => {
            Err(vec![Diagnostic::error(
                ExtractError::UnsupportedType,
                node.location,
            )])
        }
    }
}

/// The ESTree name of a Flow type annotation, used to describe unsupported
/// types in user facing diagnostics.
pub fn type_annotation_name(node: &FlowTypeAnnotation<Loc, Loc>) -> &'static str {
    match &**node {
        TypeInner::Any { .. } => "AnyTypeAnnotation",
        TypeInner::Mixed { .. } => "MixedTypeAnnotation",
        TypeInner::Empty { .. } => "EmptyTypeAnnotation",
        TypeInner::Void { .. } => "VoidTypeAnnotation",
        TypeInner::Null { .. } => "NullLiteralTypeAnnotation",
        TypeInner::Number { .. } => "NumberTypeAnnotation",
        TypeInner::BigInt { .. } => "BigIntTypeAnnotation",
        TypeInner::String { .. } => "StringTypeAnnotation",
        TypeInner::Boolean { .. } => "BooleanTypeAnnotation",
        TypeInner::Symbol { .. } => "SymbolTypeAnnotation",
        TypeInner::Exists { .. } => "ExistsTypeAnnotation",
        TypeInner::Nullable { .. } => "NullableTypeAnnotation",
        TypeInner::Function { .. } => "FunctionTypeAnnotation",
        TypeInner::ConstructorType { .. } => "ConstructorTypeAnnotation",
        TypeInner::Component { .. } => "ComponentTypeAnnotation",
        TypeInner::Object { .. } => "ObjectTypeAnnotation",
        TypeInner::Interface { .. } => "InterfaceTypeAnnotation",
        TypeInner::Array { .. } => "ArrayTypeAnnotation",
        TypeInner::Conditional { .. } => "ConditionalTypeAnnotation",
        TypeInner::Infer { .. } => "InferTypeAnnotation",
        TypeInner::Generic { .. } => "GenericTypeAnnotation",
        TypeInner::IndexedAccess { .. } => "IndexedAccessType",
        TypeInner::OptionalIndexedAccess { .. } => "OptionalIndexedAccessType",
        TypeInner::Union { .. } => "UnionTypeAnnotation",
        TypeInner::Intersection { .. } => "IntersectionTypeAnnotation",
        TypeInner::Typeof { .. } => "TypeofTypeAnnotation",
        TypeInner::Keyof { .. } => "KeyofTypeAnnotation",
        TypeInner::Renders { .. } | TypeInner::ReadOnly { .. } => "TypeOperator",
        TypeInner::Tuple { .. } => "TupleTypeAnnotation",
        TypeInner::StringLiteral { .. } => "StringLiteralTypeAnnotation",
        TypeInner::NumberLiteral { .. } => "NumberLiteralTypeAnnotation",
        TypeInner::BigIntLiteral { .. } => "BigIntLiteralTypeAnnotation",
        TypeInner::BooleanLiteral { .. } => "BooleanLiteralTypeAnnotation",
        TypeInner::TemplateLiteral { .. } => "TemplateLiteralTypeAnnotation",
        TypeInner::Unknown { .. } => "UnknownTypeAnnotation",
        TypeInner::Never { .. } => "NeverTypeAnnotation",
        TypeInner::Undefined { .. } => "UndefinedTypeAnnotation",
        TypeInner::UniqueSymbol { .. } => "UniqueSymbolTypeAnnotation",
    }
}
