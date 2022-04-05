/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod errors;
mod ir;

use std::collections::HashMap;

use crate::errors::ErrorMessages;

use common::{Diagnostic, Location};
use common::{DiagnosticsResult, WithLocation};
use docblock_syntax::{DocblockAST, DocblockField, DocblockSection};
use intern::string_key::Intern;
use intern::string_key::StringKey;
pub use ir::{DocblockIr, On, RelayResolverIr};
use ir::{IrField, PopulatedIrField};
use lazy_static::lazy_static;

lazy_static! {
    static ref RELAY_RESOLVER_FIELD: StringKey = "RelayResolver".intern();
    static ref FIELD_NAME_FIELD: StringKey = "fieldName".intern();
    pub static ref ON_TYPE_FIELD: StringKey = "onType".intern();
    pub static ref ON_INTERFACE_FIELD: StringKey = "onInterface".intern();
    static ref EDGE_TO_FIELD: StringKey = "edgeTo".intern();
    static ref DEPRECATED_FIELD: StringKey = "deprecated".intern();
    static ref LIVE_FIELD: StringKey = "live".intern();
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
    fields: HashMap<StringKey, IrField>,
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
                *ON_INTERFACE_FIELD,
                *ROOT_FRAGMENT_FIELD,
                *EDGE_TO_FIELD,
                *DEPRECATED_FIELD,
                *LIVE_FIELD,
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

        let field_name = self.assert_field_value_exists(*FIELD_NAME_FIELD, ast.location);
        let root_fragment = self.assert_field_value_exists(*ROOT_FRAGMENT_FIELD, ast.location);
        let on = self.assert_on(ast.location);

        let deprecated = self.fields.get(&DEPRECATED_FIELD).copied();
        let live = self.fields.get(&LIVE_FIELD).copied();

        Ok(RelayResolverIr {
            field_name: field_name?,
            on: on?,
            root_fragment: root_fragment?,
            edge_to: self
                .fields
                .get(&EDGE_TO_FIELD)
                .and_then(|f| f.value.clone()),
            description: self.description,
            location: ast.location,
            deprecated,
            live,
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

        let field_value = field.field_value;
        match self.fields.entry(field.field_name.item) {
            std::collections::hash_map::Entry::Occupied(_) => self.errors.push(Diagnostic::error(
                ErrorMessages::DuplicateField {
                    field_name: field.field_name.item,
                },
                field.field_name.location,
            )),
            std::collections::hash_map::Entry::Vacant(entry) => {
                entry.insert(IrField {
                    key_location: field.field_name.location,
                    value: field_value,
                });
            }
        }
    }

    fn assert_on(&mut self, docblock_location: Location) -> ParseResult<On> {
        let maybe_on_type = self.get_field_with_value(*ON_TYPE_FIELD)?;
        let maybe_on_interface = self.get_field_with_value(*ON_INTERFACE_FIELD)?;
        match (maybe_on_type, maybe_on_interface) {
            // Neither field was defined
            (None, None) => {
                self.errors.push(Diagnostic::error(
                    ErrorMessages::ExpectedOnTypeOrOnInterface,
                    docblock_location,
                ));
                Err(())
            }
            // Both fields were defined
            (Some(on_type), Some(on_interface)) => {
                self.errors.push(
                    Diagnostic::error(
                        ErrorMessages::UnexpectedOnTypeAndOnInterface,
                        on_type.key_location,
                    )
                    .annotate("`onInterface` was found here", on_interface.key_location),
                );
                Err(())
            }
            // Only onInterface was defined
            (None, Some(on_interface)) => Ok(On::Interface(on_interface)),
            // Only onType was defined
            (Some(on_type), None) => Ok(On::Type(on_type)),
        }
    }

    /// Read a field asserting that it both exists, _and_ has a value.
    fn assert_field_value_exists(
        &mut self,
        field_name: StringKey,
        docblock_location: Location,
    ) -> ParseResult<WithLocation<StringKey>> {
        match self.get_field_with_value(field_name)? {
            Some(field) => Ok(field.value),
            None => {
                self.errors.push(Diagnostic::error(
                    ErrorMessages::MissingField { field_name },
                    docblock_location,
                ));
                Err(())
            }
        }
    }

    /// Read a field that might exist, recording an error if that field exists but has no value.
    fn get_field_with_value(
        &mut self,
        field_name: StringKey,
    ) -> ParseResult<Option<PopulatedIrField>> {
        match self.fields.get(&field_name) {
            Some(field) => match field.value {
                Some(field_value) => Ok(Some(PopulatedIrField {
                    value: field_value.clone(),
                    key_location: field.key_location,
                })),
                None => {
                    self.errors.push(Diagnostic::error(
                        ErrorMessages::MissingFieldValue { field_name },
                        field.key_location,
                    ));
                    Err(())
                }
            },
            None => Ok(None),
        }
    }
}
