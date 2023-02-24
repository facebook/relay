/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod errors;
mod ir;

use std::collections::hash_map::Entry;
use std::collections::HashMap;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlag;
use common::Location;
use common::NamedItem;
use common::SourceLocationKey;
use common::Span;
use common::WithLocation;
use docblock_shared::ARGUMENT_DEFINITIONS;
use docblock_shared::ARGUMENT_TYPE;
use docblock_shared::DEFAULT_VALUE;
use docblock_shared::DEPRECATED_FIELD;
use docblock_shared::EDGE_TO_FIELD;
use docblock_shared::EMPTY_STRING;
use docblock_shared::FIELD_NAME_FIELD;
use docblock_shared::LIVE_FIELD;
use docblock_shared::ON_INTERFACE_FIELD;
use docblock_shared::ON_TYPE_FIELD;
use docblock_shared::OUTPUT_TYPE_FIELD;
use docblock_shared::PROVIDER_ARG_NAME;
use docblock_shared::RELAY_RESOLVER_FIELD;
use docblock_shared::ROOT_FRAGMENT_FIELD;
use docblock_shared::WEAK_FIELD;
use docblock_syntax::DocblockAST;
use docblock_syntax::DocblockField;
use docblock_syntax::DocblockSection;
use errors::ErrorMessagesWithData;
use graphql_ir::FragmentDefinitionName;
use graphql_syntax::parse_field_definition;
use graphql_syntax::parse_field_definition_stub;
use graphql_syntax::parse_identifier;
use graphql_syntax::parse_type;
use graphql_syntax::ConstantValue;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::FieldDefinitionStub;
use graphql_syntax::FragmentDefinition;
use graphql_syntax::InputValueDefinition;
use graphql_syntax::List;
use graphql_syntax::TypeAnnotation;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::Lookup;
use ir::Argument;
pub use ir::DocblockIr;
use ir::IrField;
pub use ir::On;
use ir::OutputType;
use ir::PopulatedIrField;
use ir::RelayResolverIr;
use ir::StrongObjectIr;
use ir::TerseRelayResolverIr;
use ir::UnpopulatedIrField;
use ir::WeakObjectIr;

use crate::errors::ErrorMessages;

pub struct ParseOptions {
    pub relay_resolver_model_syntax_enabled: bool,
    pub id_field_name: StringKey,
    pub enable_output_type: FeatureFlag,
}

pub fn parse_docblock_ast(
    ast: &DocblockAST,
    definitions: Option<&Vec<ExecutableDefinition>>,
    parse_options: ParseOptions,
) -> DiagnosticsResult<Option<DocblockIr>> {
    if ast.find_field(*RELAY_RESOLVER_FIELD).is_none() {
        return Ok(None);
    }

    let parser = RelayResolverParser::new(parse_options);
    let resolver_ir = parser.parse(ast, definitions)?;
    Ok(Some(resolver_ir))
}

/// Check if this docblock has Resolver Model (type) definition
pub fn resolver_maybe_defining_type(ast: &DocblockAST) -> bool {
    ast.find_field(*RELAY_RESOLVER_FIELD)
        .map_or(false, |field| {
            if let Some(value) = field.field_value {
                // If @RelayResolver value contains a `.`
                // it is mostly likely a terse version of resolver
                // field definition.
                // values without `.` will be considered type definitions
                !value.item.lookup().contains('.')
            } else {
                false
            }
        })
}

type ParseResult<T> = Result<T, ()>;

struct RelayResolverParser {
    fields: HashMap<StringKey, IrField>,
    description: Option<WithLocation<StringKey>>,
    allowed_fields: Vec<StringKey>,
    errors: Vec<Diagnostic>,
    options: ParseOptions,
}

