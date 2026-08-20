/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(clippy::all)]

use std::convert::Infallible;

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::Diagnostic;
use common::WithLocation;
use docblock_shared::ResolverSourceHash;
use docblock_syntax::DocblockAST;
use docblock_syntax::parse_docblock_with_offset;
use flow_parser::ast;
use flow_parser::ast::expression::object::Key;
use flow_parser::ast::types::object::PropertyValue;
use flow_parser::ast_visitor::AstVisitor;
use flow_parser::loc::Loc;
use fnv::FnvHashMap;
use schema_extractor::LocationResolver;

use crate::FieldDefinitionInfo;
use crate::SchemaGenerationError;
use crate::UnresolvedFieldDefinition;
use crate::get_deprecated;
use crate::get_description;
use crate::key_loc;

pub struct PropertyVisitor<'a> {
    pub locations: LocationResolver,
    source_hash: ResolverSourceHash,
    pub errors: Vec<Diagnostic>,
    entity_name: WithLocation<StringKey>,
    resolver_node_locs: &'a FnvHashMap<Loc, (&'a str, Loc)>,
    pub field_definitions: Vec<UnresolvedFieldDefinition>,
}

impl<'a> PropertyVisitor<'a> {
    pub fn new(
        locations: LocationResolver,
        source_hash: ResolverSourceHash,
        entity_name: WithLocation<StringKey>,
        resolver_node_locs: &'a FnvHashMap<Loc, (&'a str, Loc)>,
    ) -> Self {
        Self {
            locations,
            source_hash,
            errors: vec![],
            entity_name,
            resolver_node_locs,
            field_definitions: vec![],
        }
    }
}

impl<'ast, 'a> AstVisitor<'ast, Loc, Loc, &'ast Loc, Infallible> for PropertyVisitor<'a> {
    fn normalize_loc(loc: &'ast Loc) -> &'ast Loc {
        loc
    }

    fn normalize_type(type_: &'ast Loc) -> &'ast Loc {
        type_
    }

    fn object_property_type(
        &mut self,
        ast: &'ast ast::types::object::NormalProperty<Loc, Loc>,
    ) -> Result<(), Infallible> {
        let Some((comment, comment_loc)) = self.resolver_node_locs.get(&ast.loc) else {
            return Ok(());
        };
        let field_name = match &ast.key {
            Key::Identifier(id) => WithLocation::from_span(
                self.locations.source_location(),
                self.locations.to_span(&id.loc),
                id.name.as_str().intern(),
            ),
            key => {
                self.errors.push(Diagnostic::error(
                    SchemaGenerationError::ExpectedPropertyLookupToBeIdentifer,
                    self.locations.to_location(key_loc(key)),
                ));
                return Ok(());
            }
        };
        let PropertyValue::Init(Some(value)) = &ast.value else {
            self.errors.push(Diagnostic::error(
                SchemaGenerationError::ExpectedPropertyLookupToBeIdentifer,
                self.locations.to_location(&ast.loc),
            ));
            return Ok(());
        };
        let comment_span = self.locations.to_span(comment_loc);
        // The comment text has the `/*` and `*/` delimiters stripped, but the
        // comment span covers them, so the docblock is offset by the two
        // characters of the opening delimiter.
        let docblock = match parse_docblock_with_offset(
            comment,
            self.locations.source_location(),
            comment_span.start + 2,
        ) {
            Ok(docblock) => docblock,
            Err(err) => {
                self.errors.extend(err);
                return Ok(());
            }
        };
        let description = match get_description(&docblock, comment_span) {
            Ok(description) => description,
            Err(err) => {
                self.errors.extend(err);
                return Ok(());
            }
        };
        let deprecated = get_deprecated(&docblock);
        let alias = get_aliased_field_name(&docblock);
        let field_definition = UnresolvedFieldDefinition {
            field_name: alias.unwrap_or(field_name),
            entity_name: Some(self.entity_name),
            return_type: value.clone(),
            source_hash: self.source_hash,
            description,
            deprecated,
            entity_type: None,
            field_info: FieldDefinitionInfo::PropertyLookupInfo {
                property_name: field_name,
            },
        };
        self.field_definitions.push(field_definition);
        Ok(())
    }
}

fn get_aliased_field_name(docblock: &DocblockAST) -> Option<WithLocation<StringKey>> {
    let aliased_field = docblock.find_field("gqlField".intern());
    aliased_field.and_then(|f| f.field_value)
}
