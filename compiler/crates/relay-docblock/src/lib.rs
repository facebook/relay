/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod errors;
mod ir;

use crate::errors::ErrorMessages;
use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, WithLocation};
use docblock_syntax::{DocblockAST, DocblockField, DocblockSection};
use errors::ErrorMessagesWithData;
use graphql_syntax::{
    parse_field_definition_stub, parse_type, ConstantValue, ExecutableDefinition,
    FieldDefinitionStub, FragmentDefinition,
};
use intern::string_key::{Intern, StringKey};
pub use ir::{Argument, DocblockIr, On, RelayResolverIr};
use ir::{IrField, PopulatedIrField};
use lazy_static::lazy_static;
use std::collections::HashMap;

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
    static ref ARGUMENT_DEFINITIONS: StringKey = "argumentDefinitions".intern();
    static ref ARGUMENT_TYPE: StringKey = "type".intern();
    static ref DEFAULT_VALUE: StringKey = "defaultValue".intern();
}

pub fn parse_docblock_ast(
    ast: &DocblockAST,
    definitions: Option<&Vec<ExecutableDefinition>>,
) -> DiagnosticsResult<Option<DocblockIr>> {
    if ast.find_field(*RELAY_RESOLVER_FIELD).is_none() {
        return Ok(None);
    }

    let parser = RelayResolverParser::new();
    let resolver_ir = parser.parse(ast, definitions)?;
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
    fn parse(
        mut self,
        ast: &DocblockAST,
        definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    ) -> DiagnosticsResult<RelayResolverIr> {
        let result = self.parse_sections(ast, definitions_in_file);
        if !self.errors.is_empty() {
            Err(self.errors)
        } else {
            Ok(result.unwrap())
        }
    }

    fn parse_sections(
        &mut self,
        ast: &DocblockAST,
        definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    ) -> ParseResult<RelayResolverIr> {
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

        let on = self.assert_on(ast.location);

        let deprecated = self.fields.get(&DEPRECATED_FIELD).copied();
        let live = self.fields.get(&LIVE_FIELD).copied();

        let root_fragment = self.assert_field_value_exists(*ROOT_FRAGMENT_FIELD, ast.location)?;
        let fragment_definition =
            self.assert_fragment_definition(root_fragment, definitions_in_file)?;
        let fragment_arguments = self.extract_fragment_arguments(&fragment_definition)?;

        let field_string = self.assert_field_value_exists(*FIELD_NAME_FIELD, ast.location)?;
        let field = self.parse_field_definition(field_string)?;

        // Validate that the field arguments don't collide with the fragment arguments.
        if let (Some(field_arguments), Some(fragment_arguments)) =
            (&field.arguments, &fragment_arguments)
        {
            for field_arg in &field_arguments.items {
                if let Some(fragment_arg) = fragment_arguments.named(field_arg.name.value) {
                    self.errors.push(
                        Diagnostic::error(
                            ErrorMessages::ConflictingArguments,
                            field_string.location.with_span(field_arg.name.span),
                        )
                        .annotate(
                            "conflicts with this fragment argument",
                            fragment_definition
                                .location
                                .with_span(fragment_arg.name.span),
                        ),
                    );
                }
            }
        }

        Ok(RelayResolverIr {
            field,
            on: on?,
            root_fragment,
            edge_to: self
                .fields
                .get(&EDGE_TO_FIELD)
                .and_then(|f| f.value.clone()),
            description: self.description,
            location: ast.location,
            deprecated,
            live,
            fragment_arguments,
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

    fn assert_fragment_definition(
        &mut self,
        root_fragment: WithLocation<StringKey>,
        definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    ) -> ParseResult<FragmentDefinition> {
        let fragment_definition = definitions_in_file.and_then(|defs| {
            defs.iter().find(|item| {
                if let ExecutableDefinition::Fragment(fragment) = item {
                    fragment.name.value == root_fragment.item
                } else {
                    false
                }
            })
        });
        if let Some(ExecutableDefinition::Fragment(fragment_definition)) = fragment_definition {
            Ok(fragment_definition.clone())
        } else {
            let suggestions = definitions_in_file
                .map(|defs| defs.iter().filter_map(|def| def.name()).collect::<Vec<_>>())
                .unwrap_or_default();

            self.errors.push(Diagnostic::error(
                ErrorMessagesWithData::FragmentNotFound {
                    fragment_name: root_fragment.item,
                    suggestions,
                },
                root_fragment.location,
            ));

            Err(())
        }
    }

    fn extract_fragment_arguments(
        &mut self,
        fragment_definition: &FragmentDefinition,
    ) -> ParseResult<Option<Vec<Argument>>> {
        Ok(fragment_definition
            .directives
            .named(*ARGUMENT_DEFINITIONS)
            .and_then(|directive| directive.arguments.as_ref())
            .map(|arguments| {
                arguments
                    .items
                    .iter()
                    .map(|arg: &graphql_syntax::Argument| {
                        let (type_, default_value) = if let graphql_syntax::Value::Constant(
                            graphql_syntax::ConstantValue::Object(object),
                        ) = &arg.value
                        {
                            let type_value = &object
                                .items
                                .iter()
                                .find(|item| item.name.value == *ARGUMENT_TYPE)
                                .map(|type_| type_.value.clone());

                            let default_value = &object
                                .items
                                .iter()
                                .find(|item| item.name.value == *DEFAULT_VALUE)
                                .map(|default_value| default_value.value.clone());

                            if let Some(ConstantValue::String(string_value)) = type_value {
                                (
                                    parse_type(
                                        string_value.value.lookup(),
                                        fragment_definition.location.source_location(),
                                        // We don't currently have span information
                                        // for constant values, so we can't derive a
                                        // reasonable offset here.
                                        0,
                                    ),
                                    default_value.clone(),
                                )
                            } else {
                                panic!("Expect ConstantValue::String as a type");
                            }
                        } else {
                            panic!("Expect the constant value for the argDef: {:?}", &arg.value);
                        };

                        type_.map(|type_| Argument {
                            name: arg.name.clone(),
                            type_,
                            default_value,
                        })
                    })
                    .filter_map(|result| result.map_err(|err| self.errors.extend(err)).ok())
                    .collect::<Vec<_>>()
            }))
    }

    fn parse_field_definition(
        &mut self,
        field_string: WithLocation<StringKey>,
    ) -> ParseResult<FieldDefinitionStub> {
        let field_string_offset = field_string.location.span().start;
        parse_field_definition_stub(
            field_string.item.lookup(),
            field_string.location.source_location(),
            field_string_offset,
        )
        .map_err(|mut errors| self.errors.append(&mut errors))
    }
}