impl RelayResolverParser {
    fn new(options: ParseOptions) -> Self {
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
                *OUTPUT_TYPE_FIELD,
                *WEAK_FIELD,
            ],
            options,
        }
    }

    fn parse(
        mut self,
        ast: &DocblockAST,
        definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    ) -> DiagnosticsResult<DocblockIr> {
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
    ) -> ParseResult<DocblockIr> {
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
        let relay_resolver = self.fields.get(&RELAY_RESOLVER_FIELD).copied().unwrap();
        // Currently, we expect Strong objects to be defined
        // as @RelayResolver StrongTypeName. No other fields are expected
        if let Some(type_name) = relay_resolver.value {
            if !self.options.relay_resolver_model_syntax_enabled {
                self.errors.push(Diagnostic::error(
                    "Parsing Relay Models (@RelayResolver `StrongTypeName`) is not enabled.",
                    relay_resolver.key_location,
                ));

                return Err(());
            }

            self.parse_terse_relay_resolver(
                ast.location,
                PopulatedIrField {
                    key_location: relay_resolver.key_location,
                    value: type_name,
                },
                definitions_in_file,
            )
        } else {
            self.parse_relay_resolver(ast.location, definitions_in_file)
                .map(DocblockIr::RelayResolver)
        }
    }

    fn parse_fragment_definition(
        &mut self,
        root_fragment: Option<PopulatedIrField>,
        source_location: SourceLocationKey,
        field_arguments: &Option<List<InputValueDefinition>>,
        definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    ) -> ParseResult<(Option<WithLocation<StringKey>>, Option<Vec<Argument>>)> {
        let fragment_definition = root_fragment
            .map(|root_fragment| {
                self.assert_fragment_definition(root_fragment.value, definitions_in_file)
            })
            .transpose()?;

        let fragment_arguments = fragment_definition
            .as_ref()
            .map(|fragment_definition| self.extract_fragment_arguments(fragment_definition))
            .transpose()?
            .flatten();

        // Validate that the field arguments don't collide with the fragment arguments.
        if let (Some(field_arguments), Some(fragment_definition), Some(fragment_arguments)) =
            (&field_arguments, &fragment_definition, &fragment_arguments)
        {
            for field_arg in &field_arguments.items {
                if let Some(fragment_arg) = fragment_arguments.named(field_arg.name.value) {
                    self.errors.push(
                        Diagnostic::error(
                            ErrorMessages::ConflictingArguments,
                            Location::new(source_location, field_arg.name.span),
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

        let fragment_type_condition = fragment_definition.as_ref().map(|fragment_definition| {
            WithLocation::from_span(
                fragment_definition.location.source_location(),
                fragment_definition.type_condition.span,
                fragment_definition.type_condition.type_.value,
            )
        });
        Ok((fragment_type_condition, fragment_arguments))
    }

    fn parse_relay_resolver(
        &mut self,
        ast_location: Location,
        definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    ) -> ParseResult<RelayResolverIr> {
        let live = self.parse_unpopulated_field(*LIVE_FIELD)?;

        let field_string = self.assert_field_value_exists(*FIELD_NAME_FIELD, ast_location)?;
        let field = self.parse_field_definition(field_string)?;
        let root_fragment = self.get_field_with_value(*ROOT_FRAGMENT_FIELD)?;
        let (fragment_type_condition, fragment_arguments) = self.parse_fragment_definition(
            root_fragment,
            field_string.location.source_location(),
            &field.arguments,
            definitions_in_file,
        )?;

        let on = self.assert_on(ast_location, &fragment_type_condition);
        self.validate_field_arguments(&field.arguments, field_string.location.source_location());

        let deprecated = self.fields.get(&DEPRECATED_FIELD).copied();

        let maybe_output_type = self.output_type();
        if let Some(OutputType::Output(type_annotation)) = &maybe_output_type {
            if !self
                .options
                .enable_output_type
                .is_enabled_for(field.name.value)
            {
                self.errors.push(Diagnostic::error(
                    ErrorMessages::UnexpectedOutputType {
                        field_name: field.name.value,
                    },
                    type_annotation.location,
                ))
            }
        }

        Ok(RelayResolverIr {
            field,
            on: on?,
            root_fragment: root_fragment
                .map(|root_fragment| root_fragment.value.map(FragmentDefinitionName)),
            output_type: maybe_output_type,
            description: self.description,
            location: ast_location,
            deprecated,
            live,
            fragment_arguments,
        })
    }

    fn parse_unpopulated_field(
        &mut self,
        field_name: StringKey,
    ) -> Result<Option<UnpopulatedIrField>, ()> {
        let field = match self
            .fields
            .get(&field_name)
            .copied()
            .map(|field| -> Result<_, WithLocation<StringKey>> { field.try_into() })
            .transpose()
        {
            Ok(live) => live,
            Err(e) => {
                self.errors.push(Diagnostic::error(
                    ErrorMessages::FieldWithUnexpectedData { field_name },
                    e.location,
                ));
                return Err(());
            }
        };
        Ok(field)
    }

    fn parse_type_annotation(
        &mut self,
        type_str: WithLocation<StringKey>,
    ) -> DiagnosticsResult<WithLocation<TypeAnnotation>> {
        let type_annotation = parse_type(
            type_str.item.lookup(),
            type_str.location.source_location(),
            type_str.location.span().start,
        )?;

        let valid_type_annotation = match &type_annotation {
            TypeAnnotation::Named(_) => type_annotation,
            TypeAnnotation::List(item_type) => match &item_type.type_ {
                TypeAnnotation::NonNull(_) => {
                    return Err(vec![Diagnostic::error(
                        ErrorMessages::UnexpectedNonNullableItemInListEdgeTo {},
                        type_str.location,
                    )]);
                }
                _ => type_annotation,
            },
            TypeAnnotation::NonNull(_) => {
                return Err(vec![Diagnostic::error(
                    ErrorMessages::UnexpectedNonNullableEdgeTo {},
                    type_str.location,
                )]);
            }
        };
        Ok(WithLocation::new(
            type_str.location.clone(),
            valid_type_annotation,
        ))
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
            Entry::Occupied(_) => self.errors.push(Diagnostic::error(
                ErrorMessages::DuplicateField {
                    field_name: field.field_name.item,
                },
                field.field_name.location,
            )),
            Entry::Vacant(entry) => {
                entry.insert(IrField {
                    key_location: field.field_name.location,
                    value: field_value,
                });
            }
        }
    }

    fn output_type(&mut self) -> Option<OutputType> {
        let edge_to = self.fields.get(&EDGE_TO_FIELD).copied();
        let output_type = self.fields.get(&OUTPUT_TYPE_FIELD).copied();

        let value = edge_to.or(output_type)?.value?;
        match self.parse_type_annotation(value) {
            Ok(type_annotation) => match (edge_to, output_type) {
                (Some(_), None) => Some(OutputType::EdgeTo(type_annotation)),
                (None, Some(_)) => Some(OutputType::Output(type_annotation)),
                (Some(edge_to), Some(output_type)) => {
                    self.errors.push(
                        Diagnostic::error(
                            ErrorMessages::UnexpectedEdgeToAndOutputType,
                            edge_to.key_location,
                        )
                        .annotate(" @outputType found here", output_type.key_location),
                    );
                    None
                }
                (None, None) => {
                    unreachable!()
                }
            },
            Err(mut errors) => {
                self.errors.append(&mut errors);
                None
            }
        }
    }

    fn assert_on(
        &mut self,
        docblock_location: Location,
        fragment_type_condition: &Option<WithLocation<StringKey>>,
    ) -> ParseResult<On> {
        let maybe_on_type = self.get_field_with_value(*ON_TYPE_FIELD)?;
        let maybe_on_interface = self.get_field_with_value(*ON_INTERFACE_FIELD)?;
        match (maybe_on_type, maybe_on_interface, fragment_type_condition) {
            // Neither field was defined
            (None, None, _) => {
                self.errors.push(Diagnostic::error(
                    ErrorMessages::ExpectedOnTypeOrOnInterface,
                    docblock_location,
                ));
                Err(())
            }
            // Both fields were defined
            (Some(on_type), Some(on_interface), _) => {
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
            (None, Some(on_interface), Some(fragment_type_condition)) => {
                if on_interface.value.item == fragment_type_condition.item {
                    Ok(On::Interface(on_interface))
                } else {
                    self.errors.push(
                        Diagnostic::error(
                            ErrorMessages::MismatchRootFragmentTypeConditionOnInterface {
                                fragment_type_condition: fragment_type_condition.item,
                                interface_type: on_interface.value.item,
                            },
                            on_interface.value.location,
                        )
                        .annotate(
                            "with fragment type condition",
                            fragment_type_condition.location,
                        ),
                    );
                    Err(())
                }
            }
            // Only onType was defined
            (Some(on_type), None, Some(fragment_type_condition)) => {
                if on_type.value.item == fragment_type_condition.item {
                    Ok(On::Type(on_type))
                } else {
                    self.errors.push(
                        Diagnostic::error(
                            ErrorMessages::MismatchRootFragmentTypeConditionOnType {
                                fragment_type_condition: fragment_type_condition.item,
                                type_name: on_type.value.item,
                            },
                            on_type.value.location,
                        )
                        .annotate(
                            "with fragment type condition",
                            fragment_type_condition.location,
                        ),
                    );
                    Err(())
                }
            }
            (Some(on_type), None, None) => Ok(On::Type(on_type)),
            (None, Some(on_interface), None) => Ok(On::Interface(on_interface)),
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
            .named(ARGUMENT_DEFINITIONS.0)
            .and_then(|directive| directive.arguments.as_ref())
            .map(|arguments| {
                arguments
                    .items
                    .iter()
                    .filter_map(|arg: &graphql_syntax::Argument| {
                        let (type_, default_value) = if let graphql_syntax::Value::Constant(
                            graphql_syntax::ConstantValue::Object(object),
                        ) = &arg.value
                        {
                            if object
                                .items
                                .iter()
                                .any(|item| item.name.value == *PROVIDER_ARG_NAME)
                            {
                                return None;
                            }

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

                        Some(type_.map(|type_| Argument {
                            name: arg.name.clone(),
                            type_,
                            default_value,
                        }))
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

    fn validate_field_arguments(
        &mut self,
        arguments: &Option<List<InputValueDefinition>>,
        source_location: SourceLocationKey,
    ) {
        if let Some(field_arguments) = &arguments {
            for argument in field_arguments.items.iter() {
                if let Some(default_value) = &argument.default_value {
                    self.errors.push(Diagnostic::error(
                        ErrorMessages::ArgumentDefaultValuesNoSupported,
                        Location::new(source_location, default_value.span()),
                    ));
                }
            }
        }
    }

    fn parse_terse_relay_resolver(
        &mut self,
        ast_location: Location,
        field_value: PopulatedIrField,
        definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    ) -> ParseResult<DocblockIr> {
        let type_str = field_value.value;

        let type_name = match parse_identifier(
            type_str.item.lookup(),
            type_str.location.source_location(),
            type_str.location.span().start,
        ) {
            Ok(type_name) => type_name,
            Err(diagnostics) => {
                self.errors.extend(diagnostics);
                return Err(());
            }
        };

        let type_ = PopulatedIrField {
            key_location: field_value.key_location,
            value: WithLocation::new(type_str.location.with_span(type_name.span), type_name.value),
        };

        if let Some(terse_resolver) = self.parse_terse_field_definition_tail(
            ast_location,
            type_str,
            type_name,
            definitions_in_file,
        )? {
            Ok(DocblockIr::TerseRelayResolver(terse_resolver))
        } else if self.fields.get(&WEAK_FIELD).is_some() {
            self.parse_weak_type(ast_location, type_)
                .map(DocblockIr::WeakObjectType)
        } else {
            self.parse_strong_object(ast_location, type_)
                .map(DocblockIr::StrongObjectResolver)
        }
    }

    // If present, parse the `.field_name(argument: String): ReturnType`
    // following a `TypeName`.
    fn parse_terse_field_definition_tail(
        &mut self,
        ast_location: Location,
        type_str: WithLocation<StringKey>,
        type_name: graphql_syntax::Identifier,
        definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    ) -> ParseResult<Option<TerseRelayResolverIr>> {
        let (start, end) = type_name.span.as_usize();
        let offset = end - start;
        let remaining_source = &type_str.item.lookup()[offset..];
        let span_start = type_str.location.span().start + offset as u32;

        match remaining_source.chars().next() {
            Some(maybe_dot) => {
                if maybe_dot != '.' {
                    self.errors.push(Diagnostic::error(
                        ErrorMessages::UnexpectedNonDot { found: maybe_dot },
                        type_str
                            .location
                            .with_span(Span::new(span_start, span_start + 1)),
                    ));
                    return Err(());
                }
            }
            None => return Ok(None),
        };

        let field = match parse_field_definition(
            &remaining_source[1..],
            type_str.location.source_location(),
            span_start + 1,
        ) {
            Ok(field) => field,
            Err(diagnostics) => {
                self.errors.extend(diagnostics);
                return Err(());
            }
        };

        self.validate_field_arguments(&field.arguments, ast_location.source_location());
        let root_fragment = self.get_field_with_value(*ROOT_FRAGMENT_FIELD)?;

        let (maybe_fragment_type_condition, fragment_arguments) = self.parse_fragment_definition(
            root_fragment,
            type_str.location.source_location(),
            &field.arguments,
            definitions_in_file,
        )?;

        if let Some(fragment_type_condition) = maybe_fragment_type_condition {
            if fragment_type_condition.item != type_name.value {
                self.errors.push(
                    Diagnostic::error(
                        ErrorMessages::MismatchRootFragmentTypeConditionTerseSyntax {
                            fragment_type_condition: fragment_type_condition.item,
                            type_name: type_name.value,
                        },
                        type_str.location.with_span(type_name.span),
                    )
                    .annotate(
                        "with fragment type condition",
                        fragment_type_condition.location,
                    ),
                );
            }
        }

        let live = self.parse_unpopulated_field(*LIVE_FIELD)?;
        let deprecated = self.fields.get(&DEPRECATED_FIELD).copied();

        let location = type_str.location;

        // These fields are subsumed by the terse syntax, and as such cannot be used with terse syntax.
        for forbidden_field_name in &[
            *FIELD_NAME_FIELD,
            *ON_TYPE_FIELD,
            *ON_INTERFACE_FIELD,
            *EDGE_TO_FIELD,
            *OUTPUT_TYPE_FIELD,
            *WEAK_FIELD,
        ] {
            if let Some(field) = self.fields.get(forbidden_field_name) {
                self.errors.push(Diagnostic::error(
                    ErrorMessages::UnexpectedFieldInTerseSyntax {
                        field_name: *forbidden_field_name,
                    },
                    field.key_location,
                ));
            }
        }
        Ok(Some(TerseRelayResolverIr {
            field,
            type_: WithLocation::new(type_str.location.with_span(type_name.span), type_name.value),
            root_fragment: root_fragment
                .map(|root_fragment| root_fragment.value.map(FragmentDefinitionName)),
            location,
            deprecated,
            live,
            fragment_arguments,
        }))
    }

    fn parse_strong_object(
        &mut self,
        ast_location: Location,
        type_: PopulatedIrField,
    ) -> ParseResult<StrongObjectIr> {
        // For Relay Models (Strong object) we'll automatically inject the
        // fragment with `id` field.
        let fragment_name = FragmentDefinitionName(
            format!("{}__{}", type_.value.item, self.options.id_field_name).intern(),
        );

        let live = self.parse_unpopulated_field(*LIVE_FIELD)?;

        Ok(StrongObjectIr {
            type_,
            root_fragment: WithLocation::generated(fragment_name),
            description: self.description,
            deprecated: self.fields.get(&DEPRECATED_FIELD).copied(),
            live,
            location: ast_location,
        })
    }

    fn parse_weak_type(
        &self,
        ast_location: Location,
        type_: PopulatedIrField,
    ) -> ParseResult<WeakObjectIr> {
        // TODO: Validate that no incompatible docblock fields are used.
        Ok(WeakObjectIr {
            type_,
            description: self.description,
            deprecated: self.fields.get(&DEPRECATED_FIELD).copied(),
            location: ast_location,
        })
    }
}
