/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(clippy::all)]

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::Diagnostic;
use common::Location;
use common::SourceLocationKey;
use common::Span;
use common::WithLocation;
use docblock_shared::ResolverSourceHash;
use fnv::FnvHashSet;
use hermes_estree::ObjectTypePropertyKey;
use hermes_estree::Range;
use hermes_estree::SourceRange;
use hermes_estree::Visitor;

use crate::FieldDefinitionInfo;
use crate::SchemaGenerationError;
use crate::UnresolvedFieldDefinition;

fn source_range_to_span(source_range: SourceRange) -> Span {
    Span {
        start: source_range.start,
        end: source_range.end,
    }
}

pub struct PropertyVisitor<'a> {
    pub location: SourceLocationKey,
    source_hash: ResolverSourceHash,
    pub errors: Vec<Diagnostic>,
    entity_name: WithLocation<StringKey>,
    resolver_node_ranges: &'a FnvHashSet<SourceRange>,
    pub field_definitions: Vec<UnresolvedFieldDefinition>,
}

impl<'a> PropertyVisitor<'a> {
    pub fn new(
        source_module_path: &str,
        source_hash: ResolverSourceHash,
        entity_name: WithLocation<StringKey>,
        resolver_node_ranges: &'a FnvHashSet<SourceRange>,
    ) -> Self {
        Self {
            location: SourceLocationKey::standalone(source_module_path),
            source_hash,
            errors: vec![],
            entity_name,
            resolver_node_ranges,
            field_definitions: vec![],
        }
    }
}

impl Visitor<'_> for PropertyVisitor<'_> {
    fn visit_object_type_property(&mut self, ast: &'_ hermes_estree::ObjectTypeProperty) {
        if self.resolver_node_ranges.contains(&ast.range) {
            let field_name = match &ast.key {
                ObjectTypePropertyKey::Identifier(id) => WithLocation::from_span(
                    self.location,
                    source_range_to_span(id.range),
                    id.name.clone().intern(),
                ),
                ObjectTypePropertyKey::_Literal(lit) => {
                    self.errors.push(Diagnostic::error(
                        SchemaGenerationError::ExpectedPropertyLookupToBeIdentifer,
                        Location::new(self.location, source_range_to_span(lit.range())),
                    ));
                    return;
                }
            };
            let field_definition = UnresolvedFieldDefinition {
                field_name,
                entity_name: Some(self.entity_name),
                return_type: ast.value.clone(),
                source_hash: self.source_hash,
                description: None, // TODO
                deprecated: None,  // TODO
                entity_type: None,
                field_info: FieldDefinitionInfo::PropertyLookupInfo,
            };
            self.field_definitions.push(field_definition);
        }
    }
}
