/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod errors;
mod ir;

use std::collections::HashMap;

use errors::ErrorMessages;

use common::{Diagnostic, Location};
use common::{DiagnosticsResult, WithLocation};
use docblock_syntax::{DocblockAST, DocblockField, DocblockSection};
use intern::string_key::Intern;
use intern::string_key::StringKey;
pub use ir::{DocblockIr, RelayResolverIr};
use lazy_static::lazy_static;

lazy_static! {
    static ref RELAY_RESOLVER_FIELD: StringKey = "RelayResolver".intern();
    static ref FIELD_NAME_FIELD: StringKey = "fieldName".intern();
    static ref ON_TYPE_FIELD: StringKey = "onType".intern();
    static ref EDGE_TO_FIELD: StringKey = "edgeTo".intern();
    static ref ROOT_FRAGMENT_FIELD: StringKey = "rootFragment".intern();
    static ref EMPTY_STRING: StringKey = "".intern();
}

pub fn parse_docblock_ast(ast: &DocblockAST) -> DiagnosticsResult<Option<DocblockIr>> {
    if ast.find_field(*RELAY_RESOLVER_FIELD).is_none() {
        return Ok(None);
    }

    let parser = RelayResolverParser::new();
    let resolver_ir = parser.parse(ast)?;
    Ok(Some(DocblockIr::RelayResolver(resolver_ir)))
}

type ParseResult<T> = Result<T, ()>;

#[derive(Default)]
struct RelayResolverParser {
    fields: HashMap<StringKey, WithLocation<StringKey>>,
    description: Option<WithLocation<StringKey>>,
    allowed_fields: Vec<StringKey>,
    errors: Vec<Diagnostic>,
}

impl RelayResolverParser {
    fn new() -> Self {
        Self {
            fields: Default::default(),
            description: Default::default(),
            errors: Default::default(),
            allowed_fields: vec![
                *RELAY_RESOLVER_FIELD,
                *FIELD_NAME_FIELD,
                *ON_TYPE_FIELD,
                *ROOT_FRAGMENT_FIELD,
                *EDGE_TO_FIELD,
            ],
        }
    }
    fn parse(mut self, ast: &DocblockAST) -> DiagnosticsResult<RelayResolverIr> {
        let result = self.parse_sections(ast);
        if !self.errors.is_empty() {
            Err(self.errors)
        } else {
            Ok(result.unwrap())
        }
    }

    fn parse_sections(&mut self, ast: &DocblockAST) -> ParseResult<RelayResolverIr> {
        for section in &ast.sections {
            match section {
                DocblockSection::Field(field) => self.parse_field(field),
                DocblockSection::FreeText(free_text) => {
                    if free_text.item == *EMPTY_STRING {
                        continue;
                    }
                    if self.description.is_some() {
                        self.errors.push(Diagnostic::error(
                            ErrorMessages::MultipleDescriptions,
                            free_text.location,
                        ));
                    } else {
                        self.description = Some(*free_text)
                    }
                }
            }
        }

        Ok(RelayResolverIr {
            field_name: self.assert_field_value(*FIELD_NAME_FIELD)?,
            on_type: self.assert_field_value(*ON_TYPE_FIELD)?,
            root_fragment: self.assert_field_value(*ROOT_FRAGMENT_FIELD)?,
            edge_to: self.fields.get(&EDGE_TO_FIELD).copied(),
            description: self.description,
            location: ast.location,
        })
    }

    fn parse_field(&mut self, field: &DocblockField) {
        if !self.allowed_fields.contains(&field.field_name.item) {
            self.errors.push(Diagnostic::error(
                ErrorMessages::UnknownField {
                    field_name: field.field_name.item,
                },
                field.field_name.location,
            ));
            return;
        }
        if let Some(field_value) = field.field_value {
            match self.fields.entry(field.field_name.item) {
                std::collections::hash_map::Entry::Occupied(_) => {
                    self.errors.push(Diagnostic::error(
                        ErrorMessages::DuplicateField {
                            field_name: field.field_name.item,
                        },
                        field.field_name.location,
                    ))
                }
                std::collections::hash_map::Entry::Vacant(entry) => {
                    entry.insert(field_value);
                }
            }
        }
    }

    fn assert_field_value(
        &mut self,
        field_name: StringKey,
    ) -> ParseResult<WithLocation<StringKey>> {
        match self.fields.get(&field_name) {
            Some(field_value) => Ok(field_value.clone()),
            None => {
                self.errors.push(Diagnostic::error(
                    ErrorMessages::MissingField { field_name },
                    Location::generated(), // TODO
                ));
                Err(())
            }
        }
    }
}
