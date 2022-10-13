/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod errors;
mod ir;

use std::collections::HashMap;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::NamedItem;
use common::SourceLocationKey;
use common::WithLocation;
use docblock_syntax::DocblockAST;
use docblock_syntax::DocblockField;
use docblock_syntax::DocblockSection;
use errors::ErrorMessagesWithData;
use graphql_ir::FragmentDefinitionName;
use graphql_syntax::parse_field_definition_stub;
use graphql_syntax::parse_type;
use graphql_syntax::ConstantValue;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::FieldDefinitionStub;
use graphql_syntax::FragmentDefinition;
use graphql_syntax::TypeAnnotation;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::Lookup;
pub use ir::Argument;
pub use ir::DocblockIr;
use ir::IrField;
pub use ir::On;
use ir::OutputType;
use ir::PopulatedIrField;
pub use ir::RelayResolverIr;
use ir::StrongObjectIr;
use lazy_static::lazy_static;

use crate::errors::ErrorMessages;

#[derive(Default)]
pub struct ParseOptions {
    pub use_named_imports: bool,
    pub relay_resolver_model_syntax_enabled: bool,
}

lazy_static! {
    static ref RELAY_RESOLVER_FIELD: StringKey = "RelayResolver".intern();
    static ref FIELD_NAME_FIELD: StringKey = "fieldName".intern();
    static ref ON_TYPE_FIELD: StringKey = "onType".intern();
    static ref ON_INTERFACE_FIELD: StringKey = "onInterface".intern();
    static ref EDGE_TO_FIELD: StringKey = "edgeTo".intern();
    static ref DEPRECATED_FIELD: StringKey = "deprecated".intern();
    static ref LIVE_FIELD: StringKey = "live".intern();
    static ref ROOT_FRAGMENT_FIELD: StringKey = "rootFragment".intern();
    static ref OUTPUT_TYPE_FIELD: StringKey = "outputType".intern();
    static ref EMPTY_STRING: StringKey = "".intern();
    static ref ARGUMENT_DEFINITIONS: DirectiveName = DirectiveName("argumentDefinitions".intern());
    static ref ARGUMENT_TYPE: StringKey = "type".intern();
    static ref DEFAULT_VALUE: StringKey = "defaultValue".intern();
    static ref PROVIDER_ARG_NAME: StringKey = "provider".intern();
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

type ParseResult<T> = Result<T, ()>;

#[derive(Default)]
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
        if relay_resolver.value.is_some() {
            if !self.options.relay_resolver_model_syntax_enabled {
                self.errors.push(Diagnostic::error(
                    "Parsing Relay Models (@RelayResolver `StrongTypeName`) is not enabled.",
                    relay_resolver.key_location,
                ));

                return Err(());
            }

            self.parse_strong_object(relay_resolver)
                .map(DocblockIr::StrongObjectResolver)
        } else {
            self.parse_relay_resolver(ast.location, definitions_in_file)
                .map(DocblockIr::RelayResolver)
        }
    }

    fn parse_relay_resolver(
        &mut self,
        ast_location: Location,
        definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    ) -> ParseResult<RelayResolverIr> {
        let live = self.fields.get(&LIVE_FIELD).copied();
        let root_fragment = self.get_field_with_value(*ROOT_FRAGMENT_FIELD)?;
        let fragment_definition = root_fragment
            .map(|root_fragment| {
                self.assert_fragment_definition(root_fragment.value, definitions_in_file)
            })
            .transpose()?;

        let fragment_type_condition = fragment_definition.as_ref().map(|fragment_definition| {
            WithLocation::from_span(
                fragment_definition.location.source_location(),
                fragment_definition.type_condition.span,
                fragment_definition.type_condition.type_.value,
            )
        });
        let on = self.assert_on(ast_location, &fragment_type_condition);
        let field_string = self.assert_field_value_exists(*FIELD_NAME_FIELD, ast_location)?;
        let field = self.parse_field_definition(field_string)?;
        self.validate_field_arguments(&field, field_string.location.source_location());

        let deprecated = self.fields.get(&DEPRECATED_FIELD).copied();
        let fragment_arguments = fragment_definition
            .as_ref()
            .map(|fragment_definition| self.extract_fragment_arguments(fragment_definition))
            .transpose()?
            .flatten();

        // Validate that the field arguments don't collide with the fragment arguments.
        if let (Some(field_arguments), Some(fragment_definition), Some(fragment_arguments)) =
            (&field.arguments, &fragment_definition, &fragment_arguments)
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
        // For the initial version the name of the export have to match
        // the name of the resolver field. Adding JS parser capabilities will allow
        // us to derive the name of the export from the source.
        let named_import = self.options.use_named_imports.then_some(field.name.value);

        Ok(RelayResolverIr {
            field,
            on: on?,
            root_fragment: root_fragment
                .map(|root_fragment| root_fragment.value.map(FragmentDefinitionName)),
            output_type: self.output_type(),
            description: self.description,
            location: ast_location,
            deprecated,
            live,
            fragment_arguments,
            named_import,
        })
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
        field: &FieldDefinitionStub,
        source_location: SourceLocationKey,
    ) {
        if let Some(field_arguments) = &field.arguments {
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

    fn parse_strong_object(&self, _relay_resolver_field: IrField) -> ParseResult<StrongObjectIr> {
        todo!()
    }
}
